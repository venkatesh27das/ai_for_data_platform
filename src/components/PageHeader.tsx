import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-5 border-b border-slate-200/80 pb-4">
      <div className="min-w-[320px] flex-1">
        <h1 className="text-3xl font-extrabold tracking-normal text-slate-950">{title}</h1>
        <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
