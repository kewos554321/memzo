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

  const { id: collectionId } = await params;
  const { cards } = (await req.json()) as {
    cards: { front: string; back: string }[];
  };

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });
  if (!collection) {
    return NextResponse.json(
      { error: "Collection not found" },
      { status: 404 }
    );
  }

  const created = await prisma.$transaction(
    cards.map((c) =>
      prisma.card.create({
        data: { front: c.front, back: c.back, collectionId },
      })
    )
  );

  // Touch collection updatedAt
  await prisma.collection.update({
    where: { id: collectionId },
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
