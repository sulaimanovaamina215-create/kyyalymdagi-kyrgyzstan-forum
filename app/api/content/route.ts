import { NextResponse } from "next/server";
import { readCms } from "@/lib/cms-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readCms());
}
