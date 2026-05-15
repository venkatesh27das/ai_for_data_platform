import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { notify } from "../lib/utils";

export function ActionCard({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon: LucideIcon }) {
  return (
    <button onClick={() => notify(`${title} selected`)} className="card flex items-center justify-between gap-3 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50">
      <span className="flex items-center gap-3">
        <span className="rounded-xl bg-orange-50 p-3 text-orange-600"><Icon className="h-6 w-6" /></span>
        <span>
          <span className="block text-sm font-bold text-slate-950">{title}</span>
          {subtitle && <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 text-slate-400" />
    </button>
  );
}
