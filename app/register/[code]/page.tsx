import type { Metadata } from "next";
import { DelegationForm } from "@/components/delegation-form";
import { forum } from "@/lib/content";

type Context = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { code } = await params;
  return { title: `Заявка ${decodeURIComponent(code)} — ${forum.name}` };
}

export default async function EditRegisterPage({ params }: Context) {
  const { code } = await params;
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <DelegationForm code={decodeURIComponent(code)} />
    </main>
  );
}
