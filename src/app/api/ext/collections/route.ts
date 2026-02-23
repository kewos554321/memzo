import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

function serializeCollection(collection: {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  cards: { id: string; front: string; back: string; createdAt: Date }[];
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

export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await prisma.collection.findMany({
    include: { cards: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(collections.map(serializeCollection));
}

export async function POST(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();
  const collection = await prisma.collection.create({
    data: { title, description: description || "" },
    include: { cards: true },
  });
  return NextResponse.json(serializeCollection(collection), { status: 201 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
