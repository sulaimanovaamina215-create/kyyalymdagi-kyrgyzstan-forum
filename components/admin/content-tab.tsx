"use client";

import { useEffect, useState, type ReactNode } from "react";
import { fieldClass } from "@/components/field";
import { archiveKinds } from "@/lib/cms";
import { messages } from "@/lib/i18n";
import type { ArchiveKind, Cms, Localized } from "@/lib/types";

const kindLabels = messages.ru.archive.kinds;

export function ContentTab() {
  const [cms, setCms] = useState<Cms | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Не удалось открыть содержание.");
        return (await response.json()) as Cms;
      })
      .then(setCms)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Ошибка загрузки"));
  }, []);

  async function save() {
    if (!cms) return;
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cms),
      });
      const data = (await response.json()) as Cms & { error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось сохранить.");
      setCms(data);
      setMessage("Содержание сайта обновлено.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось сохранить.");
    } finally {
      setPending(false);
    }
  }

  async function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) throw new Error(data.error || "Файл не загрузился.");
    return data.url;
  }

  if (!cms) return <p className="text-white/60">{error || "Загружаем содержание…"}</p>;

  return (
    <div className="space-y-8">
      <p className="text-sm text-white/55">Тексты заполняются на русском и кыргызском. Пустая языковая версия не сохранится.</p>
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Концепция</h2>
        <Pair value={cms.concept} onChange={(concept) => setCms({ ...cms, concept })} multiline />
      </section>

      <List title="Цели" onAdd={() => setCms({ ...cms, goals: [...cms.goals, { id: nid(), title: emptyText("Новая цель", "Жаңы максат"), text: emptyText("Описание", "Сүрөттөмө") }] })}>
        {cms.goals.map((item, index) => (
          <Block key={item.id} onRemove={() => setCms({ ...cms, goals: cms.goals.filter((goal) => goal.id !== item.id) })}>
            <Pair value={item.title} onChange={(title) => update(cms, setCms, "goals", index, { ...item, title })} />
            <Pair value={item.text} onChange={(text) => update(cms, setCms, "goals", index, { ...item, text })} multiline />
          </Block>
        ))}
      </List>

      <List title="Программа" onAdd={() => setCms({ ...cms, program: [...cms.program, { id: nid(), day: emptyText("День", "Күн"), title: emptyText("Тема", "Тема"), text: emptyText("Описание", "Сүрөттөмө") }] })}>
        {cms.program.map((item, index) => (
          <Block key={item.id} onRemove={() => setCms({ ...cms, program: cms.program.filter((entry) => entry.id !== item.id) })}>
            <Pair value={item.day} onChange={(day) => update(cms, setCms, "program", index, { ...item, day })} />
            <Pair value={item.title} onChange={(title) => update(cms, setCms, "program", index, { ...item, title })} />
            <Pair value={item.text} onChange={(text) => update(cms, setCms, "program", index, { ...item, text })} multiline />
          </Block>
        ))}
      </List>

      <List title="Организаторы" onAdd={() => setCms({ ...cms, organizers: [...cms.organizers, { id: nid(), name: emptyText("Организатор", "Уюштуруучу"), role: emptyText("Роль", "Ролу") }] })}>
        {cms.organizers.map((item, index) => (
          <Block key={item.id} onRemove={() => setCms({ ...cms, organizers: cms.organizers.filter((entry) => entry.id !== item.id) })}>
            <Pair value={item.name} onChange={(name) => update(cms, setCms, "organizers", index, { ...item, name })} />
            <Pair value={item.role} onChange={(role) => update(cms, setCms, "organizers", index, { ...item, role })} />
          </Block>
        ))}
      </List>

      <List title="Партнёры" onAdd={() => setCms({ ...cms, partners: [...cms.partners, { id: nid(), name: emptyText("Партнёр", "Өнөктөш"), url: "" }] })}>
        {cms.partners.map((item, index) => (
          <Block key={item.id} onRemove={() => setCms({ ...cms, partners: cms.partners.filter((entry) => entry.id !== item.id) })}>
            <Pair value={item.name} onChange={(name) => update(cms, setCms, "partners", index, { ...item, name })} />
            <input className={fieldClass} placeholder="https://" value={item.url} onChange={(event) => update(cms, setCms, "partners", index, { ...item, url: event.target.value })} />
          </Block>
        ))}
      </List>

      <List title="Новости" onAdd={() => setCms({ ...cms, news: [{ id: nid(), date: new Date().toISOString().slice(0, 10), title: emptyText("Новость", "Жаңылык"), text: emptyText("Текст", "Текст") }, ...cms.news] })}>
        {cms.news.map((item, index) => (
          <Block key={item.id} onRemove={() => setCms({ ...cms, news: cms.news.filter((entry) => entry.id !== item.id) })}>
            <input className={fieldClass} type="date" value={item.date} onChange={(event) => update(cms, setCms, "news", index, { ...item, date: event.target.value })} />
            <Pair value={item.title} onChange={(title) => update(cms, setCms, "news", index, { ...item, title })} />
            <Pair value={item.text} onChange={(text) => update(cms, setCms, "news", index, { ...item, text })} multiline />
          </Block>
        ))}
      </List>

      <List
        title="Архив: программа, фото, видео, итоги"
        onAdd={() =>
          setCms({
            ...cms,
            archive: [{ id: nid(), year: String(new Date().getFullYear() - 1), kind: "photo", title: emptyText("Материал", "Материал"), text: emptyText("Описание", "Сүрөттөмө"), url: "" }, ...cms.archive],
          })
        }
      >
        {cms.archive.map((item, index) => (
          <Block key={item.id} onRemove={() => setCms({ ...cms, archive: cms.archive.filter((entry) => entry.id !== item.id) })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={fieldClass} value={item.year} onChange={(event) => update(cms, setCms, "archive", index, { ...item, year: event.target.value })} />
              <select className={fieldClass} value={item.kind} onChange={(event) => update(cms, setCms, "archive", index, { ...item, kind: event.target.value as ArchiveKind })}>
                {archiveKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kindLabels[kind]}
                  </option>
                ))}
              </select>
            </div>
            <Pair value={item.title} onChange={(title) => update(cms, setCms, "archive", index, { ...item, title })} />
            <Pair value={item.text} onChange={(text) => update(cms, setCms, "archive", index, { ...item, text })} multiline />
            <input className={fieldClass} placeholder="Ссылка на видео или файл" value={item.url} onChange={(event) => update(cms, setCms, "archive", index, { ...item, url: event.target.value })} />
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,application/pdf"
              className="text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                upload(file)
                  .then((url) => update(cms, setCms, "archive", index, { ...item, url }))
                  .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Файл не загрузился."));
              }}
            />
          </Block>
        ))}
      </List>

      {message ? <p className="text-sm text-aqua">{message}</p> : null}
      {error ? <p className="text-sm text-flame">{error}</p> : null}
      <button type="button" onClick={save} disabled={pending} className="btn-brand rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50">
        {pending ? "Сохраняем…" : "Сохранить содержание"}
      </button>
    </div>
  );
}

