"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ProgramCopy } from "@/components/program-copy";
import { useI18n } from "@/components/language";

export function ProgramModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end p-3 sm:place-items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-black/75" aria-label={t.archive.close} onClick={onClose} />
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="program-dialog-title"
        className="program-sheet relative z-10 flex max-h-[min(92dvh,52rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl"
      >
        <div className="overflow-y-auto">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p id="program-dialog-title" className="font-display text-lg font-semibold">
              {t.nav.program}
            </p>
            <button
              ref={closeRef}
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label={t.archive.close}
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
          <ProgramCopy />
        </div>
      </article>
    </div>
  );
}
