import { NextResponse } from "next/server";
import { isLang, messages } from "@/lib/i18n";
import { sendForumEmail } from "@/lib/notify";
import { parseSurvey } from "@/lib/survey";
import { addSurvey, StoreError } from "@/lib/store";

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

    await sendForumEmail(
      "Жаңы сурамжылоо жообу (jashtyk.kg)",
      `
          <h2>jashtyk.kg сайтынан жаңы сурамжылоо түштү</h2>
          <p><strong>ID:</strong> ${entry.id}</p>
          <p><strong>Дата:</strong> ${entry.createdAt}</p>
          <hr />
          <p><strong>Регион:</strong> ${entry.regionId}</p>
          <p><strong>Район/Шаар:</strong> ${entry.locality}</p>
          <p><strong>Курагы:</strong> ${entry.age}</p>
          <p><strong>Жынысы:</strong> ${entry.gender}</p>
          <p><strong>Ишмердүүлүгү:</strong> ${entry.employment}</p>
          <p><strong>Темалар:</strong> ${entry.topics.join(", ")} ${entry.topicsOther ? `(${entry.topicsOther})` : ""}</p>
          <p><strong>Тоскоолдуктар:</strong> ${entry.barriers.join(", ")} ${entry.barriersOther ? `(${entry.barriersOther})` : ""}</p>
          <p><strong>Приоритеттер:</strong> ${entry.priorities.join(", ")} ${entry.prioritiesOther ? `(${entry.prioritiesOther})` : ""}</p>
          <p><strong>Сунуштар:</strong> ${entry.change}</p>
        `,
    );

    return NextResponse.json({ id: entry.id }, { status: 201 });
  } catch (error) {
    const text = error instanceof StoreError ? messages[lang].errors.limit : messages[lang].errors.saveFailed;
    return NextResponse.json({ error: text }, { status: 400 });
  }
}