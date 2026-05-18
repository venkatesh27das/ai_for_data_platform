import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Code2,
  Database,
  FileCheck2,
  FileCog,
  FileText,
  Filter,
  Grid2X2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TriangleAlert,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DemoFlowModal, { type DemoFlow } from "../components/common/DemoFlowModal";
import EntityDrawer from "../components/common/EntityDrawer";
import StatusBadge from "../components/common/StatusBadge";
import { dataProducts, domains } from "../data/mockData";
import type { DataProduct, DrawerEntity } from "../types";

type ProductTone = "orange" | "green" | "blue" | "purple" | "teal" | "red";

const toneMap: Record<ProductTone, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  teal: "border-cyan-100 bg-cyan-50 text-cyan-700",
  red: "border-red-100 bg-red-50 text-red-600",
};

const productIconMap: Record<string, { icon: LucideIcon; tone: ProductTone }> = {
  "dp-claims-gold": { icon: Database, tone: "purple" },
  "dp-customer-360": { icon: Users, tone: "green" },
  "dp-provider-contract": { icon: FileText, tone: "orange" },
  "dp-hcp-activity": { icon: Activity, tone: "blue" },
  "dp-policy-corpus": { icon: FileCheck2, tone: "purple" },
  "dp-pricing-api": { icon: Code2, tone: "orange" },
  "dp-provider-directory": { icon: Database, tone: "blue" },
  "dp-member-eligibility": { icon: ShieldCheck, tone: "purple" },
};

const metrics = [
  { title: "Total Products", value: "248", delta: "+18", detail: "vs last 30 days", icon: Boxes, tone: "orange", values: [204, 211, 209, 218, 216, 229, 224, 236, 232, 248] },
  { title: "Certified Products", value: "136", delta: "+12", detail: "vs last 30 days", icon: ShieldCheck, tone: "green", values: [112, 118, 116, 123, 121, 128, 126, 132, 131, 136] },
  { title: "Drafts", value: "28", delta: "+5", detail: "vs last 30 days", icon: FileText, tone: "purple", values: [18, 21, 20, 24, 23, 26, 24, 27, 25, 28] },
  { title: "APIs Exposed", value: "64", delta: "+7", detail: "vs last 30 days", icon: Code2, tone: "orange", values: [48, 52, 51, 56, 54, 60, 58, 62, 61, 64] },
  { title: "Average Quality Score", value: "86.7%", delta: "+3.6 pts", detail: "vs last 30 days", icon: Star, tone: "blue", values: [78, 80, 79, 82, 81, 84, 83, 85, 84, 87] },
  { title: "Reuse Rate", value: "72.4%", delta: "+6.2 pts", detail: "vs last 30 days", icon: RefreshCw, tone: "teal", values: [58, 61, 60, 65, 64, 68, 66, 70, 69, 72] },
] as const;

const governance = [
  { title: "Contract Compliance", value: "95.6%", delta: "4.3% vs last 30 days", icon: ShieldCheck, tone: "green" },
  { title: "SLA Adherence", value: "98.1%", delta: "2.1% vs last 30 days", icon: Activity, tone: "teal" },
  { title: "Access Requests", value: "28", delta: "12 pending", icon: Users, tone: "blue", warning: true },
  { title: "Data Quality Alerts", value: "7", delta: "3 critical, 4 warning", icon: TriangleAlert, tone: "orange", warning: true },
  { title: "Certification Queue", value: "9", delta: "5 pending review", icon: Sparkles, tone: "purple", warning: true },
] as const;

const recommendationRows = [
  { title: 'Certify Draft: "HCP Activity Data Product" is ready for certification.', action: "Review", icon: Sparkles, tone: "blue", productId: "dp-hcp-activity" },
  { title: "Improve Metadata: 8 products have low metadata completeness (<70%).", action: "Improve", icon: ShieldCheck, tone: "green", productId: "dp-provider-directory" },
  { title: "Attach Data Contracts: 12 products are missing data contracts.", action: "Attach", icon: FileCog, tone: "orange", productId: "dp-provider-contract" },
  { title: '"Provider Contract Index" can be exposed as an API.', action: "Publish", icon: Code2, tone: "purple", productId: "dp-provider-contract" },
] as const;

