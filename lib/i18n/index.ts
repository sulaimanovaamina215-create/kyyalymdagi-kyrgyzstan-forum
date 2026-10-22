import { ky } from "@/lib/i18n/ky";
import { ru, type Messages } from "@/lib/i18n/ru";
import type { Issue } from "@/lib/issues";

export type Lang = "ru" | "ky";
export type { Messages };

export const messages: Record<Lang, Messages> = { ru, ky };

export function isLang(value: unknown): value is Lang {
  return value === "ru" || value === "ky";
}

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function issueText(issue: Issue, lang: Lang) {
  const errors = messages[lang].errors;
  switch (issue.code) {
    case "bad-format":
      return errors.badFormat;
    case "empty":
      return errors.empty;
    case "too-many":
      return errors.tooMany;
    case "count":
      return fill(errors.countMismatch, { file: issue.file, form: issue.form });
    case "row-name":
      return fill(errors.rowName, { row: issue.row });
    case "row-age":
      return fill(errors.rowAge, { row: issue.row });
    case "row-gender":
      return fill(errors.rowGender, { row: issue.row });
    case "row-region":
      return fill(errors.rowRegion, { row: issue.row, value: issue.value });
    case "row-district":
      return fill(errors.rowDistrict, { row: issue.row });
    case "row-org":
      return fill(errors.rowOrg, { row: issue.row });
    case "duplicate":
      return fill(errors.duplicate, { row: issue.row, name: issue.name, other: issue.other });
    case "external":
      return fill(errors.external, { row: issue.row, name: issue.name, delegation: issue.delegation });
    case "more":
      return fill(errors.more, { count: issue.count });
  }
}
