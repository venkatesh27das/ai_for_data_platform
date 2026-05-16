import { Sparkles } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function RecommendationItem({ title, description, impact, actionLabel, onClick }: { title: string; description: string; impact: string; actionLabel?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 text-left transition hover:border-orange-200 hover:bg-orange-50/40">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600"><Sparkles className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">{title}</span><span className="block truncate text-[11px] text-slate-500">{description}</span></span>
      <StatusBadge status={impact} />
      {actionLabel ? <span className="rounded-md border border-orange-200 px-2 py-1 text-[11px] font-bold text-orange-600">{actionLabel}</span> : null}
    </button>
  );
}
