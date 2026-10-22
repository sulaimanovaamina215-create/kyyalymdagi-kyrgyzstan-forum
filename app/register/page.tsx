import type { Metadata } from "next";
import { DelegationForm } from "@/components/delegation-form";
import { forum } from "@/lib/content";

export const metadata: Metadata = {
  title: `Регистрация делегации — ${forum.name}`,
  description: "Групповая регистрация делегации: ответственное лицо, организация и список участников в Excel.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <DelegationForm />
    </main>
  );
}
