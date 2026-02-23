import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: collectionId } = await params;
  const { cards } = await req.json() as { cards: { front: string; back: string }[] };

  const created = await prisma.$transaction(
    cards.map((c) =>
      prisma.card.create({
        data: { front: c.front, back: c.back, collectionId },
      })
    )
  );

  // Touch collection updatedAt
  await prisma.collection.update({ where: { id: collectionId }, data: {} });

  return NextResponse.json(
    created.map((c: { id: string; front: string; back: string; createdAt: Date }) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      createdAt: c.createdAt.getTime(),
    })),
    { status: 201 }
  );
}
