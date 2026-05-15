import { Box, Check, ChevronRight, Database, FlaskConical, LayoutDashboard, Rocket, Route, ShieldAlert, SquareCode } from "lucide-react";
import { Link } from "react-router-dom";
import { ActivityList } from "../components/ActivityList";
import { ActionCard } from "../components/ActionCard";
import { HeroBanner } from "../components/HeroBanner";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { capabilities } from "../data/capabilities";
import { recentActivities, recommendations } from "../data/activities";
import { journeyStages } from "../data/journeyStages";

const recommendationDetails = [
  "Identify and prioritize capability gaps",
  "Enhance business context coverage",
  "Make a use case available to others",
  "Explore new capabilities in development"
];

const quickActions = [
  { title: "Open Capability Hub", subtitle: "Browse capabilities", icon: LayoutDashboard },
  { title: "Start New Migration", subtitle: "Launch assessment", icon: Rocket },
  { title: "Create Data Product", subtitle: "Design product", icon: Box },
  { title: "Open Demo Workbench", subtitle: "Explore demos", icon: FlaskConical }
];

export function Home() {
  const featured = capabilities.filter((item) => ["Automated Ingestion Pipeline Builder", "Assisted Data Modelling", "Data Product Factory", "Migrate to Modernize", "Multimodal Lakehouse", "Context & Intelligence Layer"].includes(item.name));
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4 2xl:grid-cols-[minmax(0,1fr)_328px] 2xl:gap-5">
      <div className="space-y-4 2xl:space-y-5">
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
        <section className="card p-3.5 2xl:p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Featured Capabilities</h2>
            <Link to="/capability-hub" className="text-sm font-bold text-orange-600">View all capabilities</Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(142px,1fr))] gap-3">
            {featured.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="rounded-lg border border-slate-200 bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:shadow-lg 2xl:p-3.5">
                  <Icon className="mx-auto h-8 w-8 text-orange-600 2xl:h-9 2xl:w-9" />
                  <h3 className="mt-2 min-h-10 text-sm font-bold leading-tight text-slate-950">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>
                  <div className="mt-2"><StatusBadge status={item.status === "Existing / Expand" ? "Expand" : item.status} /></div>
                </div>
              );
            })}
          </div>
        </section>
        <div className="grid grid-cols-[1fr_1.4fr] items-start gap-4 2xl:gap-5">
          <section className="space-y-3">
            <h2 className="section-title">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => <ActionCard key={action.title} title={action.title} subtitle={action.subtitle} icon={action.icon} />)}
            </div>
          </section>
          <section className="card mt-[34px] p-4">
            <h2 className="section-title mb-4">Journey Snapshot</h2>
            <div className="grid grid-cols-7 gap-2">
              {journeyStages.map((stage, index) => {
                const Icon = stage.icon;
                const healthy = stage.id < 7;
                return (
                  <div key={stage.id} className="relative text-center">
                    {index < journeyStages.length - 1 && (
                      <span aria-hidden="true" className="pointer-events-none absolute left-[calc(50%+2rem)] right-[calc(-50%+2rem)] top-6 z-0 flex items-center">
                        <span className="h-px flex-1 border-t border-dashed border-orange-200" />
                        <ChevronRight className="-ml-1 h-3.5 w-3.5 text-orange-400" strokeWidth={2.5} />
                      </span>
                    )}
                    <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600"><Icon className="h-6 w-6" /></div>
                    <div className="mt-2 text-[11px] font-bold leading-4 text-slate-800">{stage.shortName}</div>
                    <div className={`mx-auto mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${healthy ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full ${healthy ? "bg-green-100" : "bg-orange-100"}`}>{healthy ? <Check className="h-3 w-3" /> : null}</span>{stage.capabilities.length}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
        <section className="card p-3.5 2xl:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Platform Insights</h2>
            <Link to="/admin" className="text-sm font-bold text-orange-600">View all insights</Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Active Capabilities" value="18" trend="+12%" icon={Database} />
            <MetricCard label="Running Accelerators" value="14" trend="+7%" icon={Rocket} />
            <MetricCard label="Demo Use Cases" value="21" trend="+18%" icon={FlaskConical} />
            <MetricCard label="Reusable Assets" value="342" trend="+11%" icon={Box} />
          </div>
        </section>
      </div>
      <aside className="space-y-4 2xl:space-y-5">
        <section className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title">Recent Activity</h2>
            <button className="text-sm font-bold text-orange-600">View all</button>
          </div>
          <ActivityList items={recentActivities} />
        </section>
        <section className="card p-5">
          <h2 className="section-title mb-4">Recommended Next Steps</h2>
          <div className="divide-y divide-slate-100">
            {recommendations.map((action, index) => (
              <button key={action} className="flex w-full items-center justify-between gap-3 py-4 text-left hover:text-orange-600">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-orange-100 bg-orange-50 text-orange-600">
                    {index % 2 === 0 ? <Rocket className="h-5 w-5" /> : <Box className="h-5 w-5" />}
                  </span>
                  <span>
                    <span className="block text-sm font-bold leading-snug text-slate-900">{action}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{recommendationDetails[index]}</span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
