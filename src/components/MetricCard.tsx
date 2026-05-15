import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MiniTrendChart } from "./MiniTrendChart";

export function MetricCard({ label, value, trend, icon: Icon, tone = "orange" }: { label: string; value: string | number; trend?: string; icon: LucideIcon; tone?: "orange" | "green" | "red" | "blue" }) {
  const toneClass = tone === "green" ? "bg-green-50 text-green-600" : tone === "red" ? "bg-red-50 text-red-600" : tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600";
  const negative = Boolean(trend?.startsWith("-"));
  const TrendIcon = negative ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="card relative p-3 transition hover:-translate-y-0.5 hover:shadow-lg 2xl:p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`rounded-lg p-2.5 ${toneClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 pr-16">
            <div className="whitespace-normal text-sm font-bold leading-tight text-slate-800 2xl:whitespace-nowrap">{label}</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">{value}</div>
            {trend && (
              <div className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${negative ? "text-red-600" : "text-green-600"}`}>
                <TrendIcon className="h-3 w-3" />
                {trend}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 right-3">
          <MiniTrendChart color={tone === "red" ? "#ef4444" : tone === "blue" ? "#3b82f6" : "#ff5a1f"} />
        </div>
      </div>
    </div>
  );
}
