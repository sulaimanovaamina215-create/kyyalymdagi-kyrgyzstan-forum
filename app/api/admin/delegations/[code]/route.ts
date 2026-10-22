import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { cleanText, fieldErrors, participantErrors } from "@/lib/delegation";
import { parseGender } from "@/lib/people";
import { canonicalizeRegion } from "@/lib/regions";
import { deleteDelegation, getDelegation, updateDelegation } from "@/lib/store";
import { organizationTypes, type Gender, type OrganizationType } from "@/lib/types";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ code: string }> };

export async function DELETE(_request: Request, context: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { code } = await context.params;
  const removed = await deleteDelegation(decodeURIComponent(code));
  if (!removed) return NextResponse.json({ error: "Заявка не найдена." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { code } = await context.params;
  const current = await getDelegation(decodeURIComponent(code));
  if (!current) return NextResponse.json({ error: "Заявка не найдена." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const source = (body ?? {}) as Record<string, unknown>;
  const action = source.action;

  if (action === "delete-participant") {
    const participantId = cleanText(source.participantId, 80);
    const updated = await updateDelegation(current.code, (item) => {
      const participants = item.participants.filter((person) => person.id !== participantId);
      return { ...item, participants, participantCount: participants.length };
    });
    return NextResponse.json(updated);
  }

  if (action === "delete-duplicates") {
    const updated = await updateDelegation(current.code, (item) => {
      const seen = new Set<string>();
      const participants = item.participants.filter((person) => {
        const key = person.fullName.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return { ...item, participants, participantCount: participants.length };
    });
    return NextResponse.json(updated);
  }

  if (action === "participant") {
    const raw = source.participant as Record<string, unknown> | undefined;
    const person = {
      id: cleanText(raw?.id, 80),
      fullName: cleanText(raw?.fullName, 160),
      age: Number(raw?.age),
      gender: cleanText(raw?.gender, 20),
      region: cleanText(raw?.region, 80),
      district: cleanText(raw?.district, 160),
      organization: cleanText(raw?.organization, 200),
    };
    const problem = participantErrors(person, "ru");
    if (!problem || !current.participants.some((item) => item.id === person.id)) {
      if (!current.participants.some((item) => item.id === person.id)) {
        return NextResponse.json({ error: "Участник не найден." }, { status: 404 });
      }
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    }
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    const gender = (parseGender(person.gender) ?? person.gender) as Gender;
    const region = canonicalizeRegion(person.region) ?? person.region;
    const updated = await updateDelegation(current.code, (item) => ({
      ...item,
      participants: item.participants.map((entry) =>
        entry.id === person.id
          ? { ...entry, fullName: person.fullName, age: person.age, gender, region, district: person.district, organization: person.organization }
          : entry,
      ),
    }));
    return NextResponse.json(updated);
  }

  if (action === "meta") {
    const fullName = cleanText(source.fullName, 160);
    const position = cleanText(source.position, 160);
    const phone = cleanText(source.phone, 40);
    const email = cleanText(source.email, 160).toLowerCase();
    const organizationType = cleanText(source.organizationType, 40);
    const regionId = cleanText(source.regionId, 40);
    const district = cleanText(source.district, 160);
    const organizationName = cleanText(source.organizationName, 200);
    const coordinate = source.willCoordinate;
    const willCoordinate = coordinate === true || coordinate === "yes" ? true : coordinate === false || coordinate === "no" ? false : null;
    const problems = fieldErrors(
      {
        fullName,
        position,
        phone,
        email,
        organizationType,
        regionId,
        district,
        organizationName,
        participantCount: Math.max(current.participants.length, 1),
        willCoordinate,
        consent: true,
      },
      "ru",
    );
    if (problems.length || willCoordinate == null || !organizationTypes.includes(organizationType as OrganizationType)) {
      return NextResponse.json({ error: problems[0] || "Проверьте поля заявки." }, { status: 400 });
    }
    const updated = await updateDelegation(current.code, (item) => ({
      ...item,
      fullName,
      position,
      phone,
      email,
      organizationType: organizationType as OrganizationType,
      regionId,
      district,
      organizationName,
      willCoordinate,
      participantCount: item.participants.length,
    }));
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Неизвестное действие." }, { status: 400 });
}
