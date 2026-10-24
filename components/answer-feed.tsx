"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/language";
import { STATS_EVENT } from "@/components/survey-form";
import { AnswerCards } from "@/components/voices";
import type { Voice } from "@/components/use-voices";
import { fill } from "@/lib/i18n";

type Cursor = { before: string; beforeId: string };

type VoicesPage = {
  total: number;
  voices: Voice[];
  next: Cursor | null;
};

function appendUnique(current: Voice[], incoming: Voice[]) {
  const seen = new Set(current.map((item) => item.id));
  const extra = incoming.filter((item) => item.id && !seen.has(item.id));
  return extra.length ? [...current, ...extra] : current;
}

function mergeNewest(current: Voice[], incoming: Voice[]) {
  const seen = new Set(current.map((item) => item.id));
  const fresh = incoming.filter((item) => item.id && !seen.has(item.id));
  return fresh.length ? [...fresh, ...current] : current;
}

export function AnswerFeed({ active }: { active: boolean }) {
  const { t } = useI18n();
  const [items, setItems] = useState<Voice[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const loading = useRef(false);
  const nextRef = useRef<Cursor | null>(null);
  const reduce = useRef(false);
  const primed = useRef(false);
  const resumeTimer = useRef(0);

  async function load(cursor: Cursor | null, mode: "append" | "newest") {
    if (loading.current) return;
    loading.current = true;
    try {
      const params = new URLSearchParams({ limit: "40" });
      if (cursor) {
        params.set("before", cursor.before);
        params.set("beforeId", cursor.beforeId);
      }
      const response = await fetch(`/api/voices?${params}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as VoicesPage;
      if (!Array.isArray(data.voices)) return;
      setTotal(typeof data.total === "number" ? data.total : 0);
      nextRef.current = data.next ?? null;
      setItems((current) => (mode === "append" ? appendUnique(current, data.voices) : mergeNewest(current, data.voices)));
      setLoaded(true);
    } catch {
      setLoaded(true);
    } finally {
      loading.current = false;
    }
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reduce.current = media.matches;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!active || primed.current) return;
    primed.current = true;
    void load(null, "newest");
  }, [active]);

  useEffect(() => {
    const onStats = () => {
      void load(null, "newest");
    };
    window.addEventListener(STATS_EVENT, onStats);
    return () => window.removeEventListener(STATS_EVENT, onStats);
  }, []);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const node = scrollerRef.current;
      if (!node || paused.current || reduce.current) return;
      if (node.scrollHeight - node.clientHeight <= 4) return;
      const distance = node.scrollHeight - node.clientHeight - node.scrollTop;
      if (distance > 1) node.scrollTop += 0.45;
      if (distance < 180 && nextRef.current) void load(nextRef.current, "append");
      if (distance <= 1 && !nextRef.current) node.scrollTop = 0;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  function hold() {
    paused.current = true;
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      paused.current = false;
    }, 8000);
  }

  function onScroll() {
    const node = scrollerRef.current;
    if (!node || !nextRef.current || loading.current) return;
    if (node.scrollTop + node.clientHeight >= node.scrollHeight - 160) {
      void load(nextRef.current, "append");
    }
  }

  return (
    <div>
      {total > 0 ? <p className="px-3 pb-2 text-xs text-white/45">{fill(t.stats.voicesOf, { shown: items.length, total })}</p> : null}
      <div
        ref={scrollerRef}
        className="h-60 space-y-2 overflow-y-auto overscroll-contain px-1 pb-1"
        onScroll={onScroll}
        onWheel={hold}
        onTouchStart={hold}
        onPointerDown={hold}
      >
        {loaded && items.length === 0 ? <p className="px-3 py-3 text-sm text-white/50">{t.stats.voicesEmpty}</p> : null}
        <ul className="space-y-2">
          <AnswerCards items={items} />
        </ul>
      </div>
    </div>
  );
}
