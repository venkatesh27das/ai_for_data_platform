import { Circle } from "lucide-react";
import type { Status } from "../../types";

export default function HealthIndicator({ status }: { status: Status }) {
  const color = status === "Healthy" || status === "Certified" || status === "Running" ? "text-emerald-500" : status === "Critical" ? "text-red-500" : "text-amber-500";
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Circle className={`h-2.5 w-2.5 fill-current ${color}`} />{status}</span>;
}
