import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "compact";
}

export function Button({
  children,
  className = "",
  variant = "secondary",
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
