import type { JourneyStage } from "../data/journeyStages";
import { cn } from "../lib/utils";

export function JourneyStageCard({ stage, selected, onSelect }: { stage: JourneyStage; selected?: boolean; onSelect?: () => void }) {
  const Icon = stage.icon;
  return (
    <button onClick={onSelect} className={cn("card min-h-32 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50", selected && "border-orange-400 bg-orange-50 ring-1 ring-orange-200")}>
      <div className="flex items-center justify-between">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold", selected ? "border-orange-400 bg-orange-500 text-white" : "border-slate-200 bg-white text-slate-600")}>{stage.id}</span>
        <Icon className={cn("h-8 w-8", selected ? "text-orange-600" : "text-slate-500")} />
      </div>
      <h3 className="mt-4 text-sm font-bold leading-snug text-slate-950">{stage.name}</h3>
      <p className="mt-2 text-xs text-slate-500">{stage.capabilities.length} capabilities</p>
    </button>
  );
}
