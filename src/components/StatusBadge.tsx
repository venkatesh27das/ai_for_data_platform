import { cn } from "../lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Available" || status === "Published" || status === "Completed" || status === "Healthy"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "Emerging" || status === "In Development" || status === "Assessment" || status === "In Review"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : status === "Expand" || status === "Existing / Expand" || status === "In Progress" || status === "Validation"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

  return <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold", styles)}>{status}</span>;
}
