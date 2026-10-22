import { messages } from "@/lib/i18n";
import { areaLabel } from "@/lib/regions";
import type { SurveyEntry } from "@/lib/types";

export const surveyNotifyEmail = "kyalymdagykyrgyzstanforum@gmail.com";

export type SurveySheetRow = {
  id: string;
  createdAt: string;
  region: string;
  locality: string;
  age: string;
  gender: string;
  employment: string;
  topics: string;
  topicsOther: string;
  barriers: string;
  barriersOther: string;
  priorities: string;
  prioritiesOther: string;
  change: string;
};

function labeled<T extends string>(ids: readonly T[], labels: Record<T, string>) {
  return ids.map((id) => labels[id]).join(" | ");
}

export function surveySheetRow(entry: SurveyEntry): SurveySheetRow {
  const copy = messages.ru.survey;
  return {
    id: entry.id,
    createdAt: entry.createdAt,
    region: areaLabel(entry.regionId, "ru", "survey"),
    locality: copy.locality[entry.locality],
    age: copy.age[entry.age],
    gender: copy.gender[entry.gender],
    employment: copy.employment[entry.employment],
    topics: labeled(entry.topics, copy.topics),
    topicsOther: entry.topicsOther,
    barriers: labeled(entry.barriers, copy.barriers),
    barriersOther: entry.barriersOther,
    priorities: labeled(entry.priorities, copy.priorities),
    prioritiesOther: entry.prioritiesOther,
    change: entry.change,
  };
}

export function googleSurveyConfigured() {
  return Boolean(process.env.GOOGLE_SURVEY_WEBHOOK_URL?.trim() && process.env.GOOGLE_SURVEY_TOKEN?.trim());
}

export async function pushSurveyToGoogle(entry: SurveyEntry) {
  const url = process.env.GOOGLE_SURVEY_WEBHOOK_URL?.trim() ?? "";
  const token = process.env.GOOGLE_SURVEY_TOKEN?.trim() ?? "";
  if (!url || !token) return { delivered: false as const };

  const response = await postAppsScript(url, {
    token,
    notifyEmail: surveyNotifyEmail,
    row: surveySheetRow(entry),
  });
  const text = await response.text();
  let data: { ok?: boolean; error?: string; url?: string; mailed?: boolean } = {};
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    data = {};
  }
  if (!response.ok || data.ok !== true) {
    throw new Error("google");
  }
  return { delivered: true as const, url: data.url ?? "", mailed: data.mailed !== false };
}

async function postAppsScript(url: string, payload: unknown) {
  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "text/plain;charset=utf-8" };
  const first = await fetch(url, {
    method: "POST",
    redirect: "manual",
    headers,
    body,
    signal: AbortSignal.timeout(20000),
  });
  if (first.status >= 300 && first.status < 400) {
    const location = first.headers.get("location");
    if (!location) throw new Error("google");
    return fetch(new URL(location, url), { method: "GET", redirect: "follow", signal: AbortSignal.timeout(20000) });
  }
  return first;
}
