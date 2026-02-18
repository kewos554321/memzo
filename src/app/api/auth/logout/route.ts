import { NextResponse } from "next/server";
import { buildClearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(buildClearSessionCookie());
  return response;
}
