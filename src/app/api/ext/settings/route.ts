import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { nativeLang: true, targetLang: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(dbUser);
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nativeLang, targetLang } = body as {
    nativeLang?: string;
    targetLang?: string;
  };

  const data: { nativeLang?: string; targetLang?: string } = {};
  if (nativeLang) data.nativeLang = nativeLang;
  if (targetLang) data.targetLang = targetLang;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { nativeLang: true, targetLang: true },
  });

  return NextResponse.json(updated);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
