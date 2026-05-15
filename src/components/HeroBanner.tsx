import type { ReactNode } from "react";
import { Boxes, CircleDot, Database, Sparkles } from "lucide-react";

export function HeroBanner({ title, subtitle, tags, actions }: { title: ReactNode; subtitle: string; tags?: ReactNode; actions?: ReactNode }) {
  return (
    <section className="card overflow-hidden bg-gradient-to-r from-white via-orange-50 to-white">
      <div className="grid grid-cols-[1fr_420px] items-center gap-6 p-7">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-slate-950">{title}</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{subtitle}</p>
          {tags && <div className="mt-4 flex flex-wrap gap-2">{tags}</div>}
          {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
        </div>
        <div className="relative h-44 overflow-hidden rounded-xl">
          <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_65%_40%,rgba(255,90,31,.2),transparent_35%),linear-gradient(135deg,rgba(255,255,255,.2),rgba(255,90,31,.08))]" />
          <div className="absolute left-14 top-11 rounded-2xl border border-orange-200 bg-white p-5 shadow-card">
            <Database className="h-12 w-12 text-orange-600" />
          </div>
          <div className="absolute left-44 top-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-card">
            <Sparkles className="h-16 w-16 text-orange-600" />
          </div>
          <div className="absolute bottom-8 right-14 rounded-2xl border border-orange-200 bg-white p-4 shadow-card">
            <Boxes className="h-12 w-12 text-orange-600" />
          </div>
          <CircleDot className="absolute right-8 top-6 h-7 w-7 text-orange-400" />
        </div>
      </div>
    </section>
  );
}
