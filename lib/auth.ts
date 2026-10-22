import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const adminCookie = "kk_admin";

const fails = new Map<string, { count: number; reset: number }>();

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "local";
  return "local";
}

export function tooManyAttempts(ip: string) {
  const item = fails.get(ip);
  if (!item || item.reset < Date.now()) return false;
  return item.count >= 8;
}

export function recordFail(ip: string) {
  const current = fails.get(ip);
  const now = Date.now();
  if (!current || current.reset < now) {
    fails.set(ip, { count: 1, reset: now + 15 * 60 * 1000 });
    return;
  }
  current.count += 1;
}

export function clearFails(ip: string) {
  fails.delete(ip);
}

export function passwordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !input) return false;
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function signSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(token: string | undefined) {
  const key = secret();
  if (!key || !token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", key).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminRequest() {
  const jar = await cookies();
  return verifySession(jar.get(adminCookie)?.value);
}

export async function adminGuard() {
  if (!passwordConfigured()) {
    return NextResponse.json({ error: "Задайте ADMIN_PASSWORD на сервере." }, { status: 503 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Нужна авторизация." }, { status: 401 });
  }
  return null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}
