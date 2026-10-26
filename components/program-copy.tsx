"use client";

import { useI18n } from "@/components/language";

const dot = "\u00b7";
const dash = "\u2013";

const ru = {
  kicker: `НАЦИОНАЛЬНЫЙ МОЛОДЕЖНЫЙ ФОРУМ  ${dot}  5 НОЯБРЯ 2026`,
  title: "КЫЯЛЫМДАГЫ КЫРГЫЗСТАН",
  kind: "ЕДИНАЯ ПРОГРАММА",
  place: `Бишкек  ${dot}  Жаштык Арена`,
  lead: "Национальный молодежный форум «Кыялымдагы Кыргызстан» объединит молодых людей из разных регионов страны для общения, обмена идеями и обсуждения будущего Кыргызстана.",
  preForum: "PRE-FORUM  |  ВНЕШНЯЯ ПЛОЩАДКА",
  preTime: `14:00${dash}16:00`,
  preTitle: "Молодежное пространство Pre-forum",
  preText:
    "Встреча участников, интерактивные площадки, фотозоны и молодежные активности. Презентация проектов Министерства культуры, информации и молодежной политики Кыргызской Республики в сфере молодежи, реализованных в рамках государственного социального заказа (ГСЗ).",
  hall: "ПЕРЕХОД В ОСНОВНОЙ ЗАЛ",
  hallTime: `16:00${dash}17:00`,
  hallTitle: "Размещение участников",
  hallText: "Размещение участников в зале, приветствие ведущих и музыкальная программа.",
  main: "ОСНОВНАЯ ПРОГРАММА",
  openTime: `17:00${dash}18:54`,
  openTitle: "Официальное открытие форума и награждение представителей молодежи",
  showTime: `18:54${dash}20:06`,
  showTitle: "Творческая программа и конкурс 15 вузов «Кыялымдагы Кыргызстан»",
  showText: "Музыкальные выступления и финальная композиция «Салым».",
  poll: "НАЦИОНАЛЬНЫЙ ОПРОС МОЛОДЕЖИ",
  pollBefore: "В рамках подготовки к форуму проходит Национальный опрос молодежи на платформе ",
  pollSite: "www.jashtyk.org",
  pollAfter:
    ". Молодые кыргызстанцы могут поделиться мнением о будущем страны, своих приоритетах и ожиданиях. Пройти опрос можно независимо от участия в форуме. Опрос не является регистрацией на мероприятие.",
  tagline: "Кыялымдагы Кыргызстан сенден башталат",
};

const ky = {
  kicker: `УЛУТТУК ЖАШТАР ФОРУМУ  ${dot}  2026-ЖЫЛДЫН 5-НОЯБРЫ`,
  title: "КЫЯЛЫМДАГЫ КЫРГЫЗСТАН",
  kind: "БИРДИКТҮҮ ПРОГРАММА",
  place: `Бишкек  ${dot}  Жаштык Арена`,
  lead: "«Кыялымдагы Кыргызстан» улуттук жаштар форуму өлкөнүн ар кайсы аймактарынан келген жаштарды баарлашуу, идеялар менен алмашуу жана Кыргызстандын келечегин талкуулоо үчүн бириктирет.",
  preForum: "PRE-FORUM  |  СЫРТКЫ АЯНТЧА",
  preTime: `14:00${dash}16:00`,
  preTitle: "Pre-forum жаштар мейкиндиги",
  preText:
    "Катышуучулардын жолугушуусу, интерактивдүү аянтчалар, фотозоналар жана жаштардын иш-чаралары. Кыргыз Республикасынын Маданият, маалымат жана жаштар саясаты министрлигинин жаштар тармагында мамлекеттик социалдык заказдын (ГСЗ) алкагында ишке ашырылган долбоорлорунун презентациясы.",
  hall: "НЕГИЗГИ ЗАЛГА ӨТҮҮ",
  hallTime: `16:00${dash}17:00`,
  hallTitle: "Катышуучуларды жайгаштыруу",
  hallText: "Катышуучуларды залга жайгаштыруу, алып баруучулардын саламдашуусу жана музыкалык программа.",
  main: "НЕГИЗГИ ПРОГРАММА",
  openTime: `17:00${dash}18:54`,
  openTitle: "Форумдун расмий ачылышы жана жаштардын өкүлдөрүн сыйлоо",
  showTime: `18:54${dash}20:06`,
  showTitle: "Чыгармачылык программа жана 15 ЖОЖдун «Кыялымдагы Кыргызстан» сынагы",
  showText: "Музыкалык чыгуулар жана «Салым» финалдык композициясы.",
  poll: "ЖАШТАРДЫН УЛУТТУК СУРАМЖЫЛООСУ",
  pollBefore: "Форумга даярдыктын алкагында Жаштардын улуттук сурамжылоосу ",
  pollSite: "www.jashtyk.org",
  pollAfter:
    " платформасында жүрүп жатат. Жаш кыргызстандыктар өлкөнүн келечеги, өз артыкчылыктары жана күтүүлөрү жөнүндө пикирлери менен бөлүшө алышат. Сурамжылоону форумга катышуудан көз карандысыз өтсө болот. Сурамжылоо иш-чарага катталуу болуп саналбайт.",
  tagline: "Кыялымдагы Кыргызстан сенден башталат",
};

function Label({ children }: { children: string }) {
  return <p className="whitespace-pre text-xs font-semibold tracking-[0.16em] text-aqua">{children}</p>;
}

function Slot({ time, title, text }: { time: string; title: string; text?: string }) {
  return (
    <div>
      <p className="whitespace-pre text-sm font-semibold text-aqua">{time}</p>
      <p className="mt-1 font-display text-lg leading-snug text-white">{title}</p>
      {text ? <p className="mt-2 text-sm leading-relaxed text-white/75">{text}</p> : null}
    </div>
  );
}

export function ProgramCopy() {
  const { lang } = useI18n();
  const copy = lang === "ky" ? ky : ru;

  return (
    <div className="space-y-6">
      <header>
        <Label>{copy.kicker}</Label>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">{copy.title}</h3>
        <p className="mt-2 whitespace-pre text-sm font-semibold tracking-[0.14em] text-white/80">{copy.kind}</p>
        <p className="mt-2 whitespace-pre text-sm text-white/60">{copy.place}</p>
      </header>

      <p className="leading-relaxed text-white/80">{copy.lead}</p>

      <section className="space-y-4">
        <Label>{copy.preForum}</Label>
        <Slot time={copy.preTime} title={copy.preTitle} text={copy.preText} />
      </section>

      <section className="space-y-4">
        <Label>{copy.hall}</Label>
        <Slot time={copy.hallTime} title={copy.hallTitle} text={copy.hallText} />
      </section>

      <section className="space-y-5">
        <Label>{copy.main}</Label>
        <Slot time={copy.openTime} title={copy.openTitle} />
        <Slot time={copy.showTime} title={copy.showTitle} text={copy.showText} />
      </section>

      <section className="space-y-3 border-t border-white/10 pt-6">
        <Label>{copy.poll}</Label>
        <p className="leading-relaxed text-white/80">
          {copy.pollBefore}
          <a href="https://www.jashtyk.org" className="text-aqua underline decoration-aqua/40 underline-offset-2" target="_blank" rel="noreferrer">
            {copy.pollSite}
          </a>
          {copy.pollAfter}
        </p>
        <a href="https://www.jashtyk.org" className="inline-block text-sm font-semibold text-aqua" target="_blank" rel="noreferrer">
          {copy.pollSite}
        </a>
        <p className="font-display text-lg text-white">{copy.tagline}</p>
      </section>
    </div>
  );
}
