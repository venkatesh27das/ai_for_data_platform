import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  CirclePlay,
  Database,
  FileText,
  Flame,
  GitBranch,
  HeartPulse,
  Info,
  Link,
  LockKeyhole,
  Network,
  ScrollText,
  Settings,
  ShieldCheck,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { IconBadge, type BadgeTone } from "../components/ui/IconBadge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { ServiceHealthStrip } from "../components/ui/ServiceHealthStrip";
import { StatusPill } from "../components/ui/StatusPill";
import {
  activeAlerts,
  governanceActivity,
  observabilityActions,
  observabilityMetrics,
  observabilityServices,
  observabilityTabs,
  operationalSeries,
  platformActivity,
  platformHealth,
  policyViolations,
  qualityTrend,
  riskCoverage,
  type ObservabilityIconKey,
} from "../data/observability";

const iconMap: Record<ObservabilityIconKey, LucideIcon> = {
  runs: CirclePlay,
  success: CheckCircle2,
  alert: Bell,
  shield: ShieldCheck,
  lineage: GitBranch,
  health: HeartPulse,
  warning: AlertTriangle,
  info: Info,
  link: Link,
  policy: FileText,
  audit: ScrollText,
  metric: Flame,
  log: Database,
  trace: Network,
  monitor: ShieldCheck,
  store: ScrollText,
  usage: Activity,
  quality: Activity,
};

