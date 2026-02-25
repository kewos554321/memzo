import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

function serializeDeck(deck: {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  cards: { id: string; front: string; back: string; createdAt: Date }[];
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

export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decks = await prisma.deck.findMany({
    include: { cards: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(decks.map(serializeDeck));
}

export async function POST(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();
  const deck = await prisma.deck.create({
    data: { title, description: description || "" },
    include: { cards: true },
  });
  return NextResponse.json(serializeDeck(deck), { status: 201 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
