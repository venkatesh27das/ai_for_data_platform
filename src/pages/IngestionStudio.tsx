import {
  Activity,
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code2,
  Database,
  File,
  FileUp,
  Folder,
  HardDrive,
  MoreVertical,
  Play,
  Plus,
  Radio,
  Server,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Tone = "orange" | "blue" | "purple" | "green" | "red" | "slate";

const toneMap: Record<Tone, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  red: "border-red-100 bg-red-50 text-red-600",
  slate: "border-slate-100 bg-slate-50 text-slate-600",
};

const metrics = [
  { title: "Active Pipelines", value: "12", detail: "2 vs yesterday", icon: Boxes, tone: "orange" },
  { title: "Connected Sources", value: "28", detail: "4 vs yesterday", icon: Database, tone: "blue" },
  { title: "Today's Runs", value: "146", detail: "18 vs yesterday", icon: Activity, tone: "purple" },
  { title: "Success Rate", value: "98.2%", detail: "1.3% vs yesterday", icon: CheckCircle2, tone: "green" },
] as const;

const sourceTypes = [
  { title: "Cloud Storage", detail: "S3, ADLS, GCS", icon: Cloud, tone: "orange", recommended: true },
  { title: "Databases", detail: "SQL, NoSQL, Warehouse", icon: Database, tone: "blue" },
  { title: "SaaS Apps", detail: "Salesforce, Veeva, SAP", icon: Cloud, tone: "blue" },
  { title: "APIs", detail: "REST, GraphQL, Webhooks", icon: Code2, tone: "purple" },
  { title: "File Uploads", detail: "CSV, JSON, PDF, DOC", icon: FileUp, tone: "green" },
  { title: "Streaming", detail: "Kafka, Event Hubs", icon: Radio, tone: "orange" },
] as const;

const pipelines = [
  { name: "Claims Batch Intake", source: "ADLS", sourceIcon: Folder, zone: "Bronze", zoneTone: "bg-orange-500", status: "Running", schedule: "Hourly", updated: "8 min ago" },
  { name: "CRM Sync", source: "Salesforce", sourceIcon: Cloud, zone: "Silver", zoneTone: "bg-slate-400", status: "Healthy", schedule: "Daily", updated: "20 min ago" },
  { name: "Research Docs Loader", source: "S3", sourceIcon: Server, zone: "Bronze", zoneTone: "bg-orange-500", status: "Review", schedule: "On-demand", updated: "1 hr ago" },
  { name: "Provider Master Feed", source: "SQL Server", sourceIcon: Database, zone: "Silver", zoneTone: "bg-slate-400", status: "Queued", schedule: "Daily", updated: "2 hr ago" },
  { name: "Audit Archive Import", source: "File Upload", sourceIcon: FileUp, zone: "Bronze", zoneTone: "bg-orange-500", status: "Failed", schedule: "Weekly", updated: "5 hr ago" },
] as const;

const connectors = [
  { name: "ADLS", icon: Folder, tone: "blue" },
  { name: "S3", icon: Server, tone: "orange" },
  { name: "Snowflake", icon: HardDrive, tone: "blue" },
  { name: "SQL Server", icon: Database, tone: "red" },
  { name: "Salesforce", icon: Cloud, tone: "blue" },
  { name: "SharePoint", icon: Boxes, tone: "green" },
  { name: "Kafka", icon: Radio, tone: "slate" },
  { name: "Databricks", icon: Boxes, tone: "red" },
] as const;

const health = [
  { title: "Schema Validation Passed", value: "96%", width: "96%", color: "bg-emerald-500", icon: ShieldCheck, tone: "green" },
  { title: "Freshness SLA Met", value: "93%", width: "93%", color: "bg-blue-500", icon: Activity, tone: "blue" },
  { title: "Failed Runs", value: "3", width: "18%", color: "bg-red-300", icon: AlertCircle, tone: "red" },
  { title: "Pending Reviews", value: "5", width: "16%", color: "bg-orange-300", icon: Radio, tone: "orange" },
] as const;

const templates = [
  { title: "Incremental File Loader", detail: "Ingest files incrementally to Bronze zone", icon: File, tone: "blue" },
  { title: "API to Bronze Pipeline", detail: "Pull data from APIs to Bronze zone", icon: Code2, tone: "green" },
  { title: "CDC Database Sync", detail: "Sync database changes to target zone", icon: ShieldCheck, tone: "orange" },
] as const;

