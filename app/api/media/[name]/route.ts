import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

type Context = { params: Promise<{ name: string }> };

export async function GET(_request: Request, context: Context) {
  const { name } = await context.params;
  if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif|mp4|webm|pdf)$/.test(name)) {
    return NextResponse.json({ error: "Файл не найден." }, { status: 404 });
  }
  try {
    const file = await fs.readFile(path.join(process.cwd(), "data", "uploads", name));
    const extension = path.extname(name).toLowerCase();
    return new NextResponse(file, {
      headers: {
        "Content-Type": types[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Файл не найден." }, { status: 404 });
  }
}
