import type { ArchiveKind, Cms, Localized } from "@/lib/types";

const text = (ru: string, ky: string): Localized => ({ ru, ky });

export const archiveKinds: ArchiveKind[] = ["program", "photo", "video", "results"];

export const defaultCms: Cms = {
  concept: text(
    "«Кыялымдагы Кыргызстан» — национальная площадка, где результаты опроса молодёжи из 7 областей, Бишкека и Оша становятся основой прямого разговора с главой государства о работе, образовании, жилье и развитии регионов.",
    "«Кыялымдагы Кыргызстан» — 7 облустун, Бишкек менен Оштун жаштарынын сурамжылоо жыйынтыгы жумуш, билим, турак жай жана аймактарды өнүктүрүү боюнча мамлекет башчысы менен түз сүйлөшүүнүн негизи болуп жаткан улуттук аянтча.",
  ),
  goals: [
    {
      id: "hear",
      title: text("Услышать повестку", "Күн тартибин угуу"),
      text: text(
        "Результаты Национального опроса покажут реальные проблемы, темы и запросы молодёжи со всей страны.",
        "Улуттук сурамжылоонун жыйынтыктары өлкө боюнча жаштардын чыныгы көйгөйлөрүн, темаларын жана суроо-талаптарын көрсөтөт.",
      ),
    },
    {
      id: "regions",
      title: text("Собрать регионы", "Аймактарды чогултуу"),
      text: text(
        "Делегации со всех 7 областей, Бишкека и Оша представят свои инициативы и видеообращения.",
        "7 облустун, Бишкек менен Оштун делегациялары өз демилгелерин жана видеокайрылууларын сунуштайт.",
      ),
    },
    {
      id: "decisions",
      title: text("Открытый диалог", "Ачык диалог"),
      text: text(
        "Прямая беседа с Президентом КР вокруг реальных вопросов и предложений молодых людей.",
        "Жаштардын чыныгы суроолору жана сунуштары боюнча Кыргыз Республикасынын Президенти менен түз баарлашуу.",
      ),
    },
    {
      id: "trace",
      title: text("Связь поколений", "Муундардын байланышы"),
      text: text(
        "Осмысление истории Отцов-основателей и передача эстафеты современному поколению лидеров.",
        "Негиздөөчү Аталардын тарыхын ой жүгүртүү жана эстафетаны азыркы муундагы лидерлерге өткөрүү.",
      ),
    },
  ],
  program: [
    {
      id: "day-1",
      day: text("5 ноября", "5-ноябрь"),
      title: text("Открытие и диалог", "Ачылыш жана диалог"),
      text: text(
        "Открытый диалог с Президентом КР Садыром Жапаровым, презентация результатов опроса и видеообращений регионов. Модератор — Айзада Жамгырчиева.",
        "Кыргыз Республикасынын Президенти Садыр Жапаров менен ачык диалог, сурамжылоонун жыйынтыктарын жана аймактардын видеокайрылууларын көрсөтүү. Модератор — Айзада Жамгырчиева.",
      ),
    },
    {
      id: "day-2",
      day: text("5 ноября", "5-ноябрь"),
      title: text("История и современность", "Тарых жана азыркы мезгил"),
      text: text(
        "Преемственность от Отцов-основателей к молодежи нового поколения, чествование достижений молодых лидеров в науке, бизнесе, культуре и спорте.",
        "Негиздөөчү Аталардан жаңы муундагы жаштарга мурас, илимдеги, бизнестеги, маданияттагы жана спорттогу жаш лидерлердин жетишкендиктерин сыйлоо.",
      ),
    },
    {
      id: "day-3",
      day: text("5 ноября", "5-ноябрь"),
      title: text("Пространство возможностей", "Мүмкүнчүлүктөр мейкиндиги"),
      text: text(
        "Интерактивные площадки, презентации проектов, а также творческий конкурс видеоработ и сценических выступлений среди 15 вузов страны.",
        "Интерактивдүү аянтчалар, долбоорлордун презентациялары, ошондой эле өлкөнүн 15 ЖОЖунун арасында видеоиштер жана сахналык чыгуулар боюнча чыгармачыл сынак.",
      ),
    },
  ],
  organizers: [
    {
      id: "committee",
      name: text("Оргкомитет форума", "Форумдун уюштуруу комитети"),
      role: text(
        "Координация основной программы, прямого диалога и презентаций молодежных инициатив.",
        "Негизги программаны, түз диалогду жана жаштардын демилгелеринин презентацияларын координациялоо.",
      ),
    },
    {
      id: "regions",
      name: text("Региональные команды", "Аймактык командалар"),
      role: text(
        "Организация участия молодежи из 7 областей, Бишкека и Оша.",
        "7 облустун, Бишкек менен Оштун жаштарынын катышуусун уюштуруу.",
      ),
    },
  ],
  partners: [
    {
      id: "season-partners",
      name: text("Партнёры сезона 2026", "2026-жылдын өнөктөштөрү"),
      url: "",
    },
  ],
  news: [
    {
      id: "survey-open",
      date: "2026-10-21",
      title: text("Национальный опрос молодежи", "Жаштардын улуттук сурамжылоосу"),
      text: text(
        "Ваши ответы сформируют повестку форума и будут представлены Президенту КР.",
        "Жоопторуңуз форумдун күн тартибин түзөт жана Кыргыз Республикасынын Президентине сунушталат.",
      ),
    },
    {
      id: "creative-contest",
      date: "2026-10-20",
      title: text("Творческий конкурс 15 вузов", "15 ЖОЖдун чыгармачыл сынагы"),
      text: text(
        "Студенческие команды представят своё видение «Кыргызстана будущего».",
        "Студенттик командалар «келечектин Кыргызстаны» боюнча өз көз карашын сунуштайт.",
      ),
    },
  ],
  archive: [
    {
      id: "2025-program",
      year: "2025",
      kind: "program",
      title: text("Программа 2025", "2025-жылдын программасы"),
      text: text(
        "Программа предыдущего сезона. Файл добавляют организаторы.",
        "Мурунку сезондун программасы. Файлды уюштуруучулар кошот.",
      ),
      url: "",
    },
    {
      id: "2025-photo",
      year: "2025",
      kind: "photo",
      title: text("Фотоархив 2025", "2025-жылдын сүрөт архиви"),
      text: text("Площадки, лаборатории и делегации прошлого форума.", "Өткөн форумдун аянтчалары, лабораториялары жана делегациялары."),
      url: "",
    },
    {
      id: "2025-video",
      year: "2025",
      kind: "video",
      title: text("Видео 2025", "2025-жылдын видеосу"),
      text: text("Записи открытий и защит проектов.", "Ачылыштардын жана долбоорлорду коргоонун жазуулары."),
      url: "",
    },
    {
      id: "2025-results",
      year: "2025",
      kind: "results",
      title: text("Итоги 2025", "2025-жылдын жыйынтыгы"),
      text: text("Декларация и решения, которые команды забрали в регионы.", "Командалар аймактарга алып кеткен декларация жана чечимдер."),
      url: "",
    },
    {
      id: "2024-results",
      year: "2024",
      kind: "results",
      title: text("Итоги 2024", "2024-жылдын жыйынтыгы"),
      text: text("Сводка сезона 2024. Материалы публикуют организаторы.", "2024-жылдын сезондук жыйынтыгы. Материалдарды уюштуруучулар жарыялайт."),
      url: "",
    },
    {
      id: "2024-photo",
      year: "2024",
      kind: "photo",
      title: text("Фото 2024", "2024-жылдын сүрөттөрү"),
      text: text("Кадры региональных встреч и национального форума.", "Аймактык жолугушуулардын жана улуттук форумдун кадрлары."),
      url: "",
    },
  ],
};