const activity = [
  { title: "Claims Batch Intake deployed", detail: "Pipeline deployed successfully by Priya N.", time: "8 min ago", color: "bg-emerald-500" },
  { title: "New connector added: SharePoint", detail: "Connector configured by Alex M.", time: "1 hr ago", color: "bg-emerald-500" },
  { title: "Research Docs Loader moved to Review", detail: "Requires schema mapping review.", time: "2 hr ago", color: "bg-blue-500" },
  { title: "Audit Archive Import run failed", detail: "3 files failed during processing.", time: "5 hr ago", color: "bg-red-400" },
] as const;

export default function IngestionStudio() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<{ title: string; detail: string; action?: string } | null>(null);
  const openModal = (title: string, detail: string, action = "Done") => setModal({ title, detail, action });

  return (
    <>
      <div className="ingestion-studio-grid items-start">
        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-card">
        <div className="text-[12px] font-semibold text-slate-600">
          <button onClick={() => navigate("/studios")} className="hover:text-orange-600">Studios</button>
          <span className="mx-2 text-slate-300">/</span>
          <span>Ingestion Studio</span>
        </div>
        <div className="mt-3">
          <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Ingestion Studio</h1>
          <p className="mt-2 text-[13px] font-medium leading-5 text-slate-700">Design, manage, and monitor ingestion pipelines for structured, semi-structured, and unstructured data sources.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <StudioButton primary icon={Plus} label="Create Ingestion Pipeline" onClick={() => navigate("/studios/ingestion/create")} />
          <StudioButton icon={Boxes} label="Browse Connectors" onClick={() => openModal("Connector Browser", "Browse connected and available sources, filter by cloud, status, authentication mode, and owner.", "Open connector catalog")} />
          <StudioButton icon={Play} label="Resume Draft" onClick={() => navigate("/studios/ingestion/create")} />
          <StudioButton icon={Upload} label="Import Config" onClick={() => openModal("Import Pipeline Config", "Upload a YAML or JSON pipeline definition, validate it, and convert it into a draft ingestion pipeline.", "Import config")} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 min-[900px]:grid-cols-2 min-[1450px]:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.title} {...metric} onClick={() => openModal(metric.title, `${metric.value} total. Trend is up ${metric.detail}; open the filtered operational view to inspect the underlying pipelines and runs.`, "Open view")} />)}
        </div>

        <StudioPanel title="Start with a Source Type" className="mt-5">
          <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1450px]:grid-cols-3">
            {sourceTypes.map((source) => <SourceTypeCard key={source.title} {...source} onClick={() => navigate("/studios/ingestion/create")} />)}
          </div>
        </StudioPanel>

        <StudioPanel title="Recent Ingestion Pipelines" className="mt-4" flush>
          <div className="overflow-x-auto">
            <div className="min-w-[780px]">
              <div className="ingestion-pipeline-row grid border-b border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                <span>Pipeline Name</span><span>Source</span><span>Target Zone</span><span>Status</span><span>Schedule</span><span>Updated</span><span />
              </div>
              <div className="divide-y divide-slate-100">
                {pipelines.map((pipeline) => <PipelineRow key={pipeline.name} {...pipeline} onClick={() => openModal(pipeline.name, `${pipeline.source} pipeline is ${pipeline.status.toLowerCase()} and runs ${pipeline.schedule.toLowerCase()}. Last updated ${pipeline.updated}.`, "Open pipeline details")} />)}
              </div>
            </div>
          </div>
          <div className="flex justify-end px-4 py-3">
            <button onClick={() => openModal("All Ingestion Pipelines", "Showing all active, queued, review, and failed ingestion pipelines with filters for source, zone, status, and owner.", "Open pipeline list")} className="inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-600 hover:text-orange-600">View all pipelines <ArrowRight className="h-4 w-4" /></button>
          </div>
        </StudioPanel>
      </section>

      <aside className="space-y-4">
        <StudioPanel title="Popular Connectors" action="View all" onAction={() => openModal("All Connectors", "Connector catalog includes ADLS, S3, Snowflake, SQL Server, Salesforce, SharePoint, Kafka, Databricks, and more.", "Open catalog")}>
          <div className="grid grid-cols-1 gap-2 min-[1180px]:grid-cols-2">
            {connectors.map((connector) => <ConnectorCard key={connector.name} {...connector} onClick={() => openModal(`${connector.name} Connector`, "Connection is healthy. You can inspect credentials, owner, access scope, schema samples, freshness, and recent pipeline usage.", "Open connector")} />)}
          </div>
        </StudioPanel>

        <StudioPanel title="Ingestion Health">
          <div className="space-y-4">
            {health.map((item) => <HealthRow key={item.title} {...item} onClick={() => openModal(item.title, `Current value is ${item.value}. Open the health drilldown to review impacted pipelines, rules, and recent events.`, "Open health drilldown")} />)}
          </div>
        </StudioPanel>

        <StudioPanel title="Recommended Templates" action="View all" onAction={() => openModal("Template Library", "Browse reusable ingestion templates and launch one as a configured pipeline draft.", "Open templates")}>
          <div className="divide-y divide-slate-100">
            {templates.map((template) => <TemplateRow key={template.title} {...template} onClick={() => navigate("/studios/ingestion/create")} />)}
          </div>
        </StudioPanel>

        <StudioPanel title="Studio Activity" action="View all" onAction={() => openModal("Studio Activity", "Audit stream for ingestion deployments, connector changes, review transitions, and failed runs.", "Open activity log")}>
          <div className="space-y-4">
            {activity.map((item) => <ActivityRow key={item.title} {...item} onClick={() => openModal(item.title, `${item.detail} Occurred ${item.time}.`, "Open event")} />)}
          </div>
        </StudioPanel>
      </aside>
      </div>
      {modal ? <InfoDialog {...modal} onClose={() => setModal(null)} /> : null}
    </>
  );
}

