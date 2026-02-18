import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { createToken, buildSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createToken({ id: user.id, name: user.name, email: user.email });

  const response = NextResponse.json({ success: true });
  response.cookies.set(buildSessionCookie(token));
  return response;
}
