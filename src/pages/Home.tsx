import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Box,
  CloudUpload,
  Database,
  FileText,
  Gauge,
  HeartPulse,
  Link2,
  MoreVertical,
  Network,
  Plus,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import EntityDrawer from "../components/common/EntityDrawer";
import type { DrawerEntity } from "../types";

type Tone = "orange" | "green" | "blue" | "purple" | "slate";

const toneMap: Record<Tone, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  slate: "border-slate-200 bg-slate-50 text-slate-500",
};

const cloudLogos = ["aws", "Microsoft Azure", "Google Cloud", "databricks", "snowflake", "Power BI"] as const;

const kpis = [
  { title: "Active Journeys", value: "28", delta: "14%", note: "vs last 30 days", icon: Rocket, tone: "green", direction: "up" },
  { title: "Certified Products", value: "124", delta: "18%", note: "vs last 30 days", icon: ShieldCheck, tone: "orange", direction: "up" },
  { title: "Open Actions", value: "16", delta: "11%", note: "vs last 30 days", icon: TriangleAlert, tone: "orange", direction: "down" },
  { title: "Platform Health", value: "98%", delta: "Healthy", note: "All systems operational", icon: HeartPulse, tone: "blue", health: true },
  { title: "Reuse Rate", value: "62%", delta: "9%", note: "vs last 30 days", icon: RefreshCw, tone: "purple", direction: "up" },
  { title: "Monthly Cost", value: "$48.7K", delta: "8%", note: "vs last month", icon: Gauge, tone: "orange", direction: "down" },
] as const;

const businessGoals = [
  { title: "Onboard a New Source", detail: "Connect and catalog new data sources", icon: Database, tone: "green" },
  { title: "Process Documents", detail: "Extract insights from unstructured documents", icon: FileText, tone: "blue" },
  { title: "Build Data Product", detail: "Create trusted, governed data products", icon: Box, tone: "orange" },
  { title: "Improve Data Quality", detail: "Profile, validate, and improve data quality", icon: ShieldCheck, tone: "purple" },
  { title: "Create Semantic Context", detail: "Build business context and semantic models", icon: Network, tone: "blue" },
  { title: "Modernize Workload", detail: "Migrate and modernize data workloads", icon: CloudUpload, tone: "orange" },
] as const;

const activeJourneys = [
  { title: "Claims Data Modernization", detail: "Processing & Model", progress: 68, due: "Due in 3 days", icon: FileText, tone: "blue", id: "jr-claims-modernization" },
  { title: "Provider 360 Ingestion", detail: "Ingestion", progress: 42, due: "Due in 5 days", icon: Database, tone: "green", id: "jr-provider-ingestion" },
  { title: "Customer Documents NLP", detail: "Processing & Extraction", progress: 75, due: "Due in 7 days", icon: FileText, tone: "green", id: "jr-customer-docs" },
] as const;

const pendingActions = [
  { title: "Review data quality alerts for Claims Gold Dataset", tag: "Data Quality", time: "2h ago", icon: TriangleAlert },
  { title: "Approve contract schema changes", tag: "Governance", time: "5h ago", icon: TriangleAlert },
  { title: "Re-run failed ingestion: HPC APACMy Feed", tag: "Ingestion", time: "18h ago", icon: Gauge },
  { title: "Update semantic terms in Provider Domain", tag: "Semantic", time: "2d ago", icon: Network },
] as const;

const recommendations = [
  { title: "Enable data repartitioning in 5 of 7 datasets", badge: "High Impact", tone: "orange" },
  { title: "Create data product from Customer 360 model", badge: "Recommended", tone: "green" },
  { title: "Optimize storage for 2 datasets", detail: "Potential monthly savings: $2.2K", badge: "Cost Saving", tone: "green" },
] as const;

const products = [
  { id: "dp-claims-gold", title: "Claims Gold Dataset", detail: "Unified claims data with predictive scores + risk attributes", status: "Certified", quality: 92, icon: Database, tone: "purple", methods: ["SQL", "API", "BI"] },
  { id: "dp-provider-contract", title: "Provider Contract Index", detail: "Normalized provider contracts with searchable index", status: "Certified", quality: 88, icon: FileText, tone: "orange", methods: ["SQL", "API", "BI"] },
  { id: "dp-customer-360", title: "Customer 360 Dataset", detail: "Unified 360 view of customers and preferences", status: "Draft", quality: 90, icon: Users, tone: "blue", methods: ["SQL", "API", "BI"] },
  { id: "dp-hcp-activity", title: "HCP Activity Data Product", detail: "Real-time HCP activity and engagement insights", status: "Certified", quality: 94, icon: Sparkles, tone: "purple", methods: ["API", "Vector"] },
] as const;

