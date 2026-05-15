import { Box, Check, ChevronRight, Filter, Grid2X2, Layers3, Map, Play, Plus, Rocket } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CapabilityCard } from "../components/CapabilityCard";
import { HeroBanner } from "../components/HeroBanner";
import { InsightPanel } from "../components/InsightPanel";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { capabilities } from "../data/capabilities";
import { journeyStages } from "../data/journeyStages";
import { cn, notify } from "../lib/utils";

const modes = [
  { id: "capabilities", label: "All Capabilities", icon: Layers3 },
  { id: "journey", label: "Data Journey", icon: Map }
] as const;

type Mode = (typeof modes)[number]["id"];

const capabilityCategories = ["All", ...Array.from(new Set(capabilities.map((capability) => capability.category)))];

export function Studios() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get("mode") as Mode | null;
  const [mode, setMode] = useState<Mode>(modeParam === "journey" ? "journey" : "capabilities");
  const [capabilityCategory, setCapabilityCategory] = useState("All");
  const [selectedStageId, setSelectedStageId] = useState(journeyStages[0].id);

  const visibleCapabilities = capabilityCategory === "All" ? capabilities : capabilities.filter((capability) => capability.category === capabilityCategory);
  const selectedStage = journeyStages.find((stage) => stage.id === selectedStageId) ?? journeyStages[0];
  const selectedStageCapabilities = capabilities.filter((capability) => selectedStage.capabilities.includes(capability.name));

  const setDisplayMode = (nextMode: Mode) => {
    setMode(nextMode);
    setSearchParams(nextMode === "capabilities" ? { mode: "capabilities" } : { mode: "journey" });
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
      <div className="space-y-5">
        <HeroBanner
          title="Studios Workspace"
          subtitle="Discover platform solutions, view them as reusable capabilities, or map them across the end-to-end data journey."
          actions={<><button className="btn-primary"><Plus className="h-4 w-4" />Launch New Studio</button><button className="btn-ghost"><Grid2X2 className="h-4 w-4" />Browse Templates</button></>}
        />

        <section className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="section-title">Solutions Display</h2>
              <p className="mt-1 text-sm text-slate-500">Switch between a solution catalog and journey-based coverage view.</p>
            </div>
            <div className="inline-flex rounded-full bg-gradient-to-r from-orange-600 to-orange-500 p-1.5 shadow-sm shadow-orange-600/20">
              {modes.map((item) => {
                const Icon = item.icon;
                const selected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setDisplayMode(item.id)}
                    className={cn(
                      "inline-flex min-w-44 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition",
                      selected ? "bg-white text-orange-600 shadow-sm" : "text-white/95 hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {mode === "capabilities" && (
          <section className="card p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title">All Capabilities</h2>
                <p className="mt-1 text-sm text-slate-500">Filter by solution category and launch the right studio or accelerator.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"><Filter className="h-4 w-4" />{visibleCapabilities.length} shown</div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {capabilityCategories.map((category) => (
                <button key={category} onClick={() => setCapabilityCategory(category)} className={cn("rounded-lg border px-4 py-2 text-sm font-semibold transition", capabilityCategory === category ? "border-orange-500 bg-orange-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600")}>{category}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">{visibleCapabilities.map((capability) => <CapabilityCard key={capability.name} capability={capability} />)}</div>
          </section>
        )}

        {mode === "journey" && (
          <section className="space-y-4">
            <div className="card p-4">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="section-title">Data Journey View</h2>
                  <p className="mt-1 text-sm text-slate-500">Select a stage to see the platform solutions available for it.</p>
                </div>
                <StatusBadge status={selectedStage.maturity} />
              </div>
              <div className="grid grid-cols-7 gap-3">
                {journeyStages.map((stage, index) => {
                  const Icon = stage.icon;
                  const selected = stage.id === selectedStageId;
                  return (
                    <button key={stage.id} onClick={() => setSelectedStageId(stage.id)} className={cn("relative rounded-lg border bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg", selected ? "border-orange-400 bg-orange-50 ring-1 ring-orange-200" : "border-slate-200")}>
                      {index < journeyStages.length - 1 && <ChevronRight className="absolute -right-3 top-8 z-10 h-5 w-5 rounded-full bg-white text-orange-400" />}
                      <div className={cn("mx-auto flex h-11 w-11 items-center justify-center rounded-full border text-orange-600", selected ? "border-orange-300 bg-white" : "border-orange-200 bg-orange-50")}><Icon className="h-5 w-5" /></div>
                      <h3 className="mt-3 text-xs font-extrabold text-slate-950">{stage.shortName}</h3>
                      <p className="mt-1 text-[11px] leading-4 text-slate-500">{stage.capabilities.length} solutions</p>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700"><Check className="h-3 w-3" />{stage.coverage}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <section className="card p-4">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">{selectedStage.name}</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{selectedStage.description}</p>
                </div>
                <button onClick={() => notify(`${selectedStage.shortName} studio launched`)} className="btn-primary"><Rocket className="h-4 w-4" />Launch Stage Studio</button>
              </div>
              <div className="mb-5 grid grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs font-bold text-slate-500">Solutions</div><div className="mt-1 text-2xl font-extrabold text-slate-950">{selectedStageCapabilities.length}</div></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs font-bold text-slate-500">Coverage</div><div className="mt-1 text-2xl font-extrabold text-slate-950">{selectedStage.coverage}</div></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs font-bold text-slate-500">Priority</div><div className="mt-1 text-2xl font-extrabold text-slate-950">{selectedStage.priority}</div></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="text-xs font-bold text-slate-500">Maturity</div><div className="mt-1 text-2xl font-extrabold text-slate-950">{selectedStage.maturity}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selectedStageCapabilities.map((capability) => {
                  const Icon = capability.icon;
                  return (
                    <article key={capability.name} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-orange-50 p-3 text-orange-600 ring-1 ring-orange-100"><Icon className="h-7 w-7" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3"><h3 className="font-extrabold leading-snug text-slate-950">{capability.name}</h3><StatusBadge status={capability.status} /></div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{capability.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">{capability.category} · {capability.owner}</span>
                            <button onClick={() => notify(`${capability.name} launched`)} className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">Launch <ChevronRight className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        )}
      </div>
      <InsightPanel title="Studio Insights" actions={["Resume unfinished studio sessions", "Publish reusable DQ rule pack", "Review new migration template", "Promote high-usage studio assets"]}>
        <div className="space-y-4"><MetricCard label="Active Studios" value="4" icon={Box} /><MetricCard label="Running Sessions" value="11" icon={Play} tone="blue" /><MetricCard label="Generated Assets" value="126" icon={Grid2X2} tone="green" /></div>
      </InsightPanel>
    </div>
  );
}
