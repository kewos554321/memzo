import { NextRequest, NextResponse } from "next/server";
import { getSession, createToken, buildSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true },
  });

  const token = await createToken(updated);
  const response = NextResponse.json(updated);
  response.cookies.set(buildSessionCookie(token));
  return response;
}
