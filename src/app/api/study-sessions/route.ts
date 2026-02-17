import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { deckId, results, completedAt } = await req.json() as {
    deckId: string;
    results: { cardId: string; known: boolean }[];
    completedAt: number;
  };

  const session = await prisma.studySession.create({
    data: {
      deckId,
      completedAt: new Date(completedAt),
      results: {
        create: results.map((r) => ({ cardId: r.cardId, known: r.known })),
      },
    },
  });

  return NextResponse.json({ id: session.id }, { status: 201 });
}
