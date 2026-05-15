import { Box, CloudUpload, Layers, ShieldCheck } from "lucide-react";

const icons = [CloudUpload, Box, ShieldCheck, Layers];

export function ActivityList({ items }: { items: Array<{ title: string; detail: string; time: string; by?: string }> }) {
  return (
    <div className="relative space-y-5 before:absolute before:left-5 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-orange-100">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];
        return (
          <div key={item.title} className="relative flex gap-3">
            <span className="absolute left-[18px] top-4 h-2 w-2 rounded-full bg-orange-600 ring-4 ring-white" />
            <div className="ml-8 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-950">{item.title}</div>
              <div className="text-xs text-slate-500">{item.detail}</div>
              <div className="mt-1 text-xs text-slate-500">{item.time}{item.by ? ` · by ${item.by}` : ""}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
