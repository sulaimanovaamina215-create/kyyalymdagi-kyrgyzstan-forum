import { promises as fs } from "fs";
import path from "path";
import { defaultCms, sanitizeCms } from "@/lib/cms";
import type { Cms } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "cms.json");

let queue: Promise<unknown> = Promise.resolve();

export async function readCms(): Promise<Cms> {
  return queue.then(async () => {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return sanitizeCms(JSON.parse(raw));
    } catch {
      return defaultCms;
    }
  });
}

export function writeCms(input: unknown) {
  const run = queue.then(async () => {
    const cms = sanitizeCms(input);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(cms, null, 2), "utf8");
    return cms;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