const ecosystem = [
  { name: "Microsoft Azure", detail: "East US", logo: "A", tone: "blue" },
  { name: "Amazon Web Services", detail: "us-west-1", logo: "aws", tone: "slate" },
  { name: "Databricks", detail: "Workspace: hc-prod", logo: "db", tone: "orange" },
  { name: "Snowflake", detail: "Account: HCACPROD", logo: "sf", tone: "blue" },
  { name: "Catalog Sync", detail: "Unity Catalog", logo: "cs", tone: "slate" },
  { name: "LLM Gateway", detail: "OpenAI / Azure OpenAI", logo: "llm", tone: "slate" },
  { name: "Vector Store", detail: "Pinecone", logo: "vs", tone: "slate" },
] as const;

export default function Home() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);

  return (
    <>
      <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-card">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(440px,.62fr)] gap-4 border-b border-slate-200 px-5 py-5 max-[1180px]:grid-cols-1">
          <div>
            <h1 className="text-[30px] font-extrabold leading-none tracking-normal text-slate-950 min-[1500px]:text-[34px]">AI-for-Data Command Center</h1>
            <p className="mt-3 text-[13px] text-slate-700">Build, govern, and consume trusted structured and unstructured data products across any cloud.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <HomeAction primary icon={Plus} label="Start Data Journey" />
              <HomeAction icon={Box} label="Create Data Product" />
              <HomeAction icon={BookOpen} label="Explore Catalog" />
              <HomeAction icon={TriangleAlert} label="Review Actions" />
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <p className="mb-3 text-center text-[13px] font-bold text-slate-950">Cloud Agnostic <span className="px-2 text-slate-400">.</span> Built for Choice</p>
            <div className="grid h-10 grid-cols-6 items-center divide-x divide-slate-100 rounded-lg border border-slate-200 bg-white px-2 text-center shadow-sm">
              {cloudLogos.map((logo) => <span key={logo} className="truncate px-2 text-[10px] font-bold text-slate-700 min-[1500px]:text-[11px]">{logo}</span>)}
            </div>
          </div>
        </div>

        <div className="home-kpi-grid border-b border-slate-200 p-3">
          {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
        </div>

        <div className="border-b border-slate-200 px-4 py-2.5">
          <SectionHeader title="Start from a Business Goal" />
          <div className="home-goal-grid mt-2">
            {businessGoals.map((goal) => <BusinessGoal key={goal.title} {...goal} />)}
          </div>
        </div>

        <div className="home-panel-grid border-b border-slate-200 p-3">
          <Panel title="My Active Journeys">
            <div className="divide-y divide-slate-100">
              {activeJourneys.map((journey) => <JourneyRow key={journey.title} {...journey} onClick={() => setDrawer({ type: "journey", id: journey.id })} />)}
            </div>
          </Panel>

          <Panel title="Pending Actions">
            <div className="divide-y divide-slate-100">
              {pendingActions.map((action) => <PendingRow key={action.title} {...action} />)}
            </div>
          </Panel>

          <Panel title="AI Recommendations">
            <div className="divide-y divide-slate-100">
              {recommendations.map((item) => <RecommendationRow key={item.title} {...item} />)}
            </div>
          </Panel>
        </div>

        <div className="border-b border-slate-200 px-4 py-2.5">
          <SectionHeader title="Recently Published Data Products" action="View catalog" />
          <div className="home-product-grid mt-2">
            {products.map((product) => <ProductCard key={product.id} {...product} onClick={() => setDrawer({ type: "product", id: product.id })} />)}
            <button className="hidden place-items-center rounded-[14px] border border-slate-200 bg-white text-slate-500 shadow-sm min-[1500px]:grid">
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-4 py-2.5">
          <SectionHeader title="Platform & Ecosystem Summary" />
          <div className="mt-2 grid grid-cols-7 divide-x divide-slate-200 rounded-[12px] border border-slate-200 bg-white px-2 py-2.5 max-[1180px]:grid-cols-2 max-[1180px]:divide-x-0 max-[1180px]:gap-2">
            {ecosystem.map((item) => <EcosystemItem key={item.name} {...item} />)}
          </div>
        </div>
      </section>

      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}

function HomeAction({ icon: Icon, label, primary = false }: { icon: LucideIcon; label: string; primary?: boolean }) {
  return (
    <button className={`inline-flex h-9 min-w-[132px] items-center justify-center gap-1.5 rounded-lg border px-3 text-[11px] font-bold shadow-sm transition hover:-translate-y-0.5 min-[1500px]:h-10 min-[1500px]:min-w-[160px] min-[1500px]:gap-2 min-[1500px]:text-[13px] ${primary ? "orange-gradient border-orange-500 text-white" : "border-orange-200 bg-white text-orange-600 hover:border-orange-300"}`}>
      <Icon className="h-3.5 w-3.5 min-[1500px]:h-4 min-[1500px]:w-4" /> {label}
    </button>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[14px] font-extrabold text-slate-950">{title}</h2>
      {action ? <button className="text-[12px] font-bold text-slate-700 hover:text-orange-600">{action}</button> : null}
    </div>
  );
}

function KpiCard({ title, value, delta, note, icon: Icon, tone, direction, health = false }: { title: string; value: string; delta: string; note: string; icon: LucideIcon; tone: Tone; direction?: "up" | "down"; health?: boolean }) {
  return (
    <button className="min-h-[92px] rounded-[12px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 min-[1500px]:min-h-[102px] min-[1500px]:p-4">
      <div className="flex items-start gap-2 min-[1500px]:gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border min-[1500px]:h-11 min-[1500px]:w-11 ${toneMap[tone]}`}><Icon className="h-4.5 w-4.5 min-[1500px]:h-6 min-[1500px]:w-6" /></span>
        <span className="min-w-0">
          <b className="block text-[11px] leading-4 text-slate-950 min-[1500px]:text-[12px]">{title}</b>
          <span className="mt-1.5 flex items-center gap-2 min-[1500px]:gap-3">
            <span className="text-[22px] font-extrabold leading-none text-slate-950 min-[1500px]:text-[25px]">{value}</span>
            {health ? <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 min-[1500px]:text-[11px]"><span className="h-2 w-2 rounded-full bg-emerald-500" />{delta}</span> : <Delta direction={direction}>{delta}</Delta>}
          </span>
          <span className="mt-2 block text-[10px] font-medium text-slate-500 min-[1500px]:text-[11px]">{note}</span>
        </span>
      </div>
    </button>
  );
}

function Delta({ direction, children }: { direction?: "up" | "down"; children: React.ReactNode }) {
  const Icon = direction === "down" ? ArrowDown : ArrowUp;
  return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 min-[1500px]:text-[11px]"><Icon className="h-3.5 w-3.5" />{children}</span>;
}

function BusinessGoal({ title, detail, icon: Icon, tone }: { title: string; detail: string; icon: LucideIcon; tone: Tone }) {
  return (
    <button className="grid min-h-[72px] grid-cols-[30px_1fr_16px] items-center gap-2 rounded-[12px] border border-slate-200 bg-white p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 min-[1500px]:min-h-[86px] min-[1500px]:grid-cols-[42px_1fr_20px] min-[1500px]:gap-3 min-[1500px]:p-4">
      <Icon className={`h-6 w-6 min-[1500px]:h-8 min-[1500px]:w-8 ${tone === "green" ? "text-emerald-600" : tone === "blue" ? "text-blue-600" : tone === "purple" ? "text-purple-600" : "text-orange-600"}`} />
      <span className="min-w-0">
        <b className="block text-[10px] leading-[13px] text-slate-950 min-[1500px]:text-[12px] min-[1500px]:leading-4">{title}</b>
        <span className="mt-1 block line-clamp-2 text-[9px] leading-[13px] text-slate-600 min-[1500px]:text-[11px] min-[1500px]:leading-4">{detail}</span>
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-orange-600 min-[1500px]:h-4 min-[1500px]:w-4" />
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-sm">
      <SectionHeader title={title} action="View all" />
      <div className="mt-2">{children}</div>
    </section>
  );
}

function JourneyRow({ title, detail, progress, due, icon: Icon, tone, onClick }: { title: string; detail: string; progress: number; due: string; icon: LucideIcon; tone: Tone; id: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[30px_1fr_92px_72px_18px] items-center gap-2.5 py-2 text-left hover:bg-orange-50/40">
      <span className={`grid h-6 w-6 place-items-center rounded-md border ${toneMap[tone]}`}><Icon className="h-3.5 w-3.5" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-800">{title}</b>
        <span className="block truncate text-[11px] text-slate-500">{detail}</span>
      </span>
      <span className="flex items-center gap-3">
        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-orange-500" style={{ width: `${progress}%` }} /></span>
        <b className="text-[11px] text-slate-700">{progress}%</b>
      </span>
      <span className="text-[11px] font-semibold text-slate-500">{due}</span>
      <MoreVertical className="h-4 w-4 text-slate-500" />
    </button>
  );
}

function PendingRow({ title, tag, time, icon: Icon }: { title: string; tag: string; time: string; icon: LucideIcon }) {
  return (
    <button className="grid w-full grid-cols-[24px_1fr_82px_48px] items-center gap-2.5 py-2 text-left hover:bg-orange-50/40">
      <Icon className="h-4 w-4 text-orange-600" />
      <span className="truncate text-[12px] font-medium text-slate-700">{title}</span>
      <span className="rounded-md bg-slate-100 px-2 py-1 text-center text-[10px] font-semibold text-slate-600">{tag}</span>
      <span className="text-right text-[11px] font-medium text-slate-500">{time}</span>
    </button>
  );
}

function RecommendationRow({ title, detail, badge, tone }: { title: string; detail?: string; badge: string; tone: string }) {
  return (
    <button className="grid w-full grid-cols-[24px_1fr_86px] items-center gap-2.5 py-2.5 text-left hover:bg-orange-50/40">
      <Link2 className="h-4 w-4 text-emerald-600" />
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-medium text-slate-700">{title}</span>
        {detail ? <span className="mt-1 block truncate text-[11px] text-slate-500">{detail}</span> : null}
      </span>
      <span className={`rounded-md px-2 py-1 text-center text-[10px] font-bold ${tone === "orange" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>{badge}</span>
    </button>
  );
}

function ProductCard({ title, detail, status, quality, icon: Icon, tone, methods, onClick }: { id: string; title: string; detail: string; status: string; quality: number; icon: LucideIcon; tone: Tone; methods: readonly string[]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="min-h-[132px] rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 min-[1500px]:min-h-[146px] min-[1500px]:p-4">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full min-[1500px]:h-11 min-[1500px]:w-11 ${tone === "purple" ? "bg-purple-600" : tone === "blue" ? "bg-blue-600" : "bg-orange-500"} text-white`}><Icon className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <b className="truncate text-[13px] text-slate-950">{title}</b>
            <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${status === "Draft" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>{status}</span>
          </span>
          <span className="mt-1.5 block line-clamp-2 text-[10px] leading-4 text-slate-600 min-[1500px]:text-[11px]">{detail}</span>
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 min-[1500px]:text-[11px]">
          <span className="grid h-6 w-6 place-items-center rounded-full border border-emerald-200 text-emerald-600"><Gauge className="h-3.5 w-3.5" /></span>
          Quality Score
          <b className="grid h-7 w-7 place-items-center rounded-full border border-emerald-300 text-[12px] text-emerald-700">{quality}</b>
        </span>
        <span className="flex items-center gap-1.5">
          {methods.map((method) => <span key={method} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 min-[1500px]:text-[11px]">{method}</span>)}
          <MoreVertical className="h-4 w-4 text-slate-500" />
        </span>
      </div>
    </button>
  );
}

function EcosystemItem({ name, detail, logo, tone }: { name: string; detail: string; logo: string; tone: Tone }) {
  return (
    <div className="grid grid-cols-[36px_1fr] items-center gap-2 px-2">
      <span className={`text-center text-[19px] font-extrabold ${tone === "blue" ? "text-blue-600" : tone === "orange" ? "text-orange-600" : "text-slate-700"}`}>{logo}</span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-800">{name}</b>
        <span className="mt-1 flex items-center gap-2 truncate text-[10px] font-medium text-slate-500">{detail}<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> <span className="text-emerald-600">Healthy</span></span>
      </span>
    </div>
  );
}
