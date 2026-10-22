"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageSwitch, useI18n } from "@/components/language";
import { Button } from "@/components/ui/button";
import { forum } from "@/lib/content";
import { areaLabel, orderedAreas, surveyRegionOrder } from "@/lib/regions";
import { ageIds, barrierIds, employmentIds, genderIds, localityIds, priorityIds, topicIds } from "@/lib/types";

export const STATS_EVENT = "kyyal-stats";

type Answers = {
  regionId: string;
  locality: string;
  age: string;
  gender: string;
  employment: string;
  topics: string[];
  topicsOther: string;
  barriers: string[];
  barriersOther: string;
  priorities: string[];
  prioritiesOther: string;
  change: string;
};

type MultiKey = "topics" | "barriers" | "priorities";

const empty: Answers = {
  regionId: "",
  locality: "",
  age: "",
  gender: "",
  employment: "",
  topics: [],
  topicsOther: "",
  barriers: [],
  barriersOther: "",
  priorities: [],
  prioritiesOther: "",
  change: "",
};

const otherField: Record<MultiKey, "topicsOther" | "barriersOther" | "prioritiesOther"> = {
  topics: "topicsOther",
  barriers: "barriersOther",
  priorities: "prioritiesOther",
};

export function SurveyForm() {
  const { lang, t } = useI18n();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(empty);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const errorText =
    error === "chooseOne" ? t.survey.chooseOne
    : error === "chooseTwo" ? t.survey.chooseTwo
    : error === "otherRequired" ? t.survey.otherRequired
    : error === "changeTooShort" ? t.survey.changeTooShort
    : error;
  const [done, setDone] = useState(false);
  const steps = 9;

  function toggle(key: MultiKey, id: string) {
    setAnswers((current) => {
      const list = current[key];
      if (list.includes(id)) return { ...current, [key]: list.filter((item) => item !== id) };
      if (list.length >= 2) return current;
      return { ...current, [key]: [...list, id] };
    });
    setError("");
  }

  function setOther(key: MultiKey, value: string) {
    setAnswers((current) => ({ ...current, [otherField[key]]: value.slice(0, 200) }));
    setError("");
  }

  function pick(patch: Partial<Answers>) {
    setAnswers((current) => ({ ...current, ...patch }));
    setError("");
  }

  function validate() {
    if (step === 0 && !answers.regionId) return "chooseOne";
    if (step === 1 && !answers.locality) return "chooseOne";
    if (step === 2 && !answers.age) return "chooseOne";
    if (step === 3 && !answers.gender) return "chooseOne";
    if (step === 4 && !answers.employment) return "chooseOne";
    if (step === 5 && (answers.topics.length < 1 || answers.topics.length > 2)) return "chooseTwo";
    if (step === 5 && answers.topics.includes("other") && !answers.topicsOther.trim()) return "otherRequired";
    if (step === 6 && (answers.barriers.length < 1 || answers.barriers.length > 2)) return "chooseTwo";
    if (step === 6 && answers.barriers.includes("other") && !answers.barriersOther.trim()) return "otherRequired";
    if (step === 7 && (answers.priorities.length < 1 || answers.priorities.length > 2)) return "chooseTwo";
    if (step === 7 && answers.priorities.includes("other") && !answers.prioritiesOther.trim()) return "otherRequired";
    if (step === 8 && answers.change.trim().length < 3) return "changeTooShort";
    return "";
  }

  function next() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setStep((current) => Math.min(steps - 1, current + 1));
  }

  async function submit() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          answers: {
            ...answers,
            topicsOther: answers.topics.includes("other") ? answers.topicsOther.trim() : "",
            barriersOther: answers.barriers.includes("other") ? answers.barriersOther.trim() : "",
            prioritiesOther: answers.priorities.includes("other") ? answers.prioritiesOther.trim() : "",
            change: answers.change.trim(),
          },
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || t.errors.network);
      setDone(true);
      window.dispatchEvent(new Event(STATS_EVENT));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.errors.network);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="glass rounded-[28px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.survey.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{t.survey.thanksTitle}</h1>
        <p className="mt-4 leading-relaxed text-white/75">{t.survey.thanksText}</p>
        <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-aqua">
          {t.survey.home}
        </Link>
      </div>
    );
  }

  const question = [
    t.survey.q.region,
    t.survey.q.locality,
    t.survey.q.age,
    t.survey.q.gender,
    t.survey.q.employment,
    t.survey.q.topics,
    t.survey.q.barriers,
    t.survey.q.priorities,
    t.survey.q.change,
  ][step];

  const otherStep =
    step === 5 ? { key: "topics" as const, selected: answers.topics, other: answers.topicsOther }
    : step === 6 ? { key: "barriers" as const, selected: answers.barriers, other: answers.barriersOther }
    : step === 7 ? { key: "priorities" as const, selected: answers.priorities, other: answers.prioritiesOther }
    : null;

  return (
    <div className="glass rounded-[28px] p-6 sm:p-8" aria-busy={pending}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.survey.eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">«{forum.name}»</h1>
        </div>
        <LanguageSwitch />
      </div>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">{t.survey.lead}</p>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
          {t.survey.question} {step + 1} {t.survey.of} {steps}
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: steps }, (_, index) => (
            <span key={index} className={`h-1.5 w-4 rounded-full sm:w-6 ${index <= step ? "bg-gradient-to-r from-ember to-aqua" : "bg-white/15"}`} />
          ))}
        </div>
      </div>
      <h2 className="mt-5 text-pretty font-display text-2xl font-semibold leading-snug sm:text-3xl">{question.title}</h2>
      {step === 8 ? (
        <div className="mt-2 flex items-center justify-between gap-4 text-sm text-white/55">
          <p>{question.hint}</p>
          <p className="shrink-0">200 символ</p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-white/55">{question.hint}</p>
      )}

      <div className="mt-6 grid gap-3">
        {step === 0
          ? orderedAreas(surveyRegionOrder).map((area) => (
              <Choice key={area.id} active={answers.regionId === area.id} label={areaLabel(area.id, lang, "survey")} onClick={() => pick({ regionId: area.id })} />
            ))
          : null}
        {step === 1
          ? localityIds.map((id) => (
              <Choice key={id} active={answers.locality === id} label={t.survey.locality[id]} onClick={() => pick({ locality: id })} />
            ))
          : null}
        {step === 2
          ? ageIds.map((id) => <Choice key={id} active={answers.age === id} label={t.survey.age[id]} onClick={() => pick({ age: id })} />)
          : null}
        {step === 3
          ? genderIds.map((id) => (
              <Choice key={id} active={answers.gender === id} label={t.survey.gender[id]} onClick={() => pick({ gender: id })} />
            ))
          : null}
        {step === 4
          ? employmentIds.map((id) => (
              <Choice key={id} active={answers.employment === id} label={t.survey.employment[id]} onClick={() => pick({ employment: id })} />
            ))
          : null}
        {step === 5
          ? topicIds.map((id) => <Choice key={id} active={answers.topics.includes(id)} label={t.survey.topics[id]} onClick={() => toggle("topics", id)} />)
          : null}
        {step === 6
          ? barrierIds.map((id) => (
              <Choice key={id} active={answers.barriers.includes(id)} label={t.survey.barriers[id]} onClick={() => toggle("barriers", id)} />
            ))
          : null}
        {step === 7
          ? priorityIds.map((id) => (
              <Choice key={id} active={answers.priorities.includes(id)} label={t.survey.priorities[id]} onClick={() => toggle("priorities", id)} />
            ))
          : null}
        {otherStep?.selected.includes("other") ? (
          <input
            type="text"
            value={otherStep.other}
            onChange={(event) => setOther(otherStep.key, event.target.value)}
            maxLength={200}
            placeholder={t.survey.otherPh}
            aria-label={t.survey.otherPh}
            className="w-full rounded-2xl border border-white/15 bg-black/35 px-3.5 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-aqua"
          />
        ) : null}
        {step === 8 ? (
          <div>
            <input
              type="text"
              value={answers.change}
              onChange={(event) => pick({ change: event.target.value.slice(0, 200) })}
              maxLength={200}
              placeholder={t.survey.changePh}
              aria-label={question.title}
              className="w-full rounded-2xl border border-white/15 bg-black/35 px-3.5 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-aqua"
            />
            <p className="mt-2 text-right text-xs text-white/45">{answers.change.length}/200</p>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-flame" role="alert">
          {errorText}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || pending}>
          {t.survey.back}
        </Button>
        {step < steps - 1 ? (
          <Button onClick={next}>{t.survey.next}</Button>
        ) : (
          <Button onClick={submit} disabled={pending} aria-busy={pending}>
            {pending ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" /> : null}
            {pending ? t.survey.sending : t.survey.submit}
          </Button>
        )}
      </div>
    </div>
  );
}

function Choice({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-4 py-3 text-left text-sm leading-snug transition sm:text-base ${
        active ? "border-transparent bg-white text-ink" : "border-white/15 text-white/85 hover:border-white/30 hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}
