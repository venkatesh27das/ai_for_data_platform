import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Database,
  FileText,
  GitBranch,
  GitFork,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import DemoFlowModal, { type DemoFlow } from "../components/common/DemoFlowModal";
import EntityDrawer from "../components/common/EntityDrawer";
import type { DrawerEntity } from "../types";

type JourneyStatus = "Running" | "Pending Review" | "Awaiting Approval";
type JourneyHealth = "Healthy" | "At Risk";
type StageState = "Complete" | "Running" | "Pending Review" | "Not Started";

const portfolioMetrics = [
  { title: "Active Journeys", value: "42", delta: "+5 from last week", icon: ShieldCheck, tone: "orange" },
  { title: "In Design", value: "18", delta: "-2 from last week", icon: Pencil, tone: "orange", negative: true },
  { title: "Running", value: "16", delta: "+3 from last week", icon: Workflow, tone: "green" },
  { title: "Awaiting Approval", value: "7", delta: "+1 from last week", icon: FileText, tone: "orange" },
  { title: "Completed (This Month)", value: "28", delta: "+10 from last month", icon: CheckCircle2, tone: "green" },
  { title: "Avg. Journey Health", value: "92%", delta: "Healthy", icon: Pencil, tone: "orange", chart: true },
] as const;

const journeys = [
  { name: "Claims to Trusted Data Product", type: "Hybrid", domain: "Claims", owner: "Priya Nair", initials: "PN", stage: "3. Data Modeling & Transformation", progress: 48, status: "Running", updated: "Jun 06, 2025 10:30 AM", health: "Healthy", accent: "blue" },
  { name: "Provider 360 Ingestion", type: "Structured", domain: "Provider Mgmt", owner: "Rahul Singh", initials: "RS", stage: "2. Storage, Processing & Extraction", progress: 62, status: "Running", updated: "Jun 06, 2025 09:15 AM", health: "Healthy", accent: "blue" },
  { name: "Sales Performance Mart", type: "Structured", domain: "Sales", owner: "Anjali Mehta", initials: "AM", stage: "4. Data Quality & Validation", progress: 30, status: "Pending Review", updated: "Jun 06, 2025 08:45 AM", health: "At Risk", accent: "blue" },
  { name: "Claims Documents NLP", type: "Unstructured", domain: "Claims", owner: "David Kumar", initials: "DK", stage: "2. Storage, Processing & Extraction", progress: 25, status: "Running", updated: "Jun 05, 2025 05:20 PM", health: "Healthy", accent: "blue" },
  { name: "Customer 360 Data Product", type: "Hybrid", domain: "Customer 360", owner: "Rohan Mehta", initials: "RM", stage: "5. Data Productization & Publishing", progress: 70, status: "Awaiting Approval", updated: "Jun 05, 2025 04:00 PM", health: "Healthy", accent: "blue" },
] as const;

const pipelineStages: { title: string; state: StageState }[] = [
  { title: "Source Onboarding & Ingestion", state: "Complete" },
  { title: "Storage, Processing & Extraction", state: "Complete" },
  { title: "Data Modeling & Transformation", state: "Running" },
  { title: "Data Quality & Validation", state: "Pending Review" },
  { title: "Data Productization & Publishing", state: "Not Started" },
  { title: "Context & Semantic Enablement", state: "Not Started" },
  { title: "Consumption, Access & Reuse", state: "Not Started" },
];

const executionTargets = [
  { label: "Execution Target", value: "Azure" },
  { label: "Compute", value: "Azure Databricks (Photon)" },
  { label: "Orchestration", value: "Azure Data Factory" },
  { label: "Repository", value: "Azure DevOps - claims-data-jobs" },
];

const stageProgress = [
  { item: "Source to Target Mapping", status: "Complete" },
  { item: "Transformation Logic", status: "In Progress" },
  { item: "Business Rule Implementation", status: "In Progress" },
  { item: "Output Model Generation", status: "Pending" },
  { item: "Unit Testing", status: "Pending" },
];

const artifacts = [
  { name: "Mapping Document", tag: "v1.2" },
  { name: "Transformation Notebook", tag: "Running" },
  { name: "Target Data Model (ERD)", tag: "v0.8" },
  { name: "Business Rules", tag: "15 Rules" },
  { name: "Data Dictionary", tag: "In Progress" },
];

const summary = [
  ["Input Datasets", "12"],
  ["Output Datasets (Expected)", "8"],
  ["Data Quality Rules", "23"],
  ["Records Processed", "18.7 M"],
  ["Last Run", "Jun 06, 2025 10:25 AM"],
  ["Next Run", "Jun 06, 2025 02:00 PM"],
];

