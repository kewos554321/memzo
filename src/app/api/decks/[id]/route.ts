import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function serializeDeck(deck: {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  cards: { id: string; front: string; back: string; createdAt: Date; deckId: string }[];
}) {
  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    createdAt: deck.createdAt.getTime(),
    updatedAt: deck.updatedAt.getTime(),
    cards: deck.cards.map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      createdAt: c.createdAt.getTime(),
    })),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deck = await prisma.deck.findUnique({
    where: { id },
    include: { cards: true },
  });
  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeDeck(deck));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const deck = await prisma.deck.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
    },
    include: { cards: true },
  });
  return NextResponse.json(serializeDeck(deck));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.deck.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
