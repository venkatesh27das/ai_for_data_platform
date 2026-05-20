import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CloudUpload,
  Grid2X2,
  ListChecks,
  MoreVertical,
  Network,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DemoFlowModal, { type DemoFlow } from "../components/common/DemoFlowModal";

type Tone = "orange" | "amber" | "purple" | "green" | "blue" | "teal";
type WorkbenchStatus = "Published" | "Review" | "Draft" | "Running Validation";
type RunStatus = "Passed" | "Warnings" | "Failed";

const toneMap: Record<Tone, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  amber: "border-amber-100 bg-amber-50 text-amber-500",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  teal: "border-cyan-100 bg-cyan-50 text-cyan-700",
};

const studioCards = [
  { title: "Business Glossary", detail: "Create and manage business terms with clear definitions, relationships, and ownership.", icon: BookOpen, tone: "amber", count: "412 Terms", active: "36 Active" },
  { title: "Metric & KPI Builder", detail: "Standardize metrics and KPIs with consistent logic, dimensions, and calculation rules.", icon: ListChecks, tone: "purple", count: "128 Metrics", active: "22 Active" },
  { title: "Entity & Relationship Modeling", detail: "Model entities, attributes, and relationships that reflect your business domain.", icon: Network, tone: "green", count: "56 Models", active: "8 Active" },
  { title: "Semantic Query / NLQ Testing", detail: "Test and validate natural language and semantic queries against your models.", icon: Search, tone: "blue", count: "24 Templates", active: "12 Active" },
  { title: "Policy & Governance Mapping", detail: "Map data policies, access rules, and governance metadata to semantic assets.", icon: ShieldCheck, tone: "orange", count: "34 Policies", active: "9 Active" },
  { title: "Publishing & Consumption", detail: "Publish models and enable trusted consumption across BI, apps, and data products.", icon: CloudUpload, tone: "teal", count: "19 Published", active: "6 Active" },
] as const;

const workbenchRows = [
  { asset: "Payer Performance Semantic Layer", domain: "Finance & Performance", status: "Published", progress: 92, updated: "1h ago", tone: "blue" },
  { asset: "Claims & Revenue KPI Model", domain: "Revenue Cycle", status: "Review", progress: 64, updated: "3h ago", tone: "purple" },
  { asset: "Provider Contract Ontology", domain: "Provider Management", status: "Draft", progress: 38, updated: "1d ago", tone: "blue" },
  { asset: "Customer 360 Business Glossary", domain: "Customer", status: "Running Validation", progress: 71, updated: "2d ago", tone: "orange" },
] as const;

const insights = [
  { label: "Published Models", value: "19", delta: "+3 vs last 7 days" },
  { label: "Active Drafts", value: "14", delta: "+2 vs last 7 days" },
  { label: "Reusable Metrics", value: "128", delta: "+12 vs last 7 days" },
  { label: "Glossary Terms", value: "412", delta: "+28 vs last 7 days" },
  { label: "Data Products Linked", value: "36", delta: "+4 vs last 7 days" },
  { label: "Query Success Rate", value: "96.4%", delta: "+1.8% vs last 7 days" },
] as const;

const capabilities = [
  { title: "Business Definitions", detail: "Organize business terms and establish a shared language across the organization.", icon: ListChecks, tone: "amber" },
  { title: "Metric Standardization", detail: "Build consistent, reusable metrics with governed calculations and dimensions.", icon: ListChecks, tone: "purple" },
  { title: "AI for BI Enablement", detail: "Prepare semantic models for natural language, insights, and AI-powered experiences.", icon: Sparkles, tone: "blue" },
  { title: "Governed Consumption", detail: "Enable trusted, policy-aware consumption across tools, apps, and data products.", icon: ShieldCheck, tone: "green" },
] as const;

const validationRuns = [
  { name: "Revenue KPI Validation", type: "Metric Validation", status: "Passed", results: "56 / 56", started: "10m ago", icon: CheckCircle2 },
  { name: "Claims NLQ Test Set", type: "NLQ Test", status: "Passed", results: "94%", started: "45m ago", icon: Search },
  { name: "Provider Ontology Check", type: "Model Validation", status: "Warnings", results: "7 warnings", started: "2h ago", icon: TriangleAlert },
  { name: "Glossary Consistency Scan", type: "Glossary Scan", status: "Failed", results: "3 errors", started: "5h ago", icon: XCircle },
] as const;