const activityRows = [
  { title: '"Claims Gold Dataset" was published', actor: "Priya Nair", time: "1h ago", icon: CheckCircle2, tone: "green", productId: "dp-claims-gold" },
  { title: '"Customer 360 Dataset" certification renewed', actor: "Rohan Mehta", time: "2h ago", icon: ShieldCheck, tone: "green", productId: "dp-customer-360" },
  { title: 'Metadata updated for "Policy Document Corpus"', actor: "Ananya Rao", time: "5h ago", icon: FileCheck2, tone: "blue", productId: "dp-policy-corpus" },
  { title: 'Access approved for "pricing-analytics@acme.com" on "Pricing Intelligence API"', actor: "System", time: "6h ago", icon: Users, tone: "orange", productId: "dp-pricing-api" },
  { title: 'New version (v2.3) of "Provider Contract Index" published', actor: "Sneha Iyer", time: "1d ago", icon: CloudUpload, tone: "purple", productId: "dp-provider-contract" },
] as const;

export default function DataProducts() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const [flow, setFlow] = useState<DemoFlow | null>(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const typeOptions = useMemo(() => Array.from(new Set(dataProducts.map((product) => product.type))), []);
  const filtered = useMemo(() => dataProducts.filter((product) => {
    const haystack = [product.name, product.domain, product.owner, product.type, product.tags.join(" ")].join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase()) && (!domain || product.domain === domain) && (!type || product.type === type) && (!status || product.status === status);
  }), [domain, search, status, type]);

  return (
    <>
      <div className="space-y-3">
        <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-card">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-2">
            <div>
              <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Data Products</h1>
              <p className="mt-2 text-[13px] text-slate-700">Discover, certify, manage, and consume trusted data products across structured and unstructured data.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ProductAction primary icon={Plus} label="Create Data Product" onClick={() => setFlow(createProductFlow)} />
            <ProductAction icon={Grid2X2} label="Browse Catalog" onClick={() => { setSearch(""); setDomain(""); setType(""); setStatus(""); }} />
            <ProductAction icon={CloudUpload} label="Import Metadata" onClick={() => setFlow(importMetadataFlow)} />
            <ProductAction icon={FileCog} label="Manage Contracts" onClick={() => setFlow(contractFlow)} />
          </div>
        </section>

        <section className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-card">
          <div className="data-products-metric-grid">
            {metrics.map((metric) => <MetricTile key={metric.title} {...metric} onClick={() => setFlow(metricDetailFlow(metric.title, metric.value))} />)}
          </div>
        </section>

        <DashboardPanel title="Featured Data Products" info action="View all featured" onAction={() => setSearch("")}>
          <div className="data-products-feature-grid">
            {dataProducts.slice(0, 6).map((product) => <FeaturedProductCard key={product.id} product={product} onClick={() => setDrawer({ type: "product", id: product.id })} />)}
          </div>
        </DashboardPanel>

        <section className="data-products-main-grid">
          <DashboardPanel title="All Data Products" action="View all" onAction={() => setSearch("")}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className="relative h-9 min-w-[240px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-full w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[12px] outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search products..." />
              </label>
              <FilterSelect label="All Domains" value={domain} options={domains} onChange={setDomain} />
              <FilterSelect label="All Types" value={type} options={typeOptions} onChange={setType} />
              <FilterSelect label="All Status" value={status} options={["Certified", "Draft", "Pending"]} onChange={setStatus} />
              <button onClick={() => { setSearch(""); setDomain(""); setType(""); setStatus(""); }} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 shadow-sm hover:border-orange-200 hover:text-orange-600">
                <Filter className="h-4 w-4" /> Filters
              </button>
            </div>
            <ProductTable rows={filtered} onSelect={(product) => setDrawer({ type: "product", id: product.id })} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-600">
              <span>Showing 1 to {filtered.length} of 248 products</span>
              <div className="flex items-center gap-2">
                <PageButton onClick={() => setFlow(productPaginationFlow)}><ChevronLeft className="h-4 w-4" /></PageButton>
                {["1", "2", "3", "...", "31"].map((item) => <PageButton key={item} active={item === "1"} onClick={() => setFlow(productPaginationFlow)}>{item}</PageButton>)}
                <PageButton onClick={() => setFlow(productPaginationFlow)}><ChevronRight className="h-4 w-4" /></PageButton>
              </div>
              <label className="flex items-center gap-2">
                Rows per page:
                <button onClick={() => setFlow(rowsPerPageFlow)} className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700">10 <ChevronDown className="h-4 w-4" /></button>
              </label>
            </div>
          </DashboardPanel>

          <DashboardPanel title="Product Health & Governance" action="View all" onAction={() => navigate("/admin")}>
            <div className="grid grid-cols-1 gap-2.5 min-[760px]:grid-cols-3">
              {governance.slice(0, 3).map((item) => <GovernanceCard key={item.title} {...item} onClick={() => setFlow(governanceFlow(item.title, item.value))} />)}
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 min-[760px]:grid-cols-2">
              {governance.slice(3).map((item) => <GovernanceCard key={item.title} {...item} onClick={() => setFlow(governanceFlow(item.title, item.value))} />)}
            </div>
          </DashboardPanel>
        </section>

        <section className="data-products-bottom-grid">
          <DashboardPanel title="AI Recommendations" info>
            <div className="space-y-2">
              {recommendationRows.map((item) => <RecommendationRow key={item.title} {...item} onClick={() => setDrawer({ type: "product", id: item.productId })} />)}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Recent Activity" action="View all activity" onAction={() => navigate("/admin")}>
            <div className="space-y-2">
              {activityRows.map((item) => <ActivityRow key={item.title} {...item} onClick={() => setDrawer({ type: "product", id: item.productId })} />)}
            </div>
          </DashboardPanel>
        </section>
      </div>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
      <DemoFlowModal flow={flow} onClose={() => setFlow(null)} />
    </>
  );
}

