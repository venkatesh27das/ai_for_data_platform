import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Cloud,
  Code2,
  FileText,
  Grid2X2,
  Image,
  MoreVertical,
  Network,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import EntityDrawer from "../components/common/EntityDrawer";
import ProgressBar from "../components/common/ProgressBar";
import StatusBadge from "../components/common/StatusBadge";
import { recommendations, studioSessions } from "../data/mockData";
import type { DrawerEntity, StudioSession } from "../types";

type StudioTone = "orange" | "blue" | "green" | "purple" | "amber" | "teal" | "red";

const toneMap: Record<StudioTone, string> = {
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  teal: "bg-cyan-50 text-cyan-700 border-cyan-100",
  red: "bg-red-50 text-red-600 border-red-100",
};

const studios = [
  { name: "Ingestion Studio", icon: UploadCloud, description: "Ingest data from any source at any scale with observability.", templates: "23 Templates", active: "4 Active", updated: "2 days ago", tone: "orange" },
  { name: "Processing & Extraction Studio", icon: Boxes, description: "Extract, transform and prepare structured and unstructured data.", templates: "31 Templates", active: "6 Active", updated: "1 day ago", tone: "blue" },
  { name: "Data Quality Studio", icon: ShieldCheck, description: "Define rules, profile data and ensure trust and reliability.", templates: "18 Templates", active: "3 Active", updated: "3 days ago", tone: "green" },
  { name: "Data Product Studio", icon: Grid2X2, description: "Package data assets as products with governance and SLAs.", templates: "27 Templates", active: "5 Active", updated: "1 day ago", tone: "purple" },
  { name: "Semantic Studio", icon: Network, description: "Build semantic models and enable universal understanding.", templates: "16 Templates", active: "4 Active", updated: "2 days ago", tone: "amber" },
  { name: "Migration Studio", icon: Cloud, description: "Migrate workloads and modernize pipelines across platforms.", templates: "20 Templates", active: "2 Active", updated: "4 days ago", tone: "teal" },
] as const;

const capabilities = [
  { title: "Data Engineering", detail: "Pipelines, ETL/ELT, Orchestration", icon: FileText, tone: "red" },
  { title: "Unstructured AI", detail: "NLP, OCR, Vision, Multimodal", icon: ShieldCheck, tone: "blue" },
  { title: "Quality & Reliability", detail: "Data Quality, Observability, Monitoring", icon: ShieldCheck, tone: "green" },
  { title: "Productization", detail: "Data Products, APIs, Catalog, SLA", icon: Network, tone: "amber" },
  { title: "Semantic Enablement", detail: "Ontologies, Models, Business Glossary", icon: Network, tone: "purple" },
  { title: "Modernization", detail: "Migrations, Refactoring, Platform Upgrades", icon: Cloud, tone: "teal" },
] as const;

const insightMetrics = [
  ["Active Studios", "6", "All systems live"],
  ["Running Sessions", "14", "+2 vs yesterday"],
  ["Template Library", "135", "+12 this week"],
  ["Success Rate", "96.4%", "2.1% vs last 7 days"],
  ["Connected Tools", "28", "Across any cloud"],
  ["AI Assist Availability", "99.7%", "Excellent"],
] as const;

const templates = [
  { title: "PDF-to-Data Product Pipeline", detail: "Extract, transform and publish PDFs as trusted data products.", uses: "1.2K uses", icon: FileText, tone: "red" },
  { title: "Legacy SQL to PySpark Migration", detail: "Automate SQL assessment and convert to optimized PySpark.", uses: "987 uses", icon: Code2, tone: "blue" },
  { title: "Semantic Layer Starter", detail: "Kickstart semantic models with best-practice domains and metrics.", uses: "756 uses", icon: Network, tone: "purple" },
  { title: "Gold Data Product Certification", detail: "End-to-end workflow for certifying data products for consumption.", uses: "643 uses", icon: ShieldCheck, tone: "green" },
  { title: "Multimodal Extraction Pipeline", detail: "Extract text, tables and images from documents and classify.", uses: "1.1K uses", icon: Image, tone: "teal" },
] as const;

