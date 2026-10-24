import { NextResponse } from "next/server";
import { listSurvey } from "@/lib/store";
import type { SurveyEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

const pageSize = 40;

function newerFirst(a: SurveyEntry, b: SurveyEntry) {
  const byTime = b.createdAt.localeCompare(a.createdAt);
  if (byTime !== 0) return byTime;
  return b.id.localeCompare(a.id);
}

function voice(entry: SurveyEntry) {
  return {
    id: entry.id,
    regionId: entry.regionId,
    change: entry.change,
    createdAt: entry.createdAt,
  };
}

export async function GET(request: Request) {
  const survey = await listSurvey();
  const ordered = [...survey].sort(newerFirst);
  const url = new URL(request.url);
  const requested = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(requested) ? Math.min(pageSize, Math.max(1, Math.floor(requested))) : pageSize;
  const before = url.searchParams.get("before") ?? "";
  const beforeId = url.searchParams.get("beforeId") ?? "";

  let start = 0;
  if (before && beforeId) {
    const index = ordered.findIndex((entry) => entry.createdAt === before && entry.id === beforeId);
    if (index < 0) {
      return NextResponse.json({ total: ordered.length, voices: [], next: null });
    }
    start = index + 1;
  }

  const slice = ordered.slice(start, start + limit);
  const last = slice.at(-1);
  const next = slice.length === limit && last ? { before: last.createdAt, beforeId: last.id } : null;

  return NextResponse.json({
    total: ordered.length,
    voices: slice.map(voice),
    next,
  });
}
