import {
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  Cloud,
  Database,
  DollarSign,
  FileText,
  Gauge,
  Layers,
  Network,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UploadCloud,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import EntityDrawer from "../components/common/EntityDrawer";
import ProgressBar from "../components/common/ProgressBar";
import { activeJourneys, dataProducts } from "../data/mockData";
import type { DataProduct, DrawerEntity } from "../types";

const metricCards = [
  { title: "Active Journeys", value: "28", delta: "↑ 14%", note: "vs last 30 days", icon: Rocket, color: "orange" },
  { title: "Published Products", value: "124", delta: "↑ 18%", note: "vs last 30 days", icon: Box, color: "orange" },
  { title: "Quality Score", value: "93", suffix: "/100", delta: "↑ 6 pts", note: "vs last 30 days", icon: ShieldCheck, color: "green" },
  { title: "Open Issues", value: "16", delta: "↓ 11%", note: "vs last 30 days", icon: TriangleAlert, color: "orange" },
  { title: "Reusable Assets", value: "352", delta: "↑ 22%", note: "vs last 30 days", icon: Layers, color: "orange" },
  { title: "Cloud Connections", value: "7", delta: "Healthy", note: "All connected", icon: Cloud, color: "blue" },
  { title: "AI Recommendations", value: "23", delta: "New", note: "View suggestions", icon: Sparkles, color: "purple" },
  { title: "Monthly Cost", value: "$48.7K", delta: "↓ 8%", note: "vs last month", icon: DollarSign, color: "orange" },
] as const;

const launchTiles = [
  { title: "Data Journey Studio", description: "Orchestrate end-to-end data engineering workflows", icon: Workflow },
  { title: "Migrate to Modernize", description: "Assess, migrate, and modernize legacy data workloads", icon: UploadCloud },
  { title: "Ingestion Studio", description: "Connect sources and enrich ingestion at scale", icon: Database },
  { title: "Processing & Extraction Studio", description: "Process, enrich, and extract structured & unstructured data", icon: Gauge },
  { title: "Data Quality Studio", description: "Validate data quality and monitor data reliability", icon: ShieldCheck },
  { title: "Data Product Hub", description: "Publish, version, and manage trusted data products", icon: Box },
  { title: "Context & Semantic Hub", description: "Build business context and semantic layers", icon: Network },
  { title: "Consumption Portal", description: "Discover, access, and use data assets", icon: Users },
] as const;

const pendingActions = [
  { title: "Review data quality alerts for Claims Gold Dataset", tag: "Data Quality", time: "2h ago", icon: TriangleAlert },
  { title: "Approve contract schema changes", tag: "Governance", time: "5h ago", icon: TriangleAlert },
  { title: "Re-run failed ingestion: HPC APACMy Feed", tag: "Ingestion", time: "18h ago", icon: ShieldCheck },
  { title: "Update semantic terms in Provider Domain", tag: "Semantic", time: "2d ago", icon: Sparkles },
] as const;

const aiRecommendations = [
  { title: "Enable data re-partitioning in 5 of 7 datasets", subtitle: "", badge: "High Impact", tone: "orange", icon: FileText },
  { title: "Create data product from Customer 360 model", subtitle: "High reuse potential identified", badge: "Recommended", tone: "green", icon: FileText },
  { title: "Optimize storage for 2 datasets", subtitle: "Potential monthly savings: $2.2K", badge: "Cost Saving", tone: "green", icon: FileText },
] as const;

const ecosystem = [
  { vendor: "Microsoft Azure", detail: "East US", logo: "A", logoClass: "text-blue-600", status: "Healthy" },
  { vendor: "Amazon Web Services", detail: "us-west-1", logo: "aws", logoClass: "text-slate-800", status: "Healthy" },
  { vendor: "Databricks", detail: "Workspace: hc-prod", logo: "◆", logoClass: "text-red-500", status: "Healthy" },
  { vendor: "Snowflake", detail: "Account: HCACPROD", logo: "✣", logoClass: "text-sky-500", status: "Healthy" },
  { vendor: "Catalog Sync", detail: "Unity Catalog", logo: "⬡", logoClass: "text-slate-600", status: "Healthy" },
  { vendor: "LLM Gateway", detail: "OpenAI / Azure OpenAI", logo: "⬡", logoClass: "text-slate-600", status: "Healthy" },
  { vendor: "Vector Store", detail: "Pinecone", logo: "⬡", logoClass: "text-slate-600", status: "Healthy" },
] as const;

const logoStrip = [
  { name: "aws", className: "text-slate-900" },
  { name: "Microsoft Azure", className: "text-slate-700" },
  { name: "Google Cloud", className: "text-slate-700" },
  { name: "databricks", className: "text-slate-700" },
  { name: "snowflake", className: "text-sky-500" },
  { name: "Power BI", className: "text-slate-700" },
] as const;

const iconTone: Record<string, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
};

