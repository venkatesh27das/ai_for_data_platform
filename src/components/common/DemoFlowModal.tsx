import { CheckCircle2, X } from "lucide-react";

export interface DemoFlow {
  title: string;
  description: string;
  steps: string[];
  primaryAction?: string;
}

export default function DemoFlowModal({ flow, onClose }: { flow: DemoFlow | null; onClose: () => void }) {
  if (!flow) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/25 px-4" onClick={onClose}>
      <section onClick={(event) => event.stopPropagation()} className="w-full max-w-[520px] rounded-[16px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-orange-600">Workflow</p>
            <h2 className="mt-1 text-[20px] font-extrabold text-slate-950">{flow.title}</h2>
            <p className="mt-2 text-[13px] leading-5 text-slate-600">{flow.description}</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" aria-label="Close flow">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {flow.steps.map((step, index) => (
            <div key={step} className="grid grid-cols-[28px_1fr] items-start gap-3 rounded-[10px] border border-slate-100 bg-slate-50/70 p-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span>
                <b className="block text-[12px] text-slate-900">Step {index + 1}</b>
                <span className="mt-0.5 block text-[12px] leading-5 text-slate-600">{step}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 hover:border-orange-200 hover:text-orange-600">Close</button>
          <button onClick={onClose} className="h-9 rounded-lg border border-orange-500 orange-gradient px-4 text-[12px] font-bold text-white shadow-sm">{flow.primaryAction ?? "Complete workflow"}</button>
        </div>
      </section>
    </div>
  );
}
