import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import type { Tone } from "../../types/knowledge";
import { Card } from "./Card";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  note: string;
  tone?: Tone;
  trend?: "up" | "down";
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  note,
  tone = "orange",
  trend,
}: KpiCardProps) {
  return (
    <Card className="kpi-card">
      <span className={`icon-tile icon-tile--${tone}`}>
        <Icon aria-hidden="true" size={23} strokeWidth={1.8} />
      </span>
      <div>
        <div className="kpi-card__label">{label}</div>
        <div className="kpi-card__value">{value}</div>
        <div
          className={`kpi-card__note${trend ? ` trend trend--${trend}` : ""}`}
        >
          {trend === "up" && <ArrowUp aria-hidden="true" size={12} />}
          {trend === "down" && <ArrowDown aria-hidden="true" size={12} />}
          {note}
        </div>
      </div>
    </Card>
  );
}
