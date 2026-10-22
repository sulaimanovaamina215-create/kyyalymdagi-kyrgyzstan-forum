import { NextResponse } from "next/server";
import {
  adminCookie,
  clearFails,
  clientIp,
  passwordConfigured,
  passwordMatches,
  recordFail,
  sessionCookieOptions,
  signSession,
  tooManyAttempts,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!passwordConfigured()) {
    return NextResponse.json({ error: "Задайте ADMIN_PASSWORD на сервере." }, { status: 503 });
  }

  const ip = clientIp(request);
  if (tooManyAttempts(ip)) {
    return NextResponse.json({ error: "Слишком много попыток. Подождите 15 минут." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const password = typeof (body as { password?: unknown }).password === "string" ? (body as { password: string }).password : "";
  if (!passwordMatches(password)) {
    recordFail(ip);
    return NextResponse.json({ error: "Неверный пароль." }, { status: 401 });
  }

  clearFails(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie, signSession(), sessionCookieOptions());
  return response;
}