export default function SemanticStudio() {
  const [flow, setFlow] = useState<DemoFlow | null>(null);
  const navigate = useNavigate();

  return (
    <>
      <div className="space-y-2.5">
        <section className="rounded-[18px] border border-slate-200 bg-white px-6 py-5 shadow-card">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <h1 className="text-[30px] font-extrabold leading-none text-slate-950">Semantic Studio</h1>
            <p className="text-[13px] font-medium text-slate-700">Build business-ready semantic models, metrics, glossary terms, and governed query experiences.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <StudioAction primary icon={Plus} label="Create Semantic Model" onClick={() => navigate("/studios/semantic/create")} />
            <StudioAction icon={Grid2X2} label="Browse Templates" onClick={() => setFlow(flowFor("Browse Templates"))} />
            <StudioAction icon={CloudUpload} label="Import Sources" onClick={() => setFlow(flowFor("Import Sources"))} />
            <StudioAction icon={Play} label="Resume Session" onClick={() => setFlow(flowFor("Resume Session"))} />
          </div>

          <div className="semantic-studio-card-grid mt-5">
            {studioCards.map((card) => <StudioCard key={card.title} {...card} onClick={() => setFlow(flowFor(card.title))} />)}
          </div>
        </section>

        <section className="semantic-studio-main-grid">
          <StudioPanel title="Modeling Workbench" action="View all assets" className="min-w-0">
            <div className="overflow-hidden rounded-[12px] border border-slate-200">
              <div className="semantic-studio-workbench-row grid bg-slate-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                <span>Asset / Domain</span><span>Status</span><span>Progress</span><span>Updated</span><span />
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {workbenchRows.map((row) => <WorkbenchRow key={row.asset} {...row} onClick={() => setFlow(flowFor(row.asset))} />)}
              </div>
            </div>
          </StudioPanel>

          <StudioPanel title="Studio Insights" action="View all insights" info>
            <div className="semantic-studio-insight-grid">
              {insights.map((insight) => <InsightTile key={insight.label} {...insight} onClick={() => setFlow(flowFor(insight.label))} />)}
            </div>
          </StudioPanel>
        </section>

        <section className="semantic-studio-main-grid">
          <StudioPanel title="Browse by Semantic Capability" info>
            <div className="semantic-studio-capability-grid">
              {capabilities.map((capability) => <CapabilityCard key={capability.title} {...capability} onClick={() => setFlow(flowFor(capability.title))} />)}
            </div>
          </StudioPanel>

          <StudioPanel title="Validation & Test Runs" action="View all runs" info>
            <div className="overflow-hidden rounded-[12px] border border-slate-200">
              <div className="semantic-studio-run-row grid bg-slate-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                <span>Test Run</span><span>Type</span><span>Status</span><span>Results</span><span>Started</span><span />
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {validationRuns.map((run) => <ValidationRow key={run.name} {...run} onClick={() => setFlow(flowFor(run.name))} />)}
              </div>
            </div>
          </StudioPanel>
        </section>
      </div>
      <DemoFlowModal flow={flow} onClose={() => setFlow(null)} />
    </>
  );
}

