import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
