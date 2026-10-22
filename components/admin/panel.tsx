"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentTab } from "@/components/admin/content-tab";
import { DelegationsTab } from "@/components/admin/delegations-tab";
import { SurveyTab } from "@/components/admin/survey-tab";
import { forum } from "@/lib/content";

const tabs = [
  { id: "delegations", label: "Делегации" },
  { id: "survey", label: "Опрос" },
  { id: "content", label: "Содержание" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("delegations");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">Панель организатора</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{forum.name}</h1>
        </div>
        <button type="button" onClick={logout} className="rounded-full border border-white/15 px-4 py-2 text-sm">
          Выйти
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm ${tab === item.id ? "bg-white text-ink" : "border border-white/15 text-white/75"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "delegations" ? <DelegationsTab /> : null}
        {tab === "survey" ? <SurveyTab /> : null}
        {tab === "content" ? <ContentTab /> : null}
      </div>
    </div>
  );
}