const toneMap: Record<string, string> = {
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
};

export default function DataJourney() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const [flow, setFlow] = useState<DemoFlow | null>(null);
  const [activeTab, setActiveTab] = useState("All Journeys");
  const selected = journeys[0];

  return (
    <>
      <div className="space-y-4">
        <section className="rounded-[18px] border border-slate-200 bg-white px-6 py-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Data Journey</h1>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <TopSelect label="Cloud" value="Multi-Cloud" onClick={() => setFlow(selectionFlow("Cloud", "Multi-Cloud"))} />
              <button onClick={() => setFlow(journeyHelpFlow)} className="grid h-10 w-10 place-items-center rounded-xl text-slate-700" aria-label="Open journey help"><CircleHelp className="h-5 w-5" /></button>
            </div>
          </div>
          <nav className="mt-5 flex gap-8 border-b border-slate-200 text-[13px] font-semibold text-slate-600">
            {["All Journeys", "Structured", "Unstructured", "Hybrid", "My Work"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-2 pb-3 ${activeTab === tab ? "border-orange-600 text-orange-600" : "border-transparent hover:text-slate-950"}`}>{tab}</button>
            ))}
          </nav>
          <p className="mt-3 text-[13px] text-slate-700">Portfolio view of all data journeys across the platform.</p>
        </section>

        <section className="journey-kpi-grid">
          {portfolioMetrics.map((metric) => <PortfolioMetric key={metric.title} {...metric} onClick={() => setFlow(metricFlow(metric.title, metric.value))} />)}
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <label className="relative h-11 min-w-[260px] flex-1 max-[900px]:min-w-full">
            <input className="h-full w-full rounded-lg border border-slate-200 bg-white pl-4 pr-11 text-sm shadow-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search journeys..." />
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          </label>
          <FilterSelect label="Type: All" onClick={() => setFlow(filterFlow("journey type"))} />
          <FilterSelect label="Domain: All" onClick={() => setFlow(filterFlow("domain"))} />
          <FilterSelect label="Owner: All" onClick={() => setFlow(filterFlow("owner"))} />
          <FilterSelect label="Status: All" onClick={() => setFlow(filterFlow("status"))} />
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button onClick={() => setFlow(filterFlow("date range"))} className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm">
              May 07, 2025 - Jun 06, 2025 <CalendarDays className="h-4 w-4 text-slate-500" />
            </button>
            <button onClick={() => setFlow(newJourneyFlow)} className="flex h-11 items-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-bold text-white shadow-sm">
              <Plus className="h-4 w-4" /> New Journey
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-[15px] font-bold text-slate-950">Journey Inventory (42)</h2>
          </div>
          <JourneyInventory onSelect={() => setDrawer({ type: "journey", id: "jr-claims-modernization" })} />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>Showing 1 to 5 of 42 journeys</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setFlow(paginationFlow)} className="grid h-8 min-w-8 place-items-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-600"><ChevronLeft className="h-4 w-4" /></button>
              {["1", "2", "3", "4", "5", "...", "9"].map((item) => (
                <button key={item} onClick={() => setFlow(paginationFlow)} className={`grid h-8 min-w-8 place-items-center rounded-md border text-sm font-semibold ${item === "1" ? "border-orange-600 bg-orange-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{item}</button>
              ))}
              <button onClick={() => setFlow(paginationFlow)} className="grid h-8 min-w-8 place-items-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-600"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-3">
            <div>
              <h2 className="text-[16px] font-extrabold text-slate-950">Selected Journey: {selected.name}</h2>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-600">
                <span><b>Type:</b> {selected.type}</span>
                <span><b>Domain:</b> {selected.domain}</span>
                <span><b>Owner:</b> {selected.owner}</span>
                <span><b>Start Date:</b> May 20, 2025</span>
                <span><b>Target Go-Live:</b> Jun 30, 2025</span>
                <span className="flex items-center gap-3"><b>Overall Progress:</b> 48% <MiniProgress value={48} /></span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDrawer({ type: "journey", id: "jr-claims-modernization" })} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[11px] font-bold text-slate-800">View Journey Details</button>
              <button onClick={() => setFlow(journeyActionsFlow)} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[11px] font-bold text-slate-800">Actions <ChevronDown className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[13px] font-bold text-slate-950">Journey Pipeline Canvas</h3>
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-600">
                <Legend color="bg-emerald-500" label="Complete" />
                <Legend color="bg-orange-600" label="In Progress" />
                <Legend color="bg-amber-500" label="Pending" />
                <Legend color="bg-slate-300" label="Not Started" />
              </div>
            </div>
            <div className="journey-pipeline-grid">
              {pipelineStages.map((stage, index) => (
                <div key={stage.title} className="contents">
                  <PipelineStage index={index + 1} title={stage.title} state={stage.state} />
                  {index < pipelineStages.length - 1 ? <PipelineArrow /> : null}
                </div>
              ))}
            </div>
          </div>
          <div className="journey-detail-grid border-t border-slate-200">
            <DetailPanel title="Stage 3: Data Modeling & Transformation">
              <div className="space-y-2.5">
                {executionTargets.map((target, index) => (
                  <div key={target.label} className="grid grid-cols-[105px_1fr] items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-2 text-slate-500">{index === 0 ? <Database className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}{target.label}</span>
                    <b className="min-w-0 text-slate-700">{target.value}</b>
                  </div>
                ))}
                <button onClick={() => setFlow(configurationFlow)} className="pt-1 text-[12px] font-bold text-blue-600">View full configuration</button>
              </div>
            </DetailPanel>
            <DetailPanel title="Stage Progress">
              <div className="space-y-2.5">
                {stageProgress.map((item) => <StatusLine key={item.item} {...item} />)}
              </div>
            </DetailPanel>
            <DetailPanel title="Key Artifacts">
              <div className="space-y-2.5">
                {artifacts.map((artifact) => (
                  <div key={artifact.name} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="flex min-w-0 items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-500" /><b className="truncate text-slate-700">{artifact.name}</b></span>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">{artifact.tag}</span>
                  </div>
                ))}
              </div>
            </DetailPanel>
            <DetailPanel title="Stage Summary">
              <div className="space-y-2">
                {summary.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="min-w-0 text-slate-600">{label}</span>
                    <b className="text-slate-800">{value}</b>
                  </div>
                ))}
                <button onClick={() => setFlow(stageLogsFlow)} className="pt-1 text-[12px] font-bold text-blue-600">View stage logs</button>
              </div>
            </DetailPanel>
            <DetailPanel title="Approvals">
              <div className="space-y-2.5">
                <ApprovalCount label="Pending" value="1" tone="orange" />
                <ApprovalCount label="Approved" value="2" tone="green" />
                <button onClick={() => setDrawer({ type: "approval", id: "ap-schema-change" })} className="text-[12px] font-bold text-blue-600">View all approvals</button>
              </div>
            </DetailPanel>
          </div>
        </section>
      </div>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
      <DemoFlowModal flow={flow} onClose={() => setFlow(null)} />
    </>
  );
}

