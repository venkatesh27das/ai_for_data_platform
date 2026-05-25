import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Box,
  ChevronRight,
  CloudUpload,
  Database,
  FileText,
  GitBranch,
  HeartPulse,
  Layers3,
  Link,
  MoreVertical,
  Play,
  Route,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
  UsersRound,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ScreenId } from "../app/routes";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { IconBadge, type BadgeTone } from "../components/ui/IconBadge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { ServiceHealthStrip } from "../components/ui/ServiceHealthStrip";
import { StatusPill } from "../components/ui/StatusPill";
import {
  aiRecommendations,
  connectedJourneyServices,
  journeyActivity,
  journeyMetrics,
  journeyPortfolio,
  journeyTabs,
  journeyTemplates,
  lifecycleOverview,
  pendingApprovals,
  type JourneyIconKey,
} from "../data/journeys";

const iconMap: Record<JourneyIconKey, LucideIcon> = {
  rocket: Route,
  file: FileText,
  pulse: Activity,
  users: UsersRound,
  box: Box,
  health: HeartPulse,
  shield: ShieldCheck,
  database: Database,
  cloud: CloudUpload,
  zap: Zap,
  share: Share2,
  play: Play,
  layers: Layers3,
  graph: GitBranch,
  gateway: Send,
  link: Link,
};

type DataJourneysProps = {
  onNavigate: (screen: ScreenId) => void;
};