function StudioPanel({ title, action, children, className = "", flush = false, onAction }: { title: string; action?: string; children: React.ReactNode; className?: string; flush?: boolean; onAction?: () => void }) {
  return (
    <section className={`overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className={`flex items-center justify-between gap-3 ${flush ? "px-4 py-3" : "p-4 pb-3"}`}>
        <h2 className="text-[15px] font-extrabold text-slate-950">{title}</h2>
        {action ? <button onClick={onAction} className="text-[12px] font-extrabold text-slate-700 hover:text-orange-600">{action}</button> : null}
      </div>
      <div className={flush ? "" : "px-4 pb-4"}>{children}</div>
    </section>
  );
}

function StudioButton({ icon: Icon, label, primary = false, onClick }: { icon: LucideIcon; label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-extrabold shadow-sm transition hover:-translate-y-0.5 ${primary ? "orange-gradient border-orange-500 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-orange-200 hover:text-orange-600"}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function MetricCard({ title, value, detail, icon: Icon, tone, onClick }: { title: string; value: string; detail: string; icon: LucideIcon; tone: Tone; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid min-h-[96px] grid-cols-[52px_1fr] items-center gap-4 rounded-[10px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
      <span className={`grid h-12 w-12 place-items-center rounded-[10px] border ${toneMap[tone]}`}><Icon className="h-7 w-7" /></span>
      <span>
        <span className="block text-[12px] font-bold text-slate-500">{title}</span>
        <b className="mt-1 block text-[25px] leading-none text-slate-950">{value}</b>
        <span className="mt-2 block text-[11px] font-extrabold text-emerald-600">↑ {detail}</span>
      </span>
    </button>
  );
}

function SourceTypeCard({ title, detail, icon: Icon, tone, recommended, onClick }: { title: string; detail: string; icon: LucideIcon; tone: Tone; recommended?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`relative grid min-h-[78px] grid-cols-[54px_1fr] items-center gap-3 rounded-[10px] border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-card ${recommended ? "border-orange-300 bg-orange-50/35" : "border-slate-200 bg-white hover:border-orange-200"}`}>
      {recommended ? <span className="absolute right-3 top-3 rounded-md border border-orange-200 bg-orange-100 px-1.5 py-0.5 text-[9px] font-extrabold text-orange-700">Recommended</span> : null}
      <span className={`grid h-11 w-11 place-items-center rounded-[10px] border ${toneMap[tone]}`}><Icon className="h-7 w-7" /></span>
      <span className="min-w-0">
        <b className="block text-[13px] text-slate-950">{title}</b>
        <span className="mt-1 block text-[12px] font-medium text-slate-600">{detail}</span>
      </span>
    </button>
  );
}

function PipelineRow({ name, source, sourceIcon: SourceIcon, zone, zoneTone, status, schedule, updated, onClick }: { name: string; source: string; sourceIcon: LucideIcon; zone: string; zoneTone: string; status: string; schedule: string; updated: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="ingestion-pipeline-row grid w-full items-center px-4 py-3 text-left transition hover:bg-orange-50/40">
      <span className="flex min-w-0 items-center gap-3">
        <File className="h-4 w-4 shrink-0 text-slate-500" />
        <b className="truncate text-[12px] text-slate-900">{name}</b>
      </span>
      <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-600"><SourceIcon className="h-4 w-4 text-blue-500" />{source}</span>
      <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-600"><span className={`h-2 w-2 rounded-full ${zoneTone}`} />{zone}</span>
      <StatusPill status={status} />
      <span className="text-[12px] font-semibold text-slate-600">{schedule}</span>
      <span className="text-[12px] font-semibold text-slate-600">{updated}</span>
      <MoreVertical className="h-4 w-4 justify-self-end text-slate-400" />
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles = status === "Running" || status === "Healthy"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : status === "Review"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : status === "Queued"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";
  return <span className={`w-fit rounded-md border px-3 py-1 text-[11px] font-extrabold ${styles}`}>{status}</span>;
}

function ConnectorCard({ name, icon: Icon, tone, onClick }: { name: string; icon: LucideIcon; tone: Tone; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid min-h-[48px] grid-cols-[34px_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-orange-200">
      <span className={`grid h-8 w-8 place-items-center rounded-md ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{name}</b>
        <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Connected</span>
      </span>
    </button>
  );
}

function HealthRow({ title, value, width, color, icon: Icon, tone, onClick }: { title: string; value: string; width: string; color: string; icon: LucideIcon; tone: Tone; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[18px_minmax(0,1fr)_minmax(66px,.62fr)_30px] items-center gap-2 rounded-md text-left transition hover:bg-orange-50/40">
      <Icon className={`h-4 w-4 ${tone === "green" ? "text-emerald-600" : tone === "blue" ? "text-blue-600" : tone === "red" ? "text-red-500" : "text-orange-500"}`} />
      <span className="text-[12px] font-bold leading-4 text-slate-700">{title}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full ${color}`} style={{ width }} /></span>
      <b className="text-right text-[12px] text-slate-950">{value}</b>
    </button>
  );
}

function TemplateRow({ title, detail, icon: Icon, tone, onClick }: { title: string; detail: string; icon: LucideIcon; tone: Tone; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[34px_1fr_auto] items-center gap-3 py-2 text-left hover:bg-orange-50/30">
      <span className={`grid h-8 w-8 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{title}</b>
        <span className="block truncate text-[11px] font-medium text-slate-500">{detail}</span>
      </span>
      <span className="whitespace-nowrap text-[11px] font-extrabold text-blue-600">Use Template</span>
    </button>
  );
}

function ActivityRow({ title, detail, time, color, onClick }: { title: string; detail: string; time: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[14px_1fr_auto] items-start gap-3 text-left">
      <span className={`mt-1.5 h-2 w-2 rounded-full ${color}`} />
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{title}</b>
        <span className="block truncate text-[11px] font-medium text-slate-500">{detail}</span>
      </span>
      <span className="whitespace-nowrap text-[11px] font-semibold text-slate-500">{time}</span>
    </button>
  );
}

function InfoDialog({ title, detail, action = "Done", onClose }: { title: string; detail: string; action?: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4">
      <section className="w-full max-w-[460px] rounded-[14px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-slate-950">{title}</h2>
            <p className="mt-2 text-[13px] font-medium leading-5 text-slate-600">{detail}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-800">Close</button>
          <button onClick={onClose} className="h-10 rounded-lg px-5 text-[13px] font-extrabold text-white orange-gradient">{action}</button>
        </div>
      </section>
    </div>
  );
}