const createProductFlow: DemoFlow = {
  title: "Create Data Product",
  description: "Packages curated data into a governed, reusable product that can be certified and consumed.",
  steps: ["Choose source assets or a completed journey output.", "Attach owner, domain, contract, SLA, and semantic links.", "Run quality checks and publish as Draft or Certified."],
  primaryAction: "Create product draft",
};

const importMetadataFlow: DemoFlow = {
  title: "Import Metadata",
  description: "Brings catalog metadata from Snowflake, Databricks, cloud storage, or API registries into DataNexus.",
  steps: ["Select a connector and workspace.", "Preview schemas, owners, tags, and lineage.", "Map imported assets to products and governance policies."],
  primaryAction: "Import metadata",
};

const contractFlow: DemoFlow = {
  title: "Manage Data Contracts",
  description: "Reviews contracts, schema expectations, access terms, and product SLAs.",
  steps: ["Open products missing contracts or renewal checks.", "Compare schema and freshness commitments with current telemetry.", "Submit contract updates for governance approval."],
  primaryAction: "Open contract queue",
};

const productPaginationFlow: DemoFlow = {
  title: "Catalog Pagination",
  description: "Loads more data products while keeping search, filters, and row selections connected.",
  steps: ["Preserve active search and filters.", "Fetch the requested result page.", "Keep product drill-down and governance panels synchronized."],
  primaryAction: "Load catalog page",
};

const rowsPerPageFlow: DemoFlow = {
  title: "Rows Per Page",
  description: "Changes the catalog table density for demo review.",
  steps: ["Choose 10, 25, 50, or 100 rows.", "Reload the current filtered product list.", "Keep pagination and selection context stable."],
  primaryAction: "Apply density",
};

function metricDetailFlow(title: string, value: string): DemoFlow {
  return {
    title,
    description: `Opens the product catalog slice behind the ${value} ${title.toLowerCase()} metric.`,
    steps: ["Show the trend and contributing products.", "Apply matching catalog filters.", "Open a product, export, or create a governance task."],
    primaryAction: "Open metric detail",
  };
}

function governanceFlow(title: string, value: string): DemoFlow {
  return {
    title,
    description: `Reviews the ${title.toLowerCase()} signal currently showing ${value}.`,
    steps: ["Open related products and policy checks.", "Inspect warnings, owners, SLAs, and access requests.", "Assign remediation or route approval."],
    primaryAction: "Open governance detail",
  };
}

