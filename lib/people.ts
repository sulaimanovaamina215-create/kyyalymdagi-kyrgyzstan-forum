import type { Gender } from "@/lib/types";

export function personKey(name: string) {
  return name.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
}

export function parseGender(value: string): Gender | null {
  const normalized = value.trim().toLowerCase().replace(/\./g, "").replace(/ё/g, "е");
  if (["м", "муж", "мужской", "эркек", "male", "m", "erkek"].includes(normalized)) return "male";
  if (["ж", "жен", "женский", "аял", "female", "f", "ayal"].includes(normalized)) return "female";
  return null;
}

export function genderMark(gender: Gender) {
  return gender === "male" ? "М" : "Ж";
}
