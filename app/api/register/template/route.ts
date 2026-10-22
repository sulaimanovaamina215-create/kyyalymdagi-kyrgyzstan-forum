import { NextResponse } from "next/server";
import { buildTemplate } from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const buffer = await buildTemplate();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"kyyalym-delegation-template.xlsx\"",
    },
  });
}
