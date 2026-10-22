"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultCms } from "@/lib/cms";
import type { Cms } from "@/lib/types";

const ContentContext = createContext<Cms>(defaultCms);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [cms, setCms] = useState<Cms>(defaultCms);

  useEffect(() => {
    let ignore = false;
    fetch("/api/content", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Cms | null) => {
        if (!ignore && data?.concept?.ru) setCms(data);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  return <ContentContext.Provider value={cms}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
