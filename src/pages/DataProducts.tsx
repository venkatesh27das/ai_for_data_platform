import { Box, CloudUpload, FileCog, Grid2X2, ShieldCheck, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";
import DataCard from "../components/common/DataCard";
import EntityDrawer from "../components/common/EntityDrawer";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import RecommendationItem from "../components/common/RecommendationItem";
import SearchFilterBar from "../components/common/SearchFilterBar";
import StatusBadge from "../components/common/StatusBadge";
import Table, { type Column } from "../components/common/Table";
import { dataProducts, domains, recommendations } from "../data/mockData";
import type { DataProduct, DrawerEntity } from "../types";

export default function DataProducts() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const filtered = useMemo(() => dataProducts.filter((p) =>
    [p.name, p.domain, p.owner, p.tags.join(" ")].join(" ").toLowerCase().includes(search.toLowerCase()) &&
    (!domain || p.domain === domain) && (!type || p.type === type) && (!status || p.status === status)
  ), [search, domain, type, status]);
  const columns: Column<DataProduct>[] = [
    { header: "Product Name", render: (p) => <b>{p.name}</b> },
    { header: "Domain", render: (p) => p.domain },
    { header: "Type", render: (p) => p.type },
    { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { header: "Owner", render: (p) => p.owner },
    { header: "Quality", render: (p) => <span className={p.qualityScore < 80 ? "font-bold text-amber-600" : "font-bold text-emerald-600"}>{p.qualityScore}%</span> },
    { header: "Consumption", render: (p) => <div className="flex gap-1">{p.consumptionMethods.slice(0, 2).map((m) => <span key={m} className="rounded bg-slate-100 px-1.5 py-0.5 font-bold">{m}</span>)}</div> },
    { header: "Last Updated", render: (p) => p.lastUpdated },
  ];
  return (
    <>
      <section className="panel p-6">
        <PageHeader title="Data Products" subtitle="Discover, certify, manage, and consume trusted data products across structured and unstructured data." actions={[
          { label: "Create Data Product", icon: Box, primary: true }, { label: "Browse Catalog", icon: Grid2X2 }, { label: "Import Metadata", icon: CloudUpload }, { label: "Manage Contracts", icon: FileCog },
        ]} />
        <div className="grid grid-cols-6 gap-4">
          <MetricCard title="Total Products" value="248" delta="▲ 18 vs last 30 days" icon={Box} trend />
          <MetricCard title="Certified Products" value="136" delta="▲ 12" icon={ShieldCheck} color="green" trend />
          <MetricCard title="Drafts" value="28" delta="▲ 5" icon={FileCog} color="purple" trend />
          <MetricCard title="APIs Exposed" value="64" delta="▲ 7" icon={CloudUpload} trend />
          <MetricCard title="Average Quality Score" value="86.7%" delta="▲ 3.6 pts" icon={Star} color="blue" trend />
          <MetricCard title="Reuse Rate" value="72.4%" delta="▲ 6.2 pts" icon={Users} color="teal" trend />
        </div>
        <Block title="Featured Data Products"><div className="grid grid-cols-6 gap-4">{dataProducts.slice(0, 6).map((p) => <DataCard key={p.id} item={p} kind="product" onClick={() => setDrawer({ type: "product", id: p.id })} />)}</div></Block>
        <div className="mt-5 grid grid-cols-[1fr_420px] gap-4">
          <div className="panel p-4 shadow-none">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">All Data Products</h2><span className="text-xs text-slate-500">Showing {filtered.length} of 248 products</span></div>
            <SearchFilterBar search={search} onSearch={setSearch} filters={[
              { label: "All Domains", value: domain, options: domains, onChange: setDomain },
              { label: "All Types", value: type, options: Array.from(new Set(dataProducts.map((p) => p.type))), onChange: setType },
              { label: "All Status", value: status, options: ["Certified", "Draft", "Pending"], onChange: setStatus },
            ]} />
            <Table columns={columns} rows={filtered} onRowClick={(p) => setDrawer({ type: "product", id: p.id })} />
          </div>
          <div className="panel p-4 shadow-none">
            <h2 className="mb-3 font-bold">Product Health & Governance</h2>
            <div className="grid grid-cols-2 gap-3">{[["Contract Compliance", "95.6%"], ["SLA Adherence", "98.1%"], ["Access Requests", "28"], ["Data Quality Alerts", "7"], ["Certification Queue", "9"]].map(([a, b]) => <div key={a} className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold text-slate-500">{a}</p><p className="mt-2 text-2xl font-bold">{b}</p></div>)}</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4"><Block title="AI Recommendations">{recommendations.map((r) => <RecommendationItem key={r.id} {...r} onClick={() => r.relatedEntityType === "product" && setDrawer({ type: "product", id: r.relatedEntityId })} />)}</Block><Block title="Recent Activity"><div className="space-y-2">{dataProducts.slice(0, 5).map((p) => <button key={p.id} onClick={() => setDrawer({ type: "product", id: p.id })} className="w-full border-b border-slate-100 py-2 text-left text-xs"><b>{p.name}</b> was updated by {p.owner}<span className="float-right text-slate-500">{p.lastUpdated}</span></button>)}</div></Block></div>
      </section>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}
function Block({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-5"><h2 className="mb-3 font-bold">{title}</h2>{children}</section>; }
