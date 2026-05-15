import { Box, Grid2X2, Play, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ActionCard } from "../components/ActionCard";
import { HeroBanner } from "../components/HeroBanner";
import { InsightPanel } from "../components/InsightPanel";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { studioSessions, studioTemplates, studios } from "../data/studios";
import { cn, notify } from "../lib/utils";

const tabs = ["All Studios", "Build Studios", "Quality", "Modernization", "Foundation", "My Workspaces"];

export function Studios() {
  const [tab, setTab] = useState("All Studios");
  const visible = tab === "All Studios" || tab === "My Workspaces" ? studios : studios.filter((studio) => studio.category === tab);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
      <div className="space-y-5">
        <HeroBanner title="Studios Workspace" subtitle="Open specialized AI-powered studios to build models, generate pipelines, validate data, convert code, and accelerate delivery." actions={<><button className="btn-primary"><Plus className="h-4 w-4" />Launch New Studio</button><button className="btn-ghost"><RotateCcw className="h-4 w-4" />Resume Recent Work</button><button className="btn-ghost"><Grid2X2 className="h-4 w-4" />Browse Templates</button></>} />
        <div className="flex gap-3">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("rounded-lg border px-5 py-2.5 text-sm font-semibold", tab === item ? "border-orange-500 bg-orange-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-orange-50")}>{item}</button>)}</div>
        <div className="grid grid-cols-3 gap-4">
          {visible.map((studio) => {
            const Icon = studio.icon;
            return (
              <article key={studio.name} className="card p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-orange-50 p-3 text-orange-600"><Icon className="h-8 w-8" /></div>
                  <div className="flex-1"><h3 className="text-lg font-bold text-slate-950">{studio.name}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{studio.description}</p></div>
                </div>
                <div className="mt-4 flex items-center justify-between"><StatusBadge status={studio.status} /><span className="text-sm text-slate-500">{studio.owner}</span></div>
                <button onClick={() => notify(`${studio.name} opened`)} className="btn-secondary mt-4 w-full">{studio.cta}</button>
              </article>
            );
          })}
        </div>
        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between"><h2 className="section-title">Recent Studio Sessions</h2><button className="text-sm font-bold text-orange-600">View all sessions</button></div>
          <div className="grid grid-cols-3 gap-4">
            {studioSessions.map((session) => <div key={session.name} className="rounded-lg border border-slate-200 p-4"><h3 className="font-bold text-slate-950">{session.name}</h3><p className="text-sm text-slate-500">{session.opened}</p><div className="mt-4 flex items-center gap-3"><ProgressBar value={session.progress} color="bg-green-500" /><span className="text-sm font-semibold">{session.progress}%</span></div><button className="mt-3 text-sm font-bold text-orange-600">Resume</button></div>)}
          </div>
        </section>
        <section className="grid grid-cols-4 gap-4">{studioTemplates.map((template) => <ActionCard key={template} title={template} icon={Box} />)}</section>
      </div>
      <InsightPanel title="Studio Insights" actions={["Resume unfinished studio sessions", "Publish reusable DQ rule pack", "Review new migration template", "Promote high-usage studio assets"]}>
        <div className="space-y-4"><MetricCard label="Active Studios" value="4" icon={Box} /><MetricCard label="Running Sessions" value="11" icon={Play} tone="blue" /><MetricCard label="Generated Assets" value="126" icon={Grid2X2} tone="green" /></div>
      </InsightPanel>
    </div>
  );
}