export function DataJourneys({ onNavigate }: DataJourneysProps) {
  const [activeTab, setActiveTab] = useState<(typeof journeyTabs)[number]>("All Journeys");

  return (
    <div className="space-y-4 px-[clamp(1rem,1.5vw,1.65rem)] py-[clamp(0.9rem,1.2vw,1.35rem)]">
      <PageHeader
        title="Data Journeys"
        subtitle="Design, run, validate, and publish governed unstructured data products across the full lifecycle."
        actions={
          <>
            <Button
              variant="primary"
              icon={<Sparkles aria-hidden="true" className="h-4 w-4" />}
              onClick={() => onNavigate("create-ai")}
            >
              Create Journey with AI
            </Button>
            <Button icon={<Play aria-hidden="true" className="h-4 w-4" />} onClick={() => onNavigate("start-journey")}>
              Start New Journey
            </Button>
            <Button icon={<Upload aria-hidden="true" className="h-4 w-4" />} onClick={() => onNavigate("start-journey")}>
              Import Blueprint
            </Button>
            <Button icon={<Box aria-hidden="true" className="h-4 w-4" />} onClick={() => setActiveTab("Templates")}>
              Explore Templates
            </Button>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {journeyMetrics.map((metric) => (
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

      <nav className="flex gap-4 border-b border-[var(--border-subtle)] px-1" aria-label="Journey lifecycle views">
        {journeyTabs.map((tab) => (
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
            {activeTab === tab ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--orange)]" />
            ) : null}
          </button>
        ))}
      </nav>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.66fr)_minmax(24rem,0.84fr)]">
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Journey Portfolio</h2>
              <span className="rounded-md bg-[var(--orange-soft)] px-2 py-1 text-[0.68rem] font-extrabold text-[var(--orange)]">
                {activeTab}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[62rem] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.62rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="px-4 py-2.5">Journey</th>
                    <th className="px-2 py-2.5">Domain</th>
                    <th className="px-2 py-2.5">Current Stage</th>
                    <th className="px-2 py-2.5">Progress</th>
                    <th className="px-2 py-2.5">Quality</th>
                    <th className="px-2 py-2.5">Structured Links</th>
                    <th className="px-2 py-2.5">Outputs</th>
                    <th className="px-2 py-2.5">Owner</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {journeyPortfolio.map((journey) => (
                    <tr
                      key={journey.journey}
                      className="border-b border-[var(--border-subtle)] text-[0.66rem] font-semibold text-[var(--text-secondary)] last:border-b-0 hover:bg-[var(--bg-subtle)]"
                    >
                      <td className="max-w-[11rem] px-4 py-2">
                        <button
                          type="button"
                          onClick={() => onNavigate("journeys")}
                          className="flex min-w-0 items-center gap-2 text-left"
                        >
                          <IconBadge icon={iconMap[journey.icon]} tone={journey.tone as BadgeTone} size="sm" />
                          <span className="line-clamp-2 font-extrabold leading-4 text-[var(--text-primary)]">{journey.journey}</span>
                        </button>
                      </td>
                      <td className="px-2 py-2">{journey.domain}</td>
                      <td className="px-2 py-2">
                        <span className="flex min-w-[8rem] items-center gap-2">
                          <IconBadge icon={iconMap[journey.stageIcon]} tone={journey.stageTone as BadgeTone} size="sm" />
                          {journey.currentStage}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className="flex min-w-[5.6rem] items-center gap-2">
                          <ProgressBar value={journey.progress} />
                          <span className="w-8 text-right text-[0.66rem] font-extrabold">{journey.progress}%</span>
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className="rounded-md bg-[var(--green-soft)] px-1.5 py-1 text-[0.64rem] font-extrabold text-[var(--green)]">
                          {journey.quality}
                        </span>
                      </td>
                      <td className="max-w-[9.5rem] px-2 py-2">
                        <span className="line-clamp-2 leading-4">{journey.links}</span>
                      </td>
                      <td className="max-w-[6.8rem] px-2 py-2">
                        <span className="line-clamp-2 leading-4">{journey.outputs}</span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2">{journey.owner}</td>
                      <td className="px-2 py-2">
                        <StatusPill tone={journey.statusTone as "green" | "blue" | "orange" | "neutral"}>
                          {journey.status}
                        </StatusPill>
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
              <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Recent Journey Activity</h2>
              <button type="button" className="inline-flex items-center gap-2 text-[0.74rem] font-extrabold text-[var(--orange)]">
                View all activity <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[48rem] w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-2 py-2.5">Journey</th>
                    <th className="px-2 py-2.5">Activity Type</th>
                    <th className="px-2 py-2.5">Details</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5">Actor</th>
                  </tr>
                </thead>
                <tbody>
                  {journeyActivity.map((activity) => (
                    <tr
                      key={`${activity.time}-${activity.type}`}
                      className="border-b border-[var(--border-subtle)] text-[0.68rem] font-semibold text-[var(--text-secondary)] last:border-b-0"
                    >
                      <td className="whitespace-nowrap px-4 py-1.5">{activity.time}</td>
                      <td className="max-w-[10rem] px-2 py-1.5 font-bold text-[var(--text-secondary)]">{activity.journey}</td>
                      <td className="px-2 py-1.5">{activity.type}</td>
                      <td className="max-w-[14rem] px-2 py-1.5">{activity.details}</td>
                      <td className="px-2 py-1.5">
                        <StatusPill tone={activity.statusTone as "green" | "orange" | "red"}>{activity.status}</StatusPill>
                      </td>
                      <td className="px-2 py-1.5">{activity.actor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-3">
          <Card className="overflow-hidden">
            <PanelHeader title="AI Recommendations" action="View all" />
            <div>
              {aiRecommendations.map((recommendation, index) => (
                <button
                  key={recommendation.title}
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-[var(--bg-subtle)]",
                    index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                  ].join(" ")}
                >
                  <IconBadge icon={iconMap[recommendation.icon]} tone={recommendation.tone as BadgeTone} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.73rem] font-extrabold text-[var(--text-primary)]">
                      {recommendation.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.68rem] font-semibold text-[var(--text-secondary)]">
                      {recommendation.description}
                    </span>
                  </span>
                  <StatusPill tone={recommendation.badgeTone as "green" | "orange" | "blue"}>{recommendation.badge}</StatusPill>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--orange)]" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="px-4 py-2.5">
            <h2 className="text-[0.9rem] font-extrabold text-[var(--text-primary)]">Lifecycle Overview</h2>
            <div className="mt-3 grid grid-cols-8 gap-1">
              {lifecycleOverview.map((item, index) => (
                <div key={item.label} className="relative flex min-w-0 flex-col items-center text-center">
                  {index < lifecycleOverview.length - 1 ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="absolute -right-2 top-2.5 h-3 w-3 text-[var(--orange)]"
                    />
                  ) : null}
                  <IconBadge icon={iconMap[item.icon]} tone={item.tone as BadgeTone} size="sm" />
                  <span className="mt-1.5 min-h-[1.55rem] text-[0.54rem] font-bold leading-[0.72rem] text-[var(--text-secondary)]">
                    {item.label}
                  </span>
                  <span className="text-[0.62rem] font-extrabold text-[var(--text-primary)]">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Popular Journey Templates" action="View all templates" />
            <div className="grid gap-2 px-4 pb-3 md:grid-cols-3 xl:grid-cols-3">
              {journeyTemplates.map((template) => (
                <button
                  key={template.title}
                  type="button"
                  onClick={() => onNavigate("start-journey")}
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
            <PanelHeader title="Pending Approvals" action="View all" />
            {pendingApprovals.map((approval, index) => (
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
                  <span className="block truncate text-[0.7rem] font-extrabold text-[var(--text-primary)]">
                    {approval.title}
                  </span>
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
        <h2 className="mb-2.5 text-[0.9rem] font-extrabold text-[var(--text-primary)]">Connected Journey Services</h2>
        <ServiceHealthStrip
          services={connectedJourneyServices.map((service) => ({
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
