import {
  cleanText,
  countIssue,
  externalDuplicateIssues,
  fieldErrors,
  readLang,
  textsFromIssues,
  withParticipantIds,
  type DelegationFields,
} from "@/lib/delegation";
import { parseParticipantSheet } from "@/lib/excel";
import { messages } from "@/lib/i18n";
import { listDelegations } from "@/lib/store";
import { organizationTypes, type OrganizationType, type Participant } from "@/lib/types";

export type DelegationPayload = {
  lang: ReturnType<typeof readLang>;
  fields: DelegationFields;
  participants: Participant[] | null;
};

export async function readDelegationRequest(request: Request, mode: "create" | "edit", existingCount = 0, exceptCode?: string) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return { ok: false as const, status: 400, errors: [messages.ru.errors.badRequest] };
  }

  const lang = readLang(form.get("lang"));
  const errors = messages[lang].errors;
  if (cleanText(form.get("company"), 80)) {
    return { ok: false as const, status: 400, errors: [errors.badRequest] };
  }

  const fullName = cleanText(form.get("fullName"), 160);
  const position = cleanText(form.get("position"), 160);
  const phone = cleanText(form.get("phone"), 40);
  const email = cleanText(form.get("email"), 160).toLowerCase();
  const organizationType = cleanText(form.get("organizationType"), 40);
  const regionId = cleanText(form.get("regionId"), 40);
  const district = cleanText(form.get("district"), 160);
  const organizationName = cleanText(form.get("organizationName"), 200);
  const participantCount = Number(cleanText(form.get("participantCount"), 6));
  const coordinate = cleanText(form.get("willCoordinate"), 8);
  const willCoordinate = coordinate === "yes" ? true : coordinate === "no" ? false : null;
  const consent = form.get("consent") === "yes";

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
      participantCount,
      willCoordinate,
      consent,
    },
    lang,
  );

  const upload = form.get("file");
  const file = upload instanceof File && upload.size > 0 ? upload : null;
  let participants: Participant[] | null = null;

  if (file) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx")) problems.push(errors.fileType);
    else if (file.size > 5 * 1024 * 1024) problems.push(errors.fileSize);
    else {
      const parsed = await parseParticipantSheet(await file.arrayBuffer());
      if (parsed.issues.length) {
        problems.push(...textsFromIssues(parsed.issues, lang));
      } else if (parsed.participants.length !== participantCount) {
        problems.push(countIssue(parsed.participants.length, participantCount, lang));
      } else {
        const delegations = await listDelegations();
        const external = externalDuplicateIssues(parsed.participants, delegations, exceptCode);
        if (external.length) problems.push(...textsFromIssues(external, lang));
        else participants = withParticipantIds(parsed.participants);
      }
    }
  } else if (mode === "create") {
    problems.push(errors.fileRequired);
  } else if (participantCount !== existingCount) {
    problems.push(messages[lang].errors.keepCount.replace("{count}", String(existingCount)));
  }

  if (problems.length || (mode === "create" && !participants)) {
    return { ok: false as const, status: 400, errors: problems.length ? problems : [errors.fileRequired] };
  }

  if (!organizationTypes.includes(organizationType as OrganizationType) || willCoordinate == null) {
    return { ok: false as const, status: 400, errors: problems.length ? problems : [errors.badRequest] };
  }

  return {
    ok: true as const,
    lang,
    fields: {
      fullName,
      position,
      phone,
      email,
      organizationType: organizationType as OrganizationType,
      regionId,
      district,
      organizationName,
      participantCount,
      willCoordinate,
    },
    participants,
  };
}
