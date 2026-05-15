import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { MiniTrendChart } from "./MiniTrendChart";

export function MetricCard({ label, value, trend, icon: Icon, tone = "orange" }: { label: string; value: string | number; trend?: string; icon: LucideIcon; tone?: "orange" | "green" | "red" | "blue" }) {
  const toneClass = tone === "green" ? "bg-green-50 text-green-600" : tone === "red" ? "bg-red-50 text-red-600" : tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600";
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-3 ${toneClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">{label}</div>
            <div className="mt-1 text-3xl font-bold text-slate-950">{value}</div>
            {trend && (
              <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${trend.startsWith("-") ? "text-red-600" : "text-green-600"}`}>
                <ArrowUpRight className="h-3 w-3" />
                {trend}
              </div>
            )}
          </div>
        </div>
        <MiniTrendChart color={tone === "red" ? "#ef4444" : tone === "blue" ? "#3b82f6" : "#ff5a1f"} />
      </div>
    </div>
  );
}
