import { Box, CloudUpload, Layers, ShieldCheck } from "lucide-react";

const icons = [CloudUpload, Box, ShieldCheck, Layers];

export function ActivityList({ items }: { items: Array<{ title: string; detail: string; time: string; by?: string }> }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];
        return (
          <div key={item.title} className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-950">{item.title}</div>
              <div className="text-xs text-slate-500">{item.detail}</div>
              <div className="mt-1 text-xs text-slate-500">{item.time}{item.by ? ` · by ${item.by}` : ""}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
