import { ArrowRight, Bot, CheckCircle2, Clock, Database, FileText, GitFork, Grid2X2, Layers, Play, Plus, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { useState } from "react";
import EntityDrawer from "../components/common/EntityDrawer";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import ProgressBar from "../components/common/ProgressBar";
import RecommendationItem from "../components/common/RecommendationItem";
import StatusBadge from "../components/common/StatusBadge";
import Table, { type Column } from "../components/common/Table";
import { activeJourneys, dataProducts, getProduct, getSemantic, getStudio, recommendations } from "../data/mockData";
import type { ActiveJourney, DrawerEntity } from "../types";

const journeyStages = [
  { label: "Discover", icon: Sparkles, description: "Profile sources, infer domains, and identify reusable assets." },
  { label: "Ingest", icon: UploadCloud, description: "Connect structured, unstructured, batch, and streaming sources." },
  { label: "Process", icon: Layers, description: "Extract, transform, enrich, and build reliable pipelines." },
  { label: "Validate", icon: ShieldCheck, description: "Apply quality rules, contracts, lineage, and policy checks." },
  { label: "Productize", icon: Database, description: "Publish governed products with SLAs and consumption methods." },
  { label: "Contextualize", icon: GitFork, description: "Link products to glossary, metrics, ontology, and semantics." },
  { label: "Consume", icon: Bot, description: "Serve SQL, BI, API, vector, search, and AI-ready experiences." },
];

const templates = [
  ["Structured Source to Gold Product", "SQL, BI, contracts, certification"],
  ["PDF-to-Data Product Pipeline", "OCR, extraction, embeddings, vector search"],
  ["Semantic Model Accelerator", "Glossary, metrics, ontology relationships"],
  ["Legacy Warehouse Modernization", "Assessment, migration, validation"],
];

export default function DataJourney() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);

  const columns: Column<ActiveJourney>[] = [
    { header: "Journey", render: (journey) => <b>{journey.name}</b> },
    { header: "Domain", render: (journey) => journey.domain },
    { header: "Stage", render: (journey) => journey.stage },
    { header: "Status", render: (journey) => <StatusBadge status={journey.status} /> },
    { header: "Progress", render: (journey) => <ProgressBar value={journey.progress} /> },
    { header: "Owner", render: (journey) => journey.owner },
    { header: "Due", render: (journey) => journey.dueDate },
  ];

  return (
    <>
      <section className="panel p-6">
        <PageHeader
          title="Data Journey"
          subtitle="Orchestrate AI-assisted data engineering journeys from discovery and ingestion through governed consumption."
          actions={[
            { label: "Start New Data Journey", icon: Plus, primary: true },
            { label: "Resume Journey", icon: Play },
            { label: "Browse Journey Templates", icon: Grid2X2 },
            { label: "Import Source Metadata", icon: FileText },
          ]}
        />

        <div className="grid grid-cols-6 gap-4">
          <MetricCard title="Active Journeys" value="28" delta="▲ 14% vs last 30 days" icon={GitFork} trend />
          <MetricCard title="Running Pipelines" value="74" delta="▲ 9 this week" icon={Play} color="green" trend />
          <MetricCard title="Assets Created" value="352" delta="▲ 22%" icon={Database} color="blue" trend />
          <MetricCard title="Validation Pass Rate" value="96.4%" delta="▲ 2.1 pts" icon={ShieldCheck} color="green" trend />
          <MetricCard title="AI Suggestions" value="23" delta="New" icon={Sparkles} color="purple" trend />
          <MetricCard title="Due This Week" value="11" delta="3 at risk" icon={Clock} color="orange" trend />
        </div>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-950">AI-for-Data Journey Blueprint</h2>
            <button className="text-sm font-bold text-orange-600">Customize stages <ArrowRight className="ml-1 inline h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {journeyStages.map(({ label, icon: Icon, description }, index) => (
              <div key={label} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600"><Icon className="h-5 w-5" /></div>
                  <span className="text-xs font-extrabold text-slate-300">0{index + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-950">{label}</h3>
                <p className="mt-2 min-h-[54px] text-xs leading-5 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-[1fr_410px] gap-4">
          <div className="panel p-4 shadow-none">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Active Journeys</h2>
              <span className="text-xs font-semibold text-slate-500">Connected to products, semantics, and studios</span>
            </div>
            <Table columns={columns} rows={activeJourneys} onRowClick={(journey) => setDrawer({ type: "journey", id: journey.id })} />
          </div>

          <div className="panel p-4 shadow-none">
            <h2 className="mb-3 font-bold text-slate-950">Claims Modernization Storyline</h2>
            {activeJourneys.filter((journey) => journey.id === "jr-claims-modernization").map((journey) => (
              <div key={journey.id} className="space-y-3">
                <button onClick={() => setDrawer({ type: "journey", id: journey.id })} className="w-full rounded-xl border border-orange-200 bg-orange-50/50 p-4 text-left">
                  <div className="flex items-center justify-between"><b>{journey.name}</b><StatusBadge status={journey.status} /></div>
                  <p className="mt-2 text-xs text-slate-600">{journey.stage} · {journey.owner}</p>
                  <div className="mt-3"><ProgressBar value={journey.progress} /></div>
                </button>
                <LinkedRow label="Data Product" value={getProduct("dp-claims-gold")?.name ?? ""} onClick={() => setDrawer({ type: "product", id: "dp-claims-gold" })} />
                <LinkedRow label="Semantic Asset" value={getSemantic("sa-claims-ontology")?.name ?? ""} onClick={() => setDrawer({ type: "semantic", id: "sa-claims-ontology" })} />
                <LinkedRow label="Studio Session" value={getStudio("ss-claims-extraction")?.name ?? ""} onClick={() => setDrawer({ type: "studio", id: "ss-claims-extraction" })} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <Panel title="Journey Templates">
            {templates.map(([title, subtitle]) => (
              <button key={title} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-orange-200 hover:bg-orange-50/40">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-50 text-orange-600"><FileText className="h-4 w-4" /></span>
                <span><b className="block text-xs text-slate-900">{title}</b><span className="text-[11px] text-slate-500">{subtitle}</span></span>
              </button>
            ))}
          </Panel>
          <Panel title="AI Recommendations">
            {recommendations.slice(0, 4).map((rec) => (
              <RecommendationItem key={rec.id} {...rec} onClick={() => rec.relatedEntityType === "product" && setDrawer({ type: "product", id: rec.relatedEntityId })} />
            ))}
          </Panel>
          <Panel title="Journey Output Products">
            {dataProducts.slice(0, 5).map((product) => (
              <button key={product.id} onClick={() => setDrawer({ type: "product", id: product.id })} className="flex w-full items-center justify-between border-b border-slate-100 py-2.5 text-left text-xs">
                <span><b>{product.name}</b><span className="block text-slate-500">{product.domain} · {product.type}</span></span>
                <span className="font-bold text-emerald-600">{product.qualityScore}%</span>
              </button>
            ))}
          </Panel>
        </div>
      </section>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}

function LinkedRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-left transition hover:border-orange-200 hover:bg-orange-50/40">
      <span><span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span><b className="text-sm text-slate-900">{value}</b></span>
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="panel p-4 shadow-none"><h2 className="mb-3 font-bold text-slate-950">{title}</h2><div className="space-y-2">{children}</div></div>;
}