const bandTone: Record<string, { accent: string; icon: string; chip: string; surface: string }> = {
  orange: {
    accent: "bg-orange-500",
    icon: "border-orange-100 bg-orange-50 text-orange-600",
    chip: "bg-orange-50 text-orange-700",
    surface: "bg-gradient-to-b from-orange-50/55 to-white",
  },
  blue: {
    accent: "bg-blue-500",
    icon: "border-blue-100 bg-blue-50 text-blue-600",
    chip: "bg-blue-50 text-blue-700",
    surface: "bg-gradient-to-b from-blue-50/55 to-white",
  },
  green: {
    accent: "bg-emerald-500",
    icon: "border-emerald-100 bg-emerald-50 text-emerald-600",
    chip: "bg-emerald-50 text-emerald-700",
    surface: "bg-gradient-to-b from-emerald-50/45 to-white",
  },
  purple: {
    accent: "bg-purple-500",
    icon: "border-purple-100 bg-purple-50 text-purple-600",
    chip: "bg-purple-50 text-purple-700",
    surface: "bg-gradient-to-b from-purple-50/45 to-white",
  },
};

export default function Home() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const recent = ["dp-claims-gold", "dp-provider-contract", "dp-customer-360", "dp-hcp-activity"].map((id) => dataProducts.find((p) => p.id === id)!);

  return (
    <>
      <section className="relative overflow-hidden rounded-[18px] border border-orange-100 bg-white px-6 py-6 min-[1400px]:px-9 min-[1400px]:py-7 shadow-card">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -bottom-20 left-[20%] h-56 w-[46%] rounded-[50%] border border-orange-200/60" />
          <div className="absolute -right-20 bottom-0 h-52 w-96 rounded-[50%] border-[18px] border-dotted border-orange-300/35" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_45%,rgba(255,122,26,.12),transparent_28%),linear-gradient(135deg,transparent_0%,rgba(255,122,26,.06)_100%)]" />
        </div>
        <div className="relative grid grid-cols-[1fr_.9fr] items-center gap-4 min-[1400px]:grid-cols-[1.05fr_.95fr] min-[1400px]:gap-7">
          <div>
            <h1 className="max-w-[720px] text-[34px] font-extrabold leading-[1.08] tracking-normal text-slate-950 min-[1400px]:text-[44px]">
              Build trusted data products from any source, on any cloud
            </h1>
            <p className="mt-4 max-w-[690px] text-[15px] leading-7 text-slate-600">
              AI-assisted workflows for structured and unstructured data across the entire data engineering journey-from ingestion to intelligent consumption.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <HeroButton primary icon={Plus} label="Start New Data Journey" />
              <HeroButton icon={UploadCloud} label="Migrate to Workload" />
              <HeroButton icon={Box} label="Create Data Product" />
              <HeroButton icon={BookOpen} label="Explore Catalog" />
            </div>
            <div className="mt-5 grid max-w-[690px] grid-cols-6 items-center divide-x divide-slate-100 rounded-lg border border-slate-200 bg-white/95 px-2 py-2 text-center text-[13px] font-semibold text-slate-700 shadow-sm">
              {logoStrip.map((logo) => (
                <span key={logo.name} className={`truncate px-3 ${logo.className}`}>{logo.name}</span>
              ))}
            </div>
          </div>
          <HeroDiagram />
        </div>
      </section>

      <GroupBand title="Platform KPIs" detail="8 live signals" badge="Overview" icon={Gauge} tone="orange">
        <section className="grid grid-cols-4 gap-3 min-[1600px]:grid-cols-8">
          {metricCards.map((metric) => <MetricTile key={metric.title} {...metric} />)}
        </section>
      </GroupBand>

      <GroupBand title="Studios & Workbenches" detail="8 entry points" badge="Launch" icon={Workflow} tone="blue">
        <section className="grid grid-cols-4 gap-3 min-[1600px]:grid-cols-8">
          {launchTiles.map((tile) => <LaunchTile key={tile.title} {...tile} />)}
        </section>
      </GroupBand>

      <GroupBand title="Operational Cockpit" detail="Journeys, actions, recommendations, health" badge="Monitor" icon={ShieldCheck} tone="green">
        <section className="grid grid-cols-2 gap-3 min-[1600px]:grid-cols-[1.02fr_1.1fr_1fr_.98fr]">
          <Panel title="My Active Journeys">
            <div className="space-y-3">
              {activeJourneys.map((journey, index) => (
                <button key={journey.id} onClick={() => setDrawer({ type: "journey", id: journey.id })} className="grid w-full grid-cols-[30px_1fr_92px_70px] items-center gap-3 text-left">
                  <span className={`grid h-7 w-7 place-items-center rounded-md border ${index === 0 ? "border-blue-100 bg-blue-50 text-blue-600" : "border-emerald-100 bg-emerald-50 text-emerald-600"}`}>
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate text-[12px] text-slate-950">{journey.name}</b>
                    <span className="block truncate text-[11px] text-slate-500">{journey.stage}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <ProgressBar value={journey.progress} />
                    <b className="w-8 text-right text-[11px] text-slate-700">{journey.progress}%</b>
                  </span>
                  <span className="text-right text-[11px] font-medium text-slate-500">{journey.dueDate}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Pending Actions">
            <div className="divide-y divide-slate-100">
              {pendingActions.map(({ title, tag, time, icon: Icon }) => (
                <button key={title} className="grid w-full grid-cols-[22px_1fr_74px_48px] items-center gap-2 py-2 text-left">
                  <Icon className="h-4 w-4 text-orange-500" />
                  <span className="truncate text-[12px] font-medium text-slate-700">{title}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-center text-[10px] font-semibold text-slate-500">{tag}</span>
                  <span className="text-right text-[11px] text-slate-500">{time}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="AI Recommendations">
            <div className="divide-y divide-slate-100">
              {aiRecommendations.map(({ title, subtitle, badge, tone, icon: Icon }) => (
                <button key={title} className="grid w-full grid-cols-[24px_1fr_88px] items-center gap-2 py-2 text-left">
                  <Icon className="h-4 w-4 text-emerald-600" />
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium text-slate-700">{title}</span>
                    {subtitle ? <span className="block truncate text-[11px] text-slate-500">{subtitle}</span> : null}
                  </span>
                  <span className={`rounded-md px-2 py-1 text-center text-[10px] font-bold ${tone === "orange" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>{badge}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Platform Health / Connected Ecosystem">
            <div className="divide-y divide-slate-100">
              {ecosystem.map((service) => (
                <div key={service.vendor} className="grid grid-cols-[34px_1fr_112px_70px] items-center gap-2 py-2 text-[12px]">
                  <span className={`font-extrabold ${service.logoClass}`}>{service.logo}</span>
                  <b className="truncate text-slate-800">{service.vendor}</b>
                  <span className="truncate text-[11px] text-slate-500">{service.detail}</span>
                  <span className="flex items-center justify-end gap-1 font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />{service.status}</span>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </GroupBand>

      <GroupBand title="Published Data Products" detail="Recently certified and draft assets" badge="Catalog" icon={Box} tone="purple" action={<button className="flex items-center gap-1 text-[12px] font-semibold text-slate-700">View catalog <ArrowRight className="h-3.5 w-3.5" /></button>}>
        <div className="grid grid-cols-2 gap-4 min-[1600px]:grid-cols-4">
          {recent.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onClick={() => setDrawer({ type: "product", id: product.id })} />
          ))}
        </div>
      </GroupBand>

      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}

function HeroButton({ icon: Icon, label, primary = false }: { icon: LucideIcon; label: string; primary?: boolean }) {
  return (
    <button className={`flex h-10 items-center gap-2 rounded-md border px-5 text-[13px] font-bold shadow-sm transition hover:-translate-y-0.5 ${primary ? "border-orange-600 bg-orange-600 text-white" : "border-orange-300 bg-white text-orange-600"}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function GroupBand({ title, detail, badge, icon: Icon, tone, action, children }: { title: string; detail: string; badge: string; icon: LucideIcon; tone: keyof typeof bandTone; action?: React.ReactNode; children: React.ReactNode }) {
  const toneClasses = bandTone[tone];
  return (
    <section className={`relative mt-3 overflow-hidden rounded-[18px] border border-slate-200 p-3 shadow-card ${toneClasses.surface}`}>
      <div className={`absolute left-0 top-0 h-full w-1 ${toneClasses.accent}`} />
      <div className="mb-3 flex items-center justify-between gap-3 pl-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${toneClasses.icon}`}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-extrabold text-slate-950">{title}</h2>
            <p className="truncate text-[11px] font-medium text-slate-500">{detail}</p>
          </div>
          <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold min-[1280px]:inline-flex ${toneClasses.chip}`}>
            {badge}
          </span>
        </div>
        {action ?? null}
      </div>
      {children}
    </section>
  );
}

function HeroDiagram() {
  return (
    <div className="relative h-[230px] min-w-[430px] min-[1400px]:h-[250px] min-[1400px]:min-w-[520px]">
      <div className="absolute left-1/2 top-3 -translate-x-1/2 text-center">
        <b className="block text-[13px] text-slate-950">AI-Assisted</b>
        <span className="text-[12px] text-slate-500">Automation & Insights</span>
      </div>
      <div className="absolute left-1/2 top-[96px] z-10 -translate-x-1/2 text-center">
        <span className="block text-[16px] font-semibold text-slate-800">AI for Data</span>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <b className="block text-[13px] text-slate-950">Trusted & Governed</b>
        <span className="text-[12px] text-slate-500">Quality • Security • Compliance</span>
      </div>
      <div className="absolute left-0 top-[103px] text-right min-[1400px]:left-[34px]">
        <b className="block text-[13px] text-slate-950">Any Source</b>
        <span className="text-[12px] text-slate-500">Structured &<br />Unstructured</span>
      </div>
      <div className="absolute right-0 top-[109px] text-left min-[1400px]:right-[8px]">
        <b className="block text-[13px] text-slate-950">Any Consumption</b>
        <span className="text-[12px] text-slate-500">People • Apps • AI</span>
      </div>
      <div className="absolute left-[96px] top-[91px] z-20 grid h-[52px] w-[52px] place-items-center rounded-full border border-orange-100 bg-white text-orange-600 shadow-card min-[1400px]:left-[150px]">
        <Database className="h-6 w-6" />
      </div>
      <div className="absolute right-[138px] top-[91px] z-20 grid h-[52px] w-[52px] place-items-center rounded-full border border-orange-100 bg-white text-slate-700 shadow-card min-[1400px]:right-[128px]">
        <Users className="h-6 w-6" />
      </div>
      <div className="absolute left-1/2 top-[50px] z-20 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border border-orange-100 bg-white text-orange-500 shadow-card">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="absolute bottom-[48px] left-1/2 z-20 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border border-orange-100 bg-white text-orange-500 shadow-card">
        <Box className="h-5 w-5" />
      </div>
      <svg className="absolute left-[58px] top-[48px] h-[150px] w-[320px] overflow-visible min-[1400px]:left-[118px]" viewBox="0 0 320 150" fill="none" aria-hidden="true">
        <path d="M160 75 C108 -8 22 0 22 75 C22 150 108 158 160 75 C212 -8 298 0 298 75 C298 150 212 158 160 75Z" stroke="#ff6b18" strokeWidth="3" />
        <path d="M160 75 C108 -8 22 0 22 75 C22 150 108 158 160 75 C212 -8 298 0 298 75 C298 150 212 158 160 75Z" stroke="#ff8a3d" strokeWidth="14" strokeOpacity=".13" />
        <path d="M160 75 C108 12 46 16 46 75 C46 134 108 138 160 75 C212 12 274 16 274 75 C274 134 212 138 160 75Z" stroke="#ff6b18" strokeWidth="1.6" strokeOpacity=".75" />
      </svg>
    </div>
  );
}

function MetricTile({ title, value, suffix, delta, note, icon: Icon, color }: { title: string; value: string; suffix?: string; delta: string; note: string; icon: LucideIcon; color: keyof typeof iconTone }) {
  return (
    <button className="rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-orange-200 min-[1400px]:p-4">
      <div className="flex items-start gap-2 min-[1400px]:gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border min-[1400px]:h-9 min-[1400px]:w-9 ${iconTone[color]}`}>
          <Icon className="h-4 w-4 min-[1400px]:h-5 min-[1400px]:w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-bold text-slate-900 min-[1400px]:text-[12px]">{title}</span>
          <span className="mt-1 flex items-end gap-1">
            <span className="text-[22px] font-bold leading-none text-slate-950 min-[1400px]:text-[24px]">{value}</span>
            {suffix ? <span className="pb-0.5 text-[12px] font-semibold text-slate-500">{suffix}</span> : null}
            <span className={`pb-0.5 text-[12px] font-bold ${delta.includes("New") ? "text-purple-600" : "text-emerald-600"}`}>{delta}</span>
          </span>
          <span className="mt-2 block truncate text-[11px] font-medium text-slate-500">{note}</span>
        </span>
      </div>
    </button>
  );
}

function LaunchTile({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <button className="group flex min-h-[82px] items-start gap-2 rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-orange-200 min-[1400px]:min-h-[92px] min-[1400px]:gap-3 min-[1400px]:p-4">
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-slate-500 group-hover:text-orange-600 min-[1400px]:h-7 min-[1400px]:w-7" />
      <span className="min-w-0 flex-1">
        <b className="block text-[11px] leading-4 text-slate-950 min-[1400px]:text-[12px] min-[1400px]:leading-5">{title}</b>
        <span className="mt-1 block text-[10px] leading-4 text-slate-500 min-[1400px]:text-[11px]">{description}</span>
      </span>
      <ArrowRight className="mt-auto h-3.5 w-3.5 shrink-0 text-orange-500 min-[1400px]:h-4 min-[1400px]:w-4" />
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[214px] rounded-[14px] border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-slate-950">{title}</h2>
        <button className="text-[11px] font-semibold text-slate-700">View all</button>
      </div>
      {children}
    </div>
  );
}

function ProductCard({ product, index, onClick }: { product: DataProduct; index: number; onClick: () => void }) {
  const colors = ["bg-purple-600", "bg-orange-500", "bg-blue-600", "bg-purple-500"];
  const visibleMethods = product.id === "dp-hcp-activity" ? ["API", "Vector"] : product.consumptionMethods.slice(0, 3);

  return (
    <button onClick={onClick} className="min-h-[158px] rounded-[14px] border border-slate-200 bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-orange-200">
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-white ${colors[index]}`}>
          {index === 2 ? <Users className="h-6 w-6" /> : index === 3 ? <Sparkles className="h-6 w-6" /> : <Database className="h-6 w-6" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <b className="line-clamp-1 text-[13px] text-slate-950">{product.name}</b>
            <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${product.status === "Draft" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>{product.status}</span>
          </span>
          <span className="mt-2 block line-clamp-2 text-[12px] leading-5 text-slate-500">{product.description}</span>
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[12px] font-medium text-slate-600">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-emerald-200 text-emerald-600"><Gauge className="h-4 w-4" /></span>
          Quality Score
        </span>
        <span className="flex gap-2">
          {visibleMethods.map((method) => <span key={method} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">{method}</span>)}
        </span>
      </div>
    </button>
  );
}
