import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: deckId } = await params;
  const { cards } = (await req.json()) as {
    cards: { front: string; back: string }[];
  };

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
  });
  if (!deck) {
    return NextResponse.json(
      { error: "Deck not found" },
      { status: 404 }
    );
  }

  const created = await prisma.$transaction(
    cards.map((c) =>
      prisma.card.create({
        data: { front: c.front, back: c.back, deckId },
      })
    )
  );

  // Touch deck updatedAt
  await prisma.deck.update({
    where: { id: deckId },
    data: {},
  });

  return NextResponse.json(
    created.map(
      (c: { id: string; front: string; back: string; createdAt: Date }) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        createdAt: c.createdAt.getTime(),
      })
    ),
    { status: 201 }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
