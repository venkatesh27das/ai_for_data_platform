import { BookOpen, Boxes, GitBranch, Grid2X2, Import, Link2, Network, Plus, Target } from "lucide-react";
import { useMemo, useState } from "react";
import DataCard from "../components/common/DataCard";
import EntityDrawer from "../components/common/EntityDrawer";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import RecommendationItem from "../components/common/RecommendationItem";
import SearchFilterBar from "../components/common/SearchFilterBar";
import StatusBadge from "../components/common/StatusBadge";
import Table, { type Column } from "../components/common/Table";
import { domains, recommendations, semanticAssets } from "../data/mockData";
import type { DrawerEntity, SemanticAsset } from "../types";

export default function SemanticHub() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const [search, setSearch] = useState(""); const [domain, setDomain] = useState(""); const [type, setType] = useState(""); const [status, setStatus] = useState("");
  const filtered = useMemo(() => semanticAssets.filter((a) => [a.name, a.domain, a.owner, a.businessTerms.join(" ")].join(" ").toLowerCase().includes(search.toLowerCase()) && (!domain || a.domain === domain) && (!type || a.type === type) && (!status || a.status === status)), [search, domain, type, status]);
  const columns: Column<SemanticAsset>[] = [
    { header: "Asset Name", render: (a) => <b>{a.name}</b> }, { header: "Domain", render: (a) => a.domain }, { header: "Type", render: (a) => a.type }, { header: "Status", render: (a) => <StatusBadge status={a.status} /> }, { header: "Owner", render: (a) => a.owner }, { header: "Coverage", render: (a) => <b>{a.coverage}%</b> }, { header: "Linked Products", render: (a) => a.linkedDataProducts.length }, { header: "Updated", render: (a) => a.lastUpdated },
  ];
  return (
    <>
      <section className="panel p-6">
        <PageHeader title="Semantic Hub" subtitle="Define business meaning, manage semantic models, and connect data products to trusted business context." actions={[
          { label: "Create Semantic Model", icon: Plus, primary: true }, { label: "Browse Glossary", icon: Grid2X2 }, { label: "Import Business Terms", icon: Import }, { label: "Manage Metrics", icon: Network },
        ]} />
        <div className="grid grid-cols-6 gap-4"><MetricCard title="Semantic Models" value="42" delta="▲ 6" icon={Boxes} color="purple" /><MetricCard title="Business Terms" value="1,284" delta="▲ 58" icon={BookOpen} color="green" /><MetricCard title="Certified Metrics" value="216" delta="▲ 12" icon={Grid2X2} /><MetricCard title="Active Domains" value="12" delta="▲ 1" icon={GitBranch} color="blue" /><MetricCard title="Linked Data Products" value="168" delta="▲ 14" icon={Link2} color="teal" /><MetricCard title="Reuse Rate" value="74.8%" delta="▲ 3.6%" icon={Target} color="red" /></div>
        <Block title="Featured Semantic Assets"><div className="grid grid-cols-6 gap-4">{semanticAssets.slice(0, 6).map((a) => <DataCard key={a.id} item={a} kind="semantic" onClick={() => setDrawer({ type: "semantic", id: a.id })} />)}</div></Block>
        <div className="mt-5 grid grid-cols-[1fr_560px] gap-4">
          <div className="panel p-4 shadow-none"><h2 className="mb-3 font-bold">Semantic Assets Explorer</h2><SearchFilterBar search={search} onSearch={setSearch} filters={[{ label: "All Domains", value: domain, options: domains, onChange: setDomain }, { label: "All Types", value: type, options: Array.from(new Set(semanticAssets.map((a) => a.type))), onChange: setType }, { label: "All Status", value: status, options: ["Certified", "Draft"], onChange: setStatus }]} /><Table columns={columns} rows={filtered} onRowClick={(a) => setDrawer({ type: "semantic", id: a.id })} /></div>
          <div className="space-y-4"><div className="panel p-4 shadow-none"><h2 className="mb-3 font-bold">Semantic Health & Governance</h2><div className="grid grid-cols-3 gap-3">{[["Glossary Coverage", "88%"], ["Metric Consistency", "92%"], ["Relationship Completeness", "81%"], ["Review Queue", "14"], ["Policy Exceptions", "7"], ["Access Requests", "11"]].map(([a,b]) => <div key={a} className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold text-slate-500">{a}</p><p className="mt-1 text-xl font-bold">{b}</p></div>)}</div></div><RelationshipMap /></div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4"><Panel title="AI Recommendations">{recommendations.map((r) => <RecommendationItem key={r.id} {...r} />)}</Panel><Panel title="Recent Activity">{semanticAssets.slice(0, 5).map((a) => <button key={a.id} onClick={() => setDrawer({ type: "semantic", id: a.id })} className="w-full border-b border-slate-100 py-2 text-left text-xs"><b>{a.name}</b> updated<span className="float-right text-slate-500">{a.lastUpdated}</span></button>)}</Panel><Panel title="Top Business Terms / Popular Metrics">{["Customer", "Claim", "Policy", "Provider", "Premium"].map((t, i) => <div key={t} className="flex justify-between border-b border-slate-100 py-2 text-xs"><b>{i + 1}. {t}</b><span>{4589 - i * 511}</span></div>)}</Panel></div>
      </section>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}
function RelationshipMap() { const nodes = [["Claims","left-[44%] top-2 text-orange-600 bg-orange-50"],["Provider","left-8 top-24 text-blue-600 bg-blue-50"],["Customer","left-[38%] top-24 text-emerald-600 bg-emerald-50"],["Policy","right-24 top-24 text-cyan-600 bg-cyan-50"],["Finance","right-4 bottom-8 text-amber-600 bg-amber-50"],["Engagement","left-[45%] bottom-8 text-purple-600 bg-purple-50"]]; return <div className="panel relative h-52 overflow-hidden p-4 shadow-none"><h2 className="font-bold">Domain Relationship Map</h2><svg className="absolute inset-0 mt-8 h-full w-full text-slate-300"><line x1="25%" y1="45%" x2="45%" y2="45%" stroke="currentColor"/><line x1="45%" y1="45%" x2="65%" y2="45%" stroke="currentColor"/><line x1="50%" y1="20%" x2="45%" y2="45%" stroke="currentColor"/><line x1="65%" y1="45%" x2="82%" y2="70%" stroke="currentColor"/><line x1="48%" y1="50%" x2="52%" y2="72%" stroke="currentColor"/></svg>{nodes.map(([n,c]) => <span key={n} className={`absolute rounded-full border border-current px-4 py-1 text-xs font-bold ${c}`}>{n}</span>)}</div>; }
function Block({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-5"><h2 className="mb-3 font-bold">{title}</h2>{children}</section>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="panel p-4 shadow-none"><h2 className="mb-3 font-bold">{title}</h2><div className="space-y-2">{children}</div></div>; }
