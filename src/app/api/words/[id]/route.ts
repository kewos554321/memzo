import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = (await req.json()) as { status: string };

  const word = await prisma.capturedWord.findUnique({ where: { id } });
  if (!word || word.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.capturedWord.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
