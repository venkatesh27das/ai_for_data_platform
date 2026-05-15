import { Box, BookOpen, Clock, Database, Play, Settings, Star, Users } from "lucide-react";
import { useState } from "react";
import { ActionCard } from "../components/ActionCard";
import { HeroBanner } from "../components/HeroBanner";
import { InsightPanel } from "../components/InsightPanel";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { demoScenarios } from "../data/demoScenarios";
import { cn, notify } from "../lib/utils";

const tabs = ["All Demos", "Executive", "Data Engineering", "Data Product", "Modernization", "Industry Use Cases", "My Saved Demos"];

export function DemoWorkbench() {
  const [tab, setTab] = useState("All Demos");
  const visible = tab === "All Demos" || tab === "My Saved Demos" ? demoScenarios : demoScenarios.filter((demo) => demo.category === tab);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
      <div className="space-y-5">
        <PageHeader title="Demo Workbench" subtitle="Explore, run, and showcase curated AI for Data use cases and platform capabilities." />
        <HeroBanner title="Client-Ready Demo Experience" subtitle="Run guided demo scenarios, configure sample datasets, switch personas, and showcase end-to-end platform value." tags={<><StatusBadge status="Available" /><span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">Persona Driven</span><span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Reusable</span></>} actions={<><button className="btn-primary"><Play className="h-4 w-4" />Launch Demo</button><button className="btn-secondary"><Settings className="h-4 w-4" />Configure Scenario</button><button className="btn-secondary"><BookOpen className="h-4 w-4" />Browse Demo Library</button></>} />
        <div className="flex flex-wrap gap-2">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("rounded-lg border px-4 py-2 text-sm font-semibold", tab === item ? "border-orange-500 bg-orange-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-orange-50")}>{item}</button>)}</div>
        <section>
          <h2 className="section-title mb-3">Featured Demo Scenarios</h2>
          <div className="grid grid-cols-3 gap-4">
            {visible.map((demo) => <article key={demo.name} className="card p-4"><div className="flex items-start gap-3"><div className="rounded-lg bg-orange-50 p-3 text-orange-600"><Play className="h-6 w-6" /></div><div><h3 className="font-bold text-slate-950">{demo.name}</h3><p className="mt-1 h-12 text-sm leading-6 text-slate-600">{demo.description}</p></div></div><div className="mt-3 flex gap-2"><span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">{demo.persona}</span><span className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">{demo.readiness}</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500"><span>{demo.domain}</span><span>{demo.useCase}</span><span>{demo.duration}</span></div><button onClick={() => notify(`${demo.name} launched`)} className="btn-secondary mt-4 w-full">{demo.readiness === "In Review" ? "Preview" : "Run Demo"}</button></article>)}
          </div>
        </section>
        <section className="card p-4">
          <h2 className="section-title mb-4">Demo Builder / Configuration</h2>
          <div className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_1fr_auto] items-end gap-4">
            {["Persona", "Dataset"].map((label) => <label key={label} className="text-sm font-semibold text-slate-700">{label}<select className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3"><option>{label === "Persona" ? "Platform Lead" : "Healthcare Claims Sample Dataset"}</option></select></label>)}
            <div><div className="text-sm font-semibold text-slate-700">Capability Modules Included</div><div className="mt-2 flex gap-2">{[Box, Database, Users].map((Icon, index) => <span key={index} className="rounded-lg border border-slate-200 p-2"><Icon className="h-5 w-5 text-slate-600" /></span>)}<span className="rounded-lg border border-slate-200 px-3 py-2 text-sm">+3</span></div></div>
            <div><div className="text-sm font-semibold text-slate-700">Narrative Flow Steps</div><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <span key={n} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs">{n}</span>)}</div></div>
            <div><div className="text-sm font-semibold text-slate-700">Estimated Run Time</div><div className="mt-2 flex h-11 items-center gap-2 text-lg font-bold"><Clock className="h-5 w-5" />25-30 min</div></div>
            <button className="btn-primary">Generate Demo Flow</button>
          </div>
        </section>
        <div className="grid grid-cols-2 gap-5">
          <section className="card p-4"><h2 className="section-title mb-4">Recent Demo Sessions</h2>{["Pharma Claims Demo", "Retail Customer 360 Demo", "SQL Migration Storyboard"].map((item, index) => <div key={item} className="flex items-center gap-4 border-b border-slate-100 py-3 last:border-0"><Play className="h-5 w-5 text-orange-600" /><div className="flex-1"><div className="font-semibold">{item}</div><ProgressBar value={[72, 58, 36][index]} /></div><button className="text-sm font-bold text-orange-600">Resume</button></div>)}</section>
          <section className="grid grid-cols-2 gap-3">{["Demo Script Template", "Persona Storyboard", "Sample Dataset Pack", "Executive Summary Export", "Capability Walkthrough Deck", "Use Case Checklist"].map((item) => <ActionCard key={item} title={item} icon={BookOpen} />)}</section>
        </div>
      </div>
      <InsightPanel title="Workbench Insights" actions={["Review in-progress demos", "Publish demo-ready scenario", "Update persona playbook", "Promote high-usage demo asset"]}>
        <div className="space-y-4"><MetricCard label="Active Demos" value="18" trend="+12%" icon={Play} /><MetricCard label="Demo Sessions" value="64" trend="+18%" icon={Users} /><MetricCard label="Demo-Ready Use Cases" value="27" trend="+8%" icon={Star} /><MetricCard label="Reusable Assets" value="46" trend="+15%" icon={Box} tone="blue" /></div>
      </InsightPanel>
    </div>
  );
}
