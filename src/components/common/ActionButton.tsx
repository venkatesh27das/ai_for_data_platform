import type { LucideIcon } from "lucide-react";

export default function ActionButton({ children, icon: Icon, primary = false, onClick }: { children: string; icon?: LucideIcon; primary?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-card ${primary ? "orange-gradient border-orange-500 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-orange-200 hover:text-orange-600"}`}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}