const newJourneyFlow: DemoFlow = {
  title: "Start New Data Journey",
  description: "Creates an end-to-end journey from source onboarding through publishing and consumption.",
  steps: ["Choose journey type, domain, and owner.", "Select source systems, target environment, and templates.", "Generate tasks, checkpoints, and governance approvals."],
  primaryAction: "Create journey",
};

const journeyActionsFlow: DemoFlow = {
  title: "Journey Actions",
  description: "Runs operational actions for the selected journey.",
  steps: ["Pause, resume, or rerun the active stage.", "Request approval, attach artifacts, or publish stage outputs.", "Notify stakeholders and write the journey audit trail."],
  primaryAction: "Run action",
};

const configurationFlow: DemoFlow = {
  title: "Full Configuration",
  description: "Shows execution target, orchestration, repository, and environment configuration for the current stage.",
  steps: ["Inspect cloud target and compute settings.", "Review orchestration and repository links.", "Validate security, secrets, and deployment policy."],
  primaryAction: "Open configuration",
};

const stageLogsFlow: DemoFlow = {
  title: "Stage Logs",
  description: "Opens execution logs and generated artifacts for the current journey stage.",
  steps: ["Review latest run status and processing metrics.", "Inspect warnings, failed records, and retries.", "Export logs or create remediation tasks."],
  primaryAction: "Open logs",
};

const journeyHelpFlow: DemoFlow = {
  title: "Journey Help",
  description: "Provides contextual help for creating and operating data journeys.",
  steps: ["Search help by journey stage or task.", "Open recommended templates and guardrails.", "Contact a platform steward with the current journey context."],
  primaryAction: "Open help center",
};

