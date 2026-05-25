import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Box,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  FileText,
  HeartPulse,
  MoreVertical,
  Network,
  Play,
  Plus,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ScreenId } from "../app/routes";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { IconBadge, type BadgeTone } from "../components/ui/IconBadge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { ServiceHealthStrip } from "../components/ui/ServiceHealthStrip";
import { StatusPill } from "../components/ui/StatusPill";
import {
  agentActivity,
  agentMetrics,
  agentOrchestration,
  agentRegistry,
  agentTabs,
  agentTemplates,
  connectedAgentServices,
  pendingAgentApprovals,
  recommendedAgentActions,
  type AgentIconKey,
} from "../data/agents";

const iconMap: Record<AgentIconKey | "database", LucideIcon> = {
  planner: Bot,
  file: FileText,
  linkage: Network,
  shield: ShieldCheck,
  remediate: Activity,
  users: UsersRound,
  success: CheckCircle2,
  health: HeartPulse,
  pulse: Activity,
  box: Box,
  cloud: Cloud,
  briefcase: BriefcaseBusiness,
  graph: Network,
  policy: ShieldCheck,
  registry: ScrollText,
  evaluation: ScrollText,
  trace: Network,
  database: Database,
};

type AgentConsoleProps = {
  onNavigate: (screen: ScreenId) => void;
};

