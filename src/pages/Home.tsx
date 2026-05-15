import { Box, CloudUpload, Database, FlaskConical, LayoutDashboard, Rocket, Route, ShieldAlert, SquareCode } from "lucide-react";
import { Link } from "react-router-dom";
import { ActivityList } from "../components/ActivityList";
import { ActionCard } from "../components/ActionCard";
import { HeroBanner } from "../components/HeroBanner";
import { InsightPanel } from "../components/InsightPanel";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { capabilities } from "../data/capabilities";
import { recentActivities, recommendations } from "../data/activities";
import { journeyStages } from "../data/journeyStages";

export function Home() {
  const featured = capabilities.filter((item) => ["Automated Ingestion Pipeline Builder", "Assisted Data Modelling", "Data Product Factory", "Migrate to Modernize", "Multimodal Lakehouse", "Context & Intelligence Layer"].includes(item.name));
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-5">
      <div className="space-y-5">
        <HeroBanner
          title={<>Welcome to <span className="text-orange-600">AI for Data Platform</span></>}
          subtitle="Discover, launch, and operationalize AI-powered data capabilities across the full journey from ingestion to consumption."
          actions={<><Link to="/capability-hub" className="btn-primary"><Box className="h-4 w-4" />Explore Capabilities</Link><Link to="/data-journey" className="btn-secondary"><Route className="h-4 w-4" />View Data Journey</Link><Link to="/studios" className="btn-secondary"><Rocket className="h-4 w-4" />Launch a Studio</Link></>}
        />
        <section className="space-y-3">
          <h2 className="section-title">Platform Snapshot</h2>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Capabilities Available" value="18" trend="+12%" icon={LayoutDashboard} />
            <MetricCard label="Studios" value="4" trend="+33%" icon={SquareCode} />
            <MetricCard label="Data Products" value="12" trend="+9%" icon={Box} />
            <MetricCard label="Priority Gaps" value="5" trend="-17%" icon={ShieldAlert} tone="red" />
          </div>
        </section>
        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Featured Capabilities</h2>
            <Link to="/capability-hub" className="text-sm font-bold text-orange-600">View all capabilities</Link>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {featured.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-orange-200 hover:bg-orange-50">
                  <Icon className="mx-auto h-9 w-9 text-orange-600" />
                  <h3 className="mt-3 min-h-10 text-sm font-bold leading-tight text-slate-950">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>
                  <div className="mt-3"><StatusBadge status={item.status === "Existing / Expand" ? "Expand" : item.status} /></div>
                </div>
              );
            })}
          </div>
        </section>
        <div className="grid grid-cols-[1fr_1.4fr] gap-5">
          <section className="space-y-3">
            <h2 className="section-title">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <ActionCard title="Open Capability Hub" subtitle="Browse capabilities" icon={LayoutDashboard} />
              <ActionCard title="Start New Migration" subtitle="Launch assessment" icon={Rocket} />
              <ActionCard title="Create Data Product" subtitle="Design product" icon={Box} />
              <ActionCard title="Open Demo Workbench" subtitle="Explore demos" icon={FlaskConical} />
            </div>
          </section>
          <section className="card p-4">
            <h2 className="section-title mb-4">Journey Snapshot</h2>
            <div className="grid grid-cols-7 gap-2">
              {journeyStages.map((stage) => {
                const Icon = stage.icon;
                return <div key={stage.id} className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-orange-600"><Icon className="h-6 w-6" /></div><div className="mt-2 text-xs font-bold text-slate-800">{stage.shortName}</div><div className="mt-2 text-xs font-semibold text-green-700">{stage.capabilities.length}</div></div>;
              })}
            </div>
          </section>
        </div>
        <section className="grid grid-cols-4 gap-4">
          <MetricCard label="Active Capabilities" value="18" trend="+12%" icon={Database} />
          <MetricCard label="Running Accelerators" value="14" trend="+7%" icon={Rocket} />
          <MetricCard label="Demo Use Cases" value="21" trend="+18%" icon={FlaskConical} />
          <MetricCard label="Reusable Assets" value="342" trend="+11%" icon={Box} />
        </section>
      </div>
      <InsightPanel title="Recent Activity" actions={recommendations}>
        <ActivityList items={recentActivities} />
      </InsightPanel>
    </div>
  );
}
