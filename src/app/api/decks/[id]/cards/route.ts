import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deckId } = await params;
  const { cards } = await req.json() as { cards: { front: string; back: string }[] };

  const created = await prisma.$transaction(
    cards.map((c) =>
      prisma.card.create({
        data: { front: c.front, back: c.back, deckId },
      })
    )
  );

  // Touch deck updatedAt
  await prisma.deck.update({ where: { id: deckId }, data: {} });

  return NextResponse.json(
    created.map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      createdAt: c.createdAt.getTime(),
    })),
    { status: 201 }
  );
}
