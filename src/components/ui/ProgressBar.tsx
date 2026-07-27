import type { Tone } from "../../types/knowledge";

interface ProgressBarProps {
  value: number;
  tone?: Tone;
  compact?: boolean;
}

export function ProgressBar({
  value,
  tone = "blue",
  compact = false,
}: ProgressBarProps) {
  return (
    <div
      aria-label={`${value}% complete`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      className={`progress${compact ? " progress--compact" : ""}`}
      role="progressbar"
    >
      <span
        className={`progress__value progress__value--${tone}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
