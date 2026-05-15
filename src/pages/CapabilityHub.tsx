import { Box, FlaskConical, Plus, Rocket, Route, SquareCode } from "lucide-react";
import { useState } from "react";
import { ActionCard } from "../components/ActionCard";
import { CapabilityCard } from "../components/CapabilityCard";
import { DonutChart } from "../components/DonutChart";
import { FilterBar } from "../components/FilterBar";
import { HeroBanner } from "../components/HeroBanner";
import { InsightPanel } from "../components/InsightPanel";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { capabilities } from "../data/capabilities";
import { journeyStages } from "../data/journeyStages";
import { cn, notify } from "../lib/utils";

const tabs = ["All", "Build Studios", "Data Products", "Foundation", "Context", "Modernization", "Consumption"];

export function CapabilityHub() {
  const [tab, setTab] = useState("All");
  const visible = tab === "All" ? capabilities.slice(0, 8) : capabilities.filter((item) => item.category === tab);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
      <div className="space-y-5">
        <PageHeader title="Capability Hub" subtitle="Explore, launch, and manage AI for Data capabilities across the platform" actions={<button onClick={() => notify("Request submitted")} className="btn-secondary"><Plus className="h-4 w-4" />Request New Capability</button>} />
        <FilterBar filters={["All Capabilities", "Status", "Journey Stage", "Domain"]} />
        <HeroBanner title="Featured Capability: Migrate to Modernize" subtitle="AI-led migration accelerator for legacy assessment, code conversion, pipeline migration, reconciliation, and modernization." tags={<><StatusBadge status="Existing / Expand" /><span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">Cross-cutting</span><span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">High Demand</span></>} actions={<><button className="btn-primary" onClick={() => notify("Migrate to Modernize opened")}>Open Capability</button><button className="btn-secondary" onClick={() => notify("Journey fit opened")}>View Journey Fit</button></>} />
        <div className="flex border-b border-slate-200">
          {tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("px-4 py-3 text-sm font-semibold text-slate-600", tab === item && "border-b-2 border-orange-500 text-orange-600")}>{item}</button>)}
        </div>
        <div className="grid grid-cols-4 gap-4">{visible.map((item) => <CapabilityCard key={item.name} capability={item} />)}</div>
        <section className="card p-4">
          <h2 className="section-title mb-4">Journey Coverage</h2>
          <div className="grid grid-cols-7 gap-3">
            {journeyStages.map((stage) => <div key={stage.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center"><stage.icon className="mx-auto h-6 w-6 text-orange-600" /><div className="mt-2 text-xs font-bold">{stage.shortName}</div><div className="mt-1 text-xs text-slate-500">{stage.capabilities.length} capabilities</div></div>)}
          </div>
        </section>
        <section className="grid grid-cols-4 gap-4">
          <ActionCard title="Launch a Studio" subtitle="Build and run studios" icon={SquareCode} />
          <ActionCard title="Create Data Product" subtitle="Package trusted data" icon={Box} />
          <ActionCard title="Start Migration" subtitle="Assess and modernize" icon={Rocket} />
          <ActionCard title="Open Demo Workbench" subtitle="Explore demos" icon={FlaskConical} />
        </section>
      </div>
      <InsightPanel title="Capability Insights" actions={["Expand context layer roadmap", "Review emerging foundation capabilities", "Promote 3 demo-ready accelerators"]}>
        <DonutChart centerLabel="Total Capabilities" data={[{ name: "Available today", value: 9, color: "#22c55e" }, { name: "In development", value: 5, color: "#8b5cf6" }, { name: "Emerging", value: 4, color: "#f59e0b" }, { name: "Expand", value: 3, color: "#60a5fa" }]} />
        <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-600"><Route className="h-4 w-4" />View all capabilities</button>
      </InsightPanel>
    </div>
  );
}