export function AgentConsole({ onNavigate }: AgentConsoleProps) {
  const [activeTab, setActiveTab] = useState<(typeof agentTabs)[number]>("All Agents");

  return (
    <div className="space-y-4 px-[clamp(1rem,1.5vw,1.65rem)] py-[clamp(0.9rem,1.2vw,1.35rem)]">
      <PageHeader
        title="Agent Console"
        subtitle="Monitor, govern, and orchestrate AI agents that automate governed unstructured data journeys."
        actions={
          <>
            <Button variant="primary" icon={<Plus aria-hidden="true" className="h-4 w-4" />}>
              Create Agent Workflow
            </Button>
            <Button icon={<UserPlus aria-hidden="true" className="h-4 w-4" />}>Register Agent</Button>
            <Button icon={<Play aria-hidden="true" className="h-4 w-4" />}>Run Sandbox Test</Button>
            <Button icon={<ShieldCheck aria-hidden="true" className="h-4 w-4" />}>Manage Policies</Button>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {agentMetrics.map((metric) => (
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

      <nav className="flex gap-4 border-b border-[var(--border-subtle)] px-1" aria-label="Agent console views">
        {agentTabs.map((tab) => (
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

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.66fr)_minmax(24rem,0.84fr)]">
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Agent Registry</h2>
              <span className="rounded-md bg-[var(--orange-soft)] px-2 py-1 text-[0.68rem] font-extrabold text-[var(--orange)]">
                {activeTab}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[59rem] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.62rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="px-4 py-2.5">Agent</th>
                    <th className="px-2 py-2.5">Purpose</th>
                    <th className="px-2 py-2.5">Assigned Journeys</th>
                    <th className="px-2 py-2.5">Success</th>
                    <th className="px-2 py-2.5">Confidence</th>
                    <th className="px-2 py-2.5">Escalations</th>
                    <th className="px-2 py-2.5">Governance Mode</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {agentRegistry.map((agent) => (
                    <tr
                      key={agent.agent}
                      className="border-b border-[var(--border-subtle)] text-[0.66rem] font-semibold text-[var(--text-secondary)] last:border-b-0 hover:bg-[var(--bg-subtle)]"
                    >
                      <td className="max-w-[11rem] px-4 py-2">
                        <button type="button" className="flex min-w-0 items-center gap-2 text-left">
                          <IconBadge icon={iconMap[agent.icon]} tone={agent.tone as BadgeTone} size="sm" />
                          <span className="line-clamp-2 font-extrabold leading-4 text-[var(--text-primary)]">{agent.agent}</span>
                        </button>
                      </td>
                      <td className="max-w-[12rem] px-2 py-2">
                        <span className="line-clamp-2 leading-4">{agent.purpose}</span>
                      </td>
                      <td className="px-2 py-2 text-center font-extrabold text-[var(--text-primary)]">{agent.journeys}</td>
                      <td className="px-2 py-2 font-extrabold text-[var(--green)]">{agent.success}</td>
                      <td className="px-2 py-2 font-extrabold text-[var(--text-primary)]">{agent.confidence}</td>
                      <td className="px-2 py-2 text-center font-extrabold text-[var(--text-primary)]">{agent.escalations}</td>
                      <td className="max-w-[12rem] px-2 py-2">
                        <span className="line-clamp-2 leading-4">{agent.governance}</span>
                      </td>
                      <td className="px-2 py-2">
                        <StatusPill tone={agent.statusTone as "green" | "orange" | "neutral"}>{agent.status}</StatusPill>
                      </td>
                      <td className="px-2 py-2">
                        <button type="button" className="rounded-md p-1 text-[var(--text-primary)] hover:bg-white">
                          <MoreVertical aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Recent Agent Activity</h2>
              <button type="button" className="inline-flex items-center gap-2 text-[0.74rem] font-extrabold text-[var(--orange)]">
                View all activity <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[48rem] w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-2 py-2.5">Agent</th>
                    <th className="px-2 py-2.5">Activity Type</th>
                    <th className="px-2 py-2.5">Details</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5">Owner</th>
                    <th className="px-2 py-2.5" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {agentActivity.map((activity) => (
                    <tr
                      key={`${activity.time}-${activity.type}`}
                      className="border-b border-[var(--border-subtle)] text-[0.68rem] font-semibold text-[var(--text-secondary)] last:border-b-0"
                    >
                      <td className="whitespace-nowrap px-4 py-1.5">{activity.time}</td>
                      <td className="max-w-[10rem] px-2 py-1.5 font-bold text-[var(--text-secondary)]">{activity.agent}</td>
                      <td className="px-2 py-1.5">{activity.type}</td>
                      <td className="max-w-[14rem] px-2 py-1.5">{activity.details}</td>
                      <td className="px-2 py-1.5">
                        <StatusPill tone={activity.statusTone as "green" | "orange" | "red"}>{activity.status}</StatusPill>
                      </td>
                      <td className="px-2 py-1.5">{activity.owner}</td>
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
          <Card className="overflow-hidden">
            <PanelHeader title="Recommended Actions" action="View all" />
            <div>
              {recommendedAgentActions.map((action, index) => (
                <button
                  key={action.title}
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-[var(--bg-subtle)]",
                    index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                  ].join(" ")}
                >
                  <IconBadge icon={iconMap[action.icon]} tone={action.tone as BadgeTone} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.73rem] font-extrabold text-[var(--text-primary)]">{action.title}</span>
                    <span className="mt-0.5 block truncate text-[0.68rem] font-semibold text-[var(--text-secondary)]">
                      {action.description}
                    </span>
                  </span>
                  <StatusPill tone={action.badgeTone as "green" | "red" | "blue"}>{action.badge}</StatusPill>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="px-4 py-2.5">
            <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Agent Orchestration Overview</h2>
            <div className="mt-3 grid grid-cols-8 gap-1">
              {agentOrchestration.map((item, index) => (
                <div key={item.label} className="relative flex min-w-0 flex-col items-center text-center">
                  {index < agentOrchestration.length - 1 ? (
                    <ChevronRight aria-hidden="true" className="absolute -right-2 top-2.5 h-3 w-3 text-[var(--orange)]" />
                  ) : null}
                  <IconBadge icon={iconMap[item.icon]} tone={item.tone as BadgeTone} size="sm" />
                  <span className="mt-1.5 min-h-[1rem] text-[0.54rem] font-bold leading-[0.72rem] text-[var(--text-secondary)]">
                    {item.label}
                  </span>
                  <span className="text-[0.62rem] font-extrabold text-[var(--text-primary)]">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Popular Agent Templates" action="View all templates" />
            <div className="grid gap-2 px-4 pb-3 md:grid-cols-3 xl:grid-cols-3">
              {agentTemplates.map((template) => (
                <button
                  key={template.title}
                  type="button"
                  className="group min-h-[4.6rem] rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-left transition hover:border-[rgba(255,90,31,0.4)] hover:bg-[var(--bg-subtle)]"
                >
                  <div className="flex gap-2">
                    <IconBadge icon={iconMap[template.icon]} tone={template.tone as BadgeTone} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-[0.7rem] font-extrabold leading-4 text-[var(--text-primary)]">
                        {template.title}
                      </span>
                      <span className="mt-1 line-clamp-2 text-[0.64rem] font-semibold leading-4 text-[var(--text-secondary)]">
                        {template.description}
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1 text-[0.66rem] font-extrabold text-[var(--orange)]">
                        Use Template
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Pending Agent Approvals" action="View all" />
            {pendingAgentApprovals.map((approval, index) => (
              <button
                key={approval.title}
                type="button"
                className={[
                  "flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[approval.icon]} tone={approval.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.7rem] font-extrabold text-[var(--text-primary)]">{approval.title}</span>
                  <span className="mt-0.5 block text-[0.66rem] font-semibold text-[var(--text-secondary)]">{approval.owner}</span>
                </span>
                <span className="whitespace-nowrap rounded-md bg-[var(--orange-soft)] px-2 py-1 text-[0.62rem] font-extrabold text-[var(--orange)]">
                  {approval.sla}
                </span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
              </button>
            ))}
          </Card>
        </aside>
      </section>

      <section>
        <h2 className="mb-2.5 text-[0.9rem] font-extrabold text-[var(--text-primary)]">Connected Agent Services</h2>
        <ServiceHealthStrip
          services={connectedAgentServices.map((service) => ({
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
      <button type="button" className="inline-flex items-center gap-1 text-[0.68rem] font-extrabold text-[var(--orange)]">
        {action}
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
