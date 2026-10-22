"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { messages, type Lang, type Messages } from "@/lib/i18n";
import type { Localized } from "@/lib/types";
import { cn } from "@/lib/utils";

type LanguageContextValue = {
  lang: Lang;
  t: Messages;
  setLang: (lang: Lang) => void;
  text: (value: Localized) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.cookie = `kk_lang=${next};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = next === "ky" ? "ky" : "ru";
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      t: messages[lang],
      setLang,
      text: (item) => item[lang] || item.ru,
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("Language provider is missing.");
  return value;
}

export function LanguageSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className={cn("flex rounded-full border border-white/15 p-0.5", className)} role="group" aria-label={t.lang.label}>
      {(
        [
          ["ky", "Кырг"],
          ["ru", "Рус"],
        ] as const
      ).map(([item, label]) => (
        <button
          key={item}
          type="button"
          onClick={() => setLang(item)}
          aria-pressed={lang === item}
          className={cn(
            "rounded-full px-2.5 py-1.5 text-xs font-semibold",
            lang === item ? "bg-white text-ink" : "text-white/70 hover:text-white",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
