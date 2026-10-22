import { fill, issueText, messages, type Lang } from "@/lib/i18n";
import { capIssues, type Issue } from "@/lib/issues";
import { parseGender, personKey } from "@/lib/people";
import { canonicalizeRegion, isAreaId } from "@/lib/regions";
import type { Delegation, OrganizationType, Participant } from "@/lib/types";
import { organizationTypes } from "@/lib/types";
import type { ParsedParticipant } from "@/lib/excel";

export type DelegationFields = {
  fullName: string;
  position: string;
  phone: string;
  email: string;
  organizationType: OrganizationType;
  regionId: string;
  district: string;
  organizationName: string;
  participantCount: number;
  willCoordinate: boolean;
};

export function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F]/g, "").trim().slice(0, max);
}

export function readLang(value: unknown): Lang {
  return value === "ky" ? "ky" : "ru";
}

export function fieldErrors(input: {
  fullName: string;
  position: string;
  phone: string;
  email: string;
  organizationType: string;
  regionId: string;
  district: string;
  organizationName: string;
  participantCount: number;
  willCoordinate: boolean | null;
  consent: boolean;
}, lang: Lang) {
  const errors = messages[lang].errors;
  const list: string[] = [];
  if (input.fullName.length < 5 || input.fullName.split(/\s+/).filter(Boolean).length < 2) list.push(errors.name);
  if (input.position.length < 2) list.push(errors.position);
  const digits = input.phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) list.push(errors.phone);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) list.push(errors.email);
  if (!organizationTypes.includes(input.organizationType as OrganizationType)) list.push(errors.orgType);
  if (!isAreaId(input.regionId)) list.push(errors.region);
  if (input.district.length < 2) list.push(errors.district);
  if (input.organizationName.length < 2) list.push(errors.orgName);
  if (!Number.isInteger(input.participantCount) || input.participantCount < 1 || input.participantCount > 500) list.push(errors.count);
  if (!input.consent) list.push(errors.consent);
  if (input.willCoordinate == null) list.push(errors.coordinate);
  return list;
}

export function externalDuplicateIssues(participants: ParsedParticipant[], delegations: Delegation[], exceptCode?: string) {
  const index = new Map<string, string>();
  for (const delegation of delegations) {
    if (delegation.code === exceptCode) continue;
    for (const person of delegation.participants) {
      index.set(`${personKey(person.fullName)}|${person.age}|${person.region}`, delegation.code);
    }
  }
  const issues: Issue[] = [];
  for (const person of participants) {
    const code = index.get(`${personKey(person.fullName)}|${person.age}|${person.region}`);
    if (code) issues.push({ code: "external", row: person.row, name: person.fullName, delegation: code });
  }
  return capIssues(issues);
}

export function withParticipantIds(participants: ParsedParticipant[]): Participant[] {
  return participants.map((person) => ({
    id: crypto.randomUUID(),
    fullName: person.fullName,
    age: person.age,
    gender: person.gender,
    region: person.region,
    district: person.district,
    organization: person.organization,
  }));
}

export function duplicateGroups(delegations: Delegation[]) {
  const map = new Map<string, { name: string; refs: { code: string; participantId: string }[] }>();
  for (const delegation of delegations) {
    for (const person of delegation.participants) {
      const key = personKey(person.fullName);
      const item = map.get(key) ?? { name: person.fullName, refs: [] };
      item.refs.push({ code: delegation.code, participantId: person.id });
      map.set(key, item);
    }
  }
  return [...map.values()].filter((item) => item.refs.length > 1);
}

export function participantErrors(
  person: { fullName: string; age: number; gender: string; region: string; district: string; organization: string },
  lang: Lang,
) {
  const errors = messages[lang].errors;
  if (person.fullName.length < 5 || person.fullName.split(/\s+/).filter(Boolean).length < 2) return errors.rowName.replace("{row}", "—");
  if (!Number.isInteger(person.age) || person.age < 14 || person.age > 70) return errors.rowAge.replace("{row}", "—");
  if (!parseGender(person.gender) && person.gender !== "male" && person.gender !== "female") return errors.rowGender.replace("{row}", "—");
  if (!canonicalizeRegion(person.region)) return fill(errors.rowRegion, { row: "—", value: person.region || "—" });
  if (person.district.trim().length < 2) return errors.rowDistrict.replace("{row}", "—");
  if (person.organization.trim().length < 2) return errors.rowOrg.replace("{row}", "—");
  return null;
}

export function textsFromIssues(issues: Issue[], lang: Lang) {
  return issues.map((issue) => issueText(issue, lang));
}

export function countIssue(file: number, form: number, lang: Lang) {
  return fill(messages[lang].errors.countMismatch, { file, form });
}
