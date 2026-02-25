import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wordIds, collectionId } = (await req.json()) as {
    wordIds: string[];
    collectionId: string;
  };

  if (!wordIds?.length || !collectionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const deck = await prisma.deck.findUnique({ where: { id: collectionId } });
  if (!deck) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  const words = await prisma.capturedWord.findMany({
    where: { id: { in: wordIds }, userId: user.id, status: "saved" },
  });

  await prisma.$transaction([
    ...words.map((w) =>
      prisma.card.create({
        data: { front: w.word, back: w.definition, deckId: collectionId },
      })
    ),
    prisma.capturedWord.updateMany({
      where: { id: { in: words.map((w) => w.id) } },
      data: { status: "imported", importedTo: collectionId },
    }),
  ]);

  return NextResponse.json({ imported: words.length });
}
