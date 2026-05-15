import { Box, FileInput, Plus, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { ActionCard } from "../components/ActionCard";
import { DonutChart } from "../components/DonutChart";
import { FilterBar } from "../components/FilterBar";
import { HeroBanner } from "../components/HeroBanner";
import { InsightPanel } from "../components/InsightPanel";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { dataProducts } from "../data/dataProducts";
import { cn, notify } from "../lib/utils";

const tabs = ["All", "Draft", "In Review", "Published", "Archived"];

export function DataProducts() {
  const [tab, setTab] = useState("All");
  const visible = tab === "All" ? dataProducts : dataProducts.filter((product) => product.status === tab);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
      <div className="space-y-5">
        <PageHeader title="Data Products" subtitle="Create, manage, validate, and publish governed data products across the platform." actions={<><button className="btn-primary"><Plus className="h-4 w-4" />Create Data Product</button><button className="btn-secondary"><FileInput className="h-4 w-4" />Import Blueprint</button></>} />
        <HeroBanner title="Data Product Factory" subtitle="Industrialize trusted datasets into reusable, governed data products with contracts, quality checks, ownership, and publishing workflows." tags={<><StatusBadge status="Available" /><span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Governed</span><span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">High Adoption</span></>} actions={<><button className="btn-primary">Create New Product</button><button className="btn-secondary">View Publishing Workflow</button></>} />
        <div className="grid grid-cols-4 gap-4"><MetricCard label="Active Data Products" value="12" icon={Box} /><MetricCard label="Draft Blueprints" value="7" icon={FileInput} tone="blue" /><MetricCard label="Published Products" value="8" icon={ShieldCheck} tone="green" /><MetricCard label="Readiness Issues" value="5" icon={TriangleAlert} tone="red" /></div>
        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between"><h2 className="section-title">Data Product Catalog</h2><FilterBar filters={["Domain", "Owner", "Readiness", "Status"]} /></div>
          <div className="mb-4 flex gap-2">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("rounded-lg px-4 py-2 text-sm font-semibold", tab === item ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-50")}>{item}</button>)}</div>
          <div className="grid grid-cols-3 gap-4">
            {visible.map((product) => <article key={product.name} className="rounded-lg border border-slate-200 p-4"><div className="flex items-start justify-between"><h3 className="font-bold text-slate-950">{product.name}</h3><StatusBadge status={product.status} /></div><p className="mt-1 h-12 text-sm leading-6 text-slate-600">{product.description}</p><div className="mt-3 flex items-center justify-between text-xs"><span className="rounded-md bg-orange-50 px-2 py-1 font-semibold text-orange-700">{product.domain}</span><span>{product.owner}</span></div><div className="mt-4 flex items-center gap-3"><span className="text-xs text-slate-500">Readiness</span><ProgressBar value={product.readiness} color={product.readiness > 80 ? "bg-green-500" : "bg-orange-500"} /><span className="text-xs font-bold">{product.readiness}%</span></div><div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>DQ {product.dq ? "●" : "○"}</span><span>Contract {product.contract ? "●" : "○"}</span><span>Catalog {product.catalog ? "●" : "○"}</span><span>Consumers {product.consumers}</span></div><button onClick={() => notify(`${product.name} opened`)} className="mt-3 text-sm font-bold text-orange-600">Open Product</button></article>)}
          </div>
        </section>
        <section className="grid grid-cols-7 gap-3">{["Intake", "Blueprint", "Quality Rules", "Contract", "Review", "Publish", "Catalog Access"].map((item, index) => <div key={item} className="card p-3 text-center"><Box className="mx-auto h-6 w-6 text-orange-600" /><div className="mt-2 text-xs font-bold">{item}</div><div className="mt-2 rounded-full bg-orange-50 py-1 text-xs font-bold text-orange-700">{index + 4}</div></div>)}</section>
      </div>
      <InsightPanel title="Product Insights" actions={["Review products pending approval", "Resolve readiness issues", "Complete missing contracts", "Publish demo-ready data products"]}>
        <DonutChart centerLabel="Total" data={[{ name: "Published", value: 8, color: "#22c55e" }, { name: "Draft", value: 3, color: "#3b82f6" }, { name: "In Review", value: 1, color: "#fb923c" }, { name: "Issues", value: 5, color: "#ef4444" }]} />
        <div className="mt-5 space-y-3"><h3 className="font-bold">Top Product Owners</h3>{["Priya Mehta 12 products", "Rohit Sharma 9 products", "Arjun Nair 7 products"].map((item) => <div className="text-sm text-slate-600" key={item}>{item}</div>)}</div>
      </InsightPanel>
    </div>
  );
}
