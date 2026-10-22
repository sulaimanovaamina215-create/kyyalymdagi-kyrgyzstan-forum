import { NextResponse } from "next/server";
import { readDelegationRequest } from "@/lib/delegation-request";
import { messages } from "@/lib/i18n";
import { getDelegation, updateDelegation } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ code: string }> };

export async function GET(_request: Request, context: Context) {
  const { code } = await context.params;
  const entry = await getDelegation(decodeURIComponent(code));
  if (!entry) return NextResponse.json({ error: messages.ru.errors.notFound }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PUT(request: Request, context: Context) {
  const { code } = await context.params;
  const current = await getDelegation(decodeURIComponent(code));
  if (!current) return NextResponse.json({ errors: [messages.ru.errors.notFound] }, { status: 404 });

  const parsed = await readDelegationRequest(request, "edit", current.participants.length, current.code);
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: parsed.status });

  const updated = await updateDelegation(current.code, (item) => ({
    ...item,
    ...parsed.fields,
    participants: parsed.participants ?? item.participants,
    participantCount: parsed.participants ? parsed.participants.length : item.participants.length,
    consent: true,
  }));
  if (!updated) return NextResponse.json({ errors: [messages[parsed.lang].errors.notFound] }, { status: 404 });
  return NextResponse.json({ code: updated.code, participantCount: updated.participantCount });
}