function clip(value: string, max: number) {
  return value.replace(/[\u0000-\u001F]/g, "").trim().slice(0, max);
}

function loc(value: unknown, max: number): Localized | null {
  if (!value || typeof value !== "object") return null;
  const source = value as { ru?: unknown; ky?: unknown };
  if (typeof source.ru !== "string" || typeof source.ky !== "string") return null;
  const ru = clip(source.ru, max);
  const ky = clip(source.ky, max);
  if (!ru || !ky) return null;
  return { ru, ky };
}

function cleanUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const url = value.trim().slice(0, 500);
  if (!url) return "";
  if (/^\/api\/media\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif|mp4|webm|pdf)$/.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return url;
  } catch {
    return "";
  }
  return "";
}

function idOf(value: unknown, fallback: string) {
  if (typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value)) return value;
  return fallback;
}

export function sanitizeCms(input: unknown): Cms {
  if (!input || typeof input !== "object") throw new Error("cms");
  const source = input as Partial<Cms>;
  const concept = loc(source.concept, 4000);
  if (!concept) throw new Error("cms");

  const goals = (Array.isArray(source.goals) ? source.goals : []).slice(0, 12).map((item, index) => {
    const title = loc(item?.title, 160);
    const text = loc(item?.text, 800);
    if (!title || !text) throw new Error("cms");
    return { id: idOf(item?.id, `goal-${index + 1}`), title, text };
  });

  const program = (Array.isArray(source.program) ? source.program : []).slice(0, 12).map((item, index) => {
    const day = loc(item?.day, 80);
    const title = loc(item?.title, 180);
    const text = loc(item?.text, 800);
    if (!day || !title || !text) throw new Error("cms");
    return { id: idOf(item?.id, `program-${index + 1}`), day, title, text };
  });

  const organizers = (Array.isArray(source.organizers) ? source.organizers : []).slice(0, 20).map((item, index) => {
    const name = loc(item?.name, 180);
    const role = loc(item?.role, 300);
    if (!name || !role) throw new Error("cms");
    return { id: idOf(item?.id, `org-${index + 1}`), name, role };
  });

  const partners = (Array.isArray(source.partners) ? source.partners : []).slice(0, 30).map((item, index) => {
    const name = loc(item?.name, 180);
    if (!name) throw new Error("cms");
    return { id: idOf(item?.id, `partner-${index + 1}`), name, url: cleanUrl(item?.url) };
  });

  const news = (Array.isArray(source.news) ? source.news : []).slice(0, 40).map((item, index) => {
    const title = loc(item?.title, 200);
    const text = loc(item?.text, 2000);
    const date = typeof item?.date === "string" ? item.date : "";
    if (!title || !text || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("cms");
    return { id: idOf(item?.id, `news-${index + 1}`), date, title, text };
  });

  const archive = (Array.isArray(source.archive) ? source.archive : []).slice(0, 60).map((item, index) => {
    const title = loc(item?.title, 180);
    const text = loc(item?.text, 1000);
    const year = typeof item?.year === "string" ? clip(item.year, 9) : "";
    const kind = archiveKinds.includes(item?.kind as ArchiveKind) ? (item?.kind as ArchiveKind) : null;
    if (!title || !text || !year || !kind) throw new Error("cms");
    return { id: idOf(item?.id, `archive-${index + 1}`), year, kind, title, text, url: cleanUrl(item?.url) };
  });

  if (!goals.length || !program.length) throw new Error("cms");
  return { concept, goals, program, organizers, partners, news, archive };
}
