import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { duplicateGroups } from "@/lib/delegation";
import { listDelegations } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  const delegations = await listDelegations();
  return NextResponse.json({ delegations, duplicates: duplicateGroups(delegations) });
}
