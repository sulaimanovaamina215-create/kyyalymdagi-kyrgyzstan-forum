import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const extensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "application/pdf": ".pdf",
};

export async function POST(request: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) return NextResponse.json({ error: "Выберите файл." }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "Файл больше 20 МБ." }, { status: 400 });
  const extension = extensions[file.type];
  if (!extension) return NextResponse.json({ error: "Допустимы JPG, PNG, WEBP, GIF, MP4, WEBM и PDF." }, { status: 400 });

  const name = `${randomUUID()}${extension}`;
  const directory = path.join(process.cwd(), "data", "uploads");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/media/${name}` }, { status: 201 });
}
