export const MOTIVATION_WORD_LIMIT = 300;

export type Application = {
  fullName: string;
  phone: string;
  letter: string;
};

export type ApplicationError = "applyName" | "applyPhone" | "applyLetter" | "applyWords";

export function countWords(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function whatsAppLocalDigits(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("996")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function formatWhatsAppInput(raw: string) {
  const local = whatsAppLocalDigits(raw).slice(0, 9);
  const parts = [local.slice(0, 3), local.slice(3, 6), local.slice(6, 9)].filter((part) => part.length > 0);
  return parts.length ? `+996 ${parts.join(" ")}` : "";
}

export function parseApplication(source: { fullName?: unknown; phone?: unknown; letter?: unknown }):
  | { ok: true; value: Application }
  | { ok: false; error: ApplicationError } {
  const fullName = typeof source.fullName === "string" ? source.fullName.trim().replace(/\s+/g, " ") : "";
  const phoneRaw = typeof source.phone === "string" ? source.phone : "";
  const letter = typeof source.letter === "string" ? source.letter.replace(/\r\n/g, "\n").trim() : "";

  if (fullName.length < 5 || fullName.length > 160 || fullName.split(" ").length < 2) {
    return { ok: false, error: "applyName" };
  }

  const local = whatsAppLocalDigits(phoneRaw);
  if (!/^\d{9}$/.test(local)) return { ok: false, error: "applyPhone" };

  if (!letter) return { ok: false, error: "applyLetter" };
  if (letter.length > 20000 || countWords(letter) > MOTIVATION_WORD_LIMIT) return { ok: false, error: "applyWords" };

  return {
    ok: true,
    value: {
      fullName,
      phone: formatWhatsAppInput(local),
      letter,
    },
  };
}
