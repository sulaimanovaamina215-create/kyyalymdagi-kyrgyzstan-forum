import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { buildWorkbook } from "@/lib/excel";
import { messages } from "@/lib/i18n";
import { areaLabel } from "@/lib/regions";
import { listSurvey } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function label(group: "locality" | "age" | "gender" | "employment" | "topics" | "barriers" | "priorities", id: string) {
  const table = messages.ru.survey[group] as Record<string, string>;
  return table[id] ?? id;
}

function join(group: "topics" | "barriers" | "priorities", ids: string[], other?: string) {
  return ids
    .map((id) => (id === "other" && other?.trim() ? `${label(group, id)}: ${other.trim()}` : label(group, id)))
    .join("; ");
}

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  const survey = await listSurvey();
  const buffer = await buildWorkbook([
    {
      name: "Опрос",
      headers: ["Дата", "Регион", "Местность", "Возраст", "Пол", "Занятость", "Важные темы", "Что мешает", "Что сделать", "Что изменить"],
      rows: survey.map((entry) => [
        entry.createdAt,
        areaLabel(entry.regionId, "ru", "survey"),
        label("locality", entry.locality),
        label("age", entry.age),
        label("gender", entry.gender),
        label("employment", entry.employment),
        join("topics", entry.topics, entry.topicsOther),
        join("barriers", entry.barriers, entry.barriersOther),
        join("priorities", entry.priorities, entry.prioritiesOther),
        entry.change,
      ]),
    },
  ]);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"kyyalym-survey.xlsx\"",
      "Cache-Control": "no-store",
    },
  });
}
