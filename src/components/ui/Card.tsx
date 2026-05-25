import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-card",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
