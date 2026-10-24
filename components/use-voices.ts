"use client";

import { useEffect, useState } from "react";
import { STATS_EVENT } from "@/components/survey-form";

export type Voice = { id: string; regionId: string; change: string; createdAt: string };

export function useVoices(limit = 24) {
  const [items, setItems] = useState<Voice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const response = await fetch(`/api/voices?limit=${limit}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { voices?: Voice[] };
        if (ignore || !Array.isArray(data.voices)) return;
        setItems(data.voices);
        setLoaded(true);
      } catch {
        if (!ignore) setLoaded(true);
      }
    }

    load();
    window.addEventListener(STATS_EVENT, load);
    return () => {
      ignore = true;
      window.removeEventListener(STATS_EVENT, load);
    };
  }, [limit]);

  return { items, loaded };
}
