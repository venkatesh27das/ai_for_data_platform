import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--orange)] bg-[var(--orange)] text-white shadow-[0_9px_20px_rgba(255,90,31,0.16)] hover:bg-[var(--orange-dark)]",
  secondary:
    "border-[rgba(255,90,31,0.45)] bg-white text-[var(--orange)] hover:bg-[var(--orange-soft)]",
  ghost:
    "border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
};

export function Button({ children, icon, variant = "secondary", className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-[0.8rem] font-bold transition focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,90,31,0.16)] disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {icon ? <span className="flex h-[1.125rem] w-[1.125rem] items-center justify-center">{icon}</span> : null}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}
