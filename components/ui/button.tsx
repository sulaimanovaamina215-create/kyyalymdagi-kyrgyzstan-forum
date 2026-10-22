import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "brand" | "ghost" | "quiet";
};

export function Button({ className, variant = "brand", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua disabled:cursor-not-allowed disabled:opacity-50",
        variant === "brand" && "btn-brand",
        variant === "ghost" &&
          "border border-white/15 bg-white/5 text-white transition hover:border-white/30 hover:bg-white/10",
        variant === "quiet" && "text-white/70 transition hover:text-white",
        className,
      )}
      {...props}
    />
  );
}
