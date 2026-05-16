import type { LucideIcon } from "lucide-react";
import ActionButton from "./ActionButton";

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions: { label: string; icon?: LucideIcon; primary?: boolean; onClick?: () => void }[] }) {
  return (
    <div className="mb-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {actions.map((action) => <ActionButton key={action.label} icon={action.icon} primary={action.primary} onClick={action.onClick}>{action.label}</ActionButton>)}
      </div>
    </div>
  );
}
