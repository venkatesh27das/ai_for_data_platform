import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Box,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  FileText,
  GitBranch,
  HeartPulse,
  KeyRound,
  Lock,
  MoreVertical,
  Network,
  Search,
  Send,
  ShieldCheck,
  Table2,
  UserPlus,
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
  accessRequests,
  consumptionActivity,
  consumptionMethods,
  consumptionMetrics,
  consumptionServices,
  consumptionTabs,
  governanceSignals,
  governedAssets,
  recommendedAssets,
  recentlyPublished,
  type ConsumptionIconKey,
} from "../data/consumption";

const iconMap: Record<ConsumptionIconKey, LucideIcon> = {
  box: Box,
  shield: ShieldCheck,
  users: UsersRound,
  code: Code2,
  search: Search,
  health: HeartPulse,
  table: Table2,
  graph: GitBranch,
  mcp: Network,
  api: Braces,
  file: FileText,
  lineage: Network,
  lock: Lock,
  gateway: Send,
  registry: Database,
  vector: Box,
  access: KeyRound,
  quality: BarChart3,
};

export function ConsumptionHub() {
  const [activeTab, setActiveTab] = useState<(typeof consumptionTabs)[number]>("All Assets");

  return (
    <div className="space-y-4 px-[clamp(1rem,1.5vw,1.65rem)] py-[clamp(0.9rem,1.2vw,1.35rem)]">
      <section className="grid gap-4 min-[1500px]:grid-cols-[minmax(0,1fr)_minmax(24rem,0.4fr)]">
        <div className="space-y-4">
          <PageHeader
            title="Consumption Hub"
            subtitle="Discover, test, and consume governed knowledge assets across search, APIs, MCP tools, tables, vectors, and graphs."
            actions={
              <>
                <Button variant="primary" icon={<Box aria-hidden="true" className="h-4 w-4" />}>
                  Explore Assets
                </Button>
                <Button icon={<UserPlus aria-hidden="true" className="h-4 w-4" />}>Request Access</Button>
                <Button icon={<Search aria-hidden="true" className="h-4 w-4" />}>Create Search Experience</Button>
                <Button icon={<Network aria-hidden="true" className="h-4 w-4" />}>Publish MCP Tool</Button>
              </>
            }
          />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {consumptionMetrics.map((metric) => (
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
        </div>

        <Card className="hidden overflow-hidden min-[1500px]:block">
          <PanelHeader title="Recommended Assets" action="View all" />
          {recommendedAssets.map((asset, index) => (
            <button
              key={asset.title}
              type="button"
              className={[
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--bg-subtle)]",
                index > 0 ? "border-t border-[var(--border-subtle)]" : "",
              ].join(" ")}
            >
              <IconBadge icon={iconMap[asset.icon]} tone={asset.tone as BadgeTone} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.73rem] font-extrabold text-[var(--text-primary)]">{asset.title}</span>
                <span className="mt-0.5 block truncate text-[0.66rem] font-semibold text-[var(--text-secondary)]">
                  {asset.description}
                </span>
              </span>
              <StatusPill tone="green">{asset.score}</StatusPill>
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
            </button>
          ))}
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.72fr)_minmax(24rem,0.78fr)]">
        <div className="space-y-3">
          <nav className="flex gap-4 border-b border-[var(--border-subtle)] px-1" aria-label="Consumption asset views">
            {consumptionTabs.map((tab) => (
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

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Governed Asset Catalog</h2>
              <span className="rounded-md bg-[var(--orange-soft)] px-2 py-1 text-[0.68rem] font-extrabold text-[var(--orange)]">
                {activeTab}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[67rem] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.62rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="px-4 py-2.5">Asset</th>
                    <th className="px-2 py-2.5">Type</th>
                    <th className="px-2 py-2.5">Domain</th>
                    <th className="px-2 py-2.5">Quality</th>
                    <th className="px-2 py-2.5">Interfaces</th>
                    <th className="px-2 py-2.5">Linked Products</th>
                    <th className="px-2 py-2.5">Owner</th>
                    <th className="px-2 py-2.5">Access</th>
                    <th className="px-2 py-2.5">Usage</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {governedAssets.map((asset) => (
                    <tr
                      key={asset.asset}
                      className="border-b border-[var(--border-subtle)] text-[0.66rem] font-semibold text-[var(--text-secondary)] last:border-b-0 hover:bg-[var(--bg-subtle)]"
                    >
                      <td className="max-w-[12rem] px-4 py-2">
                        <button type="button" className="flex min-w-0 items-center gap-2 text-left">
                          <IconBadge icon={iconMap[asset.icon]} tone={asset.tone as BadgeTone} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-extrabold text-[var(--text-primary)]">{asset.asset}</span>
                            <span className="mt-0.5 block truncate text-[0.62rem] text-[var(--text-secondary)]">{asset.detail}</span>
                          </span>
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <StatusPill tone={asset.typeTone as "green" | "blue" | "orange" | "purple"}>{asset.type}</StatusPill>
                      </td>
                      <td className="px-2 py-2">{asset.domain}</td>
                      <td className="px-2 py-2">
                        <span className="rounded-md bg-[var(--green-soft)] px-1.5 py-1 text-[0.64rem] font-extrabold text-[var(--green)]">
                          {asset.quality}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className="flex gap-1.5">
                          {asset.interfaces.map((item) => (
                            <span key={item} className="rounded-md bg-[#f1f3f8] px-2 py-1 text-[0.62rem] font-extrabold text-[var(--text-secondary)]">
                              {item}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="max-w-[9rem] px-2 py-2">
                        <span className="line-clamp-2 leading-4">{asset.linkedProducts}</span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2">{asset.owner}</td>
                      <td className="whitespace-nowrap px-2 py-2">{asset.access}</td>
                      <td className="whitespace-nowrap px-2 py-2 font-extrabold text-[var(--text-secondary)]">{asset.usage}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-1.5 text-[0.66rem] font-extrabold text-[var(--green)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <MoreVertical aria-hidden="true" className="h-4 w-4 text-[var(--text-primary)]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Recent Consumption Activity</h2>
              <button type="button" className="inline-flex items-center gap-2 text-[0.74rem] font-extrabold text-[var(--orange)]">
                View all activity <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[55rem] w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-2 py-2.5">Asset</th>
                    <th className="px-2 py-2.5">Activity Type</th>
                    <th className="px-2 py-2.5">Details</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5">Consumer</th>
                    <th className="px-2 py-2.5" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {consumptionActivity.map((activity) => (
                    <tr
                      key={`${activity.time}-${activity.type}`}
                      className="border-b border-[var(--border-subtle)] text-[0.68rem] font-semibold text-[var(--text-secondary)] last:border-b-0"
                    >
                      <td className="whitespace-nowrap px-4 py-1.5">{activity.time}</td>
                      <td className="max-w-[11rem] px-2 py-1.5 font-bold text-[var(--text-secondary)]">{activity.asset}</td>
                      <td className="px-2 py-1.5">{activity.type}</td>
                      <td className="max-w-[17rem] px-2 py-1.5">{activity.details}</td>
                      <td className="px-2 py-1.5">
                        <StatusPill tone={activity.statusTone as "green" | "blue"}>{activity.status}</StatusPill>
                      </td>
                      <td className="px-2 py-1.5">{activity.consumer}</td>
                      <td className="px-2 py-1.5">
                        <MoreVertical aria-hidden="true" className="h-4 w-4 text-[var(--text-primary)]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-3">
          <Card className="overflow-hidden min-[1500px]:hidden">
            <PanelHeader title="Recommended Assets" action="View all" />
            {recommendedAssets.map((asset, index) => (
              <button
                key={asset.title}
                type="button"
                className={[
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[asset.icon]} tone={asset.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.73rem] font-extrabold text-[var(--text-primary)]">{asset.title}</span>
                  <span className="mt-0.5 block truncate text-[0.66rem] font-semibold text-[var(--text-secondary)]">
                    {asset.description}
                  </span>
                </span>
                <StatusPill tone="green">{asset.score}</StatusPill>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
              </button>
            ))}
          </Card>

          <Card className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[0.86rem] font-extrabold text-[var(--text-primary)]">Popular Consumption Methods</h2>
              <button type="button" className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                Last 7 days
              </button>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {consumptionMethods.map((method) => (
                <div key={method.label} className="min-w-0 text-center">
                  <IconBadge icon={iconMap[method.icon]} tone={method.tone as BadgeTone} size="sm" />
                  <p className="mt-1 truncate text-[0.62rem] font-bold text-[var(--text-secondary)]">{method.label}</p>
                  <p className="text-[0.7rem] font-extrabold text-[var(--text-primary)]">{method.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Access Requests" action="View all" />
            {accessRequests.map((request, index) => (
              <button
                key={request.name}
                type="button"
                className={[
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--purple-soft)] text-[0.62rem] font-extrabold text-[var(--purple)]">
                  {request.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.72rem] font-extrabold text-[var(--text-primary)]">{request.name}</span>
                  <span className="mt-0.5 block truncate text-[0.64rem] font-semibold text-[var(--text-secondary)]">{request.asset}</span>
                </span>
                <span className="hidden text-[0.62rem] font-semibold text-[var(--text-secondary)] min-[1500px]:inline">{request.owner}</span>
                <span className="whitespace-nowrap rounded-md bg-[var(--orange-soft)] px-2 py-1 text-[0.62rem] font-extrabold text-[var(--orange)]">
                  {request.sla}
                </span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
              </button>
            ))}
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Recently Published" action="View all" />
            {recentlyPublished.map((asset, index) => (
              <button
                key={asset.title}
                type="button"
                className={[
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[asset.icon]} tone={asset.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.72rem] font-extrabold text-[var(--text-primary)]">{asset.title}</span>
                  <span className="mt-0.5 block truncate text-[0.64rem] font-semibold text-[var(--text-secondary)]">{asset.detail}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[0.64rem] font-extrabold text-[var(--green)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                  {asset.status}
                </span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
              </button>
            ))}
          </Card>

          <Card className="px-4 py-3">
            <h2 className="text-[0.86rem] font-extrabold text-[var(--text-primary)]">Trust & Governance Signals</h2>
            <div className="mt-3 grid grid-cols-5 gap-2 text-center">
              {governanceSignals.map((signal) => (
                <div key={signal.label} className="min-w-0 border-r border-[var(--border-subtle)] last:border-r-0">
                  <div className="flex justify-center">
                    <IconBadge icon={iconMap[signal.icon]} tone={signal.tone as BadgeTone} size="sm" />
                  </div>
                  <p className="mt-1 text-[0.55rem] font-extrabold leading-3 text-[var(--text-secondary)]">{signal.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </section>

      <section>
        <h2 className="mb-2.5 text-[0.9rem] font-extrabold text-[var(--text-primary)]">Consumption Services</h2>
        <ServiceHealthStrip
          columns={6}
          services={consumptionServices.map((service) => ({
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
      <button type="button" className="text-[0.68rem] font-extrabold text-[var(--text-secondary)] hover:text-[var(--orange)]">
        {action}
      </button>
    </div>
  );
}
