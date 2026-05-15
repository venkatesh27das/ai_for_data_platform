import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal text-slate-950">{title}</h1>
        <p className="mt-1 max-w-4xl text-sm text-slate-600">{subtitle}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
