import { isAreaId } from "@/lib/regions";
import {
  ageIds,
  barrierIds,
  employmentIds,
  genderIds,
  localityIds,
  priorityIds,
  topicIds,
  type AgeId,
  type BarrierId,
  type EmploymentId,
  type LocalityId,
  type PriorityId,
  type SurveyEntry,
  type SurveyGenderId,
  type TopicId,
} from "@/lib/types";

export type SurveyDraft = Omit<SurveyEntry, "id" | "createdAt">;

function oneOf<T extends string>(value: unknown, ids: readonly T[]): T | null {
  return typeof value === "string" && (ids as readonly string[]).includes(value) ? (value as T) : null;
}

function manyOf<T extends string>(value: unknown, ids: readonly T[]): T[] | null {
  if (!Array.isArray(value)) return null;
  const unique = [...new Set(value)];
  if (unique.length < 1 || unique.length > 2) return null;
  if (!unique.every((item) => typeof item === "string" && (ids as readonly string[]).includes(item))) return null;
  return unique as T[];
}

function plainText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function otherAnswer(selected: readonly string[], value: unknown) {
  if (!selected.includes("other")) return "";
  const text = plainText(value, 200);
  return text.length > 0 ? text : null;
}

export function parseSurvey(input: unknown): SurveyDraft | null {
  if (!input || typeof input !== "object") return null;
  const source = input as Record<string, unknown>;
  const regionId = typeof source.regionId === "string" && isAreaId(source.regionId) ? source.regionId : null;
  const locality = oneOf<LocalityId>(source.locality, localityIds);
  const age = oneOf<AgeId>(source.age, ageIds);
  const gender = oneOf<SurveyGenderId>(source.gender, genderIds);
  const employment = oneOf<EmploymentId>(source.employment, employmentIds);
  const topics = manyOf<TopicId>(source.topics, topicIds);
  const barriers = manyOf<BarrierId>(source.barriers, barrierIds);
  const priorities = manyOf<PriorityId>(source.priorities, priorityIds);
  const topicsOther = topics ? otherAnswer(topics, source.topicsOther) : null;
  const barriersOther = barriers ? otherAnswer(barriers, source.barriersOther) : null;
  const prioritiesOther = priorities ? otherAnswer(priorities, source.prioritiesOther) : null;
  const change = typeof source.change === "string" ? source.change.replace(/[\u0000-\u001F]/g, "").trim() : "";
  if (!regionId || !locality || !age || !gender || !employment || !topics || !barriers || !priorities) return null;
  if (topicsOther === null || barriersOther === null || prioritiesOther === null) return null;
  if (change.length < 3 || change.length > 200) return null;
  return { regionId, locality, age, gender, employment, topics, topicsOther, barriers, barriersOther, priorities, prioritiesOther, change };
}

export type SurveyBreakdown = {
  age: Record<AgeId, number>;
  gender: Record<SurveyGenderId, number>;
  locality: Record<LocalityId, number>;
  employment: Record<EmploymentId, number>;
  topics: Record<TopicId, number>;
  barriers: Record<BarrierId, number>;
  priorities: Record<PriorityId, number>;
};

function zeros<T extends string>(ids: readonly T[]) {
  return Object.fromEntries(ids.map((id) => [id, 0])) as Record<T, number>;
}

export function emptyBreakdown(): SurveyBreakdown {
  return {
    age: zeros(ageIds),
    gender: zeros(genderIds),
    locality: zeros(localityIds),
    employment: zeros(employmentIds),
    topics: zeros(topicIds),
    barriers: zeros(barrierIds),
    priorities: zeros(priorityIds),
  };
}

function bump(record: Record<string, number>, id: unknown) {
  if (typeof id === "string" && id in record) record[id] += 1;
}

function addEntry(target: SurveyBreakdown, entry: SurveyEntry) {
  bump(target.age, entry.age);
  bump(target.gender, entry.gender);
  bump(target.locality, entry.locality);
  bump(target.employment, entry.employment);
  for (const id of entry.topics ?? []) bump(target.topics, id);
  for (const id of entry.barriers ?? []) bump(target.barriers, id);
  for (const id of entry.priorities ?? []) bump(target.priorities, id);
}

export function summarizeSurvey(entries: SurveyEntry[]) {
  const all = emptyBreakdown();
  const byRegion: Record<string, SurveyBreakdown> = {};
  const regionCounts = new Map<string, number>();
  for (const entry of entries) {
    addEntry(all, entry);
    regionCounts.set(entry.regionId, (regionCounts.get(entry.regionId) ?? 0) + 1);
    byRegion[entry.regionId] ??= emptyBreakdown();
    addEntry(byRegion[entry.regionId], entry);
  }
  return { all, byRegion, regionCounts };
}

export function countBy(entries: SurveyEntry[], pick: (entry: SurveyEntry) => string | string[]) {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const value = pick(entry);
    for (const key of Array.isArray(value) ? value : [value]) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return [...map.entries()].map(([id, count]) => ({ id, count }));
}
