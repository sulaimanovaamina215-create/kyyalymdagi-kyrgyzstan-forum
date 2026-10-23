"use client";

import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { useI18n } from "@/components/language";
import { Logo } from "@/components/logo";
import { forum } from "@/lib/content";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="hero-glow relative pt-24 sm:pt-32">
      <div className="hero-spot-gold pointer-events-none absolute -left-32 -top-36 h-[40rem] w-[40rem] rounded-full blur-[160px]" />
      <div className="hero-spot-cyan pointer-events-none absolute -right-28 top-4 h-[42rem] w-[42rem] rounded-full blur-[160px]" />
      <div className="hero-spot-green pointer-events-none absolute -bottom-32 left-[20%] h-[36rem] w-[42rem] rounded-full blur-[160px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:pb-28">
        <div>
          <p className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            {t.hero.place} · {t.hero.dates}
          </p>
          <h1 className="mt-5 max-w-full font-display text-[1.85rem] font-semibold leading-[1.08] min-[400px]:text-4xl sm:mt-6 sm:text-6xl">
            {t.hero.title}
            <span className="mt-2 block text-gradient">«{forum.name}»</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:mt-6 sm:text-lg">{t.hero.mission}</p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link href="/opros" className="btn-brand inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold sm:w-auto">
              {t.hero.survey}
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {t.hero.topics.map((topic) => (
              <li key={topic} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75">
                {topic}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[15rem] sm:max-w-md">
          <div className="logo-halo absolute inset-2 rounded-full" />
          <div className="relative grid aspect-square place-items-center">
            <div className="logo-ring absolute inset-0 rounded-full border" />
            <div className="logo-ring-inner absolute inset-5 rounded-full border border-dashed sm:inset-6" />
            <Logo className="relative h-36 w-36 sm:h-72 sm:w-72" />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <Countdown />
      </div>
    </section>
  );
}
