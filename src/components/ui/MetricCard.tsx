import { ArrowDown, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { IconBadge, type BadgeTone } from "./IconBadge";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  trend?: string;
  trendTone?: "up" | "down" | "neutral";
  tone?: BadgeTone;
};

export function MetricCard({
  icon,
  label,
  value,
  helper,
  trend,
  trendTone = "up",
  tone = "blue",
}: MetricCardProps) {
  const TrendIcon = trendTone === "down" ? ArrowDown : ArrowUp;
  const trendColor =
    trendTone === "down" ? "text-[var(--red)]" : trendTone === "neutral" ? "text-[var(--green)]" : "text-[var(--green)]";

  return (
    <Card className="flex min-h-[6.25rem] items-center gap-4 px-4 py-3">
      <IconBadge icon={icon} tone={tone} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-[0.76rem] font-bold text-[var(--text-primary)]">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[1.45rem] font-extrabold leading-none tracking-normal text-[var(--text-primary)]">
            {value}
          </span>
          {trend ? (
            <span className={["inline-flex items-center gap-1 text-[0.74rem] font-bold", trendColor].join(" ")}>
              {trendTone !== "neutral" ? <TrendIcon aria-hidden="true" className="h-3.5 w-3.5" /> : null}
              {trend}
            </span>
          ) : null}
        </div>
        <p className="mt-2 truncate text-[0.74rem] font-medium text-[var(--text-muted)]">{helper}</p>
      </div>
    </Card>
  );
}
