import {
  ArrowUp,
  BookOpen,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Filter,
  GitBranch,
  Import,
  Link2,
  MoreVertical,
  Network,
  Plus,
  Search,
  ShieldCheck,
  ShieldQuestion,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import EntityDrawer from "../components/common/EntityDrawer";
import { domains } from "../data/mockData";
import type { DrawerEntity } from "../types";

type SemanticTone = "orange" | "green" | "blue" | "purple" | "teal" | "red" | "amber";
type QueuePriority = "High" | "Medium" | "Low";

type AssetRow = {
  id: string;
  assetId?: string;
  name: string;
  type: string;
  domain: string;
  status: "Certified" | "Draft" | "Review Needed";
  owner: string;
  linkedAssets: number;
  updated: string;
  icon: LucideIcon;
  tone: SemanticTone;
};

const toneMap: Record<SemanticTone, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  teal: "border-cyan-100 bg-cyan-50 text-cyan-700",
  red: "border-rose-100 bg-rose-50 text-rose-600",
  amber: "border-amber-100 bg-amber-50 text-amber-600",
};

const summaryMetrics = [
  { title: "Certified Models", value: "42", delta: "6", icon: Box, tone: "purple", values: [18, 19, 21, 20, 24, 23, 27, 25, 28, 27, 29, 28] },
  { title: "Business Terms", value: "1,284", delta: "58", icon: BookOpen, tone: "green", values: [42, 43, 42, 46, 45, 50, 48, 49, 54, 51, 56, 55] },
  { title: "Certified Metrics", value: "216", delta: "12", icon: GitBranch, tone: "orange", values: [23, 25, 25, 30, 27, 33, 30, 34, 32, 35, 36, 34] },
  { title: "Governance Gaps", value: "18", delta: "3", icon: ShieldCheck, tone: "red", values: [30, 29, 28, 31, 27, 33, 29, 32, 30, 34, 33, 32], down: true },
] as const;

const assetRows: AssetRow[] = [
  { id: "claim-denial", name: "Claim Denial Reason", type: "Business Term", domain: "Claims", status: "Certified", owner: "Claims Ops", linkedAssets: 8, updated: "1 day ago", icon: Box, tone: "purple", assetId: "sa-claims-ontology" },
  { id: "loss-ratio", name: "Loss Ratio", type: "Metric", domain: "Finance", status: "Certified", owner: "Finance Data Team", linkedAssets: 12, updated: "2 days ago", icon: GitBranch, tone: "orange", assetId: "sa-finance-kpis" },
  { id: "provider-domain", name: "Provider Domain Model", type: "Domain Model", domain: "Provider", status: "Certified", owner: "Provider Data Office", linkedAssets: 18, updated: "3 days ago", icon: Box, tone: "purple", assetId: "sa-provider-domain" },
  { id: "policy-hierarchy", name: "Policy Coverage Hierarchy", type: "Ontology", domain: "Policy", status: "Draft", owner: "Policy Analytics", linkedAssets: 7, updated: "4 days ago", icon: Network, tone: "orange", assetId: "sa-policy-metrics" },
  { id: "customer-360", name: "Customer 360 Model", type: "Domain Model", domain: "Customer", status: "Review Needed", owner: "Customer Data Office", linkedAssets: 14, updated: "5 days ago", icon: Box, tone: "purple", assetId: "sa-customer-360" },
  { id: "hcp-taxonomy", name: "HCP Engagement Taxonomy", type: "Taxonomy", domain: "Provider", status: "Certified", owner: "Marketing Insights", linkedAssets: 11, updated: "6 days ago", icon: Network, tone: "teal", assetId: "sa-hcp-taxonomy" },
  { id: "reinsurance-glossary", name: "Reinsurance Glossary", type: "Glossary", domain: "Finance", status: "Certified", owner: "Finance Data Team", linkedAssets: 5, updated: "7 days ago", icon: BookOpen, tone: "purple", assetId: "sa-finance-kpis" },
];

const healthCards = [
  { title: "Glossary Coverage", value: "88%", detail: "5% vs last 30 days", icon: BookOpen, tone: "purple" },
  { title: "Metric Consistency", value: "92%", detail: "3% vs last 30 days", icon: GitBranch, tone: "orange" },
  { title: "Data Product Mapping", value: "81%", detail: "4% vs last 30 days", icon: Link2, tone: "teal" },
  { title: "Review Queue", value: "14", detail: "6 pending", icon: ShieldQuestion, tone: "red", neutral: true },
] as const;

