import { NextResponse } from "next/server";
import { readDelegationRequest } from "@/lib/delegation-request";
import { messages } from "@/lib/i18n";
import { createDelegation, StoreError } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = await readDelegationRequest(request, "create");
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: parsed.status });
  if (!parsed.participants) return NextResponse.json({ errors: [messages[parsed.lang].errors.fileRequired] }, { status: 400 });

  try {
    const entry = await createDelegation({
      ...parsed.fields,
      participants: parsed.participants,
      participantCount: parsed.participants.length,
      consent: true,
    });
    return NextResponse.json(
      { code: entry.code, participantCount: entry.participantCount, editPath: `/register/${entry.code}` },
      { status: 201 },
    );
  } catch (error) {
    const text = error instanceof StoreError ? messages[parsed.lang].errors.limit : messages[parsed.lang].errors.saveFailed;
    return NextResponse.json({ errors: [text] }, { status: 400 });
  }
}
