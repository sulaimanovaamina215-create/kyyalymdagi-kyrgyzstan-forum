import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { buildWorkbook } from "@/lib/excel";
import { messages } from "@/lib/i18n";
import { genderMark } from "@/lib/people";
import { areaLabel } from "@/lib/regions";
import { listDelegations } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  const delegations = await listDelegations();
  const org = messages.ru.register.org;
  const buffer = await buildWorkbook([
    {
      name: "Делегации",
      headers: ["Код", "Дата", "ФИО", "Должность", "Телефон", "Email", "Тип организации", "Область", "Район", "Организация", "Участников", "Координирует"],
      rows: delegations.map((item) => [
        item.code,
        item.createdAt,
        item.fullName,
        item.position,
        item.phone,
        item.email,
        org[item.organizationType],
        areaLabel(item.regionId, "ru"),
        item.district,
        item.organizationName,
        item.participants.length,
        item.willCoordinate ? "Да" : "Нет",
      ]),
    },
    {
      name: "Участники",
      headers: ["Код делегации", "Организация делегации", "№", "ФИО", "Возраст", "Пол", "Область", "Район/город", "Вуз/организация"],
      rows: delegations.flatMap((item) =>
        item.participants.map((person, index) => [
          item.code,
          item.organizationName,
          index + 1,
          person.fullName,
          person.age,
          genderMark(person.gender),
          person.region,
          person.district,
          person.organization,
        ]),
      ),
    },
  ]);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"kyyalym-delegations.xlsx\"",
      "Cache-Control": "no-store",
    },
  });
}
