import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bot,
  Box,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Filter,
  Grid2X2,
  Inbox,
  List,
  MoreHorizontal,
  Network,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UserPlus,
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
  reviewBreakdown,
  reviewMetrics,
  reviewQueue,
  reviewRecommendations,
  reviewServices,
  reviewTabs,
  reviewerWorkload,
  type ReviewIconKey,
} from "../data/reviews";

const iconMap: Record<ReviewIconKey, LucideIcon> = {
  inbox: Inbox,
  alert: AlertTriangle,
  clock: Clock3,
  shield: ShieldCheck,
  success: CheckCircle2,
  user: UserRound,
  file: FileText,
  building: Building2,
  warning: AlertTriangle,
  relationship: Network,
  publish: Send,
  agent: Bot,
  route: Filter,
  evidence: Box,
  policy: ShieldCheck,
  audit: ScrollText,
  notification: Bell,
  rules: ShieldCheck,
  spark: Sparkles,
};

type FilterChipProps = {
  label: string;
};

export function HumanReviewQueue() {
  const [activeTab, setActiveTab] = useState<(typeof reviewTabs)[number]>("All Reviews");
  const [listView, setListView] = useState(true);

  return (
    <div className="space-y-4 px-[clamp(1rem,1.5vw,1.65rem)] py-[clamp(0.9rem,1.2vw,1.35rem)]">
      <PageHeader
        title="Human Review Queue"
        subtitle="Review, validate, and approve AI-generated outputs and platform decisions before they become governed assets."
        actions={
          <>
            <Button variant="primary" icon={<UsersRound aria-hidden="true" className="h-4 w-4" />}>
              Bulk Review
            </Button>
            <Button icon={<UserPlus aria-hidden="true" className="h-4 w-4" />}>Assign Reviews</Button>
            <Button icon={<FileText aria-hidden="true" className="h-4 w-4" />}>Create Review Rule</Button>
            <Button icon={<Upload aria-hidden="true" className="h-4 w-4" />}>Export Decisions</Button>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {reviewMetrics.map((metric) => (
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

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.72fr)_minmax(24rem,0.78fr)]">
        <div className="space-y-3">
          <nav className="flex gap-4 border-b border-[var(--border-subtle)] px-1" aria-label="Review queue views">
            {reviewTabs.map((tab) => (
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

          <div className="flex flex-wrap items-center gap-3">
            {["Priority: All", "Status: All", "Journey: All", "Review Type: All", "Assigned To: All", "Domain: All"].map((label) => (
              <FilterChip key={label} label={label} />
            ))}
            <label className="ml-auto flex h-9 items-center gap-2 text-[0.72rem] font-bold text-[var(--text-secondary)]">
              Only My Items
              <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#dbe1ea]">
                <span className="ml-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
              </span>
            </label>
            <div className="flex h-9 items-center rounded-lg border border-[var(--border-subtle)] bg-white p-1">
              <button
                type="button"
                aria-label="List view"
                onClick={() => setListView(true)}
                className={[
                  "flex h-7 w-8 items-center justify-center rounded-md",
                  listView ? "bg-[var(--orange-soft)] text-[var(--orange)]" : "text-[var(--text-secondary)]",
                ].join(" ")}
              >
                <List aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setListView(false)}
                className={[
                  "flex h-7 w-8 items-center justify-center rounded-md",
                  !listView ? "bg-[var(--orange-soft)] text-[var(--orange)]" : "text-[var(--text-secondary)]",
                ].join(" ")}
              >
                <Grid2X2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[70rem] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[0.62rem] font-extrabold text-[var(--text-secondary)]">
                    <th className="w-9 px-3 py-2.5">
                      <input type="checkbox" aria-label="Select all reviews" className="h-3.5 w-3.5 rounded border-[var(--border-strong)]" />
                    </th>
                    <th className="px-2 py-2.5">Review Item</th>
                    <th className="px-2 py-2.5">Journey / Asset</th>
                    <th className="px-2 py-2.5">Review Type</th>
                    <th className="px-2 py-2.5">Trigger Reason</th>
                    <th className="px-2 py-2.5">Confidence</th>
                    <th className="px-2 py-2.5">Priority</th>
                    <th className="px-2 py-2.5">SLA</th>
                    <th className="px-2 py-2.5">Assigned To</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-2 py-2.5" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {reviewQueue.map((review) => (
                    <tr
                      key={`${review.item}-${review.detail}`}
                      className="border-b border-[var(--border-subtle)] text-[0.66rem] font-semibold text-[var(--text-secondary)] last:border-b-0 hover:bg-[var(--bg-subtle)]"
                    >
                      <td className="px-3 py-2">
                        <input type="checkbox" aria-label={`Select ${review.item}`} className="h-3.5 w-3.5 rounded border-[var(--border-strong)]" />
                      </td>
                      <td className="max-w-[12rem] px-2 py-2">
                        <button type="button" className="flex min-w-0 items-center gap-2 text-left">
                          <IconBadge icon={iconMap[review.icon]} tone={review.tone as BadgeTone} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-extrabold text-[var(--text-primary)]">{review.item}</span>
                            <span className="mt-0.5 block truncate text-[0.62rem] text-[var(--text-secondary)]">{review.detail}</span>
                          </span>
                        </button>
                      </td>
                      <td className="max-w-[11rem] px-2 py-2">
                        <span className="block line-clamp-2 font-bold text-[var(--text-primary)]">{review.asset}</span>
                        {review.assetDetail ? <span className="mt-0.5 block truncate text-[0.62rem]">{review.assetDetail}</span> : null}
                      </td>
                      <td className="px-2 py-2">
                        <StatusPill tone={review.typeTone as "green" | "blue" | "orange" | "purple"}>{review.type}</StatusPill>
                      </td>
                      <td className="max-w-[10rem] px-2 py-2">
                        <span className="block truncate font-bold text-[var(--text-primary)]">{review.trigger}</span>
                        <span className="mt-0.5 block truncate text-[0.62rem]">{review.triggerDetail}</span>
                      </td>
                      <td
                        className={[
                          "px-2 py-2 font-extrabold",
                          review.confidenceTone === "red"
                            ? "text-[var(--red)]"
                            : review.confidenceTone === "orange"
                              ? "text-[var(--orange)]"
                              : "text-[var(--text-secondary)]",
                        ].join(" ")}
                      >
                        {review.confidence}
                      </td>
                      <td className="px-2 py-2">
                        <StatusPill tone={review.priorityTone as "red" | "orange" | "neutral"}>{review.priority}</StatusPill>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 font-extrabold text-[var(--orange)]">{review.sla}</td>
                      <td className="px-2 py-2">
                        <span className="flex min-w-[7rem] items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f2ff] text-[0.62rem] font-extrabold text-[var(--text-secondary)]">
                            {review.initials}
                          </span>
                          {review.assignee}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <StatusPill tone={review.statusTone as "orange" | "blue"}>{review.status}</StatusPill>
                      </td>
                      <td className="px-2 py-2">
                        <MoreHorizontal aria-hidden="true" className="h-4 w-4 text-[var(--text-primary)]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-3 text-[0.72rem] font-semibold text-[var(--text-secondary)]">
              <span>Showing 1 to 7 of 238 reviews</span>
              <div className="flex items-center gap-2">
                {["1", "2", "3", "4", "...", "24"].map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={[
                      "flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-[0.68rem] font-extrabold",
                      page === "1"
                        ? "border-[rgba(255,90,31,0.5)] bg-[var(--orange-soft)] text-[var(--orange)]"
                        : "border-[var(--border-subtle)] bg-white text-[var(--text-secondary)]",
                    ].join(" ")}
                  >
                    {page}
                  </button>
                ))}
                <button type="button" aria-label="Next page" className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white">
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-3">
          <Card className="overflow-hidden">
            <PanelHeader title="AI Review Recommendations" action="View all" />
            {reviewRecommendations.map((recommendation, index) => (
              <div
                key={recommendation.title}
                className={[
                  "flex items-center gap-3 px-4 py-3",
                  index > 0 ? "border-t border-[var(--border-subtle)]" : "",
                ].join(" ")}
              >
                <IconBadge icon={iconMap[recommendation.icon]} tone={recommendation.tone as BadgeTone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.73rem] font-extrabold text-[var(--text-primary)]">{recommendation.title}</span>
                  <span className="mt-0.5 block truncate text-[0.66rem] font-semibold text-[var(--text-secondary)]">
                    {recommendation.description}
                  </span>
                </span>
                <button type="button" className="rounded-md border border-[rgba(255,90,31,0.35)] bg-[var(--orange-soft)] px-2 py-1 text-[0.62rem] font-extrabold text-[var(--orange)]">
                  {recommendation.action}
                </button>
              </div>
            ))}
          </Card>

          <Card className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[0.86rem] font-extrabold text-[var(--text-primary)]">Review Type Breakdown</h2>
              <button type="button" className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[0.64rem] font-extrabold text-[var(--text-secondary)]">
                Last 7 days
              </button>
            </div>
            <div className="mt-4 grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-4">
              <div className="relative flex h-[7.2rem] w-[7.2rem] items-center justify-center rounded-full bg-[conic-gradient(#f97316_0_26%,#16a34a_26%_50%,#2563eb_50%_68%,#3b82f6_68%_82%,#ef4444_82%_92%,#8a3ffc_92%_100%)]">
                <div className="flex h-[4.8rem] w-[4.8rem] flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-[1.25rem] font-extrabold leading-none text-[var(--text-primary)]">238</span>
                  <span className="mt-1 text-[0.62rem] font-bold text-[var(--text-secondary)]">Total</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {reviewBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-[0.66rem] font-bold text-[var(--text-secondary)]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span className="text-[var(--text-primary)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="SLA & Workload" action="View all" />
            <div className="grid grid-cols-[0.72fr_1fr]">
              <div className="border-r border-[var(--border-subtle)] px-4 py-3">
                <p className="text-[0.68rem] font-bold text-[var(--text-secondary)]">Avg SLA Compliance</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[1.45rem] font-extrabold leading-none text-[var(--text-primary)]">92%</span>
                  <span className="text-[0.68rem] font-extrabold text-[var(--green)]">+ 6%</span>
                </div>
                <p className="mt-1 text-[0.66rem] font-semibold text-[var(--text-secondary)]">vs last 7 days</p>
                <p className="mt-4 text-[0.68rem] font-bold text-[var(--text-secondary)]">Overdue Reviews</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[1.25rem] font-extrabold text-[var(--text-primary)]">7</span>
                  <span className="text-[0.68rem] font-extrabold text-[var(--red)]">+ 2</span>
                </div>
                <p className="text-[0.66rem] font-semibold text-[var(--text-secondary)]">vs yesterday</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[0.68rem] font-extrabold text-[var(--text-primary)]">Workload by Reviewer</p>
                <div className="mt-3 space-y-2">
                  {reviewerWorkload.map((reviewer) => (
                    <div key={reviewer.name} className="grid grid-cols-[5.9rem_minmax(0,1fr)_1.5rem] items-center gap-2 text-[0.64rem] font-bold text-[var(--text-secondary)]">
                      <span className="truncate">{reviewer.name}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-[#edf1f6]">
                        <span className="block h-full rounded-full bg-[var(--orange)]" style={{ width: `${reviewer.width}%` }} />
                      </span>
                      <span className="text-right text-[var(--text-primary)]">{reviewer.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </section>

      <section>
        <h2 className="mb-2.5 text-[0.9rem] font-extrabold text-[var(--text-primary)]">Review Services</h2>
        <ServiceHealthStrip
          columns={6}
          services={reviewServices.map((service) => ({
            ...service,
            icon: iconMap[service.icon],
          }))}
        />
      </section>
    </div>
  );
}

function FilterChip({ label }: FilterChipProps) {
  return (
    <button
      type="button"
      className="flex h-9 min-w-[7.2rem] items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-white px-3 text-[0.72rem] font-bold text-[var(--text-secondary)]"
    >
      {label}
      <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 text-[var(--text-muted)]" />
    </button>
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
