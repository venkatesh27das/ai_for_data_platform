import { Boxes, Cloud, FileText, Grid2X2, Play, ShieldCheck, Sparkles, UploadCloud, UserPlus } from "lucide-react";
import { useState } from "react";
import EntityDrawer from "../components/common/EntityDrawer";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import ProgressBar from "../components/common/ProgressBar";
import RecommendationItem from "../components/common/RecommendationItem";
import StatusBadge from "../components/common/StatusBadge";
import Table, { type Column } from "../components/common/Table";
import { recommendations, studioSessions } from "../data/mockData";
import type { DrawerEntity, StudioSession } from "../types";

const studios = [
  ["Ingestion Studio", UploadCloud, "Ingest data from any source at any scale with observability.", "23 Templates", "4 Active"],
  ["Processing & Extraction Studio", Boxes, "Extract, transform and prepare structured and unstructured data.", "31 Templates", "6 Active"],
  ["Data Quality Studio", ShieldCheck, "Define rules, profile data and ensure trust and reliability.", "18 Templates", "3 Active"],
  ["Data Product Studio", Grid2X2, "Package data assets as products with governance and SLAs.", "27 Templates", "5 Active"],
  ["Semantic Studio", Sparkles, "Build semantic models and enable universal understanding.", "16 Templates", "4 Active"],
  ["Migration Studio", Cloud, "Migrate workloads and modernize pipelines across platforms.", "20 Templates", "2 Active"],
] as const;

export default function Studios() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const columns: Column<StudioSession>[] = [
    { header: "Session", render: (s) => <b>{s.name}</b> }, { header: "Studio", render: (s) => s.studioType }, { header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    { header: "Progress", render: (s) => <ProgressBar value={s.progress} /> }, { header: "Updated", render: (s) => s.lastUpdated },
  ];
  return (
    <>
      <section className="panel p-6">
        <PageHeader title="Studios" subtitle="Launch specialized workspaces to build, govern, and operationalize structured and unstructured data assets." actions={[
          { label: "Launch New Studio", icon: Play, primary: true }, { label: "Browse Templates", icon: Grid2X2 }, { label: "Resume Last Session", icon: Play }, { label: "Create Workspace", icon: UserPlus },
        ]} />
        <h2 className="mb-3 font-bold">Featured Studios</h2><div className="grid grid-cols-6 gap-4">{studios.map(([name, Icon, desc, templates, active]) => <button key={name} className="panel p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-200"><div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-600"><Icon className="h-6 w-6" /></div><h3 className="mt-3 text-sm font-bold">{name}</h3><p className="mt-1 min-h-12 text-xs text-slate-600">{desc}</p><div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-600"><span>{templates}</span><span className="text-emerald-600">{active}</span></div></button>)}</div>
        <div className="mt-5 grid grid-cols-[360px_1fr_420px] gap-4">
          <div className="panel p-4 shadow-none"><h2 className="mb-3 font-bold">Browse by Capability</h2>{["Data Engineering", "Unstructured AI", "Quality & Reliability", "Productization", "Semantic Enablement", "Modernization"].map((c) => <div key={c} className="mb-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-bold">{c}<p className="text-xs font-normal text-slate-500">Templates, accelerators, controls</p></div>)}</div>
          <div className="panel p-4 shadow-none"><h2 className="mb-3 font-bold">Active Studio Sessions</h2><Table columns={columns} rows={studioSessions} onRowClick={(s) => setDrawer({ type: "studio", id: s.id })} /></div>
          <div className="panel p-4 shadow-none"><h2 className="mb-3 font-bold">Workspace Insights</h2><div className="grid grid-cols-2 gap-3">{[["Active Studios", "6"], ["Running Sessions", "14"], ["Template Library", "135"], ["Success Rate", "96.4%"], ["Connected Tools", "28"], ["AI Assist Availability", "99.7%"]].map(([a, b]) => <MetricMini key={a} title={a} value={b} />)}</div></div>
        </div>
        <div className="mt-5 grid grid-cols-[1fr_1fr] gap-4"><Panel title="Recommended Templates">{["PDF-to-Data Product Pipeline", "Legacy SQL to PySpark Migration", "Semantic Layer Starter", "Gold Data Product Certification", "Multimodal Extraction Pipeline"].map((t) => <div key={t} className="rounded-xl border border-slate-100 p-3 text-sm font-bold"><FileText className="mb-2 h-5 w-5 text-orange-600" />{t}<p className="text-xs font-normal text-slate-500">Popular enterprise template</p></div>)}</Panel><Panel title="AI Recommendations">{recommendations.slice(0, 3).map((r) => <RecommendationItem key={r.id} {...r} />)}</Panel></div>
      </section>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}
function MetricMini({ title, value }: { title: string; value: string }) { return <div className="rounded-xl border border-slate-200 p-4 text-center"><p className="text-xs font-bold text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-[11px] text-emerald-600">All systems live</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="panel p-4 shadow-none"><h2 className="mb-3 font-bold">{title}</h2><div className="grid grid-cols-5 gap-3">{children}</div></div>; }
