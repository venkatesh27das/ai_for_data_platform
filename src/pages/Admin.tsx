import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Database,
  HeartPulse,
  Info,
  KeyRound,
  LockKeyhole,
  Network,
  ScrollText,
  Server,
  Settings,
  Share2,
  ShieldCheck,
  UserRound,
  UsersRound,
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
  adminActivity,
  adminAreas,
  adminMetrics,
  adminRecommendations,
  adminServices,
  adminTabs,
  pendingAdminApprovals,
  riskSignals,
  type AdminIconKey,
} from "../data/admin";

const iconMap: Record<AdminIconKey, LucideIcon> = {
  connectors: Share2,
  models: Box,
  policies: ShieldCheck,
  users: UsersRound,
  environments: Server,
  health: HeartPulse,
  review: UserRound,
  agents: Settings,
  integrations: Network,
  identity: KeyRound,
  secret: LockKeyhole,
  gateway: Network,
  metadata: Database,
  audit: ScrollText,
  warning: AlertTriangle,
  info: Info,
};

export function Admin() {
  const [activeTab, setActiveTab] = useState<(typeof adminTabs)[number]>("Overview");

  return (
    <div className="space-y-4 px-[clamp(1rem,1.5vw,1.65rem)] py-[clamp(0.9rem,1.2vw,1.35rem)]">
      <section className="space-y-4">
        <PageHeader
          title="Admin"
          subtitle="Configure platform foundations, access, policies, connectors, models, and environments for governed unstructured data products."
          actions={
            <>
              <Button variant="primary" icon={<Database aria-hidden="true" className="h-4 w-4" />}>
                Add Connector
              </Button>
              <Button icon={<Box aria-hidden="true" className="h-4 w-4" />}>Register Model</Button>
              <Button icon={<ShieldCheck aria-hidden="true" className="h-4 w-4" />}>Create Policy</Button>
              <Button icon={<UsersRound aria-hidden="true" className="h-4 w-4" />}>Manage Users</Button>
            </>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1760px]:grid-cols-6">
          {adminMetrics.map((metric) => (
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
        </div>
      </section>

      <nav className="flex gap-4 overflow-x-auto border-b border-[var(--border-subtle)] px-1" aria-label="Admin views">
        {adminTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              "relative h-8 shrink-0 px-3 text-[0.76rem] font-extrabold transition",
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
          <Card className="px-4 py-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Admin Areas</h2>
              <span className="rounded-md bg-[var(--orange-soft)] px-2 py-1 text-[0.68rem] font-extrabold text-[var(--orange)]">
                {activeTab}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 min-[1500px]:grid-cols-4">
              {adminAreas.map((area) => (
                <button
                  key={area.title}
                  type="button"
                  onClick={() => setActiveTab(area.title === "Governance Policies" ? "Policies" : area.title === "Models & AI Services" ? "Models & Services" : area.title as (typeof adminTabs)[number])}
                  className="min-h-[9.2rem] rounded-xl border border-[var(--border-subtle)] bg-white px-4 py-3 text-left shadow-card transition hover:border-[rgba(255,90,31,0.42)] hover:bg-[var(--bg-subtle)]"
                >
                  <div className="flex items-start gap-3">
                    <IconBadge icon={iconMap[area.icon]} tone={area.tone as BadgeTone} />
                    <div className="min-w-0">
                      <h3 className="text-[0.78rem] font-extrabold text-[var(--text-primary)]">{area.title}</h3>
                      <p className="mt-2 line-clamp-3 text-[0.7rem] font-semibold leading-5 text-[var(--text-secondary)]">
                        {area.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.68rem] font-extrabold">
                    <span className="rounded-md bg-[#f1f3f8] px-2 py-1 text-[var(--text-secondary)]">{area.primary}</span>
                    <span className="inline-flex items-center gap-1.5 text-[var(--green)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                      {area.secondary}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Recent Admin Activity</h2>
              <button type="button" className="inline-flex items-center gap-2 text-[0.74rem] font-extrabold text-[var(--orange)]">
                View all activity <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[56rem] w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-2 py-2.5">Activity</th>
                    <th className="px-2 py-2.5">Area</th>
                    <th className="px-2 py-2.5">Details</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {adminActivity.map((activity) => (
                    <tr key={`${activity.time}-${activity.activity}`} className="border-b border-[var(--border-subtle)] text-[0.68rem] font-semibold text-[var(--text-secondary)] last:border-b-0">
                      <td className="whitespace-nowrap px-4 py-2">{activity.time}</td>
                      <td className="px-2 py-2">{activity.activity}</td>
                      <td className="px-2 py-2">
                        <span className="flex items-center gap-2">
                          <IconBadge icon={iconMap[activity.areaIcon]} tone="green" size="sm" />
                          {activity.area}
                        </span>
                      </td>
                      <td className="max-w-[18rem] px-2 py-2">{activity.details}</td>
                      <td className="px-2 py-2">
                        <StatusPill tone={activity.statusTone as "green"}>{activity.status}</StatusPill>
                      </td>
                      <td className="px-2 py-2">{activity.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-3">
          <Card className="overflow-hidden">
            <PanelHeader title="Admin Recommendations" action="View all" />
            {adminRecommendations.map((recommendation, index) => (
              <button
                key={recommendation.title}
                type="button"
                className={[
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[recommendation.icon]} tone={recommendation.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.72rem] font-extrabold text-[var(--text-primary)]">{recommendation.title}</span>
                  <span className="mt-0.5 block truncate text-[0.64rem] font-semibold text-[var(--text-secondary)]">
                    {recommendation.detail}
                  </span>
                </span>
                <StatusPill tone={recommendation.badgeTone as "orange" | "red" | "blue"}>{recommendation.badge}</StatusPill>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
              </button>
            ))}
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Pending Admin Approvals" action="View all" />
            {pendingAdminApprovals.map((approval, index) => (
              <button
                key={approval.title}
                type="button"
                className={[
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[approval.icon]} tone={approval.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.72rem] font-extrabold text-[var(--text-primary)]">{approval.title}</span>
                  <span className="mt-0.5 block truncate text-[0.64rem] font-semibold text-[var(--text-secondary)]">
                    {approval.requester}
                  </span>
                </span>
                <span className="whitespace-nowrap rounded-md bg-[var(--orange-soft)] px-2 py-1 text-[0.62rem] font-extrabold text-[var(--orange)]">
                  {approval.sla}
                </span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
              </button>
            ))}
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Risk & Compliance Signals" action="" />
            <div className="px-4 py-2">
              {riskSignals.map((signal, index) => (
                <div
                  key={signal.title}
                  className={[
                    "flex items-center gap-3 py-2 text-[0.68rem] font-semibold text-[var(--text-secondary)]",
                    index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                  ].join(" ")}
                >
                  <IconBadge icon={iconMap[signal.icon]} tone={signal.tone as BadgeTone} size="sm" />
                  <span className="min-w-0 flex-1 truncate">{signal.title}</span>
                  <span className="w-6 text-right font-extrabold text-[var(--text-primary)]">{signal.count}</span>
                  <StatusPill tone={signal.badgeTone as "red" | "orange"}>{signal.badge}</StatusPill>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </section>

      <section>
        <h2 className="mb-2.5 text-[0.9rem] font-extrabold text-[var(--text-primary)]">Platform Foundation Services</h2>
        <ServiceHealthStrip
          columns={6}
          services={adminServices.map((service) => ({
            ...service,
            icon: iconMap[service.icon],
          }))}
        />
      </section>
    </div>
  );
}

function PanelHeader({ action, title }: { action: string; title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
      <h2 className="text-[0.86rem] font-extrabold text-[var(--text-primary)]">{title}</h2>
      {action ? (
        <button type="button" className="text-[0.68rem] font-extrabold text-[var(--text-secondary)] hover:text-[var(--orange)]">
          {action}
        </button>
      ) : null}
    </div>
  );
}
