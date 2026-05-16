import type { Status } from "../../types";

const styles: Record<string, string> = {
  Certified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-orange-50 text-orange-700 border-orange-200",
  Running: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Review: "bg-blue-50 text-blue-700 border-blue-200",
  Queued: "bg-amber-50 text-amber-700 border-amber-200",
  Healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Warning: "bg-amber-50 text-amber-700 border-amber-200",
  Critical: "bg-red-50 text-red-700 border-red-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Recommended: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Cost Saving": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "High Impact": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function StatusBadge({ status }: { status: Status | "High Impact" | string }) {
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${styles[status] ?? "bg-slate-50 text-slate-700 border-slate-200"}`}>{status}</span>;
}
