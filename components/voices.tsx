"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useI18n } from "@/components/language";
import { useVoices, type Voice } from "@/components/use-voices";
import { areaLabel } from "@/lib/regions";
import { formatDate } from "@/lib/utils";

export function AnswerCards({ items }: { items: Voice[] }) {
  const { lang } = useI18n();
  return items.map((item, index) => (
    <li key={item.id || `${item.createdAt}-${index}`} className="rounded-2xl border border-white/10 px-4 py-3">
      <p className="text-xs text-white/45">
        {formatDate(item.createdAt, lang)} · {areaLabel(item.regionId, lang, "survey")}
      </p>
      <p className="mt-1 text-sm leading-relaxed [overflow-wrap:anywhere]">{item.change}</p>
    </li>
  ));
}

export function Voices() {
  const { t } = useI18n();
  const { items, loaded } = useVoices();
  const [reduceMotion, setReduceMotion] = useState(false);
  const duration = Math.max(16, items.length * 8);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return (
    <div id="voices" className="mt-8">
      <article className="glass rounded-[28px] p-6 sm:p-8">
        <h3 className="font-display text-2xl font-semibold">{t.survey.q.change.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{t.stats.voicesNote}</p>
        {loaded && items.length === 0 ? <p className="mt-6 text-sm text-white/50">{t.stats.voicesEmpty}</p> : null}
        {items.length > 0 ? (
          <div className={`voice-marquee mt-6 h-80 ${reduceMotion ? "is-static" : ""}`}>
            <div className="voice-track" style={{ "--voice-duration": `${duration}s` } as CSSProperties}>
              <ul className="space-y-3 pb-3">
                <AnswerCards items={items} />
              </ul>
              {reduceMotion ? null : (
                <ul className="space-y-3 pb-3" aria-hidden="true">
                  <AnswerCards items={items} />
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </article>
    </div>
  );
}
