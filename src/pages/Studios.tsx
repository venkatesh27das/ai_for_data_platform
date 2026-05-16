import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  Boxes,
  ChevronRight,
  Clock3,
  CloudUpload,
  Code2,
  Compass,
  FileCheck2,
  Grid2X2,
  History,
  LibraryBig,
  Plus,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";
import { useMemo, useState } from "react";
import { HeroBanner } from "../components/HeroBanner";
import { MiniTrendChart } from "../components/MiniTrendChart";
import { ProgressBar } from "../components/ProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { cn, notify } from "../lib/utils";

type StudioCategory = "Data Engineering" | "Quality" | "Modernization" | "Context";

type StudioItem = {
  name: string;
  description: string;
  status: "Available" | "Expand" | "In Development";
  stage: string;
  owner: string;
  cta: string;
  category: StudioCategory;
  icon: LucideIcon;
};

type StudioTab = "All Studios" | StudioCategory | "My Workspaces";

const tabs: StudioTab[] = ["All Studios", "Data Engineering", "Quality", "Modernization", "Context", "My Workspaces"];

const studioItems: StudioItem[] = [
  {
    name: "Assisted Data Modelling",
    description: "Design logical and physical data models with AI assistance.",
    status: "Available",
    stage: "Modelling",
    owner: "Data Architecture",
    cta: "Open Studio",
    category: "Data Engineering",
    icon: Workflow
  },
  {
    name: "Automated Ingestion Pipeline Builder",
    description: "Generate ingestion pipelines, source mappings, and onboarding templates.",
    status: "Available",
    stage: "Ingestion",
    owner: "Data Engineering",
    cta: "Open Studio",
    category: "Data Engineering",
    icon: CloudUpload
  },
  {
    name: "Automated Data Quality",
    description: "Create DQ rules, validations, profiling checks, and readiness reports.",
    status: "Available",
    stage: "Quality",
    owner: "Data Quality",
    cta: "Open Studio",
    category: "Quality",
    icon: ShieldCheck
  },
  {
    name: "Code Conversion Studio",
    description: "Convert legacy SQL, ETL, and scripts into modern platform patterns.",
    status: "Available",
    stage: "Modernization",
    owner: "Modernization",
    cta: "Open Studio",
    category: "Modernization",
    icon: Code2
  },
  {
    name: "Migration Workspace",
    description: "Run modernization assessments, dependency mapping, and migration planning.",
    status: "Expand",
    stage: "Cross-Journey",
    owner: "Platform Modernization",
    cta: "Explore",
    category: "Modernization",
    icon: Compass
  },
  {
    name: "Semantic / Context Studio",
    description: "Create glossary, business rules, semantic assets, and context packs.",
    status: "In Development",
    stage: "Context",
    owner: "Data Architecture",
    cta: "View Roadmap",
    category: "Context",
    icon: BookOpenCheck
  }
];

const recentSessions = [
  { name: "Customer 360 Data Model", studio: "Assisted Data Modelling", progress: 75, cta: "Resume", icon: Workflow },
  { name: "Claims Ingestion Pipeline Draft", studio: "Ingestion Builder", progress: 60, cta: "Resume", icon: CloudUpload },
  { name: "Legacy SQL Conversion Batch", studio: "Code Conversion", progress: 40, cta: "Resume", icon: Code2 },
  { name: "DQ Rule Pack for Claims", studio: "Automated Data Quality", progress: 85, cta: "Review", icon: ShieldCheck }
];

const templateAssets = [
  {
    title: "Data Modelling Blueprint",
    description: "Starter blueprint for logical and physical data modelling.",
    icon: Workflow
  },
  {
    title: "DQ Rule Starter Kit",
    description: "Pre-built rule templates for data quality and validation.",
    icon: ShieldCheck
  },
  {
    title: "Ingestion Connector Template",
    description: "Reusable connector and mapping template for onboarding.",
    icon: CloudUpload
  },
  {
    title: "Code Conversion Playbook",
    description: "Best practices and patterns for modernizing legacy code.",
    icon: Code2
  }
];

const insightMetrics = [
  { label: "Active Studios", value: "4", icon: Boxes, color: "#ff5a1f", tileClass: "bg-orange-50 text-orange-600" },
  { label: "Running Sessions", value: "11", icon: Clock3, color: "#3b82f6", tileClass: "bg-blue-50 text-blue-600" },
  { label: "Generated Assets", value: "126", icon: Grid2X2, color: "#22c55e", tileClass: "bg-green-50 text-green-600" },
  { label: "Completion Rate", value: "82%", icon: FileCheck2, color: "#8b5cf6", tileClass: "bg-purple-50 text-purple-600" }
];

const recommendedActions = [
  { text: "Resume unfinished studio sessions", icon: History },
  { text: "Publish reusable DQ rule pack", icon: LibraryBig },
  { text: "Review new migration template", icon: Compass },
  { text: "Promote high-usage studio assets", icon: Sparkles }
];