const actionQueue = [
  { title: "Map 23 unmapped columns to business terms", priority: "High", icon: TriangleAlert, tone: "orange", assetId: "sa-claims-ontology" },
  { title: "Resolve 8 duplicate metrics", priority: "High", icon: GitBranch, tone: "orange", assetId: "sa-finance-kpis" },
  { title: "Certify \"Provider Domain Model\"", priority: "Medium", icon: Box, tone: "purple", assetId: "sa-provider-domain" },
  { title: "Review draft \"Policy Coverage Hierarchy\"", priority: "Medium", icon: Network, tone: "orange", assetId: "sa-policy-metrics" },
  { title: "Link 5 data products to semantic assets", priority: "Low", icon: Link2, tone: "teal", assetId: "sa-hcp-taxonomy" },
] as const;

const domainCards = [
  { title: "Claims", icon: ShieldCheck, tone: "purple", models: 8, terms: 312, metrics: 54, linkedProducts: 16, coverage: 87 },
  { title: "Customer", icon: BookOpen, tone: "green", models: 10, terms: 428, metrics: 72, linkedProducts: 18, coverage: 89 },
  { title: "Provider", icon: Network, tone: "blue", models: 9, terms: 276, metrics: 48, linkedProducts: 15, coverage: 85 },
  { title: "Finance", icon: GitBranch, tone: "orange", models: 7, terms: 268, metrics: 42, linkedProducts: 12, coverage: 83 },
] as const;

const recentUpdates = [
  { title: "Provider Domain Model updated", time: "1 hour ago", icon: Box, tone: "purple", assetId: "sa-provider-domain" },
  { title: "Metric \"Loss Ratio\" certified", time: "3 hours ago", icon: GitBranch, tone: "orange", assetId: "sa-finance-kpis" },
  { title: "Business term \"Claim Denial Reason\" approved", time: "5 hours ago", icon: BookOpen, tone: "green", assetId: "sa-claims-ontology" },
  { title: "Policy Coverage Hierarchy draft updated", time: "1 day ago", icon: Network, tone: "orange", assetId: "sa-policy-metrics" },
  { title: "Customer 360 Model updated", time: "2 days ago", icon: Box, tone: "purple", assetId: "sa-customer-360" },
] as const;

export default function SemanticHub() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [owner, setOwner] = useState("");

  const typeOptions = useMemo(() => Array.from(new Set(assetRows.map((asset) => asset.type))), []);
  const ownerOptions = useMemo(() => Array.from(new Set(assetRows.map((asset) => asset.owner))), []);
  const filtered = useMemo(() => assetRows.filter((asset) => {
    const haystack = [asset.name, asset.domain, asset.type, asset.status, asset.owner].join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase()) && (!domain || asset.domain === domain) && (!type || asset.type === type) && (!status || asset.status === status) && (!owner || asset.owner === owner);
  }), [domain, owner, search, status, type]);

  const openAsset = (assetId?: string) => {
    if (assetId) setDrawer({ type: "semantic", id: assetId });
  };

  return (
    <>
      <div className="space-y-3">
        <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-card">
          <div>
            <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Semantic Hub</h1>
            <p className="mt-2 text-[13px] text-slate-700">Define trusted business meaning, certify metrics, and connect semantic context to data products, BI, APIs, and AI agents.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <SemanticAction primary icon={Plus} label="Create Semantic Model" />
            <SemanticAction icon={BookOpen} label="Add Business Term" />
            <SemanticAction icon={GitBranch} label="Create Metric" />
            <SemanticAction icon={Import} label="Import Terms" />
          </div>

          <div className="semantic-metric-grid mt-5">
            {summaryMetrics.map((metric) => <SummaryMetric key={metric.title} {...metric} />)}
          </div>
        </section>

        <section className="semantic-main-grid">
          <DashboardPanel title="Explore Semantic Assets">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className="relative h-9 min-w-[250px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-full w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[12px] outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search assets..." />
              </label>
              <FilterSelect label="All Domains" value={domain} options={domains.map(compactDomain)} onChange={setDomain} />
              <FilterSelect label="All Types" value={type} options={typeOptions} onChange={setType} />
              <FilterSelect label="All Status" value={status} options={["Certified", "Draft", "Review Needed"]} onChange={setStatus} />
              <FilterSelect label="All Owners" value={owner} options={ownerOptions} onChange={setOwner} wide />
              <button className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 shadow-sm hover:border-orange-200 hover:text-orange-600">
                <Filter className="h-4 w-4" /> Filters
              </button>
            </div>
            <AssetTable rows={filtered} onSelect={(asset) => openAsset(asset.assetId)} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-600">
              <span>Showing 1 to {filtered.length} of {assetRows.length} assets</span>
              <div className="flex items-center gap-2">
                <PageButton><ChevronLeft className="h-4 w-4" /></PageButton>
                <PageButton active>1</PageButton>
                <PageButton><ChevronRight className="h-4 w-4" /></PageButton>
              </div>
              <label className="flex items-center gap-2">
                Rows per page:
                <span className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700">10 <ChevronDown className="h-4 w-4" /></span>
              </label>
            </div>
          </DashboardPanel>

          <div className="space-y-3">
            <DashboardPanel title="Semantic Health" info>
              <div className="grid grid-cols-1 gap-2.5 min-[760px]:grid-cols-2">
                {healthCards.map((item) => <HealthCard key={item.title} {...item} />)}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Action Queue">
              <div className="overflow-hidden rounded-[10px] border border-slate-100 bg-white">
                {actionQueue.map((item) => <QueueRow key={item.title} {...item} onClick={() => openAsset(item.assetId)} />)}
              </div>
            </DashboardPanel>
          </div>
        </section>

        <section className="semantic-bottom-grid">
          <DashboardPanel title="Domain Overview">
            <div className="semantic-domain-grid">
              {domainCards.map((domainCard) => <DomainCard key={domainCard.title} {...domainCard} />)}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Recently Updated">
            <div className="space-y-1">
              {recentUpdates.map((item) => <RecentRow key={item.title} {...item} onClick={() => openAsset(item.assetId)} />)}
            </div>
          </DashboardPanel>
        </section>
      </div>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}

