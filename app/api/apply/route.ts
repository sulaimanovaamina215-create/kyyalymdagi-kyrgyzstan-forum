import { NextResponse } from "next/server";
import { parseApplication } from "@/lib/application";
import { sendApplicationNotice } from "@/lib/application-mail";
import { isLang, messages } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: messages.ru.errors.badRequest }, { status: 400 });
  }

  const source = (body ?? {}) as {
    lang?: unknown;
    fullName?: unknown;
    phone?: unknown;
    letter?: unknown;
    company?: unknown;
  };
  const lang = isLang(source.lang) ? source.lang : "ru";
  if (typeof source.company === "string" && source.company.trim()) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = parseApplication(source);
  if (!parsed.ok) {
    return NextResponse.json({ error: messages[lang].errors[parsed.error] }, { status: 400 });
  }

  const sent = await sendApplicationNotice(parsed.value);
  if (sent === "unconfigured") {
    return NextResponse.json({ relay: true });
  }
  if (sent !== "sent") {
    return NextResponse.json({ error: messages[lang].errors.applyMail }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
