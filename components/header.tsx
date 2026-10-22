"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LanguageSwitch, useI18n } from "@/components/language";
import { Logo } from "@/components/logo";
import { forum } from "@/lib/content";

export function Header() {
  const { t } = useI18n();
  const [menu, setMenu] = useState(false);
  const desktop = [
    { href: "/#about", label: t.nav.about },
    { href: "/#program", label: t.nav.program },
    { href: "/#news", label: t.nav.news },
    { href: "/#archive", label: t.nav.archive },
    { href: "/opros", label: t.nav.survey },
  ];
  const mobile = [
    ...desktop.slice(0, 2),
    { href: "/#organizers", label: t.nav.organizers },
    ...desktop.slice(2),
    { href: "/#stats", label: t.nav.stats },
    { href: "/#contacts", label: t.nav.contacts },
  ];

  useEffect(() => {
    if (!menu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menu]);

  return (
    <>
      {menu ? (
        <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" aria-label={t.nav.closeMenu} onClick={() => setMenu(false)} />
      ) : null}
      <header className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 pt-[env(safe-area-inset-top)] backdrop-blur-xl ${menu ? "bg-ink" : "bg-ink/80"}`}>
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2 overflow-hidden" onClick={() => setMenu(false)}>
            <Logo className="h-10 w-10 shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-sm font-semibold">{forum.name}</span>
              <span className="hidden truncate text-[10px] uppercase tracking-[0.16em] text-white/50 sm:block">{t.brand.subtitle}</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="mr-1 hidden items-center gap-4 lg:flex" aria-label={t.nav.about}>
              {desktop.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-white/75 transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
            <LanguageSwitch />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 lg:hidden"
              aria-expanded={menu}
              aria-label={menu ? t.nav.closeMenu : t.nav.openMenu}
              onClick={() => setMenu((current) => !current)}
            >
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menu ? (
          <nav
            className="min-h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto border-t border-white/10 bg-ink px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
            aria-label={t.nav.about}
          >
            {mobile.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-2xl px-3 py-3.5 text-base text-white/90 active:bg-white/10"
                onClick={() => setMenu(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
    </>
  );
}
