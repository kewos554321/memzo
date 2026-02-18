import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { createToken, buildSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const hashedPassword = await hash(password, 10);
  const user = await db.user.create({
    data: { name, email, password: hashedPassword },
  });

  const token = await createToken({ id: user.id, name: user.name, email: user.email });

  const response = NextResponse.json({ success: true });
  response.cookies.set(buildSessionCookie(token));
  return response;
}
