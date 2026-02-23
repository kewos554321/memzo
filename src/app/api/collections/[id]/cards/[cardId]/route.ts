import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const { id: collectionId, cardId } = await params;
  const { front, back } = await req.json();
  const card = await prisma.card.update({
    where: { id: cardId },
    data: { front, back },
  });
  // Touch collection updatedAt
  await prisma.collection.update({ where: { id: collectionId }, data: {} });
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
  const { id: collectionId, cardId } = await params;
  await prisma.card.delete({ where: { id: cardId } });
  await prisma.collection.update({ where: { id: collectionId }, data: {} });
  return new NextResponse(null, { status: 204 });
}
