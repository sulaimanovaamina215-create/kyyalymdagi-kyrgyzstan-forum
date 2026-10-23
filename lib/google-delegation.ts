import { pushToGoogle } from "@/lib/google-survey";
import { messages } from "@/lib/i18n";
import { escapeHtml, sendForumEmail } from "@/lib/notify";
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

export function mailDelegation(entry: Delegation) {
  const notice = delegationNotice(entry);
  const line = (label: string, value: string) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`;
  const people = notice.participants
    .map(
      (person) =>
        `<li>${escapeHtml(person.fullName)}, ${escapeHtml(person.age)}, ${escapeHtml(person.gender)}, ${escapeHtml(person.region)}, ${escapeHtml(person.district)}, ${escapeHtml(person.organization)}</li>`,
    )
    .join("");
  return sendForumEmail(
    `Новая делегация «Кыялымдагы Кыргызстан» — ${notice.code}`,
    `
      <h2>Новая регистрация делегации</h2>
      ${line("Регистрационный номер", notice.code)}
      ${line("Время", notice.createdAt)}
      ${line("ФИО", notice.fullName)}
      ${line("Должность", notice.position)}
      ${line("Телефон", notice.phone)}
      ${line("Email", notice.email)}
      ${line("Тип организации", notice.organizationType)}
      ${line("Область", notice.region)}
      ${line("Район", notice.district)}
      ${line("Организация", notice.organizationName)}
      ${line("Участников", String(notice.participantCount))}
      ${line("Координирует делегацию", notice.willCoordinate)}
      <p><strong>Участники:</strong></p>
      <ol>${people}</ol>
    `,
  );
}
