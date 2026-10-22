"use client";

import { useEffect, useMemo, useState } from "react";
import { fieldClass } from "@/components/field";
import { messages } from "@/lib/i18n";
import { areaLabel, areas, delegationRegionOrder, orderedAreas } from "@/lib/regions";
import { organizationTypes, type Delegation, type Participant } from "@/lib/types";
import { plural } from "@/lib/utils";

type Duplicate = { name: string; refs: { code: string; participantId: string }[] };

const orgLabels = messages.ru.register.org;

export function DelegationsTab() {
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [regionId, setRegionId] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function reload() {
    const response = await fetch("/api/admin/delegations", { cache: "no-store" });
    const data = (await response.json()) as { delegations?: Delegation[]; duplicates?: Duplicate[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Не удалось загрузить делегации.");
    setDelegations(data.delegations ?? []);
    setDuplicates(data.duplicates ?? []);
  }

  useEffect(() => {
    reload()
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  const duplicatedIds = useMemo(() => new Set(duplicates.flatMap((item) => item.refs.map((ref) => ref.participantId))), [duplicates]);
  const filtered = delegations.filter((item) => {
    if (regionId && item.regionId !== regionId) return false;
    if (organizationType && item.organizationType !== organizationType) return false;
    if (!query.trim()) return true;
    const blob = `${item.code} ${item.organizationName} ${item.district} ${item.fullName} ${item.email}`.toLowerCase();
    return blob.includes(query.trim().toLowerCase());
  });
  const participants = filtered.reduce((sum, item) => sum + item.participants.length, 0);
  const byRegion = orderedAreas(delegationRegionOrder).map((area) => ({
    name: area.name,
    count: delegations.filter((item) => item.regionId === area.id).reduce((sum, item) => sum + item.participants.length, 0),
  }));
  const maxRegion = Math.max(...byRegion.map((item) => item.count), 1);

  async function mutate(code: string, body: unknown) {
    setError("");
    const response = await fetch(`/api/admin/delegations/${encodeURIComponent(code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(data.error || "Не удалось сохранить.");
    await reload();
  }

  if (loading) return <p className="text-white/60">Загружаем делегации…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">
            Делегаций: {delegations.length}. Участников: {delegations.reduce((sum, item) => sum + item.participants.length, 0)}.
          </p>
          <p className="mt-1 text-sm text-white/50">
            В текущем фильтре: {filtered.length} {plural(filtered.length, "делегация", "делегации", "делегаций")}, {participants}{" "}
            {plural(participants, "участник", "участника", "участников")}.
          </p>
        </div>
        <a href="/api/admin/export/delegations" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold">
          Экспорт в Excel
        </a>
      </div>

      <div className="grid gap-3 rounded-3xl border border-white/10 p-4 sm:grid-cols-3">
        {byRegion.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-xs text-white/60">
              <span>{item.name}</span>
              <span>{item.count}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-violet to-aqua" style={{ width: `${(item.count / maxRegion) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <select value={regionId} onChange={(event) => setRegionId(event.target.value)} className={fieldClass}>
          <option value="">Все области</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
        <select value={organizationType} onChange={(event) => setOrganizationType(event.target.value)} className={fieldClass}>
          <option value="">Все типы организаций</option>
          {organizationTypes.map((item) => (
            <option key={item} value={item}>
              {orgLabels[item]}
            </option>
          ))}
        </select>
        <input value={query} onChange={(event) => setQuery(event.target.value)} className={fieldClass} placeholder="Код, вуз, район, ФИО" />
      </div>

      {duplicates.length ? (
        <div className="rounded-2xl border border-flame/40 bg-flame/10 p-4 text-sm">
          Повторяющиеся ФИО: {duplicates.map((item) => `${item.name} (${item.refs.map((ref) => ref.code).join(", ")})`).join("; ")}
        </div>
      ) : null}
      {error ? <p className="text-sm text-flame">{error}</p> : null}

      <div className="space-y-4">
        {filtered.map((item) => (
          <DelegationCard
            key={item.code}
            item={item}
            duplicatedIds={duplicatedIds}
            onMeta={(body) => mutate(item.code, { action: "meta", ...body })}
            onParticipant={(person) => mutate(item.code, { action: "participant", participant: person })}
            onDeleteParticipant={(participantId) => mutate(item.code, { action: "delete-participant", participantId })}
            onDeleteDuplicates={() => mutate(item.code, { action: "delete-duplicates" })}
            onDelete={async () => {
              if (!window.confirm(`Удалить делегацию ${item.code}?`)) return;
              const response = await fetch(`/api/admin/delegations/${encodeURIComponent(item.code)}`, { method: "DELETE" });
              if (!response.ok) throw new Error("Не удалось удалить делегацию.");
              await reload();
            }}
            onError={setError}
          />
        ))}
      </div>
    </div>
  );
}

function DelegationCard({
  item,
  duplicatedIds,
  onMeta,
  onParticipant,
  onDeleteParticipant,
  onDeleteDuplicates,
  onDelete,
  onError,
}: {
  item: Delegation;
  duplicatedIds: Set<string>;
  onMeta: (body: Partial<Delegation>) => Promise<void>;
  onParticipant: (person: Participant) => Promise<void>;
  onDeleteParticipant: (id: string) => Promise<void>;
  onDeleteDuplicates: () => Promise<void>;
  onDelete: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [meta, setMeta] = useState(item);

  useEffect(() => setMeta(item), [item]);

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl">{item.code}</p>
          <p className="mt-1 text-sm text-white/70">
            {item.organizationName} · {areaLabel(item.regionId, "ru")} · {item.district}
          </p>
          <p className="mt-1 text-sm text-white/50">
            {orgLabels[item.organizationType]} · {item.participants.length} участников · координация: {item.willCoordinate ? "да" : "нет"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-xs" onClick={() => onDeleteDuplicates().catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Ошибка"))}>
            Удалить повторы внутри
          </button>
          <button type="button" className="rounded-full border border-flame/40 px-3 py-2 text-xs text-flame" onClick={() => onDelete().catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Ошибка"))}>
            Удалить делегацию
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className={fieldClass} value={meta.fullName} onChange={(event) => setMeta({ ...meta, fullName: event.target.value })} />
        <input className={fieldClass} value={meta.position} onChange={(event) => setMeta({ ...meta, position: event.target.value })} />
        <input className={fieldClass} value={meta.phone} onChange={(event) => setMeta({ ...meta, phone: event.target.value })} />
        <input className={fieldClass} value={meta.email} onChange={(event) => setMeta({ ...meta, email: event.target.value })} />
        <input className={fieldClass} value={meta.organizationName} onChange={(event) => setMeta({ ...meta, organizationName: event.target.value })} />
        <input className={fieldClass} value={meta.district} onChange={(event) => setMeta({ ...meta, district: event.target.value })} />
        <select className={fieldClass} value={meta.organizationType} onChange={(event) => setMeta({ ...meta, organizationType: event.target.value as Delegation["organizationType"] })}>
          {organizationTypes.map((type) => (
            <option key={type} value={type}>
              {orgLabels[type]}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={meta.regionId} onChange={(event) => setMeta({ ...meta, regionId: event.target.value })}>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
        <select
          className={fieldClass}
          value={meta.willCoordinate ? "yes" : "no"}
          onChange={(event) => setMeta({ ...meta, willCoordinate: event.target.value === "yes" })}
        >
          <option value="yes">Координирует: да</option>
          <option value="no">Координирует: нет</option>
        </select>
      </div>
      <button
        type="button"
        className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink"
        onClick={() => onMeta(meta).catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Ошибка"))}
      >
        Сохранить карточку
      </button>

      <ul className="mt-5 space-y-3">
        {item.participants.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            duplicated={duplicatedIds.has(person.id)}
            onSave={(next) => onParticipant(next).catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Ошибка"))}
            onDelete={() => onDeleteParticipant(person.id).catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Ошибка"))}
          />
        ))}
      </ul>
    </article>
  );
}

function PersonRow({
  person,
  duplicated,
  onSave,
  onDelete,
}: {
  person: Participant;
  duplicated: boolean;
  onSave: (person: Participant) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(person);
  useEffect(() => setDraft(person), [person]);

  return (
    <li className={`grid gap-2 rounded-2xl border p-3 md:grid-cols-6 ${duplicated ? "border-flame/60" : "border-white/10"}`}>
      <input className={fieldClass} value={draft.fullName} onChange={(event) => setDraft({ ...draft, fullName: event.target.value })} />
      <input className={fieldClass} type="number" value={draft.age} onChange={(event) => setDraft({ ...draft, age: Number(event.target.value) })} />
      <select className={fieldClass} value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value as Participant["gender"] })}>
        <option value="female">Ж</option>
        <option value="male">М</option>
      </select>
      <input className={fieldClass} value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })} />
      <input className={fieldClass} value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })} />
      <input className={fieldClass} value={draft.organization} onChange={(event) => setDraft({ ...draft, organization: event.target.value })} />
      <div className="flex gap-2 md:col-span-6">
        <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-xs" onClick={() => onSave(draft)}>
          Сохранить участника
        </button>
        <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-xs text-flame" onClick={onDelete}>
          Удалить
        </button>
        {duplicated ? <span className="self-center text-xs text-flame">Повтор ФИО</span> : null}
      </div>
    </li>
  );
}
