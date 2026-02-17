import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const { id: deckId, cardId } = await params;
  const { front, back } = await req.json();
  const card = await prisma.card.update({
    where: { id: cardId },
    data: { front, back },
  });
  // Touch deck updatedAt
  await prisma.deck.update({ where: { id: deckId }, data: {} });
  return NextResponse.json({
    id: card.id,
    front: card.front,
    back: card.back,
    createdAt: card.createdAt.getTime(),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const { id: deckId, cardId } = await params;
  await prisma.card.delete({ where: { id: cardId } });
  await prisma.deck.update({ where: { id: deckId }, data: {} });
  return new NextResponse(null, { status: 204 });
}
