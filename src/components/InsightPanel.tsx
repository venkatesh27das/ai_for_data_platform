import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { notify } from "../lib/utils";

export function InsightPanel({ title, children, actions }: { title: string; children?: ReactNode; actions?: string[] }) {
  return (
    <aside className="space-y-4">
      <section className="card p-5">
        <h2 className="section-title mb-4">{title}</h2>
        {children}
      </section>
      {actions && (
        <section className="card p-5">
          <h2 className="section-title mb-4">Recommended Actions</h2>
          <div className="divide-y divide-slate-100">
            {actions.map((action) => (
              <button key={action} onClick={() => notify(`${action} selected`)} className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-slate-700 hover:text-orange-600">
                {action}
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
