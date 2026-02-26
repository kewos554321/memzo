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
    select: { nativeLang: true, targetLang: true, userLevels: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    nativeLang: dbUser.nativeLang,
    targetLang: dbUser.targetLang,
    userLevels: (dbUser.userLevels ?? {}) as Record<string, string>,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nativeLang, targetLang, userLevels } = body as {
    nativeLang?: string;
    targetLang?: string;
    userLevels?: Record<string, string>;
  };

  const data: { nativeLang?: string; targetLang?: string; userLevels?: Record<string, string> } = {};
  if (nativeLang) data.nativeLang = nativeLang;
  if (targetLang) data.targetLang = targetLang;

  // Merge incoming userLevels with existing (don't overwrite other languages)
  if (userLevels) {
    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { userLevels: true },
    });
    const existing = (current?.userLevels ?? {}) as Record<string, string>;
    data.userLevels = { ...existing, ...userLevels };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { nativeLang: true, targetLang: true, userLevels: true },
  });

  return NextResponse.json({
    nativeLang: updated.nativeLang,
    targetLang: updated.targetLang,
    userLevels: (updated.userLevels ?? {}) as Record<string, string>,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
