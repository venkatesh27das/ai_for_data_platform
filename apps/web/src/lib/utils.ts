import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toneForStatus(status: string) {
  const normalized = status.toLowerCase();
  if (
    ["published", "healthy", "passed", "active", "approved", "connected", "on track"].some(
      (value) => normalized.includes(value),
    )
  )
    return "success" as const;
  if (
    ["failed", "critical", "degraded", "error"].some((value) =>
      normalized.includes(value),
    )
  )
    return "critical" as const;
  if (
    ["warning", "attention", "update", "partial"].some((value) =>
      normalized.includes(value),
    )
  )
    return "warning" as const;
  if (
    ["review", "testing", "validation"].some((value) =>
      normalized.includes(value),
    )
  )
    return "ai" as const;
  if (
    ["build", "design", "progress", "development"].some((value) =>
      normalized.includes(value),
    )
  )
    return "info" as const;
  return "neutral" as const;
}

