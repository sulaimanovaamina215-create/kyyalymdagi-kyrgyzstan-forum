"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnswerFeed } from "@/components/answer-feed";
import { useI18n } from "@/components/language";

export function SurveyNav({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinned) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPinned(false);
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPinned(false);
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  const panel = open ? (
    <div className={mobile ? "mt-1 rounded-2xl border border-white/10 bg-white/[0.04]" : "absolute right-0 top-full z-50 mt-3 w-[min(26rem,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-ink/95 p-2 shadow-2xl backdrop-blur-xl"}>
      <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-[0.16em] text-aqua">{t.stats.voices}</p>
      <p className="px-3 pb-2 pt-2 text-sm leading-snug text-white/70">{t.survey.q.change.title}</p>
      <AnswerFeed active={open} />
      <Link href="/opros" className="mx-2 mb-2 mt-1 block rounded-full px-3 py-2 text-center text-sm font-semibold text-aqua hover:bg-white/5" onClick={onNavigate}>
        {t.hero.survey}
      </Link>
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={mobile ? "relative" : "relative"}
      onMouseEnter={() => {
        if (!mobile) setOpen(true);
      }}
      onMouseLeave={() => {
        if (!mobile && !pinned) setOpen(false);
      }}
    >
      <button
        type="button"
        className={mobile ? "block w-full rounded-2xl px-3 py-3.5 text-left text-base text-white/90 active:bg-white/10" : "text-sm text-white/75 transition hover:text-white"}
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => {
            const next = !(current && pinned);
            setPinned(next);
            return next;
          });
        }}
      >
        {t.nav.survey}
      </button>
      {panel}
    </div>
  );
}
