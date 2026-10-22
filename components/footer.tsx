"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/components/language";
import { contacts, forum } from "@/lib/content";

const icons: Record<string, ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M20.7 4.4 3.6 11c-1.2.46-1.18 1.08-.22 1.36l4.38 1.37 1.69 5.16c.2.62.1.86.68.86.36 0 .52-.16.72-.36l2.06-2 4.28 3.16c.78.44 1.34.2 1.54-.72l2.78-13.1c.28-1.12-.42-1.62-1.16-1.32Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M14.2 21v-7.1h2.4l.36-2.8h-2.76V9.3c0-.8.22-1.35 1.38-1.35H17V5.45A18 18 0 0 0 14.9 5.3c-2.08 0-3.5 1.27-3.5 3.6v2.2H8.8v2.8h2.6V21h2.8Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M22 12.2s0-3.2-.4-4.6c-.22-.86-.9-1.54-1.76-1.76C18.4 5.4 12 5.4 12 5.4s-6.4 0-7.84.44c-.86.22-1.54.9-1.76 1.76C2 9 2 12.2 2 12.2s0 3.2.4 4.6c.22.86.9 1.54 1.76 1.76 1.44.44 7.84.44 7.84.44s6.4 0 7.84-.44c.86-.22 1.54-.9 1.76-1.76.4-1.4.4-4.6.4-4.6ZM10.2 15.4V9l5.2 3.2-5.2 3.2Z" />
    </svg>
  ),
};

export function Footer() {
  const { t } = useI18n();
  return (
    <footer id="contacts" className="footer-bg border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold">{forum.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">{t.hero.mission}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.footer.contacts}</p>
          <ul className="mt-4 space-y-4 text-sm text-white/80">
            <li>
              <p className="text-white/45">{t.footer.trustPhone}</p>
              <a className="mt-1 inline-block hover:text-white" href={`tel:${contacts.phoneHref}`}>
                {contacts.phone}
              </a>
            </li>
            <li>
              <p className="text-white/45">{t.footer.hours}</p>
              <p className="mt-1 leading-relaxed">{t.footer.hoursValue}</p>
            </li>
            <li>
              <p className="text-white/45">{t.footer.address}</p>
              <p className="mt-1">{t.footer.addressValue}</p>
            </li>
            <li>
              <p className="text-white/45">{t.footer.fax}</p>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.footer.socials}</p>
          <div className="mt-4 flex gap-3">
            {contacts.socials.map((social) => {
              const className =
                "grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-transparent hover:bg-gradient-to-br hover:from-ember hover:via-magenta hover:to-aqua";
              const icon = icons[social.id];
              if (!social.href) {
                return (
                  <span key={social.id} className={className} title={t.footer.socialSoon} aria-label={social.label}>
                    {icon}
                  </span>
                );
              }
              return (
                <a key={social.id} href={social.href} className={className} aria-label={social.label} target="_blank" rel="noreferrer">
                  {icon}
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40 sm:px-6">
        <p>
          {t.hero.title} «{forum.name}» · {t.hero.dates}
        </p>
        <p className="mt-1">{t.footer.note}</p>
      </div>
    </footer>
  );
}
