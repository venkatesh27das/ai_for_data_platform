type StatusPillProps = {
  children: string;
  tone?: "green" | "blue" | "orange" | "red" | "purple" | "neutral";
};

const toneClasses = {
  green: "bg-[var(--green-soft)] text-[var(--green)]",
  blue: "bg-[var(--blue-soft)] text-[var(--blue)]",
  orange: "bg-[var(--orange-soft)] text-[var(--orange)]",
  red: "bg-[var(--red-soft)] text-[var(--red)]",
  purple: "bg-[var(--purple-soft)] text-[var(--purple)]",
  neutral: "bg-[#f1f3f8] text-[var(--text-secondary)]",
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={[
        "inline-flex h-6 items-center rounded-md px-2 text-[0.69rem] font-extrabold leading-none",
        toneClasses[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
