"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/language";
import { forum } from "@/lib/content";
import { plural } from "@/lib/utils";

const start = new Date(forum.start).getTime();

export function Countdown() {
  const { lang, t } = useI18n();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = now === null ? null : Math.max(0, start - now);
  const opened = remaining === 0;
  const parts = remaining === null ? null : split(remaining);
  const unit = (value: number, forms: string[]) => (lang === "ky" ? forms[0] : plural(value, forms[0] ?? "", forms[1] ?? "", forms[2] ?? ""));

  return (
    <div className="glass rounded-[28px] p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t.countdown.title}</p>
        <p className="text-sm text-white/70">
          {t.hero.place} · {t.hero.dates}
        </p>
      </div>
      {opened ? (
        <p className="mt-6 font-display text-3xl font-semibold text-gradient">{t.countdown.opened}</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Cell value={parts?.days} label={parts ? unit(parts.days, t.countdown.days) : t.countdown.days[2]} />
          <Cell value={parts?.hours} label={parts ? unit(parts.hours, t.countdown.hours) : t.countdown.hours[2]} />
          <Cell value={parts?.minutes} label={parts ? unit(parts.minutes, t.countdown.minutes) : t.countdown.minutes[2]} />
          <Cell value={parts?.seconds} label={parts ? unit(parts.seconds, t.countdown.seconds) : t.countdown.seconds[2]} />
        </div>
      )}
    </div>
  );
}

function Cell({ value, label }: { value?: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
      <p className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">{value === undefined ? "—" : String(value).padStart(2, "0")}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">{label}</p>
    </div>
  );
}

function split(ms: number) {
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
