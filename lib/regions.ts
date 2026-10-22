export const areas = [
  { id: "bishkek", name: "Бишкек", nameKy: "Бишкек", pilot: 1860 },
  { id: "osh-city", name: "Ош (город)", nameKy: "Ош (шаар)", pilot: 760 },
  { id: "chuy", name: "Чуйская область", nameKy: "Чүй облусу", pilot: 940 },
  { id: "issyk-kul", name: "Иссык-Кульская область", nameKy: "Ысык-Көл облусу", pilot: 610 },
  { id: "talas", name: "Таласская область", nameKy: "Талас облусу", pilot: 280 },
  { id: "naryn", name: "Нарынская область", nameKy: "Нарын облусу", pilot: 340 },
  { id: "jalal-abad", name: "Джалал-Абадская область", nameKy: "Жалал-Абад облусу", pilot: 1120 },
  { id: "osh", name: "Ошская область", nameKy: "Ош облусу", pilot: 980 },
  { id: "batken", name: "Баткенская область", nameKy: "Баткен облусу", pilot: 420 },
] as const;

export type AreaId = (typeof areas)[number]["id"];
export type Lang = "ru" | "ky";

export const delegationRegionOrder = ["bishkek", "osh-city", "chuy", "osh", "jalal-abad", "batken", "naryn", "issyk-kul", "talas"] as const satisfies readonly AreaId[];

export const surveyRegionOrder = ["bishkek", "osh-city", "batken", "jalal-abad", "issyk-kul", "naryn", "osh", "talas", "chuy"] as const satisfies readonly AreaId[];

const aliases: Record<string, string> = {};

function remember(alias: string, canonical: string) {
  aliases[normalizeRegionKey(alias)] = canonical;
}

for (const area of areas) {
  remember(area.name, area.name);
  remember(area.nameKy, area.name);
}

[
  ["г. бишкек", "Бишкек"],
  ["город бишкек", "Бишкек"],
  ["ош", "Ош (город)"],
  ["ош город", "Ош (город)"],
  ["город ош", "Ош (город)"],
  ["ош шаар", "Ош (город)"],
  ["чуй", "Чуйская область"],
  ["чуйская", "Чуйская область"],
  ["ошская", "Ошская область"],
  ["ош облусу", "Ошская область"],
  ["джалал-абад", "Джалал-Абадская область"],
  ["джалал-абадская", "Джалал-Абадская область"],
  ["жалал-абад", "Джалал-Абадская область"],
  ["жалал-абад облусу", "Джалал-Абадская область"],
  ["баткен", "Баткенская область"],
  ["баткенская", "Баткенская область"],
  ["баткен облусу", "Баткенская область"],
  ["нарын", "Нарынская область"],
  ["нарынская", "Нарынская область"],
  ["нарын облусу", "Нарынская область"],
  ["иссык-куль", "Иссык-Кульская область"],
  ["иссык-кульская", "Иссык-Кульская область"],
  ["иссык куль", "Иссык-Кульская область"],
  ["ысык-кол", "Иссык-Кульская область"],
  ["ысык-көл", "Иссык-Кульская область"],
  ["ысык-кол облусу", "Иссык-Кульская область"],
  ["талас", "Таласская область"],
  ["таласская", "Таласская область"],
  ["талас облусу", "Таласская область"],
].forEach(([alias, canonical]) => remember(alias, canonical));

export function isAreaId(value: string): value is AreaId {
  return areas.some((area) => area.id === value);
}

export function areaById(id: string) {
  return areas.find((area) => area.id === id);
}

const surveyLabels: Record<AreaId, { ru: string; ky: string }> = {
  bishkek: { ru: "Бишкек", ky: "Бишкек шаары" },
  "osh-city": { ru: "Ош", ky: "Ош шаары" },
  batken: { ru: "Баткенская область", ky: "Баткен облусу" },
  "jalal-abad": { ru: "Джалал-Абадская область", ky: "Жалал-Абад облусу" },
  "issyk-kul": { ru: "Иссык-Кульская область", ky: "Ысык-Көл облусу" },
  naryn: { ru: "Нарынская область", ky: "Нарын облусу" },
  osh: { ru: "Ошская область", ky: "Ош облусу" },
  talas: { ru: "Таласская область", ky: "Талас облусу" },
  chuy: { ru: "Чуйская область", ky: "Чүй облусу" },
};

export function areaLabel(id: string, lang: Lang, variant: "full" | "survey" = "full") {
  const area = areaById(id);
  if (!area) return id;
  if (variant === "survey") return surveyLabels[area.id][lang];
  return lang === "ky" ? area.nameKy : area.name;
}

export function orderedAreas(order: readonly AreaId[]) {
  return order.map((id) => areaById(id)).filter((area): area is (typeof areas)[number] => Boolean(area));
}

export function normalizeRegionKey(value: string) {
  return value.trim().toLowerCase().replace(/ё/g, "е").replace(/\./g, "").replace(/\s+/g, "");
}

export function canonicalizeRegion(value: string) {
  const key = normalizeRegionKey(value);
  if (!key) return null;
  return aliases[key] ?? null;
}
