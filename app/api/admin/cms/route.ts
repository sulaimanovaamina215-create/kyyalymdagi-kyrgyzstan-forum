import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { readCms, writeCms } from "@/lib/cms-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  return NextResponse.json(await readCms());
}

export async function PUT(request: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }
  try {
    return NextResponse.json(await writeCms(body));
  } catch {
    return NextResponse.json(
      { error: "Проверьте поля: у каждого текста нужны русская и кыргызская версии, у новости — дата ГГГГ-ММ-ДД." },
      { status: 400 },
    );
  }
}
