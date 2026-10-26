"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useContent } from "@/components/content-provider";
import { useI18n } from "@/components/language";
import { ProgramCopy } from "@/components/program-copy";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

export function About() {
  const { t, text } = useI18n();
  const content = useContent();
  const [programOpen, setProgramOpen] = useState(true);

  return (
    <>
      <section id="about" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-28">
        <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} text={t.about.text} />
        <article id="concept" className="glass mt-12 rounded-[28px] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.about.concept}</p>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/80">{text(content.concept)}</p>
        </article>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {content.goals.map((goal, index) => (
            <Reveal key={goal.id} delay={index * 0.05}>
              <article className="glass h-full rounded-3xl p-6">
                <p className="font-display text-sm text-gradient">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 font-display text-2xl font-semibold">{text(goal.title)}</h3>
                <p className="mt-3 leading-relaxed text-white/70">{text(goal.text)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="program" className="program-bg mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-28">
        <h2>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 text-left"
            aria-expanded={programOpen}
            aria-controls="program-panel"
            onClick={() => setProgramOpen((open) => !open)}
          >
            <span className="font-display text-3xl font-semibold sm:text-4xl">{t.about.program}</span>
            <ChevronDown className={`shrink-0 transition ${programOpen ? "rotate-180" : ""}`} size={28} aria-hidden />
          </button>
        </h2>
        {programOpen ? (
          <div id="program-panel" className="program-sheet mt-8 overflow-hidden rounded-[28px]">
            <ProgramCopy />
          </div>
        ) : null}
      </section>
    </>
  );
}
