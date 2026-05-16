import { Box, Brain, Cloud, Database, DollarSign, ExternalLink, FileCheck, Layers, Library, Network, Plus, Rocket, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { useState } from "react";
import MetricCard from "../components/common/MetricCard";
import EntityDrawer from "../components/common/EntityDrawer";
import ProgressBar from "../components/common/ProgressBar";
import RecommendationItem from "../components/common/RecommendationItem";
import DataCard from "../components/common/DataCard";
import { activeJourneys, dataProducts, healthServices, recommendations } from "../data/mockData";
import type { DrawerEntity } from "../types";

export default function Home() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const recent = ["dp-claims-gold", "dp-provider-contract", "dp-customer-360", "dp-hcp-activity"].map((id) => dataProducts.find((p) => p.id === id)!);
  const launch = [
    ["Data Journey Studio", Rocket], ["Migrate to Modernize", Cloud], ["Ingestion Studio", Database], ["Processing & Extraction Studio", Brain],
    ["Data Quality Studio", ShieldCheck], ["Data Product Hub", Box], ["Context & Semantic Hub", Network], ["Consumption Portal", Library],
  ] as const;
  return (
    <>
      <section className="panel overflow-hidden p-8">
        <div className="grid grid-cols-[1.05fr_.95fr] gap-8">
          <div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight text-slate-950">Build trusted data products from any source, on any cloud</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">AI-assisted workflows for structured and unstructured data across the entire data engineering journey-from ingestion to intelligent consumption.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Start New Data Journey", "Migrate Workload", "Create Data Product", "Explore Catalog"].map((label, i) => <button key={label} className={`h-11 rounded-lg border px-5 text-sm font-bold ${i === 0 ? "orange-gradient border-orange-500 text-white" : "border-orange-300 bg-white text-orange-600"}`}>{label}</button>)}
            </div>
            <div className="mt-5 flex max-w-3xl items-center divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
              {["AWS", "Microsoft Azure", "Google Cloud", "Databricks", "Snowflake", "Power BI"].map((item) => <span key={item} className="px-4">{item}</span>)}
            </div>
          </div>
          <div className="relative min-h-[250px] rounded-[24px] bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6">
            <div className="absolute left-8 top-1/2 h-28 w-[82%] -translate-y-1/2 rounded-[50%] border-4 border-orange-400/70" />
            <div className="absolute right-8 top-1/2 h-28 w-[82%] -translate-y-1/2 rounded-[50%] border-4 border-orange-400/70" />
            {["Any Source", "AI-Assisted", "Trusted & Governed", "Any Consumption"].map((label, i) => <div key={label} className={`absolute rounded-xl border border-orange-100 bg-white px-4 py-3 text-center shadow-card ${["left-3 top-24", "left-1/2 top-4 -translate-x-1/2", "left-1/2 bottom-4 -translate-x-1/2", "right-3 top-24"][i]}`}><Sparkles className="mx-auto mb-1 h-5 w-5 text-orange-600" /><b className="text-sm">{label}</b></div>)}
          </div>
        </div>
      </section>
      <section className="mt-4 grid grid-cols-4 gap-4">
        <MetricCard title="Active Journeys" value="28" delta="▲ 14%" icon={Rocket} trend={false} />
        <MetricCard title="Published Products" value="124" delta="▲ 18%" icon={Box} trend={false} />
        <MetricCard title="Quality Score" value="93/100" delta="▲ 6 pts" icon={ShieldCheck} color="green" trend={false} />
        <MetricCard title="Open Issues" value="16" delta="▼ 11%" icon={TriangleAlert} color="orange" trend={false} />
        <MetricCard title="Reusable Assets" value="352" delta="▲ 22%" icon={Layers} trend={false} />
        <MetricCard title="Cloud Connections" value="7" delta="Healthy" icon={Cloud} color="blue" trend={false} />
        <MetricCard title="AI Recommendations" value="23" delta="New" icon={Sparkles} color="purple" trend={false} />
        <MetricCard title="Monthly Cost" value="$48.7K" delta="▼ 8%" icon={DollarSign} trend={false} />
      </section>
      <section className="mt-4 grid grid-cols-4 gap-4">{launch.map(([title, Icon]) => <button key={title} className="panel flex items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-200"><Icon className="h-7 w-7 text-orange-600" /><span><b className="block text-sm">{title}</b><span className="text-xs text-slate-500">Open workspace</span></span><ExternalLink className="ml-auto h-4 w-4 text-orange-500" /></button>)}</section>
      <section className="mt-4 grid grid-cols-[1.2fr_1.2fr_1fr] gap-4">
        <Panel title="My Active Journeys">{activeJourneys.map((j) => <button key={j.id} onClick={() => setDrawer({ type: "journey", id: j.id })} className="mb-3 w-full text-left"><div className="flex items-center justify-between text-sm font-bold"><span>{j.name}</span><span className="text-xs text-slate-500">{j.dueDate}</span></div><p className="mb-2 text-xs text-slate-500">{j.stage}</p><ProgressBar value={j.progress} /></button>)}</Panel>
        <Panel title="AI Recommendations">{recommendations.slice(0, 3).map((r) => <RecommendationItem key={r.id} {...r} onClick={() => r.relatedEntityType === "product" ? setDrawer({ type: "product", id: r.relatedEntityId }) : undefined} />)}</Panel>
        <Panel title="Platform Health / Connected Ecosystem">{healthServices.slice(0, 7).map((s) => <div key={s.service} className="flex items-center justify-between border-b border-slate-100 py-2 text-xs"><b>{s.service}</b><span className="font-bold text-emerald-600">{s.status}</span></div>)}</Panel>
      </section>
      <section className="mt-4 panel p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Recently Published Data Products</h2><button className="text-sm font-bold text-orange-600">View catalog</button></div><div className="grid grid-cols-4 gap-4">{recent.map((p) => <DataCard key={p.id} item={p} kind="product" onClick={() => setDrawer({ type: "product", id: p.id })} />)}</div></section>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="panel p-4"><h2 className="mb-3 font-bold text-slate-950">{title}</h2><div className="space-y-2">{children}</div></div>;
}
