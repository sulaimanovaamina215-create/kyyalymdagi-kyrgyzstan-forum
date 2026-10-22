import { NextResponse } from "next/server";
import { pushSurveyToGoogle } from "@/lib/google-survey";
import { isLang, messages } from "@/lib/i18n";
import { parseSurvey } from "@/lib/survey";
import { addSurvey, removeSurvey, StoreError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: messages.ru.errors.badRequest }, { status: 400 });
  }

  const source = (body ?? {}) as { lang?: unknown; answers?: unknown };
  const lang = isLang(source.lang) ? source.lang : "ru";
  const answers = parseSurvey(source.answers);
  if (!answers) {
    const change = (source.answers as { change?: unknown } | undefined)?.change;
    const tooShort = typeof change === "string" && change.trim().length > 0 && change.trim().length < 3;
    const tooLong = typeof change === "string" && change.trim().length > 200;
    const error = tooShort || tooLong ? messages[lang].errors.surveyChange : messages[lang].errors.survey;
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const entry = await addSurvey({ ...answers, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    try {
      const google = await pushSurveyToGoogle(entry);
      if (!google.delivered) console.warn("survey: Google Sheets не настроен, ответ сохранён только на сервере сайта");
      else if (!google.mailed) console.error("survey: строка записана в таблицу, письмо не ушло");
    } catch (googleError) {
      console.error("survey google", googleError);
      await removeSurvey(entry.id);
      return NextResponse.json({ error: messages[lang].errors.saveFailed }, { status: 502 });
    }
    return NextResponse.json({ id: entry.id }, { status: 201 });
  } catch (error) {
    const text = error instanceof StoreError ? messages[lang].errors.limit : messages[lang].errors.saveFailed;
    return NextResponse.json({ error: text }, { status: 400 });
  }
}
