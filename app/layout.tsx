import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Manrope, Unbounded } from "next/font/google";
import { Providers } from "@/components/providers";
import { forum } from "@/lib/content";
import { isLang, type Lang } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: `${forum.name} — ${forum.title}`,
  description: forum.mission,
  icons: { icon: "/logo.png" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  const stored = jar.get("kk_lang")?.value;
  const lang: Lang = isLang(stored) ? stored : "ru";

  return (
    <html lang={lang === "ky" ? "ky" : "ru"}>
      <body className={`${manrope.variable} ${unbounded.variable} antialiased`}>
        <Providers initialLang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