function SemanticAction({ icon: Icon, label, primary = false }: { icon: LucideIcon; label: string; primary?: boolean }) {
  return (
    <button className={`inline-flex h-10 min-w-[190px] items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-bold shadow-sm transition hover:-translate-y-0.5 ${primary ? "orange-gradient border-orange-500 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-orange-200 hover:text-orange-600"}`}>
      <Icon className="h-[18px] w-[18px]" /> {label}
    </button>
  );
}

function DashboardPanel({ title, info = false, children }: { title: string; info?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950">
          {title}
          {info ? <span className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-[10px] text-slate-400">i</span> : null}
        </h2>
      </div>
      {children}
    </section>
  );
}

function SummaryMetric({ title, value, delta, icon: Icon, tone, values, down = false }: { title: string; value: string; delta: string; icon: LucideIcon; tone: SemanticTone; values: readonly number[]; down?: boolean }) {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-card">
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[12px] border ${toneMap[tone]}`}><Icon className="h-7 w-7" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-extrabold leading-4 text-slate-800">{title}</span>
          <span className="mt-2 block text-[27px] font-extrabold leading-none text-slate-950">{value}</span>
          <span className={`mt-3 flex items-center gap-1 text-[11px] font-extrabold ${down ? "text-emerald-600" : "text-emerald-600"}`}>
            <ArrowUp className={`h-3.5 w-3.5 ${down ? "rotate-180" : ""}`} /> {delta} vs last 30 days
          </span>
        </span>
      </div>
      <Sparkline tone={tone} values={values} />
    </div>
  );
}

function Sparkline({ tone, values }: { tone: SemanticTone; values: readonly number[] }) {
  const strokeMap: Record<SemanticTone, string> = {
    orange: "#ff5a0a",
    green: "#16a34a",
    blue: "#3b82f6",
    purple: "#a855f7",
    teal: "#0891b2",
    red: "#fb7185",
    amber: "#d97706",
  };
  const width = 180;
  const height = 44;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = 4 + (index / (values.length - 1)) * (width - 8);
    const y = 8 + (1 - (value - min) / range) * (height - 16);
    return [x, y] as const;
  });
  const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg className="ml-auto mt-2 block h-11 w-[92px] overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={strokeMap[tone]} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function FilterSelect({ label, value, options, onChange, wide = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; wide?: boolean }) {
  return (
    <label className={`relative h-9 ${wide ? "min-w-[155px]" : "min-w-[132px]"}`}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-full w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[12px] font-semibold text-slate-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100">
        <option value="">{label}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function AssetTable({ rows, onSelect }: { rows: AssetRow[]; onSelect: (asset: AssetRow) => void }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200">
      <div className="semantic-table-row grid bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        <span>Asset Name</span><span>Type</span><span>Domain</span><span>Status</span><span>Owner</span><span>Linked Assets</span><span className="flex items-center gap-1">Last Updated <ChevronsUpDown className="h-3 w-3" /></span><span />
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {rows.map((asset) => {
          const Icon = asset.icon;
          return (
            <button key={asset.id} onClick={() => onSelect(asset)} className="semantic-table-row grid w-full items-center px-3 py-2 text-left transition hover:bg-orange-50/40">
              <span className="flex min-w-0 items-center gap-2">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${toneMap[asset.tone]}`}><Icon className="h-3.5 w-3.5" /></span>
                <b className="truncate text-[12px] text-slate-800">{asset.name}</b>
              </span>
              <span className="truncate text-[12px] font-medium text-slate-600">{asset.type}</span>
              <span className="truncate text-[12px] font-medium text-slate-600">{asset.domain}</span>
              <SemanticStatusBadge status={asset.status} />
              <span className="truncate text-[12px] font-medium text-slate-600">{asset.owner}</span>
              <span className="text-[12px] font-bold text-slate-700">{asset.linkedAssets}</span>
              <span className="text-[12px] font-medium text-slate-500">{asset.updated}</span>
              <MoreVertical className="h-4 w-4 justify-self-end text-slate-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SemanticStatusBadge({ status }: { status: AssetRow["status"] }) {
  const className = status === "Certified"
    ? "bg-emerald-50 text-emerald-700"
    : status === "Draft"
      ? "bg-orange-50 text-orange-600"
      : "bg-amber-50 text-amber-700";
  return (
    <span className={`inline-flex h-6 w-fit items-center gap-1.5 rounded-md px-2 text-[11px] font-extrabold ${className}`}>
      <span className={`h-2 w-2 rounded-full ${status === "Certified" ? "bg-emerald-500" : status === "Draft" ? "bg-orange-500" : "bg-amber-400"}`} />
      {status}
    </span>
  );
}

