"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ContentProvider } from "@/components/content-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/components/language";
import type { Lang } from "@/lib/i18n";

export function Providers({ initialLang, children }: { initialLang: Lang; children: ReactNode }) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <ContentProvider>
        <SiteShell>{children}</SiteShell>
      </ContentProvider>
    </LanguageProvider>
  );
}

function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");

  return (
    <>
      <div className="site-glow pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-20%] top-[-24%] h-[44rem] w-[44rem] rounded-full blur-[160px]" />
        <div className="absolute right-[-18%] top-[6%] h-[42rem] w-[42rem] rounded-full blur-[160px]" />
        <div className="absolute bottom-[-24%] left-[16%] h-[40rem] w-[40rem] rounded-full blur-[160px]" />
      </div>
      {admin ? (
        children
      ) : (
        <>
          <Header />
          {children}
          <Footer />
        </>
      )}
    </>
  );
}
