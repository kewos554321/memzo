import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { word, definition, phonetic, audioUrl, source } = await req.json();

  if (!word || !definition || !source) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.capturedWord.findFirst({
    where: { userId: user.id, word, status: "saved" },
  });

  if (existing) {
    return NextResponse.json({ id: existing.id, word: existing.word, status: existing.status });
  }

  const captured = await prisma.capturedWord.create({
    data: {
      userId: user.id,
      word,
      definition,
      phonetic: phonetic ?? null,
      audioUrl: audioUrl ?? null,
      source,
      status: "saved",
    },
  });

  return NextResponse.json(
    { id: captured.id, word: captured.word, status: captured.status },
    { status: 201 }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
