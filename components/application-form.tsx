"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Field, fieldClass } from "@/components/field";
import { useI18n } from "@/components/language";
import { Button } from "@/components/ui/button";
import { countWords, formatWhatsAppInput, MOTIVATION_WORD_LIMIT, parseApplication } from "@/lib/application";
import { forumNotifyEmail } from "@/lib/google-survey";
import { fill } from "@/lib/i18n";

export function ApplicationForm() {
  const { lang, t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [letter, setLetter] = useState("");
  const [company, setCompany] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const words = countWords(letter);
  const overLimit = words > MOTIVATION_WORD_LIMIT;

  function message(code: string) {
    if (code === "applyName") return t.errors.applyName;
    if (code === "applyPhone") return t.errors.applyPhone;
    if (code === "applyLetter") return t.errors.applyLetter;
    if (code === "applyWords") return t.errors.applyWords;
    return code;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseApplication({ fullName, phone, letter });
    if (!parsed.ok) {
      setError(message(parsed.error));
      return;
    }

    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, fullName: parsed.value.fullName, phone: parsed.value.phone, letter: parsed.value.letter, company }),
      });
      const data = (await response.json()) as { error?: string; relay?: boolean };
      if (!response.ok) throw new Error(data.error || t.errors.network);
      if (data.relay) await deliverToInbox(parsed.value, t.errors.applyActivate, t.errors.applyMail);
      setDone(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.errors.network);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="glass rounded-[28px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.apply.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{t.apply.successTitle}</h1>
        <p className="mt-4 leading-relaxed text-white/75">{t.apply.successText}</p>
        <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-aqua">
          {t.apply.home}
        </Link>
      </div>
    );
  }

  return (
    <form className="glass relative rounded-[28px] p-6 sm:p-8" onSubmit={submit} noValidate>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.apply.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{t.apply.title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-white/65">{t.apply.lead}</p>

      <div className="mt-8 space-y-4">
        <Field label={t.apply.fullName}>
          <input
            required
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              setError("");
            }}
            className={fieldClass}
            placeholder={t.apply.namePh}
            autoComplete="name"
            maxLength={160}
            name="fullName"
          />
        </Field>
        <Field label={t.apply.phone} hint={t.apply.phoneHint}>
          <input
            required
            value={phone}
            onFocus={() => {
              if (!phone) setPhone("+996 ");
            }}
            onBlur={() => {
              if (whatsAppDigits(phone).length <= 3) setPhone("");
            }}
            onChange={(event) => {
              const next = formatWhatsAppInput(event.target.value);
              setPhone(next || "+996 ");
              setError("");
            }}
            className={fieldClass}
            placeholder="+996 XXX XXX XXX"
            autoComplete="tel"
            inputMode="tel"
            name="phone"
            aria-invalid={error === t.errors.applyPhone}
          />
        </Field>
        <Field label={t.apply.letter}>
          <textarea
            required
            value={letter}
            onChange={(event) => {
              setLetter(event.target.value);
              setError("");
            }}
            className={`${fieldClass} min-h-40 resize-y`}
            placeholder={t.apply.letterPh}
            rows={8}
            maxLength={20000}
            name="letter"
          />
          <span className={`mt-2 block text-xs leading-relaxed ${overLimit ? "text-flame" : "text-white/40"}`}>
            {fill(t.apply.letterHint, { count: words })}
          </span>
        </Field>
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" name="company" value={company} onChange={(event) => setCompany(event.target.value)} />
      </div>

      {error ? (
        <p className="mt-6 text-sm text-flame" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="mt-6 w-full" disabled={pending}>
        {pending ? t.apply.sending : t.apply.submit}
      </Button>
    </form>
  );
}

function whatsAppDigits(value: string) {
  return value.replace(/\D/g, "");
}

async function deliverToInbox(application: { fullName: string; phone: string; letter: string }, activateText: string, failText: string) {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(forumNotifyEmail)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: `Новая заявка: ${application.fullName.slice(0, 80)}`,
      _template: "box",
      _captcha: "false",
      name: application.fullName,
      phone: application.phone,
      message: application.letter,
    }),
    signal: AbortSignal.timeout(60000),
  });
  const data = (await response.json().catch(() => ({}))) as { success?: string; message?: string };
  if (String(data.success) === "true") return;
  if (/activ/i.test(data.message || "")) throw new Error(activateText);
  throw new Error(failText);
}