const paginationFlow: DemoFlow = {
  title: "Journey Pagination",
  description: "Loads additional journey inventory pages while preserving filters and selected journey context.",
  steps: ["Keep active filters and search text.", "Fetch the selected result page.", "Update the inventory and keep the selected journey available for drill-down."],
  primaryAction: "Load page",
};

function selectionFlow(label: string, value: string): DemoFlow {
  return {
    title: `Change ${label}`,
    description: `Switches the current ${label.toLowerCase()} from ${value} and refreshes journey data for the demo.`,
    steps: ["Show available options for the current user.", "Validate access and environment compatibility.", "Refresh metrics, inventory, and selected journey details."],
    primaryAction: `Switch ${label.toLowerCase()}`,
  };
}

function metricFlow(title: string, value: string): DemoFlow {
  return {
    title,
    description: `Opens the journey portfolio slice behind the ${value} ${title.toLowerCase()} metric.`,
    steps: ["Apply the relevant inventory filters.", "Show trend, owners, and affected journeys.", "Open a journey or export the metric view for review."],
    primaryAction: "Open metric detail",
  };
}

function filterFlow(label: string): DemoFlow {
  return {
    title: `Filter by ${label}`,
    description: `Narrows the journey inventory by ${label} while keeping the demo dataset connected.`,
    steps: ["Show available values with counts.", "Apply the selected filter to inventory and metrics.", "Keep selected journey details synchronized."],
    primaryAction: "Apply filter",
  };
}