function StudioAction({ icon: Icon, label, primary = false, onClick }: { icon: LucideIcon; label: string; primary?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-5 text-[13px] font-extrabold shadow-sm transition hover:-translate-y-0.5 ${primary ? "orange-gradient border-orange-500 text-white" : "border-slate-200 bg-white text-slate-900 hover:border-orange-200 hover:text-orange-600"}`}>
      <Icon className="h-4.5 w-4.5" /> {label}
    </button>
  );
}

function StudioCard({ title, detail, icon: Icon, tone, count, active, onClick }: { title: string; detail: string; icon: LucideIcon; tone: Tone; count: string; active: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-[220px] flex-col rounded-[12px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
      <span className={`grid h-12 w-12 place-items-center rounded-[10px] border ${toneMap[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <b className="mt-4 block min-h-[38px] text-[15px] leading-[18px] text-slate-950">{title}</b>
      <span className="mt-2 block text-[12px] font-medium leading-[17px] text-slate-700">{detail}</span>
      <span className="mt-auto flex items-center gap-4 border-t border-transparent pt-4 text-[11px] font-extrabold text-slate-700">
        <span className="inline-flex items-center gap-1.5"><Grid2X2 className="h-3.5 w-3.5 text-slate-500" />{count}</span>
        <span className="h-4 w-px bg-slate-200" />
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />{active}</span>
      </span>
    </button>
  );
}

function StudioPanel({ title, action, info = false, className = "", children }: { title: string; action?: string; info?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-[16px] border border-slate-200 bg-white p-4 shadow-card ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950">
          {title}
          {info ? <span className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-[10px] text-slate-400">i</span> : null}
        </h2>
        {action ? <button className="inline-flex items-center gap-2 text-[12px] font-extrabold text-slate-700 hover:text-orange-600">{action}<ArrowRight className="h-4 w-4" /></button> : null}
      </div>
      {children}
    </section>
  );
}

function WorkbenchRow({ asset, domain, status, progress, updated, tone, onClick }: { asset: string; domain: string; status: WorkbenchStatus; progress: number; updated: string; tone: Tone; onClick: () => void }) {
  return (
    <button onClick={onClick} className="semantic-studio-workbench-row grid w-full items-center px-4 py-2.5 text-left hover:bg-orange-50/40">
      <span className="grid min-w-0 grid-cols-[32px_1fr] items-center gap-3">
        <span className={`grid h-8 w-8 place-items-center rounded-lg border ${toneMap[tone]}`}><Network className="h-4 w-4" /></span>
        <span className="min-w-0">
          <b className="block truncate text-[12px] text-slate-950">{asset}</b>
          <span className="block truncate text-[11px] font-semibold text-slate-600">{domain}</span>
        </span>
      </span>
      <StatusBadge status={status} />
      <span className="grid grid-cols-[minmax(0,1fr)_42px] items-center gap-3">
        <span className="h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-orange-600" style={{ width: `${progress}%` }} /></span>
        <b className="text-[12px] text-slate-700">{progress}%</b>
      </span>
      <span className="text-[12px] font-semibold text-slate-600">{updated}</span>
      <MoreVertical className="h-4 w-4 justify-self-end text-slate-400" />
    </button>
  );
}

function StatusBadge({ status }: { status: WorkbenchStatus }) {
  const className = status === "Published"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : status === "Review"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : status === "Draft"
        ? "border-slate-200 bg-slate-50 text-slate-600"
        : "border-amber-200 bg-amber-50 text-amber-700";
  return <span className={`w-fit rounded-md border px-3 py-1 text-[11px] font-extrabold ${className}`}>{status}</span>;
}

function InsightTile({ label, value, delta, onClick }: { label: string; value: string; delta: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="min-h-[98px] rounded-[10px] border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-orange-200">
      <span className="block text-[11px] font-extrabold text-slate-600">{label}</span>
      <b className="mt-2 block text-[25px] leading-none text-slate-950">{value}</b>
      <span className="mt-3 block text-[11px] font-extrabold text-emerald-600">{delta}</span>
    </button>
  );
}

function CapabilityCard({ title, detail, icon: Icon, tone, onClick }: { title: string; detail: string; icon: LucideIcon; tone: Tone; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-[170px] flex-col rounded-[10px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200">
      <span className={`grid h-10 w-10 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <b className="mt-3 text-[13px] text-slate-950">{title}</b>
      <span className="mt-2 block text-[12px] font-medium leading-4 text-slate-700">{detail}</span>
      <ArrowRight className="mt-auto h-4 w-4 self-end text-slate-700" />
    </button>
  );
}

function ValidationRow({ name, type, status, results, started, icon: Icon, onClick }: { name: string; type: string; status: RunStatus; results: string; started: string; icon: LucideIcon; onClick: () => void }) {
  const iconClass = status === "Passed" ? "text-emerald-600" : status === "Warnings" ? "text-amber-500" : "text-red-500";
  return (
    <button onClick={onClick} className="semantic-studio-run-row grid w-full items-center px-4 py-2.5 text-left hover:bg-orange-50/40">
      <span className="flex min-w-0 items-center gap-3">
        <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
        <b className="truncate text-[12px] text-slate-950">{name}</b>
      </span>
      <span className="truncate text-[12px] font-semibold text-slate-600">{type}</span>
      <RunBadge status={status} />
      <span className="truncate text-[12px] font-bold text-slate-700">{results}</span>
      <span className="truncate text-[12px] font-semibold text-slate-600">{started}</span>
      <MoreVertical className="h-4 w-4 justify-self-end text-slate-400" />
    </button>
  );
}

function RunBadge({ status }: { status: RunStatus }) {
  const className = status === "Passed"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : status === "Warnings"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-red-200 bg-red-50 text-red-600";
  return <span className={`w-fit rounded-md border px-3 py-1 text-[11px] font-extrabold ${className}`}>{status}</span>;
}

function flowFor(title: string): DemoFlow {
  return {
    title,
    description: `Opens the ${title.toLowerCase()} workflow in Semantic Studio.`,
    steps: ["Review semantic assets, owners, and governance context.", "Apply templates, validation checks, or modeling changes.", "Publish updates to BI, apps, and data products."],
    primaryAction: "Open workflow",
  };
}