const activity = [
  { title: 'Data Product "Claims Summary" certified', detail: "Data Product Studio", time: "20m ago", icon: CheckCircle2, tone: "green" },
  { title: 'Semantic model "Provider Domain" updated', detail: "Semantic Studio", time: "1h ago", icon: Grid2X2, tone: "purple" },
  { title: 'Ingestion job "Policy_Documents" completed', detail: "Ingestion Studio", time: "2h ago", icon: UploadCloud, tone: "orange" },
  { title: 'Extraction pipeline "Invoice OCR" deployed', detail: "Processing & Extraction Studio", time: "3h ago", icon: Boxes, tone: "blue" },
] as const;

export default function Studios() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);

  return (
    <>
      <div className="space-y-4">
        <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-card">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Studios</h1>
            <p className="text-[13px] text-slate-700">Launch specialized workspaces to build, govern, and operationalize structured and unstructured data assets.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <StudioAction primary icon={Plus} label="Launch New Studio" />
            <StudioAction icon={Grid2X2} label="Browse Templates" />
            <StudioAction icon={Play} label="Resume Last Session" />
            <StudioAction icon={UserPlus} label="Create Workspace" />
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <SectionTitle title="Featured Studios" action="View all studios" />
            <div className="studios-feature-grid mt-3">
              {studios.map((studio) => <StudioCard key={studio.name} {...studio} />)}
            </div>
          </div>
        </section>

        <section className="studios-mid-grid">
          <DashboardPanel title="Browse by Capability">
            <div className="grid grid-cols-1 gap-2.5 min-[1500px]:grid-cols-2">
              {capabilities.map((capability) => <CapabilityCard key={capability.title} {...capability} />)}
            </div>
            <PanelLink label="View all capabilities" />
          </DashboardPanel>

          <DashboardPanel title="Active Studio Sessions" action="View all sessions">
            <div className="overflow-hidden rounded-[12px] border border-slate-100">
              <div className="studios-session-row grid border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <span>Session</span><span>Studio</span><span>Status</span><span>Progress</span><span>Updated</span><span />
              </div>
              <div className="divide-y divide-slate-100">
                {studioSessions.map((session) => (
                  <button key={session.id} onClick={() => setDrawer({ type: "studio", id: session.id })} className="studios-session-row grid w-full items-center px-3 py-2.5 text-left transition hover:bg-orange-50/40">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                      <b className="truncate text-[12px] text-slate-800">{session.name}</b>
                    </span>
                    <StudioIcon name={session.studioType} />
                    <StatusBadge status={session.status} />
                    <span className="min-w-0">
                      <ProgressBar value={session.progress} />
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{session.lastUpdated}</span>
                    <MoreVertical className="h-4 w-4 justify-self-end text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
            <PanelLink label="Go to all sessions" />
          </DashboardPanel>

          <DashboardPanel title="Workspace Insights">
            <div className="grid grid-cols-3 gap-2.5 max-[1500px]:grid-cols-2 max-[1180px]:grid-cols-3 max-[760px]:grid-cols-2">
              {insightMetrics.map(([title, value, detail]) => <InsightCard key={title} title={title} value={value} detail={detail} />)}
            </div>
            <PanelLink label="View full health dashboard" />
          </DashboardPanel>
        </section>

        <section className="studios-bottom-grid">
          <DashboardPanel title="Recommended Templates" action="View all templates">
            <div className="grid grid-cols-1 gap-2.5 min-[1500px]:grid-cols-3 min-[1800px]:grid-cols-5">
              {templates.map((template) => <TemplateCard key={template.title} {...template} />)}
            </div>
          </DashboardPanel>

          <DashboardPanel title="AI Recommendations">
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((recommendation) => (
                <button key={recommendation.id} className="flex w-full items-center gap-3 rounded-[10px] border border-slate-100 bg-white px-3 py-2 text-left shadow-sm transition hover:border-orange-200">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600"><Sparkles className="h-[18px] w-[18px]" /></span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[12px] text-slate-900">{recommendation.title}</b>
                    <span className="block truncate text-[11px] text-slate-500">{recommendation.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
            <PanelLink label="View all recommendations" />
          </DashboardPanel>

          <DashboardPanel title="Recent Activity" action="View all activity">
            <div className="space-y-2">
              {activity.map((item) => <ActivityRow key={item.title} {...item} />)}
            </div>
          </DashboardPanel>
        </section>
      </div>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}

function StudioAction({ icon: Icon, label, primary = false }: { icon: LucideIcon; label: string; primary?: boolean }) {
  return (
    <button className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-bold shadow-sm transition hover:-translate-y-0.5 ${primary ? "orange-gradient border-orange-500 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-orange-200 hover:text-orange-600"}`}>
      <Icon className="h-[18px] w-[18px]" /> {label}
    </button>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950">{title}<span className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-[10px] text-slate-400">i</span></h2>
      {action ? <button className="flex items-center gap-2 text-[12px] font-bold text-slate-700 hover:text-orange-600">{action}<ArrowRight className="h-4 w-4" /></button> : null}
    </div>
  );
}

function DashboardPanel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-slate-200 bg-white p-3 shadow-card">
      <SectionTitle title={title} action={action} />
      <div className="mt-3 flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

function StudioCard({ name, icon: Icon, description, templates, active, updated, tone }: { name: string; icon: LucideIcon; description: string; templates: string; active: string; updated: string; tone: StudioTone }) {
  return (
    <button className="min-h-[148px] rounded-[10px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
      <div className={`grid h-11 w-11 place-items-center rounded-[10px] border ${toneMap[tone]}`}><Icon className="h-6 w-6" /></div>
      <h3 className="mt-2 text-[14px] font-extrabold leading-snug text-slate-950">{name}</h3>
      <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-slate-600">{description}</p>
      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-600">
        <span className="flex items-center gap-1"><Grid2X2 className="h-3.5 w-3.5" />{templates}</span>
        <span className="h-4 w-px bg-slate-100" />
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{active}</span>
      </div>
      <p className="mt-2 text-[10px] font-medium text-slate-500">Last updated: {updated}</p>
    </button>
  );
}

function CapabilityCard({ title, detail, icon: Icon, tone }: { title: string; detail: string; icon: LucideIcon; tone: StudioTone }) {
  return (
    <button className="grid min-h-[94px] grid-cols-[38px_1fr] items-start gap-3 rounded-[10px] border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-orange-200 hover:bg-white min-[1500px]:min-h-[104px]">
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 pt-0.5">
        <b className="block min-h-8 text-[12px] leading-4 text-slate-950">{title}</b>
        <span className="mt-1 block line-clamp-3 text-[11px] leading-4 text-slate-600">{detail}</span>
      </span>
    </button>
  );
}

function InsightCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-[10px] border border-slate-100 bg-white p-3 text-center shadow-sm">
      <p className="text-[11px] font-semibold text-slate-600">{title}</p>
      <p className="mt-1 text-[22px] font-extrabold leading-none text-slate-950">{value}</p>
      <p className="mt-2 text-[10px] font-bold text-emerald-600">{detail}</p>
    </div>
  );
}

function TemplateCard({ title, detail, uses, icon: Icon, tone }: { title: string; detail: string; uses: string; icon: LucideIcon; tone: StudioTone }) {
  return (
    <button className="grid min-h-[174px] grid-rows-[36px_40px_48px_1fr] rounded-[10px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-orange-200">
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <b className="mt-2 line-clamp-2 text-[12px] leading-4 text-slate-950">{title}</b>
      <span className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-600">{detail}</span>
      <span className="self-end flex items-center justify-between pt-3 text-[10px] font-bold text-slate-500">
        {uses}
        <span className="rounded-md bg-orange-50 px-2 py-1 text-orange-600">Popular</span>
      </span>
    </button>
  );
}

function ActivityRow({ title, detail, time, icon: Icon, tone }: { title: string; detail: string; time: string; icon: LucideIcon; tone: StudioTone }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-[10px] bg-slate-50/80 px-3 py-2 text-left transition hover:bg-orange-50/50">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[12px] text-slate-900">{title}</b>
        <span className="block truncate text-[11px] text-slate-500">{detail}</span>
      </span>
      <span className="text-[11px] font-semibold text-slate-500">{time}</span>
    </button>
  );
}

function StudioIcon({ name }: { name: string }) {
  const studio = studios.find((item) => item.name === name) ?? studios[0];
  const Icon = studio.icon;
  return <Icon className={`h-[18px] w-[18px] ${studio.tone === "orange" ? "text-orange-600" : studio.tone === "blue" ? "text-blue-600" : studio.tone === "green" ? "text-emerald-600" : studio.tone === "purple" ? "text-purple-600" : studio.tone === "amber" ? "text-amber-600" : "text-cyan-700"}`} />;
}

function PanelLink({ label }: { label: string }) {
  return (
    <div className="mt-auto flex justify-center pt-3">
      <button className="flex items-center gap-2 text-[12px] font-bold text-orange-600 hover:text-orange-700">{label}<ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}