function StudioTabs({ activeTab, onChange }: { activeTab: StudioTab; onChange: (tab: StudioTab) => void }) {
  return (
    <section className="card px-4 py-3">
      <div className="flex flex-wrap items-center gap-1">
        {tabs.map((tab) => {
          const selected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={cn(
                "relative rounded-lg px-4 py-2.5 text-sm font-extrabold transition focus:outline-none focus:ring-2 focus:ring-orange-300",
                selected ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              )}
            >
              {tab}
              {selected && <span className="absolute inset-x-4 -bottom-3 h-0.5 rounded-full bg-orange-600" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TagPill({ children }: { children: string }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{children}</span>;
}

function StudioCard({ studio }: { studio: StudioItem }) {
  const Icon = studio.icon;

  return (
    <article className="group flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-100">
          <Icon className="h-6 w-6" />
        </div>
        <StatusBadge status={studio.status} />
      </div>
      <h3 className="mt-4 text-base font-extrabold leading-snug text-slate-950">{studio.name}</h3>
      <p className="mt-2 min-h-[50px] text-sm leading-6 text-slate-600">{studio.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <TagPill>{studio.stage}</TagPill>
        <TagPill>{studio.owner}</TagPill>
      </div>
      <div className="mt-auto pt-5">
        <button onClick={() => notify(`${studio.name}: ${studio.cta}`)} className="btn-primary w-full justify-center">
          {studio.cta}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function RecentSessionCard({ session }: { session: (typeof recentSessions)[number] }) {
  const Icon = session.icon;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-orange-200 hover:shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-100">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-extrabold text-slate-950">{session.name}</h3>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">{session.studio}</p>
            </div>
            <button onClick={() => notify(`${session.cta}: ${session.name}`)} className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-extrabold text-orange-600 transition hover:bg-orange-50">
              {session.cta}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <ProgressBar value={session.progress} />
            </div>
            <span className="w-9 text-right text-xs font-extrabold text-slate-700">{session.progress}%</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function TemplateAssetCard({ asset }: { asset: (typeof templateAssets)[number] }) {
  const Icon = asset.icon;

  return (
    <button onClick={() => notify(`${asset.title} opened`)} className="group flex h-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-orange-200 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-orange-300">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-100">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-slate-950">{asset.title}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-600">{asset.description}</span>
      </span>
      <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-orange-600" />
    </button>
  );
}

function InsightMetricCard({ metric }: { metric: (typeof insightMetrics)[number] }) {
  const Icon = metric.icon;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", metric.tileClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-700">{metric.label}</p>
            <p className="mt-1 text-3xl font-extrabold leading-none text-slate-950">{metric.value}</p>
          </div>
        </div>
        <MiniTrendChart color={metric.color} />
      </div>
    </article>
  );
}

function RecommendedActionItem({ action, divided }: { action: (typeof recommendedActions)[number]; divided?: boolean }) {
  const Icon = action.icon;

  return (
    <button onClick={() => notify(action.text)} className={cn("group flex w-full items-center gap-3 py-3 text-left focus:outline-none focus:ring-2 focus:ring-orange-300", divided && "border-t border-slate-100")}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-100">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-extrabold leading-5 text-slate-700">{action.text}</span>
      <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-orange-600" />
    </button>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="section-title">{title}</h2>
      {action && (
        <button onClick={() => notify(action)} className="text-sm font-extrabold text-orange-600 transition hover:text-orange-700">
          {action}
        </button>
      )}
    </div>
  );
}

export function Studios() {
  const [activeTab, setActiveTab] = useState<StudioTab>("All Studios");

  const visibleStudios = useMemo(() => {
    if (activeTab === "All Studios" || activeTab === "My Workspaces") {
      return studioItems;
    }

    return studioItems.filter((studio) => studio.category === activeTab);
  }, [activeTab]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5 max-[1280px]:grid-cols-1">
      <main className="min-w-0 space-y-5">
        <HeroBanner
          title="Studios Workspace"
          subtitle="Launch AI-assisted workspaces to design models, generate pipelines, validate quality, convert code, and accelerate data delivery."
          actions={
            <>
              <button onClick={() => notify("New studio launcher opened")} className="btn-primary">
                <Plus className="h-4 w-4" />
                Launch New Studio
              </button>
              <button onClick={() => notify("Recent studio work opened")} className="btn-secondary">
                <History className="h-4 w-4" />
                Resume Recent Work
              </button>
              <button onClick={() => notify("Template library opened")} className="btn-secondary">
                <Grid2X2 className="h-4 w-4" />
                Browse Templates
              </button>
            </>
          }
        />

        <StudioTabs activeTab={activeTab} onChange={setActiveTab} />

        <section className="card p-4">
          <SectionHeader title={activeTab === "My Workspaces" ? "My Studio Workspaces" : "AI-Assisted Studios"} />
          {activeTab === "My Workspaces" && (
            <div className="mb-4 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
              Your active studio workspaces are shown below with launch-ready studio options.
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 max-[1500px]:grid-cols-2 max-[900px]:grid-cols-1">
            {visibleStudios.map((studio) => (
              <StudioCard key={studio.name} studio={studio} />
            ))}
          </div>
        </section>

        <section className="card p-4">
          <SectionHeader title="Recent Studio Sessions" action="View all sessions" />
          <div className="grid grid-cols-2 gap-3 max-[900px]:grid-cols-1">
            {recentSessions.map((session) => (
              <RecentSessionCard key={session.name} session={session} />
            ))}
          </div>
        </section>

        <section className="card p-4">
          <SectionHeader title="Studio Templates & Assets" action="View all templates" />
          <div className="grid grid-cols-4 gap-3 max-[1500px]:grid-cols-2 max-[900px]:grid-cols-1">
            {templateAssets.map((asset) => (
              <TemplateAssetCard key={asset.title} asset={asset} />
            ))}
          </div>
        </section>
      </main>

      <aside className="space-y-5">
        <section className="card p-4">
          <h2 className="section-title">Studio Insights</h2>
          <div className="mt-4 space-y-3">
            {insightMetrics.map((metric) => (
              <InsightMetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="section-title">Recommended Actions</h2>
          <div className="mt-4">
            {recommendedActions.map((action, index) => (
              <RecommendedActionItem key={action.text} action={action} divided={index > 0} />
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
