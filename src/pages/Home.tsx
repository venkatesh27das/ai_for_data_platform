import {
  ArrowRight,
  Bot,
  Box,
  BrainCircuit,
  ChevronRight,
  CloudCog,
  Database,
  FileText,
  HeartPulse,
  Layers3,
  MoreVertical,
  Network,
  Play,
  Route,
  Search,
  Send,
  Sparkles,
  Table2,
  UsersRound,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ScreenId } from "../app/routes";
import {
  businessGoals,
  lifecycleItems,
  platformMetrics,
  recentAssets,
  serviceHealth,
  workItems,
  type IconKey,
} from "../data/home";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { IconBadge } from "../components/ui/IconBadge";
import type { BadgeTone } from "../components/ui/IconBadge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { ServiceHealthStrip } from "../components/ui/ServiceHealthStrip";
import { StatusPill } from "../components/ui/StatusPill";

const iconMap: Record<IconKey, LucideIcon> = {
  rocket: Route,
  file: FileText,
  box: Box,
  users: UsersRound,
  health: HeartPulse,
  database: Database,
  network: Network,
  search: Search,
  table: Table2,
  graph: Workflow,
  cloud: CloudCog,
  layers: Layers3,
  brain: BrainCircuit,
  gateway: Send,
};

type HomeProps = {
  onNavigate: (screen: ScreenId) => void;
};

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="space-y-4 px-[clamp(1rem,1.5vw,1.65rem)] py-[clamp(1rem,1.35vw,1.5rem)]">
      <section className="grid gap-5 border-b border-[var(--border-subtle)] pb-5 xl:grid-cols-[minmax(0,1fr)_minmax(30rem,0.86fr)]">
        <PageHeader
          title="Home"
          subtitle="Create governed knowledge assets from unstructured content for business users, BI teams, applications, and AI agents."
          actions={
            <>
              <Button
                variant="primary"
                icon={<Sparkles aria-hidden="true" className="h-4 w-4" />}
                onClick={() => onNavigate("create-ai")}
              >
                Create Journey with AI
              </Button>
              <Button
                icon={<Play aria-hidden="true" className="h-4 w-4" />}
                onClick={() => onNavigate("start-journey")}
              >
                Start Data Journey
              </Button>
              <Button
                icon={<Box aria-hidden="true" className="h-4 w-4" />}
                onClick={() => onNavigate("assets")}
              >
                Explore Assets
              </Button>
            </>
          }
        />

        <Card className="px-4 py-4">
          <h2 className="text-[0.86rem] font-extrabold text-[var(--text-primary)]">What you can do</h2>
          <div className="mt-4 grid grid-cols-2 gap-0 lg:grid-cols-4">
            {lifecycleItems.map((item, index) => {
              const Icon = iconMap[item.icon];
              return (
                <div
                  key={item.title}
                  className={[
                    "min-w-0 px-3 py-1",
                    index > 0 ? "border-l border-[var(--border-subtle)]" : "",
                    index === 2 ? "border-l-0 lg:border-l" : "",
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden="true"
                    className={[
                      "mb-3 h-8 w-8",
                      item.tone === "green" ? "text-[var(--green)]" : "text-[var(--blue)]",
                    ].join(" ")}
                    strokeWidth={2.1}
                  />
                  <h3 className="text-[0.78rem] font-extrabold text-[var(--text-primary)]">{item.title}</h3>
                  <p className="mt-2 text-[0.76rem] font-medium leading-5 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle>Platform Snapshot</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {platformMetrics.map((metric) => (
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

      <section>
        <SectionTitle>Start from a Business Goal</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {businessGoals.map((goal) => (
            <button
              key={goal.title}
              type="button"
              onClick={() => onNavigate(goal.title === "Publish Search Experience" ? "assets" : "start-journey")}
              className="group flex min-h-[5.5rem] min-w-0 items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-white px-4 py-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-[rgba(255,90,31,0.42)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            >
              <IconBadge icon={iconMap[goal.icon]} tone={goal.tone as BadgeTone} />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.78rem] font-extrabold leading-4 text-[var(--text-primary)]">
                  {goal.title}
                </span>
                <span className="mt-1 block text-[0.74rem] font-medium leading-5 text-[var(--text-secondary)]">
                  {goal.description}
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[var(--orange)] transition group-hover:translate-x-0.5"
              />
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 border-t border-[var(--border-subtle)] pt-3 xl:grid-cols-[minmax(22rem,0.82fr)_minmax(0,1.65fr)]">
        <div>
          <SectionTitle>Continue Where You Left Off</SectionTitle>
          <Card className="overflow-hidden">
            {workItems.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => onNavigate("journeys")}
                className={[
                  "flex min-h-[3.2rem] w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--bg-subtle)]",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[item.icon]} tone={item.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.76rem] font-extrabold text-[var(--text-primary)]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.69rem] font-medium text-[var(--text-secondary)]">
                    {item.category}
                  </span>
                </span>
                {"progress" in item ? (
                  <span className="hidden min-w-[8.5rem] items-center gap-3 md:flex">
                    <ProgressBar value={item.progress} />
                    <span className="w-8 text-right text-[0.74rem] font-extrabold text-[var(--text-secondary)]">
                      {item.progress}%
                    </span>
                    <span className="hidden whitespace-nowrap text-[0.72rem] font-semibold text-[var(--text-secondary)] min-[1500px]:inline">
                      {item.meta}
                    </span>
                  </span>
                ) : (
                  <StatusPill tone={item.statusTone as "blue" | "orange"}>{item.status}</StatusPill>
                )}
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--text-primary)]" />
              </button>
            ))}
          </Card>
        </div>

        <div>
          <SectionTitle>Recent Published Assets</SectionTitle>
          <div className="grid gap-3 lg:grid-cols-3">
            {recentAssets.map((asset) => (
              <Card key={asset.title} className="min-h-[10.75rem] px-4 py-4">
                <div className="flex items-start gap-3">
                  <IconBadge icon={iconMap[asset.icon]} tone={asset.tone as BadgeTone} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="pt-1 text-[0.78rem] font-extrabold leading-5 text-[var(--text-primary)]">
                        {asset.title}
                      </h3>
                      <button type="button" className="rounded-md p-1 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
                        <MoreVertical aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 min-h-[2.4rem] text-[0.72rem] font-medium leading-5 text-[var(--text-secondary)]">
                      {asset.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill tone="green">Quality</StatusPill>
                  <span className="text-[0.72rem] font-extrabold text-[var(--green)]">{asset.quality}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#f1f3f8] px-2 py-1 text-[0.68rem] font-extrabold text-[var(--text-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border-subtle)] pt-3">
        <SectionTitle>Platform Status</SectionTitle>
        <ServiceHealthStrip
          services={serviceHealth.map((service) => ({
            ...service,
            icon: iconMap[service.icon],
          }))}
        />
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-2.5 text-[0.9rem] font-extrabold text-[var(--text-primary)]">{children}</h2>;
}