export function Observability() {
  const [activeTab, setActiveTab] = useState<(typeof observabilityTabs)[number]>("Core Dashboard");

  return (
    <div className="space-y-4 px-[clamp(1rem,1.5vw,1.65rem)] py-[clamp(0.9rem,1.2vw,1.35rem)]">
      <PageHeader
        title="Observability"
        subtitle="Monitor platform health, runs, lineage, governance, and compliance across governed unstructured data workflows."
        actions={
          <>
            <Button icon={<CirclePlay aria-hidden="true" className="h-4 w-4" />}>Open Dashboard</Button>
            <Button icon={<Bell aria-hidden="true" className="h-4 w-4" />}>Create Alert Rule</Button>
            <Button icon={<Upload aria-hidden="true" className="h-4 w-4" />}>Export Logs</Button>
            <Button icon={<Settings aria-hidden="true" className="h-4 w-4" />}>Open Lineage Explorer</Button>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {observabilityMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            icon={iconMap[metric.icon]}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
            trend={metric.trend}
            trendTone={metric.trendTone}
            tone={metric.tone}
          />
        ))}
      </section>

      <nav className="flex gap-4 border-b border-[var(--border-subtle)] px-1" aria-label="Observability views">
        {observabilityTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              "relative h-8 px-3 text-[0.76rem] font-extrabold transition",
              activeTab === tab ? "text-[var(--orange)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            ].join(" ")}
          >
            {tab}
            {activeTab === tab ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--orange)]" /> : null}
          </button>
        ))}
      </nav>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.72fr)_minmax(24rem,0.78fr)]">
        <div className="space-y-3">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)]">
            <Card className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Operational Overview</h2>
                  <div className="mt-2 flex gap-5 text-[0.66rem] font-bold text-[var(--text-secondary)]">
                    <Legend color="#12a66a" label="Success" />
                    <Legend color="#ef4444" label="Failed" />
                    <Legend color="#f59e0b" label="Partial" />
                  </div>
                </div>
                <button type="button" className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                  Last 24 hours
                </button>
              </div>
              <OperationalChart />
            </Card>

            <Card className="px-4 py-3">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Asset Risk & Coverage</h2>
              <div className="mt-3 grid grid-cols-[10rem_minmax(0,1fr)] items-center gap-5">
                <div className="relative flex h-[9.3rem] w-[9.3rem] items-center justify-center rounded-full bg-[conic-gradient(#12a66a_0_60%,#f59e0b_60%_78%,#2563eb_78%_89%,#ef4444_89%_100%)]">
                  <div className="flex h-[6rem] w-[6rem] flex-col items-center justify-center rounded-full bg-white text-center">
                    <span className="text-[1.45rem] font-extrabold leading-none text-[var(--text-primary)]">214</span>
                    <span className="mt-1 text-[0.62rem] font-bold text-[var(--text-secondary)]">Total Assets</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {riskCoverage.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[0.7rem] font-bold text-[var(--text-secondary)]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <span className="text-[var(--text-primary)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 border-t border-[var(--border-subtle)] pt-3 text-[0.72rem] font-bold text-[var(--text-secondary)]">
                <span>Total Governed Assets <b className="ml-5 text-[var(--text-primary)]">214</b></span>
                <span>Runs <b className="ml-5 text-[var(--text-primary)]">284</b> <span className="ml-2">(Last 24h)</span></span>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Recent Platform Activity</h2>
              <button type="button" className="inline-flex items-center gap-2 text-[0.74rem] font-extrabold text-[var(--orange)]">
                View all activity <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[57rem] w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-2 py-2.5">Activity</th>
                    <th className="px-2 py-2.5">Journey / Asset</th>
                    <th className="px-2 py-2.5">Type</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {platformActivity.map((activity) => (
                    <tr key={`${activity.time}-${activity.activity}`} className="border-b border-[var(--border-subtle)] text-[0.68rem] font-semibold text-[var(--text-secondary)] last:border-b-0">
                      <td className="whitespace-nowrap px-4 py-1.5">{activity.time}</td>
                      <td className="px-2 py-1.5">{activity.activity}</td>
                      <td className="px-2 py-1.5">{activity.asset}</td>
                      <td className="px-2 py-1.5">{activity.type}</td>
                      <td className="px-2 py-1.5">
                        <StatusPill tone={activity.statusTone as "green" | "orange" | "red"}>{activity.status}</StatusPill>
                      </td>
                      <td className="px-2 py-1.5">{activity.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-3 xl:grid-cols-[0.82fr_1fr_0.86fr]">
            <Card className="overflow-hidden">
              <PanelHeader title="Platform Health" action="View system status" />
              <div className="px-4 py-2">
                {platformHealth.map((item, index) => (
                  <div
                    key={item.name}
                    className={[
                      "flex items-center justify-between py-1.5 text-[0.7rem] font-semibold text-[var(--text-secondary)]",
                      index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                    ].join(" ")}
                  >
                    <span>{item.name}</span>
                    <span className="inline-flex items-center gap-1.5 font-extrabold text-[var(--green)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[0.86rem] font-extrabold text-[var(--text-primary)]">Data Quality & Governance Trend</h2>
                <button type="button" className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                  Last 7 days
                </button>
              </div>
              <TrendChart />
            </Card>

            <Card className="overflow-hidden">
              <PanelHeader title="Top Policy Violations" action="View all" />
              <div className="px-4 py-2">
                {policyViolations.map((violation, index) => (
                  <div
                    key={violation.name}
                    className={[
                      "flex items-center gap-2 py-1.5 text-[0.68rem] font-semibold text-[var(--text-secondary)]",
                      index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                    ].join(" ")}
                  >
                    <span className="min-w-0 flex-1 truncate">{violation.name}</span>
                    <span className="flex h-5 min-w-7 items-center justify-center rounded-md bg-[#f1f3f8] px-2 text-[0.64rem] font-extrabold text-[var(--text-primary)]">
                      {violation.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <aside className="space-y-3">
          <Card className="overflow-hidden">
            <PanelHeader title="Active Alerts" action="View all" />
            {activeAlerts.map((alert, index) => (
              <button
                key={alert.title}
                type="button"
                className={[
                  "flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[alert.icon]} tone={alert.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.72rem] font-extrabold text-[var(--text-primary)]">{alert.title}</span>
                  <span className="mt-0.5 block truncate text-[0.64rem] font-semibold text-[var(--text-secondary)]">{alert.detail}</span>
                </span>
                <span className="whitespace-nowrap text-[0.62rem] font-semibold text-[var(--text-secondary)]">{alert.time}</span>
              </button>
            ))}
            <div className="border-t border-[var(--border-subtle)] px-4 py-2 text-right">
              <button type="button" className="inline-flex items-center gap-2 text-[0.68rem] font-extrabold text-[var(--orange)]">
                View all alerts <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Recent Governance Activity" action="View all" />
            {governanceActivity.map((item, index) => (
              <div
                key={item.title}
                className={[
                  "flex items-center gap-3 px-4 py-2 text-[0.68rem] font-semibold text-[var(--text-secondary)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[item.icon]} tone={item.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                <span className="whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Recommended Actions" action="View all" />
            {observabilityActions.map((action, index) => (
              <button
                key={action.title}
                type="button"
                className={[
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[action.icon]} tone={action.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1 truncate text-[0.68rem] font-semibold text-[var(--text-secondary)]">{action.title}</span>
                <StatusPill tone={action.badgeTone as "green" | "red"}>{action.badge}</StatusPill>
              </button>
            ))}
            <div className="border-t border-[var(--border-subtle)] px-4 py-2 text-right">
              <button type="button" className="inline-flex items-center gap-2 text-[0.68rem] font-extrabold text-[var(--orange)]">
                Open Observability Assistant <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        </aside>
      </section>

      <section>
        <h2 className="mb-2.5 text-[0.9rem] font-extrabold text-[var(--text-primary)]">Observability Services</h2>
        <ServiceHealthStrip
          columns={6}
          services={observabilityServices.map((service) => ({
            ...service,
            icon: iconMap[service.icon],
          }))}
        />
      </section>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function OperationalChart() {
  return (
    <div className="mt-4 h-[10.2rem]">
      <svg viewBox="0 0 520 170" className="h-full w-full" role="img" aria-label="Operational overview chart">
        {[30, 70, 110, 150].map((y) => (
          <line key={y} x1="38" x2="505" y1={y} y2={y} stroke="#dfe5ef" strokeDasharray="4 4" />
        ))}
        <polyline
          points={pointsFromSeries(operationalSeries.success, 32, 505, 24, 145, 284)}
          fill="none"
          stroke="#12a66a"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <polyline
          points={pointsFromSeries(operationalSeries.failed, 32, 505, 24, 145, 284)}
          fill="none"
          stroke="#ef4444"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        <polyline
          points={pointsFromSeries(operationalSeries.partial, 32, 505, 24, 145, 284)}
          fill="none"
          stroke="#f59e0b"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        {operationalSeries.labels.map((label, index) => (
          <text key={label} x={38 + index * 93} y="166" fill="#34415f" fontSize="11" fontWeight="700">
            {label}
          </text>
        ))}
        {[0, 75, 150, 225, 300].map((tick, index) => (
          <text key={tick} x="4" y={150 - index * 30} fill="#667085" fontSize="10" fontWeight="700">
            {tick}
          </text>
        ))}
      </svg>
    </div>
  );
}

function TrendChart() {
  return (
    <div className="mt-3 h-[8.2rem]">
      <svg viewBox="0 0 420 130" className="h-full w-full" role="img" aria-label="Data quality and governance trend chart">
        {[25, 55, 85, 115].map((y) => (
          <line key={y} x1="28" x2="405" y1={y} y2={y} stroke="#e4e9f2" strokeDasharray="4 4" />
        ))}
        <polyline
          points={pointsFromSeries(qualityTrend.values, 32, 400, 18, 105, 100)}
          fill="none"
          stroke="#8a3ffc"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {qualityTrend.labels.map((label, index) => (
          <text key={label} x={34 + index * 59} y="126" fill="#34415f" fontSize="10" fontWeight="700">
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function pointsFromSeries(values: readonly number[], minX: number, maxX: number, minY: number, maxY: number, maxValue: number) {
  const step = (maxX - minX) / (values.length - 1);
  return values
    .map((value, index) => {
      const x = minX + index * step;
      const y = maxY - (value / maxValue) * (maxY - minY);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function PanelHeader({ action, title }: { action: string; title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
      <h2 className="text-[0.86rem] font-extrabold text-[var(--text-primary)]">{title}</h2>
      <button type="button" className="text-[0.68rem] font-extrabold text-[var(--text-secondary)] hover:text-[var(--orange)]">
        {action}
      </button>
    </div>
  );
}
