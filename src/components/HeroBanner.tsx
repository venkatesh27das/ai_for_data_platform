import type { ReactNode } from "react";
import { Boxes, BrainCircuit, CircleDot, Database, FileCheck2, Layers3, Network, Sparkles } from "lucide-react";

function HeroIllustration() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden md:block max-[1360px]:opacity-60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_38%,rgba(255,90,31,0.18),transparent_20rem)]" />
      <div className="absolute -right-4 bottom-0 h-48 w-[110%] rounded-tl-[120px] bg-gradient-to-r from-transparent via-orange-50 to-orange-100/70" />
      <div className="absolute right-8 top-5 h-40 w-72 rotate-[-12deg] rounded-full border border-orange-200/80" />
      <div className="absolute right-16 top-8 h-36 w-64 rotate-[-12deg] rounded-full border border-orange-100" />
      <div className="absolute right-12 top-11 h-28 w-56 rotate-[-12deg] rounded-full border border-orange-100/80" />
      <div className="absolute right-12 top-6 h-px w-80 rotate-[-12deg] bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
      <div className="absolute bottom-7 right-24 h-24 w-24 rounded-2xl border border-orange-200 bg-white/90 p-5 shadow-card">
        <BrainCircuit className="h-full w-full text-orange-600" />
      </div>
      <div className="absolute bottom-14 right-64 h-20 w-20 rounded-2xl border border-orange-200 bg-white/95 p-4 shadow-card">
        <Database className="h-full w-full text-orange-600" />
      </div>
      <div className="absolute bottom-6 right-2 h-20 w-20 rounded-2xl border border-orange-200 bg-white/95 p-4 shadow-card">
        <Boxes className="h-full w-full text-orange-600" />
      </div>
      <div className="absolute right-44 top-4 h-16 w-16 rounded-xl border border-orange-200 bg-orange-50 p-3 shadow-sm max-[1360px]:hidden">
        <Layers3 className="h-full w-full text-orange-600" />
      </div>
      <div className="absolute right-4 top-16 h-14 w-14 rounded-xl border border-orange-200 bg-white p-3 shadow-sm max-[1360px]:hidden">
        <FileCheck2 className="h-full w-full text-orange-500" />
      </div>
      <div className="absolute right-72 top-24 h-12 w-12 rounded-xl border border-orange-200 bg-white p-2.5 shadow-sm max-[1360px]:hidden">
        <Network className="h-full w-full text-orange-500" />
      </div>
      {[12, 34, 58, 84, 114, 148, 184, 226, 268, 310].map((left, index) => (
        <span key={left} className="absolute h-1.5 w-1.5 rounded-full bg-orange-400/70" style={{ right: `${left}px`, top: `${24 + (index % 4) * 34}px` }} />
      ))}
      <CircleDot className="absolute right-36 top-24 h-7 w-7 text-orange-400 max-[1360px]:hidden" />
      <Sparkles className="absolute right-80 bottom-12 h-6 w-6 text-orange-400" />
    </div>
  );
}

export function HeroBanner({ title, subtitle, tags, actions }: { title: ReactNode; subtitle: string; tags?: ReactNode; actions?: ReactNode }) {
  return (
    <section className="card relative min-h-[205px] overflow-hidden bg-gradient-to-r from-white via-white to-orange-50">
      <HeroIllustration />
      <div className="relative z-10 max-w-[72%] p-5 pl-16 pr-4 2xl:p-6 2xl:pl-16 max-[1360px]:max-w-[82%] max-[1360px]:pl-6">
        <div className="absolute left-6 top-6 h-10 w-1.5 rounded-full bg-orange-600 max-[1360px]:hidden" />
        <h2 className="max-w-5xl text-[2.35rem] font-extrabold leading-none tracking-normal text-slate-950 2xl:text-[2.45rem] max-[1360px]:text-4xl">{title}</h2>
        <p className="mt-3 max-w-2xl text-base leading-6 text-slate-600">{subtitle}</p>
        {tags && <div className="mt-4 flex flex-wrap gap-2">{tags}</div>}
        {actions && <div className="mt-4 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
