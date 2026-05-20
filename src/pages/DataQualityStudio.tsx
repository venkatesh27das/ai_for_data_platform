import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Grid2X2,
  Link,
  MoreVertical,
  Play,
  Plus,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Tone = "green" | "purple" | "red" | "blue" | "amber" | "orange" | "teal";

const toneMap: Record<Tone, string> = {
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  red: "border-red-100 bg-red-50 text-red-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  amber: "border-amber-100 bg-amber-50 text-amber-600",
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  teal: "border-cyan-100 bg-cyan-50 text-cyan-700",
};

const metrics = [
  { title: "Active Rule Sets", value: "48", detail: "+8 vs yesterday", icon: ShieldCheck, tone: "green" },
  { title: "Monitored Datasets", value: "26", detail: "+3 vs yesterday", icon: Database, tone: "purple" },
  { title: "Critical Alerts", value: "7", detail: "+2 vs yesterday", icon: AlertTriangle, tone: "red", danger: true },
  { title: "SLA Compliance", value: "97.8%", detail: "+1.2% vs last 7 days", icon: Target, tone: "blue" },
  { title: "Last Scan Coverage", value: "92%", detail: "+2% vs yesterday", icon: ClipboardCheck, tone: "amber" },
] as const;

const domains = [
  { title: "Completeness", detail: "Validate missing values, null thresholds, and required fields", icon: SearchCheck, tone: "green", templates: "12 templates", active: "8 active" },
  { title: "Accuracy", detail: "Check business rules, reference conformity, and logic consistency", icon: Target, tone: "purple", templates: "15 templates", active: "6 active" },
  { title: "Timeliness", detail: "Monitor latency, freshness, and pipeline SLA adherence", icon: ClipboardCheck, tone: "orange", templates: "9 templates", active: "4 active" },
  { title: "Consistency", detail: "Detect schema drift, duplicate entities, and cross-source mismatch", icon: Link, tone: "teal", templates: "11 templates", active: "5 active" },
] as const;

const workflows = [
  { workflow: "Claims Completeness Audit", dataset: "Claims Bronze", status: "Running", score: 96, updated: "8m ago" },
  { workflow: "Provider Master Validation", dataset: "Provider Gold", status: "Review", score: 89, updated: "32m ago" },
  { workflow: "Policy Reference Check", dataset: "Policy Metadata", status: "Passed", score: 98, updated: "1h ago" },
  { workflow: "Contract Drift Monitor", dataset: "Contracts Silver", status: "Alert", score: 72, updated: "2h ago" },
] as const;

const templates = [
  { title: "PII Compliance Rule Pack", tag: "Governance", rules: "12 rules", icon: ShieldCheck, tone: "green" },
  { title: "Schema Drift Detection", tag: "Reliability", rules: "9 rules", icon: Grid2X2, tone: "purple" },
  { title: "Freshness SLA Monitor", tag: "Monitoring", rules: "7 rules", icon: ClipboardCheck, tone: "orange" },
] as const;

const alerts = [
  { title: "Claims Bronze - Missing required field", severity: "Critical", time: "8m ago" },
  { title: "Provider Feed - Stale reference file", severity: "Warning", time: "32m ago" },
  { title: "Policy API - Schema change detected", severity: "Info", time: "1h ago" },
] as const;

const coverage = [
  { label: "Structured", value: 95, color: "bg-emerald-500" },
  { label: "Semi-structured", value: 82, color: "bg-orange-500" },
  { label: "Unstructured", value: 68, color: "bg-blue-500" },
] as const;

