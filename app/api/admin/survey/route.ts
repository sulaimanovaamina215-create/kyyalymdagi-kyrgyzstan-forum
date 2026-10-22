import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { countBy } from "@/lib/survey";
import { listSurvey } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  const survey = await listSurvey();
  const comments = [...survey]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 120)
    .map((entry) => ({ regionId: entry.regionId, change: entry.change, createdAt: entry.createdAt }));

  return NextResponse.json({
    total: survey.length,
    byRegion: countBy(survey, (entry) => entry.regionId),
    byLocality: countBy(survey, (entry) => entry.locality),
    byAge: countBy(survey, (entry) => entry.age),
    byGender: countBy(survey, (entry) => entry.gender),
    byEmployment: countBy(survey, (entry) => entry.employment),
    topics: countBy(survey, (entry) => entry.topics),
    barriers: countBy(survey, (entry) => entry.barriers),
    priorities: countBy(survey, (entry) => entry.priorities),
    comments,
  });
}
