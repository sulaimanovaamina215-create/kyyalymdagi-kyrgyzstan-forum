import type { Metadata } from "next";
import { ApplicationForm } from "@/components/application-form";
import { forum } from "@/lib/content";

export const metadata: Metadata = {
  title: `Регистрация — ${forum.name}`,
  description: "Заявка на участие: ФИО, номер WhatsApp и мотивационное письмо.",
};

export default function ApplicationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <ApplicationForm />
    </main>
  );
}
