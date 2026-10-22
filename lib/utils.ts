import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const months = {
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  ky: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
};

export function formatDate(iso: string, lang: "ru" | "ky") {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.getDate();
  const month = months[lang][date.getMonth()];
  const year = date.getFullYear();
  return lang === "ky" ? `${day}-${month} ${year}` : `${day} ${month} ${year}`;
}

export function plural(value: number, one: string, few: string, many: string) {
  const abs = Math.abs(value);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function heatColor(amount: number) {
  const stops: Array<[number, number, number]> = [
    [127, 0, 255],
    [79, 172, 254],
    [0, 242, 254],
    [255, 140, 0],
    [255, 107, 0],
  ];
  const t = Math.min(1, Math.max(0, amount));
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const from = stops[index];
  const to = stops[index + 1];
  const channel = from.map((part, i) => Math.round(part + (to[i] - part) * mix));
  return `rgb(${channel[0]} ${channel[1]} ${channel[2]})`;
}
