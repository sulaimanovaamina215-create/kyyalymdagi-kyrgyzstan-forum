import { Reveal } from "@/components/reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  text: string;
};

export function SectionHeading({ eyebrow, title, text }: SectionHeadingProps) {
  return (
    <Reveal className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqua">{eyebrow}</p>
      <h2 className="mt-3 text-balance font-display text-[1.65rem] font-semibold leading-tight sm:text-4xl md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">{text}</p>
    </Reveal>
  );
}
