"use client";

import { useContent } from "@/components/content-provider";
import { useI18n } from "@/components/language";

export function Organizers() {
  const { t, text } = useI18n();
  const content = useContent();

  return (
    <section id="organizers" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-28">
      <div id="partners">
        <h3 className="font-display text-3xl font-semibold">{t.organizers.partners}</h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.partners.map((partner) => (
            <li key={partner.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              {partner.url ? (
                <a href={partner.url} className="font-display text-xl hover:text-aqua" target="_blank" rel="noreferrer">
                  {text(partner.name)}
                </a>
              ) : (
                <p className="font-display text-xl">{text(partner.name)}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