function HealthCard({ title, value, detail, icon: Icon, tone, neutral = false }: { title: string; value: string; detail: string; icon: LucideIcon; tone: SemanticTone; neutral?: boolean }) {
  return (
    <div className="min-h-[94px] rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
        <span className="min-w-0">
          <b className="block truncate text-[12px] text-slate-800">{title}</b>
          <span className="mt-1 block text-[24px] font-extrabold leading-none text-slate-950">{value}</span>
        </span>
      </div>
      <p className={`mt-3 flex items-center gap-1 pl-[52px] text-[11px] font-bold ${neutral ? "text-slate-500" : "text-emerald-600"}`}>{neutral ? null : <ArrowUp className="h-3.5 w-3.5" />}{detail}</p>
    </div>
  );
}

function QueueRow({ title, priority, icon: Icon, tone, onClick }: { title: string; priority: QueuePriority; icon: LucideIcon; tone: SemanticTone; assetId: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[34px_1fr_78px_22px] items-center gap-2 border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-orange-50/40">
      <span className={`grid h-7 w-7 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
      <span className="truncate text-[12px] font-semibold text-slate-700">{title}</span>
      <PriorityBadge priority={priority} />
      <ChevronRight className="h-4 w-4 text-slate-500" />
    </button>
  );
}

function PriorityBadge({ priority }: { priority: QueuePriority }) {
  const className = priority === "High"
    ? "border-rose-100 bg-rose-50 text-rose-600"
    : priority === "Medium"
      ? "border-amber-100 bg-amber-50 text-amber-600"
      : "border-emerald-100 bg-emerald-50 text-emerald-700";
  return <span className={`rounded-md border px-2 py-1 text-center text-[11px] font-extrabold ${className}`}>{priority}</span>;
}

function DomainCard({ title, icon: Icon, tone, models, terms, metrics, linkedProducts, coverage }: { title: string; icon: LucideIcon; tone: SemanticTone; models: number; terms: number; metrics: number; linkedProducts: number; coverage: number }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-[10px] border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
        <b className="text-[13px] text-slate-950">{title}</b>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <DomainStat label="Models" value={models} />
        <DomainStat label="Terms" value={terms} />
        <DomainStat label="Metrics" value={metrics} />
        <DomainStat label="Linked Products" value={linkedProducts} />
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <span>Coverage</span><span>{coverage}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <span className={`block h-full rounded-full ${tone === "green" ? "bg-emerald-500" : tone === "blue" ? "bg-blue-500" : tone === "purple" ? "bg-purple-500" : "bg-orange-500"}`} style={{ width: `${coverage}%` }} />
      </div>
    </div>
  );
}

function DomainStat({ label, value }: { label: string; value: number }) {
  return (
    <span>
      <span className="block min-h-8 text-[10px] font-bold leading-4 text-slate-500">{label}</span>
      <b className="mt-2 block text-[20px] leading-none text-slate-950">{value}</b>
    </span>
  );
}

function RecentRow({ title, time, icon: Icon, tone, onClick }: { title: string; time: string; icon: LucideIcon; tone: SemanticTone; assetId: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[34px_1fr_82px] items-center gap-3 border-b border-slate-100 px-1 py-2 text-left last:border-b-0 hover:bg-orange-50/40">
      <span className={`grid h-7 w-7 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
      <span className="truncate text-[12px] font-semibold text-slate-700">{title}</span>
      <span className="text-right text-[12px] font-semibold text-slate-500">{time}</span>
    </button>
  );
}

function PageButton({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return <button className={`grid h-8 min-w-8 place-items-center rounded-md border px-2 text-[12px] font-bold ${active ? "border-orange-500 text-orange-600 shadow-[0_0_0_1px_rgba(249,115,22,.18)]" : "border-transparent text-slate-500 hover:border-slate-200"}`}>{children}</button>;
}

function compactDomain(value: string) {
  return value === "Provider Management" ? "Provider" : value;
}
