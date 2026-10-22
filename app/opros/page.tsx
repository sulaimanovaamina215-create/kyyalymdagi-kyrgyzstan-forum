import type { Metadata } from "next";
import { SurveyForm } from "@/components/survey-form";
import { forum } from "@/lib/content";

export const metadata: Metadata = {
  title: `Опрос — ${forum.name}`,
  description: "Анонимный социологический опрос молодёжи 18–35 лет. Аты-жөнү жана телефон суралбайт.",
};

export default function SurveyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <SurveyForm />
    </main>
  );
}
