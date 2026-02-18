import { NextRequest, NextResponse } from "next/server";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { textModel, ocrModel } from "@/lib/ai";

export const maxDuration = 60;

export const dynamic = "force-dynamic";

const cardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe("The question or term"),
      back: z.string().describe("The answer or definition"),
    })
  ),
});

const cardSystemPrompt = `You are a smart flashcard generator. Analyze the input content and generate flashcards in the most appropriate format:

1. **If the input is a list of words or vocabulary**: Create word cards where:
   - Front: The word/term
   - Back: Definition, pronunciation, or example usage

2. **If the input is explanatory text, notes, or educational content**: Create Q&A cards where:
   - Front: A clear question or topic
   - Back: The answer or explanation

3. **If the input appears to be instructions or requests for specific content**: Honor the request directly.

Guidelines:
- Generate between 3-20 cards depending on content length
- Keep answers concise but complete
- Preserve the original language of the input
- For non-English content, provide translations or explanations as needed
- Make cards easy to study and remember`;

function getLocaleInstruction(acceptLanguage: string | null): string {
  if (!acceptLanguage) return "";
  const primary = acceptLanguage.split(",")[0].trim().toLowerCase();
  if (primary.startsWith("zh-tw") || primary.startsWith("zh-hant")) {
    return "- Respond in Traditional Chinese (繁體中文)";
  }
  if (primary.startsWith("zh-cn") || primary.startsWith("zh-hans") || primary.startsWith("zh")) {
    return "- Respond in Simplified Chinese (简体中文)";
  }
  if (primary.startsWith("ja")) return "- Respond in Japanese (日本語)";
  if (primary.startsWith("ko")) return "- Respond in Korean (한국어)";
  // For other languages, let the AI match the input language naturally
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get("text") as string | null;
    const image = formData.get("image") as File | null;

    if (!text && !image) {
      return NextResponse.json(
        { error: "Please provide text or an image" },
        { status: 400 }
      );
    }

    let sourceText = text ?? "";

    if (image) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = image.type || "image/jpeg";

      // Step 1: OCR only — extract raw text from image (cheap)
      const { text: extracted } = await generateText({
        model: ocrModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                image: `data:${mimeType};base64,${base64}`,
              },
              {
                type: "text",
                text: "Extract all text from this image. Output only the raw text, no commentary.",
              },
            ],
          },
        ],
      });

      sourceText = extracted?.trim() ?? "";

      if (!sourceText) {
        return NextResponse.json(
          { error: "Could not extract text from image. Please try a clearer image." },
          { status: 422 }
        );
      }
    }

    // Step 2: Text → structured flashcard JSON (cheap DeepSeek)
    const localeInstruction = getLocaleInstruction(req.headers.get("accept-language"));
    const system = localeInstruction
      ? `${cardSystemPrompt}\n${localeInstruction}`
      : cardSystemPrompt;

    const { object } = await generateObject({
      model: textModel,
      schema: cardSchema,
      system,
      prompt: `Generate flashcards from the following content:\n\n${sourceText}`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cards. Please check your API key." },
      { status: 500 }
    );
  }
}
