import type { ReactNode } from "react";

export const fieldClass =
  "w-full rounded-2xl border border-white/15 bg-black/35 px-3.5 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-aqua";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm text-white/70">
      <span className="mb-2 block">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs leading-relaxed text-white/40">{hint}</span> : null}
    </label>
  );
}
