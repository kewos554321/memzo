import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { ocrModel } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const { text } = await generateText({
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

    return NextResponse.json({ text });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