function nid() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function emptyText(ru: string, ky: string): Localized {
  return { ru, ky };
}

function update<K extends "goals" | "program" | "organizers" | "partners" | "news" | "archive">(
  cms: Cms,
  setCms: (cms: Cms) => void,
  key: K,
  index: number,
  value: Cms[K][number],
) {
  const next = [...cms[key]];
  next[index] = value as Cms[K][number];
  setCms({ ...cms, [key]: next });
}

function List({ title, onAdd, children }: { title: string; onAdd: () => void; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">{title}</h2>
        <button type="button" onClick={onAdd} className="rounded-full border border-white/15 px-3 py-2 text-xs">
          Добавить
        </button>
      </div>
      {children}
    </section>
  );
}

function Block({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 p-4">
      {children}
      <button type="button" onClick={onRemove} className="text-xs text-flame">
        Удалить блок
      </button>
    </div>
  );
}

function Pair({ value, onChange, multiline = false }: { value: Localized; onChange: (value: Localized) => void; multiline?: boolean }) {
  const className = `${fieldClass} mt-1`;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-white/45">
        Русский
        {multiline ? (
          <textarea className={className} rows={4} value={value.ru} onChange={(event) => onChange({ ...value, ru: event.target.value })} />
        ) : (
          <input className={className} value={value.ru} onChange={(event) => onChange({ ...value, ru: event.target.value })} />
        )}
      </label>
      <label className="text-xs text-white/45">
        Кыргызча
        {multiline ? (
          <textarea className={className} rows={4} value={value.ky} onChange={(event) => onChange({ ...value, ky: event.target.value })} />
        ) : (
          <input className={className} value={value.ky} onChange={(event) => onChange({ ...value, ky: event.target.value })} />
        )}
      </label>
    </div>
  );
}