export default function DataQualityStudio() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<{ title: string; detail: string; action?: string } | null>(null);
  const openModal = (title: string, detail: string, action = "Open") => setModal({ title, detail, action });

  return (
    <>
      <div className="data-quality-layout items-start">
        <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-card">
          <div className="text-[12px] font-semibold text-slate-600">
            <button onClick={() => navigate("/studios")} className="hover:text-orange-600">Studios</button>
            <span className="mx-2 text-slate-300">/</span>
            <span>Data Quality Studio</span>
          </div>
          <div className="mt-3">
            <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Data Quality Studio</h1>
            <p className="mt-2 text-[13px] font-medium leading-5 text-slate-700">Define rules, monitor data health, and operationalize trust across structured and unstructured assets.</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <StudioButton primary icon={Plus} label="Create Rule Set" onClick={() => navigate("/studios/data-quality/create")} />
            <StudioButton icon={Grid2X2} label="Browse Templates" onClick={() => openModal("Template Library", "Browse reusable data quality templates for completeness, accuracy, timeliness, consistency, governance, and monitoring.", "Open templates")} />
            <StudioButton icon={Play} label="Run Profiling" onClick={() => openModal("Run Profiling", "Profile selected datasets for schema health, value distributions, nulls, duplicates, outliers, and freshness issues.", "Run profile")} />
            <StudioButton icon={UploadCloud} label="Import Rules" onClick={() => openModal("Import Rules", "Import rule packs from YAML, JSON, or catalog exports and validate them against HealthCorp production assets.", "Import rules")} />
          </div>

          <div className="mt-5 data-quality-metric-grid">
            {metrics.map((metric) => <MetricCard key={metric.title} {...metric} onClick={() => openModal(metric.title, `${metric.value} current value. ${metric.detail}. Open the filtered quality dashboard to inspect contributing assets and alerts.`, "View details")} />)}
          </div>

          <QualityPanel title="Quality Domains" className="mt-4">
            <div className="grid grid-cols-1 gap-3 min-[980px]:grid-cols-2">
              {domains.map((domain) => <DomainCard key={domain.title} {...domain} onClick={() => openModal(domain.title, `${domain.detail}. Includes ${domain.templates} with ${domain.active}.`, "Open domain")} />)}
            </div>
          </QualityPanel>

          <QualityPanel title="Active Quality Workflows" className="mt-4" flush>
            <div className="overflow-x-auto">
              <div className="min-w-[780px]">
                <div className="data-quality-workflow-row grid border-b border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                  <span>Workflow</span><span>Dataset</span><span>Status</span><span>Score</span><span>Updated</span><span>Action</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {workflows.map((workflow) => <WorkflowRow key={workflow.workflow} {...workflow} onClick={() => openModal(workflow.workflow, `${workflow.dataset} is ${workflow.status.toLowerCase()} with a ${workflow.score} quality score. Last updated ${workflow.updated}.`, "Open workflow")} />)}
                </div>
              </div>
            </div>
          </QualityPanel>

          <QualityPanel title="Recent Templates" action="View all templates" className="mt-4" onAction={() => openModal("Recent Templates", "Open the full template catalog with filters for domain, owner, asset type, severity, and cloud.", "View catalog")}>
            <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
              {templates.map((template) => <TemplateCard key={template.title} {...template} onClick={() => openModal(template.title, `Launch ${template.rules} for ${template.tag.toLowerCase()} workflows and save the configured rule pack as a reusable template.`, "Use template")} />)}
            </div>
          </QualityPanel>
        </section>

        <aside className="space-y-4">
          <QualityPanel title="Quality Insights">
            <InsightBox icon={AlertTriangle} title="Top Issues" tone="red">
              <IssueList items={["Missing provider IDs in 12 datasets", "Stale reference files in 5 pipelines", "Duplicate contract records detected"]} />
            </InsightBox>
            <InsightBox icon={Bell} title="Recent Alerts" action="View all" tone="slate" className="mt-3">
              <div className="space-y-3">
                {alerts.map((alert) => <AlertRow key={alert.title} {...alert} onClick={() => openModal(alert.title, `${alert.severity} alert created ${alert.time}. Review linked rules, owner, and remediation actions.`, "Open alert")} />)}
              </div>
            </InsightBox>
          </QualityPanel>

          <QualityPanel title="Rule Coverage by Asset Type" icon={BarChart3}>
            <div className="space-y-4">
              {coverage.map((item) => <CoverageRow key={item.label} {...item} />)}
            </div>
          </QualityPanel>

          <QualityPanel title="Recommendations" icon={Sparkles}>
            <div className="space-y-3">
              {["Add timeliness check for provider feed", "Promote Claims Completeness Audit as reusable template", "Increase rule coverage for unstructured assets"].map((item) => (
                <button key={item} onClick={() => openModal("Recommendation", item, "Apply recommendation")} className="grid w-full grid-cols-[22px_1fr] gap-2 rounded-lg text-left text-[12px] font-semibold leading-4 text-slate-700 hover:text-orange-600">
                  <Sparkles className="mt-0.5 h-4 w-4 text-purple-500" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </QualityPanel>
        </aside>
      </div>
      {modal ? <InfoDialog {...modal} onClose={() => setModal(null)} /> : null}
    </>
  );
}

function QualityPanel({ title, icon: Icon, action, children, className = "", flush = false, onAction }: { title: string; icon?: LucideIcon; action?: string; children: React.ReactNode; className?: string; flush?: boolean; onAction?: () => void }) {
  return (
    <section className={`overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className={`flex items-center justify-between gap-3 ${flush ? "px-4 py-3" : "p-4 pb-3"}`}>
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950">{Icon ? <Icon className="h-4 w-4 text-slate-600" /> : null}{title}</h2>
        {action ? <button onClick={onAction} className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-slate-700 hover:text-orange-600">{action}<ArrowRight className="h-3.5 w-3.5" /></button> : null}
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

function MetricCard({ title, value, detail, icon: Icon, tone, danger = false, onClick }: { title: string; value: string; detail: string; icon: LucideIcon; tone: Tone; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid min-h-[90px] grid-cols-[46px_1fr] items-center gap-3 rounded-[10px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
      <span className={`grid h-10 w-10 place-items-center rounded-[10px] border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-bold text-slate-500">{title}</span>
        <b className="mt-1 block text-[23px] leading-none text-slate-950">{value}</b>
        <span className={`mt-2 block truncate text-[11px] font-extrabold ${danger ? "text-red-600" : "text-emerald-600"}`}>{detail}</span>
      </span>
    </button>
  );
}

function DomainCard({ title, detail, icon: Icon, tone, templates, active, onClick }: { title: string; detail: string; icon: LucideIcon; tone: Tone; templates: string; active: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid min-h-[106px] grid-cols-[58px_1fr] items-center gap-4 rounded-[10px] border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
      <span className={`grid h-12 w-12 place-items-center rounded-[10px] border ${toneMap[tone]}`}><Icon className="h-6 w-6" /></span>
      <span className="min-w-0">
        <b className="block text-[13px] text-slate-950">{title}</b>
        <span className="mt-2 block text-[12px] font-medium leading-4 text-slate-600">{detail}</span>
        <span className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-600">
          <span className="inline-flex items-center gap-1"><Grid2X2 className="h-3.5 w-3.5" />{templates}</span>
          <span className="h-3 w-px bg-slate-200" />
          <span>{active}</span>
        </span>
      </span>
    </button>
  );
}

function WorkflowRow({ workflow, dataset, status, score, updated, onClick }: { workflow: string; dataset: string; status: string; score: number; updated: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="data-quality-workflow-row grid w-full items-center px-4 py-3 text-left transition hover:bg-orange-50/40">
      <b className="truncate text-[12px] text-slate-950">{workflow}</b>
      <span className="truncate text-[12px] font-semibold text-slate-700">{dataset}</span>
      <StatusPill status={status} />
      <span className="grid grid-cols-[34px_minmax(0,1fr)] items-center gap-3">
        <b className="text-[12px] text-slate-950">{score}</b>
        <span className="h-1.5 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full ${score < 80 ? "bg-orange-500" : score < 92 ? "bg-blue-500" : "bg-emerald-500"}`} style={{ width: `${score}%` }} /></span>
      </span>
      <span className="text-[12px] font-semibold text-slate-600">{updated}</span>
      <MoreVertical className="h-4 w-4 justify-self-end text-slate-400" />
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles = status === "Running" || status === "Passed"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : status === "Review"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-red-200 bg-red-50 text-red-700";
  return <span className={`w-fit rounded-md border px-3 py-1 text-[11px] font-extrabold ${styles}`}>{status}</span>;
}

function TemplateCard({ title, tag, rules, icon: Icon, tone, onClick }: { title: string; tag: string; rules: string; icon: LucideIcon; tone: Tone; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid min-h-[74px] grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[10px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
      <span className={`grid h-10 w-10 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{title}</b>
        <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-[10px] font-extrabold ${tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "purple" ? "bg-purple-50 text-purple-700" : "bg-orange-50 text-orange-700"}`}>{tag}</span>
      </span>
      <span className="whitespace-nowrap text-[11px] font-bold text-slate-600">{rules}</span>
    </button>
  );
}

function InsightBox({ icon: Icon, title, action, tone, className = "", children }: { icon: LucideIcon; title: string; action?: string; tone: "red" | "slate"; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-[10px] border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-slate-950"><Icon className={`h-4 w-4 ${tone === "red" ? "text-red-500" : "text-slate-700"}`} />{title}</h3>
        {action ? <button className="text-[11px] font-extrabold text-slate-600 hover:text-orange-600">{action}</button> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function IssueList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button key={item} className="grid w-full grid-cols-[14px_1fr] items-start gap-2 text-left text-[12px] font-semibold leading-4 text-slate-700 hover:text-orange-600">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          <span>{item}</span>
        </button>
      ))}
    </div>
  );
}

function AlertRow({ title, severity, time, onClick }: { title: string; severity: string; time: string; onClick?: () => void }) {
  const styles = severity === "Critical" ? "border-red-200 bg-red-50 text-red-700" : severity === "Warning" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-blue-200 bg-blue-50 text-blue-700";
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 text-left">
      <span className="truncate text-[12px] font-semibold text-slate-700">{title}</span>
      <span className={`rounded-md border px-2 py-1 text-[10px] font-extrabold ${styles}`}>{severity}</span>
      <span className="whitespace-nowrap text-[11px] font-semibold text-slate-500">{time}</span>
    </button>
  );
}

function CoverageRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="grid grid-cols-[96px_1fr_42px] items-center gap-3">
      <span className="text-[12px] font-semibold text-slate-700">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></span>
      <b className="text-right text-[12px] text-slate-950">{value}%</b>
    </div>
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
