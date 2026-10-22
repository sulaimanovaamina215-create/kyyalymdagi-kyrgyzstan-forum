import ExcelJS from "exceljs";
import { capIssues, type Issue } from "@/lib/issues";
import { parseGender, personKey } from "@/lib/people";
import { canonicalizeRegion } from "@/lib/regions";
import type { Participant } from "@/lib/types";

const headerAliases = [
  ["№", "n", "no", "номер"],
  ["фио"],
  ["возраст"],
  ["пол"],
  ["область"],
  ["район/город", "район/шаар", "район"],
  ["вуз/организация", "вуз/уюм", "вуз", "организация"],
];

export type ParsedParticipant = Omit<Participant, "id"> & { row: number };

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (value instanceof Date) return "";
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text.trim();
    if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text ?? "").join("").trim();
    }
  }
  return "";
}

function headerKey(value: string) {
  return value.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, "");
}

function parseAge(value: string) {
  if (!/^\d{1,3}$/.test(value.trim())) return null;
  const age = Number(value);
  if (age < 14 || age > 70) return null;
  return age;
}

export async function buildTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Кыялымдагы Кыргызстан";
  const sheet = workbook.addWorksheet("Участники");
  sheet.addRow(["№", "ФИО", "Возраст", "Пол", "Область", "Район/город", "Вуз/организация"]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns = [8, 36, 14, 12, 28, 24, 36].map((width) => ({ width }));
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const help = workbook.addWorksheet("Инструкция");
  help.getColumn(1).width = 110;
  const lines = [
    "Образец списка участников форума «Кыялымдагы Кыргызстан».",
    "Заполняйте лист «Участники». Первая строка — заголовки, не удаляйте её. Данные начинаются со 2-й строки.",
    "Столбцы: №, ФИО, Возраст, Пол, Область, Район/город, Вуз/организация.",
    "Пол: М или Ж. Возраст: целое число от 14 до 70.",
    "Область пишите как в списке: Бишкек, Ош (город), Чуйская область, Ошская область, Джалал-Абадская область, Баткенская область, Нарынская область, Иссык-Кульская область, Таласская область.",
    "Количество строк должно совпасть с числом участников в форме. Пустые строки пропускаются.",
    "Одинаковые ФИО внутри файла и повторы с другими делегациями форма не примет.",
    "",
    "«Кыялымдагы Кыргызстан» форумунун катышуучулар тизмесинин үлгүсү.",
    "«Участники» барагын толтуруңуз. Биринчи сап — аталыштар. Маалымат 2-саптан башталат.",
    "Жынысы: М же Ж. Жаш: 14төн 70ке чейинки бүтүн сан.",
    "Облусту үлгүдөгү аталыш менен жазыңыз. Саптардын саны формадагы катышуучулардын санына дал келиши керек.",
  ];
  lines.forEach((line) => help.addRow([line]));

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.from(data);
}

export async function parseParticipantSheet(data: ArrayBuffer | Buffer): Promise<{ participants: ParsedParticipant[]; issues: Issue[] }> {
  const workbook = new ExcelJS.Workbook();
  try {
    const source = Buffer.isBuffer(data) ? data : Buffer.from(new Uint8Array(data));
    await workbook.xlsx.load(source as unknown as ExcelJS.Buffer);
  } catch {
    return { participants: [], issues: [{ code: "bad-format" }] };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return { participants: [], issues: [{ code: "bad-format" }] };

  const headers = headerAliases.map((_, index) => headerKey(cellText(sheet.getRow(1).getCell(index + 1).value)));
  const headersOk = headerAliases.every((aliases, index) => aliases.includes(headers[index] ?? ""));
  if (!headersOk) return { participants: [], issues: [{ code: "bad-format" }] };

  const issues: Issue[] = [];
  const participants: ParsedParticipant[] = [];
  const seen = new Map<string, number>();

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cells = [1, 2, 3, 4, 5, 6, 7].map((column) => cellText(row.getCell(column).value));
    if (cells.every((cell) => !cell)) return;
    const [fullName, ageText, genderText, regionText, district, organization] = cells.slice(1);
    let valid = true;

    if (!fullName || fullName.length < 5 || fullName.split(/\s+/).filter(Boolean).length < 2) {
      issues.push({ code: "row-name", row: rowNumber });
      valid = false;
    }
    const age = parseAge(ageText);
    if (age == null) {
      issues.push({ code: "row-age", row: rowNumber });
      valid = false;
    }
    const gender = parseGender(genderText);
    if (!gender) {
      issues.push({ code: "row-gender", row: rowNumber });
      valid = false;
    }
    const region = canonicalizeRegion(regionText);
    if (!region) {
      issues.push({ code: "row-region", row: rowNumber, value: regionText || "—" });
      valid = false;
    }
    if (!district || district.length < 2) {
      issues.push({ code: "row-district", row: rowNumber });
      valid = false;
    }
    if (!organization || organization.length < 2) {
      issues.push({ code: "row-org", row: rowNumber });
      valid = false;
    }
    if (!valid || age == null || !gender || !region) return;

    const key = personKey(fullName);
    const previous = seen.get(key);
    if (previous) {
      issues.push({ code: "duplicate", row: rowNumber, name: fullName, other: previous });
      return;
    }
    seen.set(key, rowNumber);
    participants.push({
      row: rowNumber,
      fullName,
      age,
      gender,
      region,
      district,
      organization,
    });
  });

  if (!issues.length && participants.length === 0) issues.push({ code: "empty" });
  if (participants.length > 500) issues.push({ code: "too-many" });
  return { participants, issues: capIssues(issues) };
}

export async function buildWorkbook(sheets: { name: string; headers: string[]; rows: (string | number)[][] }[]) {
  const workbook = new ExcelJS.Workbook();
  for (const item of sheets) {
    const sheet = workbook.addWorksheet(item.name.slice(0, 31));
    sheet.addRow(item.headers);
    sheet.getRow(1).font = { bold: true };
    for (const row of item.rows) sheet.addRow(row);
    sheet.columns.forEach((column) => {
      column.width = 26;
    });
  }
  const data = await workbook.xlsx.writeBuffer();
  return Buffer.from(data);
}
