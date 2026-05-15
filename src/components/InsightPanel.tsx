import type { ReactNode } from "react";
import { ChevronRight, Compass, Map, Megaphone, ShieldCheck } from "lucide-react";
import { notify } from "../lib/utils";

const actionIcons = [Compass, Map, Megaphone, ShieldCheck];

export function InsightPanel({ title, children, actions }: { title: string; children?: ReactNode; actions?: string[] }) {
  return (
    <aside className="space-y-4">
      <section className="card p-5">
        <h2 className="section-title mb-5">{title}</h2>
        {children}
      </section>
      {actions && (
        <section className="card p-5">
          <h2 className="section-title mb-4">Recommended Actions</h2>
          <div className="divide-y divide-slate-100">
            {actions.map((action, index) => {
              const Icon = actionIcons[index % actionIcons.length];
              return (
              <button key={action} onClick={() => notify(`${action} selected`)} className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-bold text-slate-700 hover:text-orange-600">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-orange-100 bg-orange-50 text-orange-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="leading-snug">{action}</span>
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
              );
            })}
          </div>
        </section>
      )}
    </aside>
  );
}
