"use client";

import { useState } from "react";
import { useContent } from "@/components/content-provider";
import { useI18n } from "@/components/language";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import type { Cms } from "@/lib/types";

const tones = [
  "from-ember/80 via-flame/40 to-ink",
  "from-violet via-magenta/70 to-ink",
  "from-sky via-aqua/70 to-ink",
  "from-magenta via-ember/60 to-ink",
  "from-aqua/80 via-violet/50 to-ink",
  "from-flame via-violet/40 to-ink",
];

type ArchiveItem = Cms["archive"][number];

export function Archive() {
  const { t, text } = useI18n();
  const content = useContent();
  const [active, setActive] = useState<ArchiveItem | null>(null);
  const items = [...content.archive].sort((a, b) => b.year.localeCompare(a.year));

  return (
    <section id="archive" className="archive-bg mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-28">
      <SectionHeading eyebrow={t.archive.eyebrow} title={t.archive.title} text={t.archive.text} />
      {items.length ? (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className="group relative aspect-[5/4] overflow-hidden rounded-[28px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua sm:aspect-[4/5]"
            >
              {isImage(item.url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${tones[index % tones.length]}`} />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  <span>{item.year}</span>
                  <span className="h-1 w-1 rounded-full bg-aqua" />
                  <span>{t.archive.kinds[item.kind]}</span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold">{text(item.title)}</h3>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-white/60">{t.archive.empty}</p>
      )}

      {active ? (
        <div className="fixed inset-0 z-[60] grid place-items-end p-3 sm:place-items-center sm:p-6">
          <button type="button" className="absolute inset-0 bg-black/70" aria-label={t.archive.close} onClick={() => setActive(null)} />
          <article className="glass relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aqua">
              {active.year} · {t.archive.kinds[active.kind]}
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold">{text(active.title)}</h3>
            <p className="mt-4 leading-relaxed text-white/75">{text(active.text)}</p>
            <ArchiveMedia item={active} watch={t.archive.watch} file={t.archive.file} />
            <Button className="mt-6" variant="ghost" onClick={() => setActive(null)}>
              {t.archive.close}
            </Button>
          </article>
        </div>
      ) : null}
    </section>
  );
}

function ArchiveMedia({ item, watch, file }: { item: ArchiveItem; watch: string; file: string }) {
  if (!item.url) return null;
  if (isImage(item.url)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.url} alt={item.title.ru} className="mt-5 w-full rounded-2xl" />;
  }
  if (/\.(mp4|webm)$/i.test(item.url)) {
    return <video src={item.url} controls className="mt-5 w-full rounded-2xl" />;
  }
  return (
    <a href={item.url} className="mt-5 inline-flex text-sm font-semibold text-aqua" target="_blank" rel="noreferrer">
      {item.kind === "video" ? watch : file}
    </a>
  );
}

function isImage(url: string) {
  return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);
}
