import { pushToGoogle } from "@/lib/google-survey";
import { messages } from "@/lib/i18n";
import { areaLabel } from "@/lib/regions";
import type { Delegation } from "@/lib/types";

export function delegationNotice(entry: Delegation) {
  const org = messages.ru.register.org;
  return {
    code: entry.code,
    createdAt: entry.createdAt,
    fullName: entry.fullName,
    position: entry.position,
    phone: entry.phone,
    email: entry.email,
    organizationType: org[entry.organizationType],
    region: areaLabel(entry.regionId, "ru"),
    district: entry.district,
    organizationName: entry.organizationName,
    participantCount: entry.participantCount,
    willCoordinate: entry.willCoordinate ? "Да" : "Нет",
    participants: entry.participants.map((person) => ({
      fullName: person.fullName,
      age: String(person.age),
      gender: person.gender === "female" ? "Женский" : "Мужской",
      region: person.region,
      district: person.district,
      organization: person.organization,
    })),
  };
}

export function pushDelegationToGoogle(entry: Delegation) {
  return pushToGoogle({ kind: "delegation", delegation: delegationNotice(entry) });
}
