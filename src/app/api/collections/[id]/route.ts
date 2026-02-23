import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function serializeCollection(collection: {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  cards: { id: string; front: string; back: string; createdAt: Date; collectionId: string }[];
}) {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    createdAt: collection.createdAt.getTime(),
    updatedAt: collection.updatedAt.getTime(),
    cards: collection.cards.map((c) => ({
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
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { cards: true },
  });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeCollection(collection));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const collection = await prisma.collection.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
    },
    include: { cards: true },
  });
  return NextResponse.json(serializeCollection(collection));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.collection.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
