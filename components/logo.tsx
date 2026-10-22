import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    // Drop the official file at public/лого Кыялымдагы Кыргызстан-02.jpg
    // and point this src to it, or replace public/logo.png.
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="Логотип форума Кыялымдагы Кыргызстан" className={cn("object-contain", className)} />
  );
}