function ProductAction({ icon: Icon, label, primary = false, onClick }: { icon: LucideIcon; label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex h-10 min-w-[190px] items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-bold shadow-sm transition hover:-translate-y-0.5 ${primary ? "orange-gradient border-orange-500 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-orange-200 hover:text-orange-600"}`}>
      <Icon className="h-[18px] w-[18px]" /> {label}
    </button>
  );
}

function MetricTile({ title, value, delta, detail, icon: Icon, tone, values, onClick }: { title: string; value: string; delta: string; detail: string; icon: LucideIcon; tone: ProductTone; values: readonly number[]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="overflow-hidden rounded-[12px] border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-card">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-extrabold leading-4 text-slate-800">{title}</span>
          <span className="mt-1 block text-[25px] font-extrabold leading-none text-slate-950">{value}</span>
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-extrabold leading-4 text-emerald-700">▲ {delta}</span>
        <span className="text-right text-[10px] font-semibold leading-4 text-slate-500">{detail}</span>
      </div>
      <RichMetricChart tone={tone} values={values} />
    </button>
  );
}

function RichMetricChart({ tone, values }: { tone: ProductTone; values: readonly number[] }) {
  const strokeMap: Record<ProductTone, string> = {
    orange: "#ff5a0a",
    green: "#16a34a",
    blue: "#3b82f6",
    purple: "#a855f7",
    teal: "#0891b2",
    red: "#ef4444",
  };
  const gradientId = `metric-${tone}-${values[0]}`;
  const width = 180;
  const height = 54;
  const paddingX = 3;
  const paddingY = 7;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = paddingX + (index / (values.length - 1)) * (width - paddingX * 2);
    const y = paddingY + (1 - (value - min) / range) * (height - paddingY * 2);
    return [x, y] as const;
  });
  const linePath = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${width - paddingX} ${height - 2} L ${paddingX} ${height - 2} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <svg className="mt-2 h-[54px] w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeMap[tone]} stopOpacity="0.28" />
          <stop offset="100%" stopColor={strokeMap[tone]} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {[16, 31, 46].map((y) => <line key={y} x1="0" x2={width} y1={y} y2={y} stroke="#e8edf5" strokeDasharray="4 6" strokeWidth="1" />)}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={strokeMap[tone]} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="3.5" fill="#ffffff" stroke={strokeMap[tone]} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function DashboardPanel({ title, action, info = false, children, onAction }: { title: string; action?: string; info?: boolean; children: React.ReactNode; onAction?: () => void }) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950">
          {title}
          {info ? <span className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-[10px] text-slate-400">i</span> : null}
        </h2>
        {action ? <button onClick={onAction} className="flex items-center gap-2 text-[12px] font-bold text-slate-700 hover:text-orange-600">{action}<ArrowRight className="h-4 w-4" /></button> : null}
      </div>
      {children}
    </section>
  );
}

function FeaturedProductCard({ product, onClick }: { product: DataProduct; onClick: () => void }) {
  const icon = productIconMap[product.id] ?? { icon: Database, tone: "orange" as ProductTone };
  const Icon = icon.icon;
  return (
    <button onClick={onClick} className="min-h-[168px] rounded-[10px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border ${toneMap[icon.tone]}`}><Icon className="h-5 w-5" /></span>
          <span className="min-w-0">
            <b className="block truncate text-[12px] text-slate-950">{product.name}</b>
            <span className="mt-1 block"><StatusBadge status={product.status} /></span>
          </span>
        </div>
        <MoreVertical className="h-4 w-4 shrink-0 text-slate-400" />
      </div>
      <div className="mt-3 grid grid-cols-[64px_1fr] gap-y-1.5 text-[11px]">
        <span className="font-bold text-slate-500">Domain</span><span className="truncate font-semibold text-slate-800">{compactDomain(product.domain)}</span>
        <span className="font-bold text-slate-500">Owner</span><span className="truncate font-semibold text-slate-800">{product.owner}</span>
        <span className="font-bold text-slate-500">Type</span><span className="truncate font-semibold text-slate-800">{product.type}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
        <b className="text-slate-700">Quality {product.qualityScore}%</b>
        <span className="font-medium text-slate-500">Updated {product.lastUpdated}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {product.consumptionMethods.slice(0, 2).map((method) => <ProductChip key={method}>{method}</ProductChip>)}
      </div>
    </button>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="relative h-9 min-w-[150px]">
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-full w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[12px] font-semibold text-slate-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100">
        <option value="">{label}</option>
        {options.map((option) => <option key={option} value={option}>{compactDomain(option)}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function ProductTable({ rows, onSelect }: { rows: DataProduct[]; onSelect: (product: DataProduct) => void }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200">
      <div className="data-products-table-row grid bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        <span>Product Name</span><span>Domain</span><span>Type</span><span>Status</span><span>Owner</span><span>Quality</span><span>Consumption</span><span>Last Updated</span><span />
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {rows.map((product) => {
          const icon = productIconMap[product.id] ?? { icon: Database, tone: "orange" as ProductTone };
          const Icon = icon.icon;
          return (
            <button key={product.id} onClick={() => onSelect(product)} className="data-products-table-row grid w-full items-center px-3 py-2 text-left transition hover:bg-orange-50/40">
              <span className="flex min-w-0 items-center gap-2">
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${toneMap[icon.tone]}`}><Icon className="h-3.5 w-3.5" /></span>
                <b className="truncate text-[11px] text-slate-800">{product.name}</b>
              </span>
              <span className="truncate text-[11px] font-medium text-slate-600">{compactDomain(product.domain)}</span>
              <span className="truncate text-[11px] font-medium text-slate-600">{product.type}</span>
              <StatusBadge status={product.status} />
              <span className="truncate text-[11px] font-medium text-slate-600">{product.owner}</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">{product.qualityScore}% <span className={`h-2 w-2 rounded-full ${product.qualityScore < 80 ? "bg-amber-400" : "bg-emerald-500"}`} /></span>
              <span className="flex flex-wrap gap-1">{product.consumptionMethods.slice(0, 2).map((method) => <ProductChip key={method}>{method}</ProductChip>)}</span>
              <span className="text-[11px] font-medium text-slate-500">{product.lastUpdated}</span>
              <MoreVertical className="h-4 w-4 justify-self-end text-slate-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GovernanceCard({ title, value, delta, icon: Icon, tone, warning = false, onClick }: { title: string; value: string; delta: string; icon: LucideIcon; tone: ProductTone; warning?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="min-h-[118px] rounded-[10px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-200">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${tone === "green" ? "text-emerald-600" : tone === "teal" ? "text-cyan-700" : tone === "blue" ? "text-blue-500" : tone === "purple" ? "text-purple-600" : "text-orange-600"}`} />
        <b className="truncate text-[12px] text-slate-800">{title}</b>
      </div>
      <p className="mt-4 text-[25px] font-extrabold leading-none text-slate-950">{value}</p>
      <p className={`mt-4 text-[11px] font-bold ${warning ? "text-orange-600" : "text-emerald-600"}`}>{warning ? "" : "▲ "}{delta}</p>
    </button>
  );
}

function RecommendationRow({ title, action, icon: Icon, tone, onClick }: { title: string; action: string; icon: LucideIcon; tone: ProductTone; productId: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[42px_1fr_108px] items-center gap-3 rounded-[10px] border border-slate-100 bg-white px-3 py-2 text-left shadow-sm transition hover:border-orange-200">
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="truncate text-[12px] font-semibold text-slate-700">{title}</span>
      <span className="rounded-lg border border-orange-200 bg-orange-50/30 px-3 py-1.5 text-center text-[12px] font-bold text-orange-600">{action}</span>
    </button>
  );
}

function ActivityRow({ title, actor, time, icon: Icon, tone, onClick }: { title: string; actor: string; time: string; icon: LucideIcon; tone: ProductTone; productId: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[34px_1fr_58px] items-start gap-3 rounded-[10px] px-2 py-1.5 text-left transition hover:bg-orange-50/40">
      <span className={`grid h-8 w-8 place-items-center rounded-full border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-800">{title}</b>
        <span className="block truncate text-[11px] text-slate-500">by {actor}</span>
      </span>
      <span className="pt-0.5 text-right text-[11px] font-semibold text-slate-500">{time}</span>
    </button>
  );
}

function ProductChip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">{children}</span>;
}

function PageButton({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`grid h-8 min-w-8 place-items-center rounded-md border px-2 text-[12px] font-bold ${active ? "border-orange-500 text-orange-600 shadow-[0_0_0_1px_rgba(249,115,22,.18)]" : "border-transparent text-slate-500 hover:border-slate-200"}`}>{children}</button>;
}

function compactDomain(value: string) {
  return value === "Provider Management" ? "Provider Mgmt" : value;
}
