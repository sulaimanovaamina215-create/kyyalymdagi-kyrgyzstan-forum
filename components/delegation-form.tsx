"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Field, fieldClass } from "@/components/field";
import { useI18n } from "@/components/language";
import { Button } from "@/components/ui/button";
import { fill } from "@/lib/i18n";
import { areaLabel, delegationRegionOrder, orderedAreas } from "@/lib/regions";
import { organizationTypes, type Delegation, type OrganizationType } from "@/lib/types";

type FormState = {
  fullName: string;
  position: string;
  phone: string;
  email: string;
  organizationType: OrganizationType | "";
  regionId: string;
  district: string;
  organizationName: string;
  participantCount: string;
  willCoordinate: "" | "yes" | "no";
  consent: boolean;
};

const blank: FormState = {
  fullName: "",
  position: "",
  phone: "",
  email: "",
  organizationType: "",
  regionId: "",
  district: "",
  organizationName: "",
  participantCount: "",
  willCoordinate: "",
  consent: false,
};

export function DelegationForm({ code }: { code?: string }) {
  const { lang, t } = useI18n();
  const [form, setForm] = useState<FormState>(blank);
  const [file, setFile] = useState<File | null>(null);
  const [participants, setParticipants] = useState<Delegation["participants"]>([]);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(Boolean(code));
  const [missing, setMissing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ code: string; participantCount: number } | null>(null);

  useEffect(() => {
    if (!code) return;
    let ignore = false;
    fetch(`/api/register/${encodeURIComponent(code)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("missing");
        return (await response.json()) as Delegation;
      })
      .then((entry) => {
        if (ignore) return;
        setForm({
          fullName: entry.fullName,
          position: entry.position,
          phone: entry.phone,
          email: entry.email,
          organizationType: entry.organizationType,
          regionId: entry.regionId,
          district: entry.district,
          organizationName: entry.organizationName,
          participantCount: String(entry.participants.length),
          willCoordinate: entry.willCoordinate ? "yes" : "no",
          consent: true,
        });
        setParticipants(entry.participants);
      })
      .catch(() => {
        if (!ignore) setMissing(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [code]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setErrors([]);
    setNotice("");
    const body = new FormData();
    body.set("lang", lang);
    body.set("fullName", form.fullName);
    body.set("position", form.position);
    body.set("phone", form.phone);
    body.set("email", form.email);
    body.set("organizationType", form.organizationType);
    body.set("regionId", form.regionId);
    body.set("district", form.district);
    body.set("organizationName", form.organizationName);
    body.set("participantCount", form.participantCount);
    body.set("willCoordinate", form.willCoordinate);
    if (form.consent) body.set("consent", "yes");
    if (file) body.set("file", file);

    try {
      const response = await fetch(code ? `/api/register/${encodeURIComponent(code)}` : "/api/register", {
        method: code ? "PUT" : "POST",
        body,
      });
      const data = (await response.json()) as { errors?: string[]; code?: string; participantCount?: number };
      if (!response.ok) throw new Error(data.errors?.join("\n") || t.errors.network);
      if (!code && data.code && typeof data.participantCount === "number") {
        setResult({ code: data.code, participantCount: data.participantCount });
      } else {
        setNotice(t.register.updated);
        if (typeof data.participantCount === "number") update("participantCount", String(data.participantCount));
        if (file) {
          const fresh = await fetch(`/api/register/${encodeURIComponent(code ?? "")}`, { cache: "no-store" });
          if (fresh.ok) {
            const entry = (await fresh.json()) as Delegation;
            setParticipants(entry.participants);
          }
          setFile(null);
        }
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : t.errors.network;
      setErrors(message.split("\n").filter(Boolean));
    } finally {
      setPending(false);
    }
  }

  if (loading) return <p className="text-white/70">{t.register.loading}</p>;
  if (missing) return <p className="text-white/70">{t.register.notFound}</p>;

  if (result) {
    const editPath = `/register/${result.code}`;
    return (
      <div className="glass rounded-[28px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.register.successEyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{t.register.successTitle}</h1>
        <p className="mt-4 leading-relaxed text-white/75">{t.register.successText}</p>
        <p className="mt-6 text-sm text-white/50">{t.register.number}</p>
        <p className="mt-1 font-display text-3xl font-semibold tracking-wide">{result.code}</p>
        <p className="mt-3 text-white/80">{fill(t.register.total, { count: result.participantCount })}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(result.code);
              setCopied(true);
            }}
          >
            {copied ? t.register.copied : t.register.copy}
          </Button>
          <Link href={editPath} className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold">
            {t.register.edit}
          </Link>
          <Link href="/" className="inline-flex items-center justify-center px-5 py-3 text-sm text-white/70">
            {t.register.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="glass rounded-[28px] p-6 sm:p-8" onSubmit={submit}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{t.register.eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{code ? t.register.editTitle : t.register.title}</h1>
      {code ? <p className="mt-2 font-display text-lg text-aqua">{code}</p> : null}
      <p className="mt-4 text-sm leading-relaxed text-white/65">{t.register.lead}</p>

      <fieldset className="mt-8 space-y-4">
        <legend className="font-display text-xl">{t.register.responsible}</legend>
        <Field label={t.register.fullName}>
          <input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} className={fieldClass} placeholder={t.register.namePh} autoComplete="name" />
        </Field>
        <Field label={t.register.position}>
          <input required value={form.position} onChange={(event) => update("position", event.target.value)} className={fieldClass} placeholder={t.register.positionPh} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.register.phone}>
            <input required value={form.phone} onChange={(event) => update("phone", event.target.value)} className={fieldClass} placeholder="+996" autoComplete="tel" inputMode="tel" />
          </Field>
          <Field label={t.register.email}>
            <input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={fieldClass} placeholder="name@email.com" autoComplete="email" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-8 space-y-4">
        <legend className="font-display text-xl">{t.register.delegation}</legend>
        <Field label={t.register.orgType}>
          <select required value={form.organizationType} onChange={(event) => update("organizationType", event.target.value as OrganizationType)} className={fieldClass}>
            <option value="">{t.register.choose}</option>
            {organizationTypes.map((item) => (
              <option key={item} value={item}>
                {t.register.org[item]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.register.region}>
          <select required value={form.regionId} onChange={(event) => update("regionId", event.target.value)} className={fieldClass}>
            <option value="">{t.register.choose}</option>
            {orderedAreas(delegationRegionOrder).map((area) => (
              <option key={area.id} value={area.id}>
                {areaLabel(area.id, lang)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.register.district}>
          <input required value={form.district} onChange={(event) => update("district", event.target.value)} className={fieldClass} placeholder={t.register.districtPh} />
        </Field>
        <Field label={t.register.orgName}>
          <input required value={form.organizationName} onChange={(event) => update("organizationName", event.target.value)} className={fieldClass} placeholder={t.register.orgPh} />
        </Field>
        <Field label={t.register.count}>
          <input
            required
            type="number"
            min={1}
            max={500}
            value={form.participantCount}
            onChange={(event) => update("participantCount", event.target.value)}
            className={fieldClass}
            inputMode="numeric"
          />
        </Field>
      </fieldset>

      <fieldset className="mt-8 space-y-4">
        <legend className="font-display text-xl">{t.register.listTitle}</legend>
        <a href="/api/register/template" className="inline-flex text-sm font-semibold text-aqua">
          {t.register.template}
        </a>
        <Field label={t.register.file} hint={code ? t.register.replaceFile : t.register.fileHint}>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-white/80 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
          />
        </Field>
        {participants.length ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <p className="px-4 pt-4 text-sm text-white/50">{t.register.currentList}</p>
            <table className="mt-2 w-full min-w-[640px] text-left text-sm">
              <tbody>
                {participants.map((person, index) => (
                  <tr key={person.id} className="border-t border-white/10">
                    <td className="px-4 py-2 text-white/45">{index + 1}</td>
                    <td className="px-4 py-2">{person.fullName}</td>
                    <td className="px-4 py-2 text-white/70">{person.age}</td>
                    <td className="px-4 py-2 text-white/70">{person.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="mt-8 space-y-4">
        <legend className="font-display text-xl">{t.register.coordinate}</legend>
        <div className="flex gap-2">
          {(["yes", "no"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => update("willCoordinate", item)}
              className={`rounded-full border px-4 py-2 text-sm ${form.willCoordinate === item ? "border-transparent bg-white text-ink" : "border-white/15 text-white/80"}`}
            >
              {item === "yes" ? t.register.yes : t.register.no}
            </button>
          ))}
        </div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
          <input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} className="mt-1 h-4 w-4 accent-[#ff6b00]" />
          <span>{t.register.consent}</span>
        </label>
      </fieldset>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" name="company" />
      </div>

      {notice ? <p className="mt-6 text-sm text-aqua">{notice}</p> : null}
      {errors.length ? (
        <ul className="mt-6 space-y-2 text-sm text-flame" role="alert">
          {errors.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      <Button type="submit" className="mt-6 w-full" disabled={pending}>
        {pending ? t.register.saving : code ? t.register.save : t.register.submit}
      </Button>
    </form>
  );
}
