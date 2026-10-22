"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fieldClass } from "@/components/field";
import { Button } from "@/components/ui/button";
import { forum } from "@/lib/content";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось войти.");
      router.replace("/admin");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось войти.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-[28px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">Организаторы</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Вход в панель</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Закрытый раздел форума «{forum.name}»: делегации, аналитика опроса и содержание сайта.
        </p>
        <label className="mt-6 block text-sm text-white/70">
          Пароль
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${fieldClass} mt-2`}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="mt-4 text-sm text-flame">{error}</p> : null}
        <Button type="submit" className="mt-6 w-full" disabled={pending}>
          {pending ? "Проверяем…" : "Войти"}
        </Button>
      </form>
    </main>
  );
}
