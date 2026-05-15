import { ChevronRight, Flag, User } from "lucide-react";
import type { Capability } from "../data/capabilities";
import { notify } from "../lib/utils";
import { StatusBadge } from "./StatusBadge";

export function CapabilityCard({ capability }: { capability: Capability }) {
  const Icon = capability.icon;
  return (
    <article className="card group p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold leading-snug text-slate-950">{capability.name}</h3>
            <StatusBadge status={capability.status} />
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{capability.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" />{capability.stage}</span>
            <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{capability.owner}</span>
          </div>
          <button onClick={() => notify(`${capability.name} opened`)} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">
            Open <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