function TopSelect({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex h-12 min-w-[150px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left shadow-sm">
      <span>
        <span className="block text-[11px] font-semibold text-slate-500">{label}</span>
        <b className="block text-[13px] text-slate-950">{value}</b>
      </span>
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

function PortfolioMetric({ title, value, delta, icon: Icon, tone, negative, chart, onClick }: { title: string; value: string; delta: string; icon: LucideIcon; tone: keyof typeof toneMap; negative?: boolean; chart?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-[90px] items-center gap-3 rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-card">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <b className="block text-[12px] leading-4 text-slate-950">{title}</b>
        <span className="mt-1 block text-[26px] font-extrabold leading-none text-slate-950">{value}</span>
        <span className={`mt-2 block text-[11px] font-bold leading-4 ${negative ? "text-orange-600" : "text-emerald-600"}`}>{delta}</span>
      </span>
      {chart ? <svg className="hidden h-9 w-16 shrink-0 min-[1500px]:block" viewBox="0 0 96 44" fill="none" aria-hidden="true"><path d="M2 34 L18 25 L32 28 L45 19 L61 22 L74 14 L94 19" stroke="#dcfce7" strokeWidth="8" strokeLinecap="round" /><path d="M2 32 L18 23 L32 26 L45 17 L61 20 L74 12 L94 17" stroke="#16a34a" strokeWidth="3" /></svg> : null}
    </button>
  );
}

function FilterSelect({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex h-11 min-w-[150px] items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm">{label}<ChevronDown className="h-4 w-4" /></button>;
}

function formatInventoryDate(value: string) {
  return value.replace(", 2025", "").replace(" AM", "").replace(" PM", "");
}

function JourneyInventory({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="text-[12px]">
      <div className="journey-inventory-row hidden items-center border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold text-slate-500 xl:grid">
        <span>Journey Name</span>
        <span>Type</span>
        <span>Domain</span>
        <span>Owner</span>
        <span>Current Stage</span>
        <span>Progress</span>
        <span>Status</span>
        <span>Last Updated</span>
        <span>Health</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-slate-100">
        {journeys.map((journey, index) => (
          <button key={journey.name} onClick={onSelect} className={`w-full px-4 py-2.5 text-left transition hover:bg-orange-50/60 ${index === 0 ? "border-y border-orange-200 bg-orange-50/30" : "bg-white"}`}>
            <div className="journey-inventory-row hidden items-center xl:grid">
              <span className="flex min-w-0 items-center gap-2">
                <Star className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                <GitFork className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                <b className="truncate text-[12px] text-slate-900" title={journey.name}>{journey.name}</b>
              </span>
              <TypeBadge type={journey.type} />
              <span className="truncate text-[12px] text-slate-700" title={journey.domain}>{journey.domain}</span>
              <Owner initials={journey.initials} name={journey.owner} />
              <span className="truncate text-[12px] text-slate-700" title={journey.stage}>{journey.stage}</span>
              <MiniProgress value={journey.progress} />
              <StatusText status={journey.status as JourneyStatus} />
              <span className="truncate text-[11px] text-slate-600" title={journey.updated}>{formatInventoryDate(journey.updated)}</span>
              <Health health={journey.health as JourneyHealth} />
              <MoreVertical className="mx-auto h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="grid gap-3 xl:hidden">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0"><b className="block truncate text-slate-950">{journey.name}</b><span className="text-xs text-slate-500">{journey.domain} · {journey.stage}</span></span>
                <TypeBadge type={journey.type} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Owner initials={journey.initials} name={journey.owner} />
                <MiniProgress value={journey.progress} />
                <StatusText status={journey.status as JourneyStatus} />
                <Health health={journey.health as JourneyHealth} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const classes = type === "Hybrid" ? "bg-purple-50 text-purple-700 border-purple-200" : type === "Structured" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return <span className={`w-fit max-w-full truncate rounded-md border px-1.5 py-0.5 text-[10px] font-bold leading-4 ${classes}`}>{type}</span>;
}

function Owner({ initials, name }: { initials: string; name: string }) {
  return <span className="flex min-w-0 items-center gap-1.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-600 text-[10px] font-bold text-white">{initials}</span><span className="truncate text-[12px] text-slate-700">{name}</span></span>;
}

function MiniProgress({ value }: { value: number }) {
  return (
    <span className="flex min-w-[82px] items-center gap-1.5">
      <b className="w-7 text-[11px] text-slate-600">{value}%</b>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-orange-500" style={{ width: `${value}%` }} /></span>
    </span>
  );
}

function StatusText({ status }: { status: JourneyStatus }) {
  const color = status === "Running" ? "text-emerald-600" : "text-orange-600";
  return <b className={`truncate text-[11px] ${color}`} title={status}>{status}</b>;
}

function Health({ health }: { health: JourneyHealth }) {
  const color = health === "Healthy" ? "bg-emerald-500 text-emerald-600" : "bg-amber-500 text-orange-600";
  return <span className={`flex items-center gap-1.5 truncate text-[11px] font-bold ${color.split(" ")[1]}`} title={health}><span className={`h-2 w-2 shrink-0 rounded-full ${color.split(" ")[0]}`} />{health}</span>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>;
}

function PipelineStage({ index, title, state }: { index: number; title: string; state: StageState }) {
  const complete = state === "Complete";
  const running = state === "Running";
  const pending = state === "Pending Review";
  return (
    <div className={`relative min-h-[76px] rounded-lg border bg-white p-2 shadow-sm ${running ? "border-orange-300 ring-1 ring-orange-200" : "border-slate-200"}`}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${complete ? "bg-emerald-500 text-white" : running ? "bg-orange-500 text-white" : pending ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-700"}`}>
          {complete ? <Check className="h-3 w-3" /> : index}
        </span>
        <b className="text-[11px] text-slate-950">{index}</b>
      </div>
      <h4 className="text-center text-[10px] font-bold leading-[13px] text-slate-950">{title}</h4>
      <p className={`mt-1.5 text-center text-[10px] font-bold ${complete ? "text-emerald-600" : running || pending ? "text-orange-600" : "text-slate-500"}`}>{state}</p>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="journey-pipeline-arrow hidden items-center justify-center xl:flex" aria-hidden="true">
      <ArrowRight className="h-5 w-5 text-slate-800" />
    </div>
  );
}

function DetailPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="border-b border-slate-200 p-3 last:border-b-0 min-[1500px]:border-b-0 min-[1500px]:border-r"><h3 className="mb-2.5 text-[12px] font-bold text-slate-950">{title}</h3>{children}</div>;
}

function StatusLine({ item, status }: { item: string; status: string }) {
  const done = status === "Complete";
  const active = status === "In Progress";
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="flex min-w-0 items-center gap-2"><Check className={`h-3.5 w-3.5 ${done || active ? "text-emerald-600" : "text-slate-400"}`} /><span className="truncate text-slate-700">{item}</span></span>
      <span className={`flex shrink-0 items-center gap-2 font-semibold ${done ? "text-emerald-600" : active ? "text-orange-600" : "text-slate-500"}`}>{status}<span className={`h-3 w-3 rounded-full border ${done ? "border-emerald-500 bg-emerald-500" : active ? "border-orange-500" : "border-slate-300"}`} /></span>
    </div>
  );
}

function ApprovalCount({ label, value, tone }: { label: string; value: string; tone: "orange" | "green" }) {
  return <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px]"><span>{label}</span><b className={`text-lg ${tone === "orange" ? "text-orange-600" : "text-emerald-600"}`}>{value}</b></div>;
}
