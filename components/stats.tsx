"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { KyrgyzstanMap } from "@/components/kyrgyzstan-map";
import { useI18n } from "@/components/language";
import { STATS_EVENT } from "@/components/survey-form";
import { areaLabel, areas } from "@/lib/regions";
import { emptyBreakdown, type SurveyBreakdown } from "@/lib/survey";
import { ageIds, barrierIds, employmentIds, genderIds, localityIds, priorityIds, topicIds } from "@/lib/types";

type RegionStat = { id: string; name: string; value: number };
type QuestionKey = "topics" | "barriers" | "priorities" | "locality" | "employment";

const primaryQuestions: QuestionKey[] = ["topics", "barriers", "priorities"];
const extraQuestions: QuestionKey[] = ["locality", "employment"];

const questionIds = {
  topics: topicIds,
  barriers: barrierIds,
  priorities: priorityIds,
  locality: localityIds,
  employment: employmentIds,
} as const;

const genderColors = { female: "#00f2fe", male: "#ff6b00", undisclosed: "#7f00ff" };

export function Stats() {
  const { lang, t } = useI18n();
  const [responses, setResponses] = useState(0);
  const [regions, setRegions] = useState<RegionStat[]>(() => areas.map((area) => ({ id: area.id, name: areaLabel(area.id, lang), value: 0 })));
  const [breakdown, setBreakdown] = useState<SurveyBreakdown>(emptyBreakdown);
  const [byRegion, setByRegion] = useState<Record<string, SurveyBreakdown>>({});
  const [activeId, setActiveId] = useState("");
  const [question, setQuestion] = useState<QuestionKey>("topics");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await fetch("/api/stats", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          responses: number;
          regions: { id: string; value: number }[];
          breakdown: SurveyBreakdown;
          byRegion: Record<string, SurveyBreakdown>;
        };
        if (ignore) return;
        setResponses(data.responses);
        setRegions(areas.map((area) => ({ id: area.id, name: areaLabel(area.id, lang), value: data.regions.find((item) => item.id === area.id)?.value ?? 0 })));
        setBreakdown(data.breakdown);
        setByRegion(data.byRegion);
      } catch {
        // The map stays at zero if the API is unreachable.
      }
    }
    load();
    const onChange = () => load();
    window.addEventListener(STATS_EVENT, onChange);
    return () => {
      ignore = true;
      window.removeEventListener(STATS_EVENT, onChange);
    };
  }, [lang]);

  const named = regions.map((region) => ({ ...region, name: areaLabel(region.id, lang) }));
  const total = responses;
  const active = named.find((region) => region.id === activeId);
  const slice = active ? (byRegion[active.id] ?? emptyBreakdown()) : breakdown;
  const sliceTotal = active ? active.value : total;
  const max = Math.max(...named.map((region) => region.value), 1);
  const ordered = [...named].sort((a, b) => b.value - a.value);
  const questions = expanded ? [...primaryQuestions, ...extraQuestions] : primaryQuestions;
  const selected = questions.includes(question) ? question : "topics";

  return (
    <section id="stats" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-28">
      <SectionHeading eyebrow={t.stats.eyebrow} title={t.stats.title} text={t.stats.text} />

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="glass rounded-[28px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{t.stats.surveyed}</p>
          <Counter value={total} />
          <p className="mt-3 text-sm leading-relaxed text-white/60">{t.stats.liveNote}</p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-white/50">{t.stats.onMap}</p>
            <p className="mt-1 font-display text-2xl">{active ? active.name : t.stats.allRegions}</p>
            <p className="mt-2 text-lg text-white/85">
              <span className="font-display text-3xl text-aqua">{percent(active ? active.value : total, total)}</span>
              <span className="ml-2 text-sm text-white/55">{(active ? active.value : total).toLocaleString("ru-RU")}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveId("")}
            className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/30"
          >
            {t.stats.allRegions}
          </button>
        </div>

        <div className="glass rounded-[28px] p-4 sm:p-6">
          <KyrgyzstanMap regions={named} activeId={activeId} onSelect={setActiveId} label={t.stats.mapLabel} />
          <div className="mt-2 flex items-center gap-3 px-2 text-xs text-white/50">
            <span>{t.stats.lower}</span>
            <span className="h-2 flex-1 rounded-full bg-gradient-to-r from-violet via-aqua to-ember" />
            <span>{t.stats.higher}</span>
          </div>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((region) => (
          <li key={region.id}>
            <button
              type="button"
              onClick={() => setActiveId(region.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left ${
                activeId === region.id ? "border-aqua/70 bg-white/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <span className="flex items-center justify-between gap-3 text-sm">
                <span>{region.name}</span>
                <span className="tabular-nums text-aqua">{percent(region.value, total)}</span>
              </span>
              <span className="mt-1 block text-xs tabular-nums text-white/45">{region.value.toLocaleString("ru-RU")}</span>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-gradient-to-r from-violet via-aqua to-ember" style={{ width: `${(region.value / max) * 100}%` }} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="glass rounded-[28px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.stats.questions}</p>
          <h3 className="mt-3 font-display text-2xl font-semibold">{questionTitle(selected, t)}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{t.stats.shareNote}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {questions.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setQuestion(id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  selected === id ? "bg-white text-ink" : "border border-white/15 text-white/75 hover:border-white/30"
                }`}
              >
                {t.stats.tabs[id]}
              </button>
            ))}
          </div>
          <ul className="mt-6 space-y-4">
            {questionIds[selected].map((id) => {
              const counts = slice[selected] as Record<string, number>;
              return <ShareBar key={id} label={optionLabel(selected, id, t)} percent={share(counts[id] ?? 0, sliceTotal)} />;
            })}
          </ul>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="btn-brand mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold"
          >
            {expanded ? t.stats.hideAll : t.stats.viewAll}
          </button>
        </article>

        <div className="grid gap-6">
          <article className="glass rounded-[28px] p-6">
            <h3 className="font-display text-2xl font-semibold">{t.stats.ageTitle}</h3>
            <div className="mt-6 flex h-44 items-end gap-3">
              {ageIds.map((id) => {
                const value = share(slice.age[id] ?? 0, sliceTotal);
                return (
                  <div key={id} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                    <p className="text-center text-xs font-semibold tabular-nums text-aqua">{value}%</p>
                    <div className="mt-2 flex h-28 items-end">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-violet via-sky to-aqua shadow-[0_0_24px_rgba(0,242,254,0.55)]"
                        style={{ height: `${Math.max(value, value === 0 ? 4 : 8)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-center text-xs text-white/70">{t.survey.age[id]}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="glass rounded-[28px] p-6">
            <h3 className="font-display text-2xl font-semibold">{t.stats.genderTitle}</h3>
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/10">
              {genderIds.map((id) => (
                <div key={id} style={{ width: `${share(slice.gender[id] ?? 0, sliceTotal)}%`, background: genderColors[id] }} />
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {genderIds.map((id) => (
                <li key={id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: genderColors[id] }} />
                    {t.survey.gender[id]}
                  </span>
                  <span className="tabular-nums text-aqua">{share(slice.gender[id] ?? 0, sliceTotal)}%</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function share(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function percent(count: number, total: number) {
  return `${share(count, total)}%`;
}

function questionTitle(id: QuestionKey, t: ReturnType<typeof useI18n>["t"]) {
  if (id === "topics") return t.survey.q.topics.title;
  if (id === "barriers") return t.survey.q.barriers.title;
  if (id === "priorities") return t.survey.q.priorities.title;
  if (id === "locality") return t.survey.q.locality.title;
  return t.survey.q.employment.title;
}

function optionLabel(group: QuestionKey, id: string, t: ReturnType<typeof useI18n>["t"]) {
  const table = t.survey[group] as Record<string, string>;
  return table[id] ?? id;
}

function ShareBar({ label, percent: value }: { label: string; percent: number }) {
  return (
    <li>
      <div className="flex items-start justify-between gap-3 text-sm">
        <span className="leading-snug">{label}</span>
        <span className="shrink-0 tabular-nums font-semibold text-aqua">{value}%</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-aqua via-sky to-violet shadow-[0_0_18px_rgba(0,242,254,0.65)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </li>
  );
}

function Counter({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const seen = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || seen.current) return;
        seen.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 1200);
          const eased = 1 - (1 - progress) ** 3;
          setShown(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (seen.current) setShown(value);
  }, [value]);

  return (
    <p ref={ref} className="mt-3 font-display text-5xl font-semibold tabular-nums text-white drop-shadow-[0_0_28px_rgba(0,242,254,0.6)] sm:text-7xl">
      {shown.toLocaleString("ru-RU")}
    </p>
  );
}
