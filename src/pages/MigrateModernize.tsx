import { Box, CloudUpload, FileCode2, Import, Play, TriangleAlert, Users } from "lucide-react";
import { useState } from "react";
import { ActionCard } from "../components/ActionCard";
import { DonutChart } from "../components/DonutChart";
import { HeroBanner } from "../components/HeroBanner";
import { InsightPanel } from "../components/InsightPanel";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { migrationPrograms } from "../data/migrationPrograms";
import { cn, notify } from "../lib/utils";

const tabs = ["All", "Assessment", "In Progress", "Validation", "Completed"];

export function MigrateModernize() {
  const [tab, setTab] = useState("All");
  const visible = tab === "All" ? migrationPrograms : migrationPrograms.filter((program) => program.status === tab);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
      <div className="space-y-5">
        <PageHeader title="Migrate to Modernize" subtitle="Assess legacy platforms, automate migration, validate outputs, and accelerate modernization programs." />
        <HeroBanner title="AI-led Modernization Accelerator" subtitle="Leverage AI to drive end-to-end modernization with legacy assessment, dependency discovery, code conversion, pipeline migration, reconciliation, and migration planning." tags={<><StatusBadge status="Existing / Expand" /><span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">Cross-Journey</span><span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">High Impact</span></>} actions={<><button className="btn-primary"><Play className="h-4 w-4" />Start New Assessment</button><button className="btn-ghost"><Import className="h-4 w-4" />Import Migration Inventory</button></>} />
        <div className="grid grid-cols-4 gap-4"><MetricCard label="Active Migration Programs" value="6" icon={Users} /><MetricCard label="Assets Assessed" value="148" icon={Box} /><MetricCard label="Conversion Jobs Run" value="312" icon={FileCode2} /><MetricCard label="Validation Exceptions" value="19" icon={TriangleAlert} tone="red" /></div>
        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between"><h2 className="section-title">Migration Programs</h2><button className="text-sm font-bold text-orange-600">View All Programs</button></div>
          <div className="mb-4 flex gap-2">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("rounded-lg px-4 py-2 text-sm font-semibold", tab === item ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-50")}>{item}</button>)}</div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">{visible.map((program) => <article key={program.name} className="rounded-lg border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg"><h3 className="min-h-10 text-sm font-bold text-slate-950">{program.name}</h3><div className="mt-2 text-xs text-slate-500">{program.source} → {program.target}</div><div className="mt-3 flex items-center justify-between"><span className="text-xs">{program.owner}</span><StatusBadge status={program.status} /></div><div className="mt-4"><ProgressBar value={program.progress} /><div className="mt-1 text-right text-xs font-bold">{program.progress}%</div></div><div className="mt-3 grid grid-cols-3 gap-1 text-center text-xs text-slate-500"><span>Assets<br /><b>{program.assets}</b></span><span>Converted<br /><b>{program.converted}</b></span><span>Score<br /><b>{program.validationScore ?? "-"}</b></span></div><button onClick={() => notify(`${program.name} opened`)} className="btn-secondary mt-4 w-full">{program.status === "Validation" || program.status === "Completed" ? "Review" : "Open Program"}</button></article>)}</div>
        </section>
        <section className="grid grid-cols-7 gap-3">{["Inventory", "Dependency Mapping", "Code Conversion", "Pipeline Migration", "Data Validation", "Reconciliation", "Cutover Readiness"].map((item) => <div key={item} className="card p-3 text-center"><CloudUpload className="mx-auto h-6 w-6 text-orange-600" /><div className="mt-2 text-xs font-bold">{item}</div></div>)}</section>
        <section className="grid grid-cols-4 gap-4">{["Migration Assessment Template", "SQL Conversion Playbook", "Reconciliation Rule Pack", "Cutover Checklist"].map((item) => <ActionCard key={item} title={item} icon={FileCode2} />)}</section>
      </div>
      <InsightPanel title="Modernization Insights" actions={["Review validation exceptions", "Approve migration blueprint", "Publish reusable conversion pack", "Resolve dependency mapping gaps"]}>
        <DonutChart centerLabel="Programs" data={[{ name: "Assessment", value: 6, color: "#f59e0b" }, { name: "In Progress", value: 6, color: "#f97316" }, { name: "Validation", value: 4, color: "#8b5cf6" }, { name: "Completed", value: 4, color: "#22c55e" }]} />
      </InsightPanel>
    </div>
  );
}
