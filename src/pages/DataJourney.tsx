import { Layers, Map, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { ActionCard } from "../components/ActionCard";
import { CapabilityCard } from "../components/CapabilityCard";
import { DonutChart } from "../components/DonutChart";
import { JourneyStageCard } from "../components/JourneyStageCard";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { ProgressBar } from "../components/ProgressBar";
import { InsightPanel } from "../components/InsightPanel";
import { capabilities } from "../data/capabilities";
import { journeyStages } from "../data/journeyStages";
import { notify } from "../lib/utils";

export function DataJourney() {
  const [selectedId, setSelectedId] = useState(4);
  const selected = journeyStages.find((stage) => stage.id === selectedId)!;
  const supporting = capabilities.filter((capability) => selected.capabilities.includes(capability.name));
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
      <div className="space-y-5">
        <PageHeader title="Data Journey" subtitle="Navigate the end-to-end AI-supported data engineering flow and identify capabilities supporting each stage." actions={<><button className="btn-primary">Explore Full Journey</button><button className="btn-secondary">View Capability Map</button></>} />
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Journey Stages" value="7" icon={Map} />
          <MetricCard label="Capabilities Mapped" value="18" icon={Layers} />
          <MetricCard label="Priority Gaps" value="5" icon={ShieldAlert} tone="red" />
        </div>
        <section className="card p-4">
          <h2 className="section-title mb-4">End-to-End Data Engineering Journey</h2>
          <div className="grid grid-cols-7 gap-3">
            {journeyStages.map((stage) => <JourneyStageCard key={stage.id} stage={stage} selected={stage.id === selectedId} onSelect={() => setSelectedId(stage.id)} />)}
          </div>
        </section>
        <section className="grid grid-cols-[1fr_1fr_300px] gap-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2"><StatusBadge status={String(selected.id)} /><h2 className="section-title">{selected.shortName} Details</h2></div>
            <p className="text-sm leading-6 text-slate-600">{selected.description}</p>
            <h3 className="mt-4 text-sm font-bold text-slate-950">What this stage enables</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">{selected.enables.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500" />{item}</li>)}</ul>
          </div>
          <div className="space-y-3">{supporting.map((capability) => <CapabilityCard key={capability.name} capability={capability} />)}</div>
          <div className="card p-5">
            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex justify-between py-3"><span>Priority</span><span className="font-bold text-red-600">{selected.priority}</span></div>
              <div className="flex justify-between py-3"><span>Maturity</span><span className="font-bold text-orange-600">{selected.maturity}</span></div>
              <div className="flex justify-between py-3"><span>Coverage</span><span className="font-bold">{selected.coverage}</span></div>
            </div>
            <button onClick={() => notify("Capabilities opened")} className="btn-primary mt-5 w-full">Open Capabilities</button>
          </div>
        </section>
        <section className="card p-4">
          <h2 className="section-title mb-4">Capability Coverage Across Journey</h2>
          <div className="grid grid-cols-7 gap-2">
            {journeyStages.map((stage) => <div key={stage.id} className="rounded-lg border border-slate-200 p-3"><div className="mb-2 text-center text-xs font-bold">{stage.id}</div><ProgressBar value={stage.capabilities.length * 28} color="bg-green-500" /><p className="mt-2 text-center text-xs text-slate-600">{stage.capabilities[0]}</p></div>)}
          </div>
        </section>
        <section className="grid grid-cols-4 gap-4">
          {["Expand context layer roadmap", "Build connector framework", "Advance multimodal lakehouse", "Strengthen data observability"].map((title) => <ActionCard key={title} title={title} subtitle="Priority: Medium" icon={Search} />)}
        </section>
      </div>
      <InsightPanel title="Journey Insights" actions={["Review stage gaps", "Prioritize modernization", "Publish journey blueprint", "Align demo use cases"]}>
        <DonutChart centerLabel="Mapped" data={[{ name: "Existing", value: 9, color: "#22c55e" }, { name: "In Development", value: 5, color: "#f97316" }, { name: "Emerging", value: 3, color: "#f59e0b" }, { name: "Expand", value: 1, color: "#94a3b8" }]} />
      </InsightPanel>
    </div>
  );
}
