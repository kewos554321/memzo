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

export async function GET() {
  const decks = await prisma.deck.findMany({
    include: { cards: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(decks.map(serializeDeck));
}

export async function POST(req: Request) {
  const { title, description } = await req.json();
  const deck = await prisma.deck.create({
    data: { title, description },
    include: { cards: true },
  });
  return NextResponse.json(serializeDeck(deck), { status: 201 });
}
