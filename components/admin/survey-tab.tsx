"use client";

import { useEffect, useState } from "react";
import { Bars, Donut } from "@/components/admin/bars";
import { messages } from "@/lib/i18n";
import { areaLabel, areas } from "@/lib/regions";
import { formatDate } from "@/lib/utils";

type Row = { id: string; count: number };
type Analytics = {
  total: number;
  byRegion: Row[];
  byLocality: Row[];
  byAge: Row[];
  byGender: Row[];
  byEmployment: Row[];
  topics: Row[];
  barriers: Row[];
  priorities: Row[];
  comments: { regionId: string; change: string; createdAt: string }[];
};

const ru = messages.ru.survey;

function labeled(rows: Row[], dictionary: Record<string, string>, order?: string[]) {
  const counts = new Map(rows.map((row) => [row.id, row.count]));
  const ids = order ?? Object.keys(dictionary);
  return ids.map((id) => ({ label: dictionary[id] ?? id, count: counts.get(id) ?? 0 }));
}

export function SurveyTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/survey", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Не удалось загрузить аналитику.");
        return (await response.json()) as Analytics;
      })
      .then(setData)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Ошибка загрузки"));
  }, []);

  if (error) return <p className="text-sm text-flame">{error}</p>;
  if (!data) return <p className="text-white/60">Загружаем аналитику…</p>;

  const gender = labeled(data.byGender, ru.gender, ["female", "male", "undisclosed"]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">Респондентов</p>
          <p className="font-display text-5xl font-semibold">{data.total}</p>
        </div>
        <a href="/api/admin/export/survey" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold">
          Экспорт ответов в Excel
        </a>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Donut
          title="Пол"
          items={[
            { label: ru.gender.female, count: gender[0]?.count ?? 0, color: "#00f2fe" },
            { label: ru.gender.male, count: gender[1]?.count ?? 0, color: "#ff6b00" },
            { label: ru.gender.undisclosed, count: gender[2]?.count ?? 0, color: "#7f00ff" },
          ]}
        />
        <Bars title="Возраст" base={data.total} items={labeled(data.byAge, ru.age, ["18-21", "22-25", "26-30", "31-35"])} />
        <Bars title="Регионы" base={data.total} items={labeled(data.byRegion, Object.fromEntries(areas.map((area) => [area.id, areaLabel(area.id, "ru", "survey")])), areas.map((area) => area.id))} />
        <Bars title="Тип местности" base={data.total} items={labeled(data.byLocality, ru.locality, ["city", "village"])} />
        <Bars title="Занятость" base={data.total} items={labeled(data.byEmployment, ru.employment)} />
        <Bars title="Важные темы" base={data.total} items={labeled(data.topics, ru.topics)} />
        <Bars title="Что мешает" base={data.total} items={labeled(data.barriers, ru.barriers)} />
        <Bars title="Что сделать в первую очередь" base={data.total} items={labeled(data.priorities, ru.priorities)} />
      </div>
      <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-display text-xl">Открытые ответы</h3>
        <ul className="mt-4 space-y-3">
          {data.comments.length ? (
            data.comments.map((item, index) => (
              <li key={`${item.createdAt}-${index}`} className="rounded-2xl border border-white/10 px-4 py-3">
                <p className="text-xs text-white/45">
                  {formatDate(item.createdAt, "ru")} · {areaLabel(item.regionId, "ru", "survey")}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{item.change}</p>
              </li>
            ))
          ) : (
            <li className="text-sm text-white/50">Ответов пока нет.</li>
          )}
        </ul>
      </article>
    </div>
  );
}
