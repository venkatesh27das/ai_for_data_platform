import { Database, MoreVertical } from "lucide-react";
import type { DataProduct, SemanticAsset } from "../../types";
import StatusBadge from "./StatusBadge";

export default function DataCard({ item, kind, onClick }: { item: DataProduct | SemanticAsset; kind: "product" | "semantic"; onClick: () => void }) {
  const isProduct = kind === "product";
  const product = item as DataProduct;
  const asset = item as SemanticAsset;
  return (
    <button onClick={onClick} className="panel min-h-[176px] p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-panel">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600"><Database className="h-5 w-5" /></div>
          <div><h3 className="text-sm font-bold text-slate-950">{item.name}</h3><div className="mt-1"><StatusBadge status={item.status} /></div></div>
        </div>
        <MoreVertical className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-y-2 text-[11px]">
        <span className="font-bold text-slate-500">Domain</span><span className="font-semibold text-slate-800">{item.domain}</span>
        <span className="font-bold text-slate-500">Owner</span><span className="truncate font-semibold text-slate-800">{item.owner}</span>
        <span className="font-bold text-slate-500">Type</span><span className="font-semibold text-slate-800">{item.type}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="font-semibold text-slate-700">{isProduct ? `Quality ${product.qualityScore}%` : `Coverage ${asset.coverage}%`}</span>
        <span className="text-slate-500">Updated {item.lastUpdated}</span>
      </div>
      {isProduct ? <div className="mt-3 flex flex-wrap gap-1.5">{product.consumptionMethods.map((method) => <span key={method} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{method}</span>)}</div> : <div className="mt-3 flex flex-wrap gap-1.5">{asset.businessTerms.slice(0, 3).map((term) => <span key={term} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{term}</span>)}</div>}
    </button>
  );
}
