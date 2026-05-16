import type { LucideIcon } from "lucide-react";
import MiniTrend from "../charts/MiniTrend";

export default function MetricCard({ title, value, delta, icon: Icon, color = "orange", trend = true }: { title: string; value: string; delta?: string; icon: LucideIcon; color?: "orange" | "green" | "blue" | "purple" | "teal" | "red"; trend?: boolean }) {
  const colorMap = {
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-cyan-50 text-cyan-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="panel flex min-h-[96px] items-center justify-between gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-panel">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${colorMap[color]}`}><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
          {delta ? <p className="mt-1 text-[11px] font-semibold text-emerald-600">{delta}</p> : null}
        </div>
      </div>
      {trend ? <MiniTrend color={color} /> : null}
    </div>
  );
}
