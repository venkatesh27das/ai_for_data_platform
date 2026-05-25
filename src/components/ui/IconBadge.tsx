import type { LucideIcon } from "lucide-react";

export type BadgeTone = "green" | "blue" | "purple" | "orange" | "red" | "cyan";

type IconBadgeProps = {
  icon: LucideIcon;
  tone?: BadgeTone;
  size?: "sm" | "md" | "lg";
};

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-[var(--green-soft)] text-[var(--green)] border-[#cceedd]",
  blue: "bg-[var(--blue-soft)] text-[var(--blue)] border-[#d5e3ff]",
  purple: "bg-[var(--purple-soft)] text-[var(--purple)] border-[#e5d6ff]",
  orange: "bg-[var(--orange-soft)] text-[var(--orange)] border-[#ffd7c6]",
  red: "bg-[var(--red-soft)] text-[var(--red)] border-[#ffd6d6]",
  cyan: "bg-[#eafaff] text-[#06a9c8] border-[#c8eef7]",
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-[3.2rem] w-[3.2rem]",
};

const iconSizeClasses = {
  sm: "h-[1.125rem] w-[1.125rem]",
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

export function IconBadge({ icon: Icon, tone = "blue", size = "md" }: IconBadgeProps) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-full border",
        toneClasses[tone],
        sizeClasses[size],
      ].join(" ")}
    >
      <Icon aria-hidden="true" className={iconSizeClasses[size]} strokeWidth={2.15} />
    </span>
  );
}
