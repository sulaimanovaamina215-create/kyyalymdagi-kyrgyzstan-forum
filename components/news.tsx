"use client";

import { useContent } from "@/components/content-provider";
import { useI18n } from "@/components/language";
import { SectionHeading } from "@/components/section-heading";
import { formatDate } from "@/lib/utils";

export function News() {
  const { lang, t, text } = useI18n();
  const content = useContent();
  const items = [...content.news].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section id="news" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-28">
      <SectionHeading eyebrow={t.news.eyebrow} title={t.news.title} text={t.news.text} />
      {items.length ? (
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="glass rounded-[28px] p-6">
              <p className="text-sm font-semibold text-aqua">{formatDate(item.date, lang)}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{text(item.title)}</h3>
              <p className="mt-3 leading-relaxed text-white/70">{text(item.text)}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-white/60">{t.news.empty}</p>
      )}
    </section>
  );
}
