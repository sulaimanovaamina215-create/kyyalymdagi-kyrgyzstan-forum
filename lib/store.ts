import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { areas } from "@/lib/regions";
import { summarizeSurvey } from "@/lib/survey";
import type { Delegation, SurveyEntry } from "@/lib/types";

type Store = {
  delegations: Delegation[];
  survey: SurveyEntry[];
};

const filePath = path.join(process.cwd(), "data", "submissions.json");
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function isDelegation(value: unknown): value is Delegation {
  if (!value || typeof value !== "object") return false;
  const item = value as Delegation;
  return typeof item.code === "string" && Array.isArray(item.participants);
}

function isSurvey(value: unknown): value is SurveyEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as SurveyEntry;
  return typeof item.id === "string" && typeof item.regionId === "string" && typeof item.change === "string";
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      delegations: Array.isArray(parsed.delegations) ? parsed.delegations.filter(isDelegation) : [],
      survey: Array.isArray(parsed.survey) ? parsed.survey.filter(isSurvey) : [],
    };
  } catch {
    return { delegations: [], survey: [] };
  }
}

let queue: Promise<unknown> = Promise.resolve();

function withStore<T>(mutator: (store: Store) => T, persist: boolean) {
  const run = queue.then(async () => {
    const store = await readStore();
    const result = mutator(store);
    if (persist) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
    }
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function makeCode() {
  const bytes = randomBytes(6);
  let tail = "";
  for (let index = 0; index < bytes.length; index += 1) tail += alphabet[bytes[index] % alphabet.length];
  return `KK-2026-${tail}`;
}

export class StoreError extends Error {
  constructor(public issue: "limit" | "code") {
    super(issue);
  }
}

export function getStats() {
  return withStore((store) => {
    const summary = summarizeSurvey(store.survey);
    const regions = areas.map((area) => ({
      id: area.id,
      value: summary.regionCounts.get(area.id) ?? 0,
    }));
    return {
      responses: store.survey.length,
      regions,
      breakdown: summary.all,
      byRegion: summary.byRegion,
    };
  }, false);
}

export function listDelegations() {
  return withStore((store) => store.delegations, false);
}

export function listSurvey() {
  return withStore((store) => store.survey, false);
}

export function getDelegation(code: string) {
  return withStore((store) => store.delegations.find((item) => item.code === code) ?? null, false);
}

export function createDelegation(data: Omit<Delegation, "code" | "createdAt" | "updatedAt">) {
  return withStore((store) => {
    if (store.delegations.length >= 5000) throw new StoreError("limit");
    let code = "";
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const next = makeCode();
      if (!store.delegations.some((item) => item.code === next)) {
        code = next;
        break;
      }
    }
    if (!code) throw new StoreError("code");
    const now = new Date().toISOString();
    const entry: Delegation = { ...data, code, createdAt: now, updatedAt: now };
    store.delegations.push(entry);
    return entry;
  }, true);
}

export function updateDelegation(code: string, recipe: (current: Delegation) => Delegation) {
  return withStore((store) => {
    const index = store.delegations.findIndex((item) => item.code === code);
    if (index < 0) return null;
    const next = recipe(store.delegations[index]);
    next.code = code;
    next.createdAt = store.delegations[index].createdAt;
    next.updatedAt = new Date().toISOString();
    store.delegations[index] = next;
    return next;
  }, true);
}

export function deleteDelegation(code: string) {
  return withStore((store) => {
    const before = store.delegations.length;
    store.delegations = store.delegations.filter((item) => item.code !== code);
    return before !== store.delegations.length;
  }, true);
}

export function addSurvey(entry: SurveyEntry) {
  return withStore((store) => {
    if (store.survey.length >= 50000) throw new StoreError("limit");
    store.survey.push(entry);
    return entry;
  }, true);
}

export function removeSurvey(id: string) {
  return withStore((store) => {
    const before = store.survey.length;
    store.survey = store.survey.filter((item) => item.id !== id);
    return before !== store.survey.length;
  }, true);
}
