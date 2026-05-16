import type { LucideIcon } from "lucide-react";

export default function ActivityItem({ icon: Icon, title, subtitle, time, color = "orange", onClick }: { icon: LucideIcon; title: string; subtitle: string; time: string; color?: "orange" | "green" | "blue" | "purple"; onClick?: () => void }) {
  const colors = { orange: "bg-orange-50 text-orange-600", green: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600" };
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-orange-50/50">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${colors[color]}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-800">{title}</span><span className="block truncate text-[11px] text-slate-500">{subtitle}</span></span>
      <span className="text-[11px] font-semibold text-slate-500">{time}</span>
    </button>
  );
}
