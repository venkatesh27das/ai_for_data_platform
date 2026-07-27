import type { PropsWithChildren } from "react";
import type { Tone } from "../../types/knowledge";

interface BadgeProps {
  tone?: Tone;
  outline?: boolean;
}

export function Badge({
  children,
  tone = "slate",
  outline = false,
}: PropsWithChildren<BadgeProps>) {
  return (
    <span className={`badge badge--${tone}${outline ? " badge--outline" : ""}`}>
      {children}
    </span>
  );
}
