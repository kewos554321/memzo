import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { textModel, visionModel } from "@/lib/ai";

const cardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe("The question or term"),
      back: z.string().describe("The answer or definition"),
    })
  ),
});

const systemPrompt = `You are a flashcard generator. Given content (text or image), extract key concepts and create flashcards.
Each card should have a clear, concise question on the front and a complete answer on the back.
Generate between 3-20 cards depending on the content length.
If the content is in a specific language, create cards in that same language.`;

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

    if (image) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = image.type || "image/jpeg";

      const { object } = await generateObject({
        model: visionModel,
        schema: cardSchema,
        system: systemPrompt,
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
                text: "Generate flashcards from this image. Extract all key information.",
              },
            ],
          },
        ],
      });

      return NextResponse.json(object);
    }

    const { object } = await generateObject({
      model: textModel,
      schema: cardSchema,
      system: systemPrompt,
      prompt: `Generate flashcards from the following content:\n\n${text}`,
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
