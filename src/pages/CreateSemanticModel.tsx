import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Box,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Columns3,
  Database,
  FileText,
  Filter,
  GitBranch,
  Grid2X2,
  Info,
  Link2,
  ListChecks,
  Network,
  PlayCircle,
  Rocket,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type StepId = 1 | 2 | 3 | 4 | 5;
type Tone = "orange" | "green" | "purple" | "blue" | "teal" | "slate";
type PublishState = "confirm" | "success" | null;

const steps = ["Model Basics", "Sources & Scope", "Entities & Metrics", "Governance & Validation", "Review & Publish"] as const;

const toneMap: Record<Tone, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  teal: "border-cyan-100 bg-cyan-50 text-cyan-700",
  slate: "border-slate-100 bg-slate-50 text-slate-600",
};

const toneText: Record<Tone, string> = {
  orange: "text-orange-600",
  green: "text-emerald-600",
  purple: "text-purple-600",
  blue: "text-blue-600",
  teal: "text-cyan-700",
  slate: "text-slate-600",
};

const starters = [
  { title: "Payer Performance Semantic Layer", detail: "Finance, claims, and utilization model", icon: BarChart3, tone: "orange" },
  { title: "Provider Contract Ontology", detail: "Provider, contract, network, and rates", icon: Network, tone: "purple" },
  { title: "Customer 360 Starter", detail: "Members, plans, activity, and journeys", icon: Users, tone: "blue" },
] as const;

const sourceAssets = [
  { name: "Claims Gold", type: "Data Product", domain: "Claims", fields: "64", included: true, icon: Database },
  { name: "Provider Master", type: "Table", domain: "Provider", fields: "38", included: true, icon: Table2 },
  { name: "Revenue KPI Store", type: "Metric Store", domain: "Finance", fields: "22", included: true, icon: BarChart3 },
  { name: "Member Eligibility", type: "Dataset", domain: "Customer", fields: "41", included: false, icon: Database },
] as const;

const glossaryTerms = ["Claim", "Allowed Amount", "Payer", "Provider", "Member", "Service Date", "Revenue Cycle", "Contract Rate"] as const;

const entityRows = [
  { entity: "Claim", source: "Claims Gold", keys: "claim_id", attributes: "18", status: "Mapped" },
  { entity: "Provider", source: "Provider Master", keys: "provider_npi", attributes: "14", status: "Mapped" },
  { entity: "Payer", source: "Claims Gold", keys: "payer_id", attributes: "9", status: "Review" },
  { entity: "Contract", source: "Provider Master", keys: "contract_id", attributes: "11", status: "Draft" },
] as const;

const relationships = [
  { title: "Claim belongs to Payer", detail: "claim.payer_id -> payer.payer_id", icon: Link2, tone: "green" },
  { title: "Claim rendered by Provider", detail: "claim.provider_npi -> provider.provider_npi", icon: Link2, tone: "purple" },
  { title: "Provider governed by Contract", detail: "provider.contract_id -> contract.contract_id", icon: Link2, tone: "orange" },
] as const;

const metricRows = [
  { metric: "Claim Volume", formula: "count(distinct claim_id)", grain: "Payer, Month", status: "Valid" },
  { metric: "Allowed Amount", formula: "sum(allowed_amount)", grain: "Claim, Service Date", status: "Valid" },
  { metric: "Denial Rate", formula: "denied_claims / total_claims", grain: "Payer, Provider", status: "Review" },
  { metric: "Contract Leakage", formula: "allowed - contracted_rate", grain: "Provider, Contract", status: "Draft" },
] as const;

const nlqTests = [
  "Show claim volume by payer for the last 90 days",
  "What is denial rate by provider group?",
  "Compare allowed amount against contract rate",
] as const;

const reviewChecks = [
  { label: "Source assets mapped", value: "3 / 4", status: "Passed" },
  { label: "Glossary terms linked", value: "8", status: "Passed" },
  { label: "Entity relationships", value: "3 ready", status: "Passed" },
  { label: "Metric tests", value: "3 passed, 1 review", status: "Review" },
  { label: "Governance policy", value: "PHI access inherited", status: "Passed" },
] as const;

const impactRows = [
  { label: "Estimated entities", value: "4", icon: Box, tone: "purple" },
  { label: "Reusable metrics", value: "12", icon: BarChart3, tone: "orange" },
  { label: "Glossary coverage", value: "86%", icon: BookOpen, tone: "green" },
  { label: "Query readiness", value: "91%", icon: Sparkles, tone: "blue" },
] as const;

export default function CreateSemanticModel() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [publishState, setPublishState] = useState<PublishState>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const saveDraft = () => {
    setDraftSaved(true);
    setNotice("Draft saved");
    window.setTimeout(() => setDraftSaved(false), 1800);
  };
  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 1600);
  };
  const handlePrototypeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;
    const label = button.textContent?.replace(/\s+/g, " ").trim();
    if (!label || label === "Continue" || label === "Publish Model" || label === "Save as Draft" || label === "Draft Saved") return;
    if (label.includes("Model Basics") || label.includes("Sources & Scope") || label.includes("Entities & Metrics") || label.includes("Governance & Validation") || label.includes("Review & Publish")) return;
    showNotice(`${label} selected`);
  };
  const continueCurrent = () => {
    if (activeStep < 5) {
      const nextStep = (activeStep + 1) as StepId;
      setActiveStep(nextStep);
      showNotice(`Moved to ${steps[nextStep - 1]}`);
      return;
    }
    setPublishState("confirm");
  };

  return (
    <div className="space-y-4" onClickCapture={handlePrototypeClick}>
      <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-card">
        <div className="text-[12px] font-semibold text-slate-600">
          <button onClick={() => navigate("/studios")} className="hover:text-orange-600">Studios</button>
          <span className="mx-2 text-slate-300">/</span>
          <button onClick={() => navigate("/studios/semantic")} className="hover:text-orange-600">Semantic Studio</button>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900">Create Semantic Model</span>
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Create Semantic Model</h1>
            <p className="mt-2 max-w-[860px] text-[13px] font-medium leading-5 text-slate-700">Define model scope, business meaning, and governed semantic assets for trusted consumption.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={saveDraft} className="inline-flex h-11 min-w-[140px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-900 shadow-sm hover:border-orange-200 hover:text-orange-600">
              {draftSaved ? "Draft Saved" : "Save as Draft"}
            </button>
            <button onClick={continueCurrent} className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-lg border border-orange-500 bg-orange-600 px-6 text-[13px] font-extrabold text-white shadow-sm hover:bg-orange-700">{activeStep === 5 ? "Publish Model" : "Continue"}</button>
          </div>
        </div>

        <SemanticStepper activeStep={activeStep} setActiveStep={setActiveStep} />

        {activeStep === 1 ? (
          <BasicsStep onCancel={() => navigate("/studios/semantic")} onContinue={() => setActiveStep(2)} />
        ) : activeStep === 2 ? (
          <SourcesStep onBack={() => setActiveStep(1)} onContinue={() => setActiveStep(3)} />
        ) : activeStep === 3 ? (
          <EntitiesStep onBack={() => setActiveStep(2)} onContinue={() => setActiveStep(4)} />
        ) : activeStep === 4 ? (
          <MetricsStep onBack={() => setActiveStep(3)} onContinue={() => setActiveStep(5)} />
        ) : (
          <ReviewStep onBack={() => setActiveStep(4)} onPublish={() => setPublishState("confirm")} />
        )}
      </section>

      {publishState === "confirm" ? <PublishConfirmDialog onClose={() => setPublishState(null)} onConfirm={() => setPublishState("success")} /> : null}
      {publishState === "success" ? <PublishSuccessDialog onStay={() => setPublishState(null)} onOpenStudio={() => navigate("/studios/semantic")} /> : null}
      {notice ? <div className="fixed bottom-5 right-5 z-[60] rounded-lg border border-slate-200 bg-white px-4 py-3 text-[12px] font-extrabold text-slate-800 shadow-2xl">{notice}</div> : null}
    </div>
  );
}

function BasicsStep({ onCancel, onContinue }: { onCancel: () => void; onContinue: () => void }) {
  return (
    <div className="semantic-create-wire-grid mt-5">
      <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 min-[1180px]:grid-cols-2">
          <div className="border-b border-slate-200 p-4 min-[1180px]:border-r">
            <SectionHeading label="A." title="Basic Information" />
            <div className="mt-4 grid grid-cols-1 gap-4 min-[900px]:grid-cols-[1fr_220px]">
              <WireField label="Model Name" required><TextInput value="Payer Performance Semantic Model" /></WireField>
              <WireField label="Business Domain" required><SelectBox value="Finance & Performance" /></WireField>
            </div>
            <div className="mt-4">
              <WireField label="Model Type" required>
                <div className="grid grid-cols-2 gap-2 min-[1500px]:grid-cols-4">
                  <ModelTypeOption selected icon={Network} title="Semantic Layer" detail="Curated semantic layer for analytics & AI" tone="orange" />
                  <ModelTypeOption icon={BarChart3} title="KPI Model" detail="Predefined metrics and calculations" tone="blue" />
                  <ModelTypeOption icon={BookOpen} title="Business Glossary" detail="Business terms and definitions" tone="purple" />
                  <ModelTypeOption icon={Box} title="Ontology" detail="Concepts and relationships" tone="slate" />
                </div>
              </WireField>
            </div>
            <div className="mt-4">
              <WireField label="Description" required>
                <div>
                  <textarea className="h-[86px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium leading-5 text-slate-800 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue="Standardize payer performance metrics, dimensions, and business definitions to provide a trusted semantic foundation for analytics, reporting, and AI consumption across the organization." />
                  <div className="-mt-6 pr-3 text-right text-[11px] font-semibold text-slate-500">156 / 500</div>
                </div>
              </WireField>
            </div>
          </div>

          <div className="border-b border-slate-200 p-4">
            <SectionHeading label="B." title="Ownership & Workspace Context" />
            <div className="mt-4 space-y-4">
              <WireField label="Business Owner" required><SelectBox value="Revenue Analytics" /></WireField>
              <WireField label="Technical Owner" required><SelectBox value="Semantic Platform Team" /></WireField>
              <div className="grid grid-cols-2 gap-4">
                <WireField label="Workspace" required><SelectBox value="HealthCorp" /></WireField>
                <WireField label="Environment" required><SelectBox value="Production" /></WireField>
              </div>
              <WireField label="Priority" required><SelectBox value="High" /></WireField>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4">
          <SectionHeading label="C." title="Intended Consumption" />
          <div className="mt-3 grid grid-cols-2 gap-2 min-[1180px]:grid-cols-6">
            <CheckboxChip checked label="BI Dashboards" />
            <CheckboxChip checked label="NLQ / AI Assistants" />
            <CheckboxChip checked label="Data Products" />
            <CheckboxChip label="APIs / Applications" />
            <CheckboxChip label="Executive Reporting" />
            <CheckboxChip label="Self-Service Analytics" />
          </div>
        </div>

        <div className="grid grid-cols-1 min-[1180px]:grid-cols-[1.18fr_1fr]">
          <div className="border-b border-slate-200 p-4 min-[1180px]:border-b-0 min-[1180px]:border-r">
            <SectionHeading label="D." title="Starter Options" />
            <div className="mt-3 grid grid-cols-1 gap-2 min-[900px]:grid-cols-3">
              <StarterCard title="Start from Blank" detail="Build your model from scratch with full control." tone="orange" />
              <StarterCard selected title="Use Template" detail="Kickstart with a proven template for faster delivery." tone="orange" />
              <StarterCard title="Import Existing Semantic Asset" detail="Import and adapt an existing semantic model or asset." tone="slate" />
            </div>
            <button className="mt-3 grid w-full grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[10px] border border-slate-200 bg-white p-3 text-left shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600"><Network className="h-5 w-5" /></span>
              <span className="min-w-0">
                <b className="block truncate text-[13px] text-slate-950">Payer Performance Template</b>
                <span className="mt-1 block truncate text-[11px] font-medium text-slate-500">Pre-built semantic model for payer performance analytics.</span>
              </span>
              <span className="flex items-center gap-3 text-[11px] font-extrabold text-emerald-600">
                <span className="hidden gap-1 min-[1500px]:flex"><Tag label="Metrics" /><Tag label="Dimensions" /><Tag label="Time Intelligence" /></span>
                <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" />Selected</span>
              </span>
            </button>
          </div>

          <div className="p-4">
            <SectionHeading label="E." title="Success Criteria" />
            <div className="mt-3 grid grid-cols-3 gap-3">
              <CriteriaInput label="Target Query Success Rate" value="95" suffix="%" detail="Target % of successful queries" />
              <CriteriaInput label="Reusable Metrics Goal" value="25" detail="Target number of reusable metrics" />
              <CriteriaInput label="Validation Coverage" value="90" suffix="%" detail="Target % of validated assets" />
            </div>
          </div>
        </div>

      </section>

      <SemanticCreateRail />
    </div>
  );
}

function SourcesStep({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="semantic-source-wire-grid mt-5">
      <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <SectionHeading label="A." title="Source Selection" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Choose data sources and assets to include in your semantic model.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-4">
            <SourceTypeTile selected icon={Sparkles} title="Snowflake" detail="Data Warehouse" meta="3 connections" tone="blue" />
            <SourceTypeTile icon={Grid2X2} title="Databricks" detail="Data Lakehouse" meta="2 connections" tone="orange" />
            <SourceTypeTile icon={Database} title="Lakehouse / Delta" detail="Delta Lake" meta="2 connections" tone="teal" />
            <SourceTypeTile icon={Box} title="Published Data Product" detail="Enterprise Catalog" meta="8 products" tone="purple" />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
            <WireField label="Connection" required><SelectBox value="Enterprise Finance Lakehouse" /></WireField>
            <WireField label="Catalog / Database" required><SelectBox value="finance_gold" /></WireField>
            <WireField label="Schema / Namespace" required><SelectBox value="payer_performance" /></WireField>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[11px] font-extrabold text-slate-600">Select source assets</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex h-9 items-center justify-between gap-3 border-b border-slate-200 px-3">
                <span className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-slate-500"><Search className="h-4 w-4" />Search tables, views, or assets...</span>
                <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-600">5 selected</span>
              </div>
              <div className="grid grid-cols-1 gap-2 p-2 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-5">
                <SourceAssetPill name="claims_fact" rows="218.4M rows" />
                <SourceAssetPill name="member_dim" rows="1.2M rows" />
                <SourceAssetPill name="provider_dim" rows="182K rows" />
                <SourceAssetPill name="plan_dim" rows="4.3K rows" />
                <SourceAssetPill name="calendar_dim" rows="730 rows" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 text-[10px] font-extrabold text-slate-500">
                <span>Total selected rows (est.): ~220.0M</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Data freshness: Updated 2h ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4">
          <SectionHeading label="B." title="Scope Definition" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Define the business context and scope for this semantic model.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
            <WireField label="Primary Subject Area" required><SelectBox value="Payer Performance" /></WireField>
            <WireField label="Business Grain" required><SelectBox value="Monthly plan-provider performance" /></WireField>
            <WireField label="Time Granularity" required><MultiSelectBox labels={["Monthly", "Quarterly"]} /></WireField>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 min-[1180px]:grid-cols-2">
            <div>
              <span className="mb-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600">In Scope Metrics <span className="text-slate-400">(6)</span><Info className="h-3 w-3 text-slate-400" /></span>
              <div className="grid grid-cols-2 gap-2">
                {["Total Claims", "Allowed Amount", "PMPM Cost", "Denial Rate", "Provider Performance Score", "Member Count"].map((item) => <ScopeToken key={item} label={item} tone="orange" />)}
              </div>
            </div>
            <div>
              <span className="mb-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600">In Scope Dimensions <span className="text-slate-400">(6)</span><Info className="h-3 w-3 text-slate-400" /></span>
              <div className="grid grid-cols-2 gap-2">
                {["Plan", "Provider", "Geography", "Time", "Line of Business", "Claim Type"].map((item) => <ScopeToken key={item} label={item} tone="blue" />)}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <WireField label="Business context / model notes">
              <div>
                <textarea className="h-[64px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium leading-5 text-slate-800 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue="Model aligns semantic definitions for finance, reporting, and AI use cases. Focus on plan-provider performance, financial outcomes, and operational efficiency." />
                <div className="-mt-6 pr-3 text-right text-[10px] font-semibold text-slate-500">126 / 500</div>
              </div>
            </WireField>
          </div>
        </div>

        <div className="p-4">
          <SectionHeading label="C." title="Data Readiness & Scope Checks" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Review the readiness of your selected assets and scope.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-4">
            <ReadinessCard icon={CheckCircle2} tone="green" label="Schema Coverage" value="92%" detail="Good coverage across assets" />
            <ReadinessCard icon={Network} tone="blue" label="Join Relationships Detected" value="14" detail="High confidence relationships" />
            <ReadinessCard icon={ShieldCheck} tone="orange" label="PII Sensitive Columns" value="3 masked" detail="Auto-masked in semantic layer" />
            <ReadinessCard icon={Clock} tone="green" label="Freshness" value="Updated 2h ago" detail="All sources within SLA" />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
            <ToggleRow label="Include certified assets only" enabled />
            <ToggleRow label="Auto-detect relationships" enabled />
            <ToggleRow label="Profile selected assets" enabled />
          </div>
        </div>

      </section>

      <SourceScopeRail />
    </div>
  );
}

function EntitiesStep({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="semantic-entities-wire-grid mt-5">
      <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <SectionHeading label="A." title="Entity Modeling" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Define business entities, relationships, and semantic roles for this model.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-5">
            <EntityModelTile selected icon={Grid2X2} title="Claims" role="Primary Fact" state="Selected" tone="orange" />
            <EntityModelTile icon={Users} title="Member" role="Dimension" state="Active" tone="purple" />
            <EntityModelTile icon={ShieldCheck} title="Provider" role="Dimension" state="Active" tone="blue" />
            <EntityModelTile icon={FileText} title="Plan" role="Dimension" state="Active" tone="green" />
            <EntityModelTile icon={Calendar} title="Calendar" role="Time Dimension" state="Active" tone="orange" />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
            <WireField label="Primary Fact Entity" required><SelectBox value="Claims" /></WireField>
            <WireField label="Entity Relationship Mode" required><SelectBox value="Auto-detected + curated" /></WireField>
            <WireField label="Default Join Type" required><SelectBox value="Business-safe inner / left joins" /></WireField>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 min-[1180px]:grid-cols-[.78fr_1fr]">
            <div className="rounded-[10px] border border-slate-200 bg-white p-3">
              <h3 className="mb-2 text-[12px] font-extrabold text-slate-950">Relationship Diagram</h3>
              <RelationshipDiagram />
            </div>
            <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
              <h3 className="border-b border-slate-100 px-3 py-2 text-[12px] font-extrabold text-slate-950">Relationship Mapping</h3>
              <RelationshipMappingTable />
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4">
          <SectionHeading label="B." title="Metrics Design & Calculation Logic" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Define reusable business metrics, aggregations, and semantic behavior.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <MetricCategory active icon={BarChart3} label="Financial" />
            <MetricCategory active icon={ShieldCheck} label="Quality" />
            <MetricCategory icon={Sparkles} label="Utilization" />
            <MetricCategory icon={Network} label="Operational" />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-3 min-[1180px]:grid-cols-[1.1fr_300px]">
            <MetricDesignTable />
            <MetricLogicPanel />
          </div>
        </div>

        <div className="p-4">
          <SectionHeading label="C." title="Semantic Behavior & Naming" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Set user-friendly labels, synonyms, and default query behavior.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-4">
            <BehaviorCard icon={FileText} tone="blue" title="Display Names & Descriptions" value="11 assets" detail="Business-friendly labels applied to" />
            <BehaviorCard icon={Sparkles} tone="blue" title="Synonyms & NLQ Terms" chips={["PMPM", "cost per member", "provider score", "claims cost", "+5"]} />
            <BehaviorCard icon={Filter} tone="teal" title="Default Filters" chips={["Active members", "Current year", "Commercial LOB"]} />
            <BehaviorCard icon={BarChart3} tone="blue" title="Formatting Standards" chips={["Currency USD", "Percent 0-100", "Title case labels"]} />
          </div>
          <div className="mt-3">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[12px] font-medium leading-5 text-slate-700">Semantic layer tuned for finance, reporting, and AI assistant use cases. Metrics are optimized for monthly payer performance analysis.</p>
              <div className="text-right text-[10px] font-semibold text-slate-500">137 / 300</div>
            </div>
          </div>
        </div>

      </section>

      <EntitiesMetricsRail />
    </div>
  );
}

function MetricsStep({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="semantic-governance-wire-grid mt-5">
      <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <SectionHeading label="A." title="Governance Configuration" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Define ownership, access policies, certification level, and consumption guardrails for this semantic model.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-4">
            <GuardrailTile icon={ShieldCheck} tone="green" title="Access Control" detail="Role-based policy" state="Enabled" />
            <GuardrailTile icon={FileText} tone="purple" title="Certification Workflow" detail="Approval and sign-off" state="Enabled" />
            <GuardrailTile icon={ShieldCheck} tone="orange" title="Sensitive Data Protection" detail="Masking and restrictions" state="Enabled" />
            <GuardrailTile icon={GitBranch} tone="blue" title="Lineage & Audit" detail="Traceability and logs" state="Enabled" />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
            <WireField label="Business Steward" required><SelectBox value="Revenue Governance" /></WireField>
            <WireField label="Approver Group" required><SelectBox value="Semantic Review Board" /></WireField>
            <WireField label="Certification Level" required><SelectBox value="Certified" /></WireField>
            <WireField label="Default Access Policy" required><SelectBox value="Finance governed access" /></WireField>
            <WireField label="Linked Data Product"><SelectBox value="Payer Performance Semantic Product" /></WireField>
            <WireField label="Retention / Compliance Class"><SelectBox value="Internal analytics" /></WireField>
          </div>

          <div className="mt-3">
            <WireField label="Allowed Consumer Roles">
              <MultiSelectBox labels={["Finance Analyst", "BI Consumer", "AI Assistant", "Data Product App", "Data Steward"]} />
            </WireField>
          </div>
          <div className="mt-3">
            <WireField label="Governance notes">
              <div>
                <textarea className="h-[58px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium leading-5 text-slate-800 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue="Semantic model is certified for governed BI, self-service analytics, and AI assistant use cases. Access is restricted to approved finance and analytics roles." />
                <div className="-mt-6 pr-3 text-right text-[10px] font-semibold text-slate-500">168 / 400</div>
              </div>
            </WireField>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4">
          <SectionHeading label="B." title="Validation Configuration & Results" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Configure validation suites and review readiness of semantic logic, query behavior, and policy compliance.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[1180px]:grid-cols-[1fr_400px]">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <ValidationTab active label="Semantic" />
                <ValidationTab label="Query" />
                <ValidationTab active label="Policy" />
                <ValidationTab label="Security" />
              </div>
              <ValidationSuiteTable />
            </div>
            <ValidationRulePanel />
          </div>
        </div>

        <div className="p-4">
          <SectionHeading label="C." title="Approval Gates & Publish Controls" />
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Set required approvals and final quality gates before the model can be published.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-4">
            <GateCard icon={ShieldCheck} tone="green" label="Policy Rules Linked" value="4" detail="All mandatory policies applied" />
            <GateCard icon={Users} tone="purple" label="Approval Steps" value="2" detail="Business + Technical" />
            <GateCard icon={Sparkles} tone="blue" label="Validation Coverage" value="94%" detail="Most checks completed" />
            <GateCard icon={FileText} tone="orange" label="Publish Readiness" value="92%" detail="1 warning remains" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 min-[900px]:grid-cols-4">
            <ToggleRow label="Require business sign-off" enabled />
            <ToggleRow label="Require technical sign-off" enabled />
            <ToggleRow label="Create audit trail package" enabled />
            <ToggleRow label="Allow publish with warnings" />
          </div>
        </div>

      </section>

      <GovernanceValidationRail />
    </div>
  );
}

function ReviewStep({ onBack, onPublish }: { onBack: () => void; onPublish: () => void }) {
  return (
    <div className="semantic-review-wire-grid mt-5">
      <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-[10px] border border-orange-200 bg-orange-50 px-3 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg text-orange-600"><TriangleAlert className="h-5 w-5" /></span>
            <span>
              <b className="block text-[13px] text-slate-950">Ready to publish with 1 warning</b>
              <span className="mt-0.5 block text-[12px] font-medium text-slate-700">NLQ query test set has 3 prompts that may need synonym tuning or filter clarification. All other required checks are complete.</span>
            </span>
            <button className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-800 shadow-sm">Review warnings</button>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <SectionHeading label="A." title="Final Model Review" />
            <span className="text-[11px] font-semibold text-slate-500">Review the full semantic model configuration before publishing.</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-4">
            <FinalReviewCard icon={FileText} tone="purple" title="Model Basics" status="Complete" rows={[["Model Type", "Payer Performance Semantic Model"], ["Domain", "Finance & Performance"], ["Consumption targets", "BI, AI Assistants, Data Products"]]} />
            <FinalReviewCard icon={Database} tone="blue" title="Sources & Scope" status="Complete" rows={[["Sources connected", "1"], ["Assets selected", "5"], ["In-scope metrics", "6"], ["In-scope dimensions", "6"]]} />
            <FinalReviewCard icon={Network} tone="orange" title="Entities & Metrics" status="Ready" rows={[["Entities modeled", "5"], ["Relationships validated", "3 / 4"], ["Metrics defined", "5"], ["KPIs", "2"]]} />
            <FinalReviewCard icon={ShieldCheck} tone="green" title="Governance & Validation" status="1 Warning" warning rows={[["Policies linked", "4"], ["Roles mapped", "5"], ["Checks passed", "5 / 6"], ["Approval gates", "2"]]} />
          </div>
        </div>

        <div className="grid grid-cols-1 border-b border-slate-200 min-[1180px]:grid-cols-[minmax(520px,.72fr)_minmax(0,1fr)]">
          <div className="border-b border-slate-200 p-4 min-[1180px]:border-b-0 min-[1180px]:border-r">
            <SectionHeading label="B." title="Publish Configuration" />
            <div className="mt-3 grid grid-cols-1 gap-3 min-[1180px]:grid-cols-[minmax(170px,.7fr)_minmax(250px,1fr)]">
              <WireField label="Version"><SelectBox value="v1.0.0" /></WireField>
              <WireField label="Publish Destinations"><DestinationGrid /></WireField>
              <WireField label="Publish Mode"><PublishMode /></WireField>
              <WireField label="Catalog Destination"><SelectBox value="HealthCorp Semantic Catalog" /></WireField>
              <WireField label="Visibility"><SelectBox value="Certified / Enterprise" /></WireField>
              <WireField label="Linked Data Product"><SelectBox value="Payer Performance Semantic Product" /></WireField>
              <WireField label="Release Owner"><SelectBox value="Semantic Platform Team" /></WireField>
            </div>
            <div className="mt-3">
              <WireField label="Release Notes">
                <div>
                  <textarea className="h-[58px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium leading-5 text-slate-800 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue="Initial production release of payer performance semantic layer with governed finance metrics, reusable dimensions, certified access policies, and AI-ready query behavior." />
                  <div className="-mt-6 pr-3 text-right text-[10px] font-semibold text-slate-500">153 / 500</div>
                </div>
              </WireField>
            </div>
          </div>

          <div className="p-4">
            <SectionHeading label="C." title="Final Validation & Approval Checklist" />
            <FinalChecklistTable />
            <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2">
              <ToggleBox label="Notify downstream consumers after publish" />
              <ToggleBox label="Generate audit package" />
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4">
          <SectionHeading label="D." title="Post-Publish Consumption Preview" />
          <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
            <ConsumptionPreview icon={BarChart3} tone="purple" title="BI Dashboards" detail="Certified metrics available to finance and performance dashboards." />
            <ConsumptionPreview icon={Sparkles} tone="blue" title="AI Assistants" detail="Natural language and governed semantic access enabled for assistant workflows." />
            <ConsumptionPreview icon={Box} tone="orange" title="Data Products" detail="Semantic asset linked to enterprise data product catalog." />
          </div>
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-slate-700">Publishing will create lineage, version history, audit logs, and governed access metadata automatically.</div>
        </div>

      </section>

      <ReviewPublishRail />
    </div>
  );
}

function SemanticStepper({ activeStep, setActiveStep }: { activeStep: StepId; setActiveStep: (step: StepId) => void }) {
  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((step, index) => {
          const stepId = (index + 1) as StepId;
          const active = stepId === activeStep;
          const complete = stepId < activeStep;
          return (
            <div key={step} className="flex flex-1 items-center gap-3 last:flex-none">
              <button onClick={() => setActiveStep(stepId)} className="flex shrink-0 items-center gap-3 text-left">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-[12px] font-extrabold ${complete ? "bg-emerald-600 text-white" : active ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"}`}>{complete ? <Check className="h-4 w-4" /> : stepId}</span>
                <span className={`whitespace-nowrap text-[12px] font-extrabold ${active ? "text-slate-950" : "text-slate-600"}`}>{step}</span>
              </button>
              {index < steps.length - 1 ? <span className="hidden h-px min-w-[58px] flex-1 bg-slate-200 min-[1180px]:block" /> : null}
            </div>
          );
        })}
        <div className="ml-auto hidden items-center gap-2 whitespace-nowrap text-[12px] font-extrabold text-slate-600 min-[1500px]:flex">
          <Clock className="h-4 w-4" /> Estimated setup time: 10-15 mins
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return <h2 className="text-[15px] font-extrabold text-slate-950">{label} {title}</h2>;
}

function WireField({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold text-slate-600">{label} {required ? <span className="text-orange-600">*</span> : null}</span>
      {children}
    </label>
  );
}

function ModelTypeOption({ icon: Icon, title, detail, tone, selected = false }: { icon: LucideIcon; title: string; detail: string; tone: Tone; selected?: boolean }) {
  const [isSelected, setIsSelected] = useState(selected);
  return (
    <button onClick={() => setIsSelected(!isSelected)} className={`grid min-h-[76px] grid-cols-[26px_1fr] gap-2 rounded-lg border p-3 text-left shadow-sm ${isSelected ? "border-orange-500 bg-orange-50/40" : "border-slate-200 bg-white hover:border-orange-200"}`}>
      <Icon className={`mt-0.5 h-5 w-5 ${isSelected ? "text-orange-600" : toneText[tone]}`} />
      <span>
        <b className="block text-[11px] text-slate-950">{title}</b>
        <span className="mt-1 block text-[10px] font-semibold leading-4 text-slate-500">{detail}</span>
      </span>
    </button>
  );
}

function CheckboxChip({ label, checked = false }: { label: string; checked?: boolean }) {
  const [isChecked, setIsChecked] = useState(checked);
  return (
    <button onClick={() => setIsChecked(!isChecked)} className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold shadow-sm ${isChecked ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-800"}`}>
      <span className={`grid h-4 w-4 place-items-center rounded border ${isChecked ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 bg-white text-transparent"}`}><Check className="h-3 w-3" /></span>
      {label}
    </button>
  );
}

function StarterCard({ title, detail, tone, selected = false }: { title: string; detail: string; tone: Tone; selected?: boolean }) {
  const [isSelected, setIsSelected] = useState(selected);
  return (
    <button onClick={() => setIsSelected(!isSelected)} className={`grid min-h-[76px] grid-cols-[24px_1fr] gap-2 rounded-lg border p-3 text-left shadow-sm ${isSelected ? "border-orange-500 bg-orange-50/50" : "border-slate-200 bg-white hover:border-orange-200"}`}>
      <span className={`mt-1 h-4 w-4 rounded-full border ${isSelected ? "border-orange-500 bg-orange-500 shadow-[inset_0_0_0_4px_white]" : tone === "orange" ? "border-orange-300" : "border-slate-300"}`} />
      <span>
        <b className="block text-[11px] text-slate-950">{title}</b>
        <span className="mt-1 block text-[10px] font-semibold leading-4 text-slate-500">{detail}</span>
      </span>
    </button>
  );
}

function Tag({ label }: { label: string }) {
  return <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-600">{label}</span>;
}

function CriteriaInput({ label, value, suffix, detail }: { label: string; value: string; suffix?: string; detail: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold text-slate-600">{label} <span className="text-orange-600">*</span></span>
      <span className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3">
        <input defaultValue={value} className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-semibold text-slate-900 outline-none" />
        {suffix ? <span className="text-[12px] font-bold text-slate-500">{suffix}</span> : null}
      </span>
      <span className="mt-1.5 block text-[10px] font-semibold text-slate-500">{detail}</span>
    </label>
  );
}

function SemanticCreateRail() {
  return (
    <aside className="space-y-3">
      <CreatePanel title="Creation Summary">
        <div className="space-y-3 text-[12px]">
          <SummaryLine label="Model Type" value="Semantic Layer" />
          <SummaryLine label="Domain" value="Finance & Performance" />
          <SummaryLine label="Selected Template" value="Payer Performance Template" />
          <SummaryLine label="Consumption Targets" value="3 selected" success />
        </div>
      </CreatePanel>

      <CreatePanel title="Recommended Templates" action="View all templates">
        <div className="space-y-2">
          <TemplateUseRow icon={Network} tone="blue" title="Payer Performance Template" detail="Comprehensive payer performance metrics and dimensions." />
          <TemplateUseRow icon={BarChart3} tone="purple" title="Claims Revenue KPI Starter" detail="Claims revenue KPIs with time intelligence and benchmarks." />
          <TemplateUseRow icon={Network} tone="orange" title="Provider Contract Ontology Starter" detail="Provider contract concepts, attributes, and relationships." />
        </div>
      </CreatePanel>

      <CreatePanel title="What this model enables">
        <div className="space-y-3">
          <EnablementRow icon={Network} tone="green" title="Standardized KPIs and dimensions" detail="Create consistent, trustworthy metrics and dimensions." />
          <EnablementRow icon={ShieldCheck} tone="blue" title="Business glossary alignment" detail="Ensure shared definitions and business understanding." />
          <EnablementRow icon={Sparkles} tone="purple" title="Natural language query readiness" detail="Enable NLQ and AI assistants with governed semantics." />
          <EnablementRow icon={Network} tone="orange" title="Governed publishing to BI and AI tools" detail="Secure, versioned publishing to downstream tools." />
        </div>
      </CreatePanel>
    </aside>
  );
}

function SummaryLine({ label, value, success = false }: { label: string; value: string; success?: boolean }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3">
      <span className="font-extrabold text-slate-600">{label}</span>
      <span className={`font-semibold ${success ? "text-emerald-600" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

function TemplateUseRow({ icon: Icon, tone, title, detail }: { icon: LucideIcon; tone: Tone; title: string; detail: string }) {
  return (
    <button className="grid w-full grid-cols-[42px_1fr_58px] items-center gap-3 rounded-lg text-left">
      <span className={`grid h-10 w-10 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{title}</b>
        <span className="mt-1 block text-[11px] font-medium leading-4 text-slate-600">{detail}</span>
      </span>
      <span className="grid h-8 place-items-center rounded-lg border border-slate-200 bg-white text-[11px] font-extrabold text-slate-700 shadow-sm">Use</span>
    </button>
  );
}

function EnablementRow({ icon: Icon, tone, title, detail }: { icon: LucideIcon; tone: Tone; title: string; detail: string }) {
  return (
    <div className="grid grid-cols-[34px_1fr] gap-3">
      <span className={`grid h-8 w-8 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0">
        <b className="block text-[12px] text-slate-950">{title}</b>
        <span className="mt-0.5 block text-[11px] font-medium leading-4 text-slate-600">{detail}</span>
      </span>
    </div>
  );
}

function SourceTypeTile({ icon: Icon, title, detail, meta, tone, selected = false }: { icon: LucideIcon; title: string; detail: string; meta: string; tone: Tone; selected?: boolean }) {
  const [isSelected, setIsSelected] = useState(selected);
  return (
    <button onClick={() => setIsSelected(!isSelected)} className={`grid h-[70px] grid-cols-[44px_1fr_20px] items-center gap-3 rounded-[10px] border px-3 text-left shadow-sm ${isSelected ? "border-orange-500 bg-orange-50/40" : "border-slate-200 bg-white hover:border-orange-200"}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${isSelected ? "text-sky-500" : toneMap[tone]}`}>
        <Icon className="h-7 w-7" />
      </span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] leading-4 text-slate-950">{title}</b>
        <span className="mt-0.5 block truncate text-[10px] font-bold text-slate-500">{detail}</span>
        <span className="block truncate text-[10px] font-bold text-slate-500">{meta}</span>
      </span>
      <span className={`grid h-4 w-4 place-items-center rounded-full border ${isSelected ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 bg-white text-transparent"}`}><Check className="h-3 w-3" /></span>
    </button>
  );
}

function MultiSelectBox({ labels }: { labels: string[] }) {
  return (
    <button className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left shadow-sm hover:border-orange-200">
      <span className="flex min-w-0 flex-wrap gap-1">
        {labels.map((label) => <span key={label} className="inline-flex h-6 items-center gap-1 rounded-md bg-slate-50 px-2 text-[10px] font-extrabold text-slate-700">{label}<X className="h-3 w-3 text-slate-400" /></span>)}
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

function SourceAssetPill({ name, rows }: { name: string; rows: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <button onClick={() => setVisible(false)} className="grid h-[48px] grid-cols-[22px_1fr_18px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left shadow-sm hover:border-orange-200">
      <Database className="h-4 w-4 text-slate-500" />
      <span className="min-w-0">
        <b className="block truncate text-[11px] leading-4 text-slate-950">{name}</b>
        <span className="block truncate text-[10px] font-semibold text-slate-500">{rows}</span>
      </span>
      <X className="h-3.5 w-3.5 text-slate-500" />
    </button>
  );
}

function ScopeToken({ label, tone }: { label: string; tone: "orange" | "blue" }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const className = tone === "orange"
    ? "border-orange-200 bg-orange-50/40 text-slate-800"
    : "border-blue-200 bg-blue-50/50 text-slate-800";
  return (
    <button onClick={() => setVisible(false)} className={`inline-flex h-7 min-w-0 items-center gap-2 rounded-md border px-2 text-left text-[10px] font-extrabold ${className}`}>
      <Grid2X2 className={`h-3.5 w-3.5 shrink-0 ${tone === "orange" ? "text-orange-500" : "text-blue-500"}`} />
      <span className="truncate">{label}</span>
      <X className="ml-auto h-3 w-3 shrink-0 text-slate-500" />
    </button>
  );
}

function ReadinessCard({ icon: Icon, tone, label, value, detail }: { icon: LucideIcon; tone: Tone; label: string; value: string; detail: string }) {
  return (
    <button className={`grid h-[68px] grid-cols-[38px_1fr] items-center gap-3 rounded-[10px] border px-3 text-left shadow-sm ${toneMap[tone]}`}>
      <Icon className="h-6 w-6" />
      <span className="min-w-0">
        <span className="block truncate text-[10px] font-extrabold text-slate-700">{label}</span>
        <b className="block truncate text-[18px] leading-5 text-slate-950">{value}</b>
        <span className={`block truncate text-[10px] font-extrabold ${tone === "orange" ? "text-slate-500" : "text-emerald-600"}`}>{detail}</span>
      </span>
    </button>
  );
}

function ToggleRow({ label, enabled = false }: { label: string; enabled?: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <button onClick={() => setIsEnabled(!isEnabled)} className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-600">
      <span className={`flex h-5 w-9 items-center rounded-full px-0.5 ${isEnabled ? "justify-end bg-orange-500" : "justify-start bg-slate-200"}`}>
        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
      </span>
      {label}
      <Info className="h-3.5 w-3.5 text-slate-400" />
    </button>
  );
}

function SourceScopeRail() {
  return (
    <aside className="space-y-3">
      <CreatePanel title="Selection Summary">
        <div className="space-y-3 text-[12px]">
          <SummaryLine label="Model Type" value="Semantic Layer" />
          <SummaryLine label="Domain" value="Finance & Performance" />
          <SummaryLine label="Sources Connected" value="1" />
          <SummaryLine label="Assets Selected" value="5" />
          <SummaryLine label="In Scope Metrics" value="6" />
          <SummaryLine label="In Scope Dimensions" value="6" />
        </div>
      </CreatePanel>

      <CreatePanel title="Recommended Source Groups" action="View all groups">
        <div className="space-y-3">
          <TemplateUseRow icon={Database} tone="purple" title="Payer Performance Core" detail="Core fact and dimension tables for financial and performance analysis." />
          <TemplateUseRow icon={BarChart3} tone="green" title="Claims Revenue Mart" detail="Curated claims and revenue metrics for reporting and finance." />
          <TemplateUseRow icon={Network} tone="orange" title="Provider Quality Reference" detail="Provider attributes and quality measures reference data." />
        </div>
      </CreatePanel>

      <CreatePanel title="Why this scope works">
        <div className="space-y-3">
          <EnablementRow icon={Network} tone="green" title="Supports BI dashboards and self-service analytics" detail="Aligned metrics and dimensions for trusted reporting." />
          <EnablementRow icon={Sparkles} tone="blue" title="Enables NLQ and AI assistants" detail="Well-defined business context improves AI accuracy." />
          <EnablementRow icon={BarChart3} tone="purple" title="Aligns reusable metrics and dimensions" detail="Consistent definitions across teams and use cases." />
          <EnablementRow icon={Network} tone="orange" title="Accelerates publishing and adoption" detail="Pre-validated scope reduces time to value." />
        </div>
      </CreatePanel>
    </aside>
  );
}

function EntityModelTile({ icon: Icon, title, role, state, tone, selected = false }: { icon: LucideIcon; title: string; role: string; state: string; tone: Tone; selected?: boolean }) {
  const [isSelected, setIsSelected] = useState(selected);
  return (
    <button onClick={() => setIsSelected(!isSelected)} className={`grid h-[70px] grid-cols-[42px_1fr_18px] items-center gap-3 rounded-[10px] border px-3 text-left shadow-sm ${isSelected ? "border-orange-500 bg-orange-50/40" : "border-slate-200 bg-white hover:border-orange-200"}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-6 w-6" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] leading-4 text-slate-950">{title}</b>
        <span className="block truncate text-[10px] font-bold text-slate-500">{role}</span>
        <span className="block truncate text-[10px] font-extrabold text-emerald-600">{state}</span>
      </span>
      {isSelected ? <span className="grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-white"><Check className="h-3 w-3" /></span> : <span className="h-4 w-4 rounded-full border border-slate-300" />}
    </button>
  );
}

function RelationshipDiagram() {
  return (
    <div className="relative h-[138px] rounded-lg bg-white">
      <div className="absolute left-2 top-1">
        <DiagramNode icon={Users} title="Member" detail="Dimension" tone="purple" />
      </div>
      <div className="absolute left-2 bottom-1">
        <DiagramNode icon={ShieldCheck} title="Provider" detail="Dimension" tone="blue" />
      </div>
      <div className="absolute left-1/2 top-1/2 z-10 w-[112px] -translate-x-1/2 -translate-y-1/2">
        <DiagramNode selected icon={Grid2X2} title="Claims" detail="Primary Fact" tone="orange" />
      </div>
      <div className="absolute right-2 top-1">
        <DiagramNode icon={FileText} title="Plan" detail="Dimension" tone="green" />
      </div>
      <div className="absolute bottom-1 right-2">
        <DiagramNode icon={Calendar} title="Calendar" detail="Time Dimension" tone="orange" />
      </div>
      <span className="absolute left-[30%] top-[38px] h-px w-[22%] rotate-[28deg] border-t border-dashed border-slate-300" />
      <span className="absolute left-[30%] bottom-[38px] h-px w-[22%] -rotate-[28deg] border-t border-dashed border-slate-300" />
      <span className="absolute right-[30%] top-[38px] h-px w-[22%] -rotate-[28deg] border-t border-dashed border-slate-300" />
      <span className="absolute bottom-[38px] right-[30%] h-px w-[22%] rotate-[28deg] border-t border-dashed border-slate-300" />
    </div>
  );
}

function DiagramNode({ icon: Icon, title, detail, tone, selected = false }: { icon: LucideIcon; title: string; detail: string; tone: Tone; selected?: boolean }) {
  return (
    <div className={`grid h-[48px] w-[112px] grid-cols-[28px_1fr] items-center gap-2 rounded-lg border bg-white px-2 shadow-sm ${selected ? "border-orange-500" : "border-slate-200"}`}>
      <Icon className={`h-5 w-5 ${toneText[tone]}`} />
      <span className="min-w-0">
        <b className="block truncate text-[10px] text-slate-950">{title}</b>
        <span className="block truncate text-[9px] font-bold text-slate-500">{detail}</span>
      </span>
    </div>
  );
}

function RelationshipMappingTable() {
  const rows = [
    ["Claims -> Member", "member_id", "Many to one", "Validated"],
    ["Claims -> Provider", "provider_id", "Many to one", "Validated"],
    ["Claims -> Plan", "plan_id", "Many to one", "Review"],
    ["Claims -> Calendar", "service_month", "Many to one", "Validated"],
  ] as const;
  return (
    <div>
      <div className="semantic-relationship-row grid bg-slate-50 px-3 py-2 text-[10px] font-extrabold text-slate-500">
        <span>Relationship</span><span>Join Key</span><span>Cardinality</span><span>Status</span>
      </div>
      {rows.map(([relationship, joinKey, cardinality, status]) => (
        <div key={relationship} className="semantic-relationship-row grid border-t border-slate-100 px-3 py-2">
          <b className="truncate text-[11px] text-slate-950">{relationship}</b>
          <span className="truncate text-[11px] font-semibold text-slate-700">{joinKey}</span>
          <span className="truncate text-[11px] font-semibold text-slate-700">{cardinality}</span>
          <StatusPill status={status} />
        </div>
      ))}
    </div>
  );
}

function MetricCategory({ icon: Icon, label, active = false }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <button className={`inline-flex h-8 min-w-[98px] items-center justify-center gap-2 rounded-lg border px-3 text-[11px] font-extrabold ${active ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600"}`}>
      <Icon className="h-3.5 w-3.5" />{label}
    </button>
  );
}

function MetricDesignTable() {
  const rows = [
    ["Total Claims", "Base Metric", "Sum", "Whole number", "Ready"],
    ["Allowed Amount", "Base Metric", "Sum", "Currency", "Ready"],
    ["PMPM Cost", "Derived Metric", "Formula", "Currency", "Ready"],
    ["Denial Rate", "KPI", "Percentage", "%", "Needs review"],
    ["Provider Performance Score", "KPI", "Weighted Score", "Decimal", "Draft"],
  ] as const;
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
      <div className="semantic-metric-design-row grid bg-slate-50 px-3 py-2 text-[10px] font-extrabold text-slate-500">
        <span>Metric Name</span><span>Type</span><span>Aggregation</span><span>Format</span><span>Status</span>
      </div>
      {rows.map(([name, type, aggregation, format, status]) => (
        <button key={name} className={`semantic-metric-design-row grid w-full border-t border-slate-100 px-3 py-2 text-left ${name === "PMPM Cost" ? "bg-orange-50/50 ring-1 ring-inset ring-orange-200" : "bg-white"}`}>
          <b className="truncate text-[11px] text-slate-950">{name}</b>
          <span className="truncate text-[11px] font-semibold text-slate-700">{type}</span>
          <span className="truncate text-[11px] font-semibold text-slate-700">{aggregation}</span>
          <span className="truncate text-[11px] font-semibold text-slate-700">{format}</span>
          <StatusPill status={status} />
        </button>
      ))}
    </div>
  );
}

function MetricLogicPanel() {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="text-[12px] font-extrabold text-slate-950">Selected Metric Logic</h3>
      <b className="mt-2 block text-[18px] leading-5 text-slate-950">PMPM Cost</b>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
        <FormulaChip label="Allowed Amount" />
        <span className="text-[13px] font-extrabold text-slate-600">/</span>
        <FormulaChip label="Distinct Member Months" />
      </div>
      <div className="mt-3 space-y-2">
        <LogicRow icon={Clock} label="Time-aware metric" toggle />
        <LogicRow icon={Grid2X2} label="Default grain" value="Monthly" />
        <LogicRow icon={Filter} label="Null handling" value="Ignore nulls" />
        <LogicRow icon={BarChart3} label="Rounding" value="2 decimals" />
      </div>
    </div>
  );
}

function FormulaChip({ label }: { label: string }) {
  return <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-slate-700">{label}</span>;
}

function LogicRow({ icon: Icon, label, value, toggle = false }: { icon: LucideIcon; label: string; value?: string; toggle?: boolean }) {
  return (
    <div className="grid grid-cols-[18px_1fr_auto] items-center gap-2 text-[11px] font-semibold text-slate-600">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
      <span>{label}</span>
      {toggle ? <span className="flex h-5 w-9 justify-end rounded-full bg-orange-500 px-0.5"><span className="mt-0.5 h-4 w-4 rounded-full bg-white" /></span> : <span className="inline-flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-extrabold text-slate-700">{value}<ChevronDown className="h-3 w-3 text-slate-400" /></span>}
    </div>
  );
}

function BehaviorCard({ icon: Icon, tone, title, value, detail, chips }: { icon: LucideIcon; tone: Tone; title: string; value?: string; detail?: string; chips?: string[] }) {
  return (
    <div className="min-h-[78px] rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-[34px_1fr] gap-3">
        <span className={`grid h-8 w-8 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
        <span className="min-w-0">
          <b className="block truncate text-[11px] text-slate-950">{title}</b>
          {detail ? <span className="mt-1 block truncate text-[10px] font-semibold text-slate-500">{detail}</span> : null}
          {value ? <span className="mt-1 block text-[11px] font-extrabold text-slate-700">{value}</span> : null}
          {chips ? <span className="mt-1.5 flex flex-wrap gap-1">{chips.map((chip) => <span key={chip} className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-extrabold text-slate-600">{chip}</span>)}</span> : null}
        </span>
      </div>
    </div>
  );
}

function EntitiesMetricsRail() {
  return (
    <aside className="space-y-3">
      <CreatePanel title="Entities & Metrics Summary">
        <div className="space-y-3 text-[12px]">
          <SummaryLine label="Entities Modeled" value="5" />
          <SummaryLine label="Relationships Validated" value="3 / 4" />
          <SummaryLine label="Metrics Defined" value="5" />
          <SummaryLine label="KPIs Included" value="2" />
          <SummaryLine label="Synonyms Added" value="9" />
          <SummaryLine label="Default Filters" value="3" />
        </div>
      </CreatePanel>

      <CreatePanel title="Recommended Reusable Components">
        <div className="space-y-3">
          <TemplateUseRow icon={Database} tone="purple" title="Finance KPI Pack" detail="Reusable financial metrics and business rules." />
          <TemplateUseRow icon={BarChart3} tone="green" title="Time Intelligence Set" detail="MTD, QTD, YTD and rolling period logic." />
          <TemplateUseRow icon={Network} tone="orange" title="Provider Score Template" detail="Weighted scoring framework for provider performance." />
        </div>
      </CreatePanel>

      <CreatePanel title="Why this design works">
        <div className="space-y-3">
          <EnablementRow icon={Network} tone="green" title="Improves query accuracy" detail="Clear entity relationships reduce ambiguity." />
          <EnablementRow icon={Sparkles} tone="blue" title="Supports BI and AI use cases" detail="Metrics are reusable across dashboards and assistants." />
          <EnablementRow icon={FileText} tone="purple" title="Enables governed KPIs" detail="Calculation logic is explicit and reviewable." />
          <EnablementRow icon={Users} tone="orange" title="Accelerates adoption" detail="Friendly labels and synonyms improve discoverability." />
        </div>
      </CreatePanel>
    </aside>
  );
}

function GuardrailTile({ icon: Icon, tone, title, detail, state }: { icon: LucideIcon; tone: Tone; title: string; detail: string; state: string }) {
  return (
    <button className="grid h-[70px] grid-cols-[44px_1fr] items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-3 text-left shadow-sm hover:border-orange-200">
      <span className={`grid h-10 w-10 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] leading-4 text-slate-950">{title}</b>
        <span className="block truncate text-[10px] font-bold text-slate-500">{detail}</span>
        <span className="block truncate text-[10px] font-extrabold text-emerald-600">{state}</span>
      </span>
    </button>
  );
}

function ValidationTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button className={`h-7 min-w-[72px] rounded-md border px-3 text-[10px] font-extrabold ${active ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600"}`}>{label}</button>
  );
}

function ValidationSuiteTable() {
  const rows = [
    ["Relationship integrity", "Model Validation", "4 joins", "Passed"],
    ["Metric formula validation", "KPI Validation", "5 metrics", "Passed"],
    ["NLQ query test set", "Query Validation", "24 prompts", "Warnings"],
    ["Policy compliance", "Governance", "4 policies", "Passed"],
    ["PII masking review", "Security", "3 columns", "Passed"],
    ["Synonym consistency", "Semantic", "9 terms", "Passed"],
  ] as const;
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
      <div className="semantic-validation-row grid bg-slate-50 px-3 py-2 text-[10px] font-extrabold text-slate-500">
        <span>Validation Check</span><span>Type</span><span>Scope</span><span>Status</span>
      </div>
      {rows.map(([check, type, scope, status]) => (
        <button key={check} className={`semantic-validation-row grid w-full border-t border-slate-100 px-3 py-2 text-left ${check === "NLQ query test set" ? "bg-orange-50/50 ring-1 ring-inset ring-orange-200" : "bg-white"}`}>
          <b className="truncate text-[11px] text-slate-950">{check}</b>
          <span className="truncate text-[11px] font-semibold text-slate-600">{type}</span>
          <span className="truncate text-[11px] font-semibold text-slate-600">{scope}</span>
          <StatusPill status={status} />
        </button>
      ))}
    </div>
  );
}

function ValidationRulePanel() {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="text-[12px] font-extrabold text-slate-950">Selected Validation Rule</h3>
      <b className="mt-1 block text-[16px] leading-5 text-slate-950">NLQ Query Test Set</b>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <WireField label="Pass threshold"><SelectBox value="90%" /></WireField>
        <WireField label="Required prompts"><SelectBox value="24" /></WireField>
        <WireField label="Ambiguity tolerance"><SelectBox value="Low" /></WireField>
      </div>
      <div className="mt-3 space-y-2">
        <ToggleRow label="Block publish on failure" enabled />
        <ToggleRow label="Require evidence log" enabled />
      </div>
      <div className="mt-3 text-[12px] font-semibold text-slate-700">Current result: <b className="text-slate-950">21 / 24 passed (87.5%)</b></div>
      <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] font-extrabold text-orange-700">
        3 prompts need synonym tuning or filter clarification.
      </div>
    </div>
  );
}

function GateCard({ icon: Icon, tone, label, value, detail }: { icon: LucideIcon; tone: Tone; label: string; value: string; detail: string }) {
  return (
    <button className="grid h-[70px] grid-cols-[42px_1fr] items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-3 text-left shadow-sm">
      <span className={`grid h-10 w-10 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 text-center">
        <span className="block truncate text-[10px] font-extrabold text-slate-600">{label}</span>
        <b className="block truncate text-[22px] leading-6 text-slate-950">{value}</b>
        <span className={`block truncate text-[10px] font-extrabold ${tone === "orange" ? "text-orange-600" : "text-emerald-600"}`}>{detail}</span>
      </span>
    </button>
  );
}

function GovernanceValidationRail() {
  return (
    <aside className="space-y-3">
      <CreatePanel title="Governance & Validation Summary">
        <div className="space-y-3 text-[12px]">
          <SummaryLine label="Policies Linked" value="4" />
          <SummaryLine label="Roles Mapped" value="5" />
          <SummaryLine label="Validation Checks" value="6" />
          <SummaryLine label="Checks Passed" value="5 / 6" />
          <SummaryLine label="Approval Gates" value="2" />
          <SummaryLine label="Publish Readiness" value="92%" />
        </div>
      </CreatePanel>

      <CreatePanel title="Recommended Guardrails" action="View all guardrails">
        <div className="space-y-3">
          <TemplateUseRow icon={ShieldCheck} tone="green" title="Finance Access Policy" detail="Role-based access for finance and analytics users." />
          <TemplateUseRow icon={FileText} tone="purple" title="KPI Certification Workflow" detail="Business and technical approval workflow for governed metrics." />
          <TemplateUseRow icon={Sparkles} tone="orange" title="NLQ Validation Pack" detail="Prompt set for semantic and natural language testing." />
        </div>
      </CreatePanel>

      <CreatePanel title="Why this governance works">
        <div className="space-y-3">
          <EnablementRow icon={ShieldCheck} tone="green" title="Protects trusted consumption" detail="Access and policy controls keep semantic assets safe." />
          <EnablementRow icon={GitBranch} tone="blue" title="Improves auditability" detail="Lineage, approvals, and logs create traceable governance." />
          <EnablementRow icon={Grid2X2} tone="purple" title="Reduces semantic risk" detail="Validation checks catch gaps before publication." />
          <EnablementRow icon={Network} tone="orange" title="Supports BI and AI adoption" detail="Certified semantics improve downstream reliability." />
        </div>
      </CreatePanel>
    </aside>
  );
}

function FinalReviewCard({ icon: Icon, tone, title, rows, status, warning = false }: { icon: LucideIcon; tone: Tone; title: string; rows: readonly [string, string][]; status: string; warning?: boolean }) {
  return (
    <div className="flex min-h-[168px] flex-col rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
          <b className="min-w-0 truncate text-[12px] text-slate-950">{title}</b>
        </div>
        <button className="shrink-0 text-[10px] font-extrabold text-blue-600">Edit</button>
      </div>
      <div className="mt-3 flex-1 space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3 text-[10.5px]">
            <span className="shrink-0 whitespace-nowrap font-semibold leading-4 text-slate-500">{label}</span>
            <span className="min-w-0 max-w-[150px] break-words text-right font-bold leading-4 text-slate-800">{value}</span>
          </div>
        ))}
      </div>
      <span className={`mt-3 inline-flex h-7 w-fit items-center gap-1 rounded-md border px-3 text-[11px] font-extrabold ${warning ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
        {warning ? <TriangleAlert className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}{status}
      </span>
    </div>
  );
}

function DestinationGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <DestinationChip checked label="BI Dashboards" />
      <DestinationChip checked label="AI Assistants" />
      <DestinationChip checked label="Data Products" />
      <DestinationChip label="APIs / Applications" />
    </div>
  );
}

function DestinationChip({ label, checked = false }: { label: string; checked?: boolean }) {
  const [isChecked, setIsChecked] = useState(checked);
  return (
    <button onClick={() => setIsChecked(!isChecked)} className={`inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md border px-2 text-[10px] font-extrabold ${isChecked ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700"}`}>
      <span className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded ${isChecked ? "bg-orange-500 text-white" : "border border-slate-300 text-transparent"}`}><Check className="h-2.5 w-2.5" /></span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function PublishMode() {
  const [mode, setMode] = useState<"now" | "later">("now");
  return (
    <div className="grid grid-cols-2 gap-2">
      <button onClick={() => setMode("now")} className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold ${mode === "now" ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700"}`}><span className={`h-2.5 w-2.5 rounded-full ${mode === "now" ? "bg-orange-600" : "bg-slate-300"}`} />Publish Now</button>
      <button onClick={() => setMode("later")} className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold ${mode === "later" ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700"}`}><Calendar className="h-4 w-4" />Schedule Later</button>
    </div>
  );
}

function FinalChecklistTable() {
  const rows = [
    ["Data source connectivity", "Infrastructure", "Passed", "1 source / 5 assets connected"],
    ["Relationship integrity", "Model", "Passed", "3 validated joins, 1 reviewed"],
    ["KPI formula review", "Metrics", "Passed", "All critical financial formulas reviewed"],
    ["Policy compliance", "Governance", "Passed", "4 required policies applied"],
    ["Business sign-off", "Approval", "Passed", "Revenue Governance approved"],
    ["Technical sign-off", "Approval", "Passed", "Semantic Review Board approved"],
    ["NLQ query test set", "Validation", "Warning", "3 prompts need tuning"],
  ] as const;
  return (
    <div className="mt-3 overflow-hidden rounded-[10px] border border-slate-200 bg-white">
      <div className="semantic-final-check-row grid bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
        <span>Checkpoint</span><span>Category</span><span>Status</span><span>Notes</span>
      </div>
      {rows.map(([checkpoint, category, status, notes]) => (
        <div key={checkpoint} className="semantic-final-check-row grid border-t border-slate-100 px-3 py-2">
          <b className="truncate text-[11px] text-slate-950">{checkpoint}</b>
          <span className="truncate text-[11px] font-semibold text-slate-600">{category}</span>
          <StatusPill status={status} />
          <span className="truncate text-[11px] font-semibold text-slate-600">{notes}</span>
        </div>
      ))}
    </div>
  );
}

function ToggleBox({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <button onClick={() => setEnabled(!enabled)} className="flex h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left text-[11px] font-semibold text-slate-700 shadow-sm">
      <span>{label}</span>
      <span className={`flex h-5 w-9 rounded-full px-0.5 ${enabled ? "justify-end bg-orange-500" : "justify-start bg-slate-200"}`}><span className="mt-0.5 h-4 w-4 rounded-full bg-white" /></span>
    </button>
  );
}

function ConsumptionPreview({ icon: Icon, tone, title, detail }: { icon: LucideIcon; tone: Tone; title: string; detail: string }) {
  return (
    <div className="grid min-h-[68px] grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm">
      <span className={`grid h-10 w-10 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{title}</b>
        <span className="mt-0.5 block text-[10px] font-semibold leading-4 text-slate-600">{detail}</span>
      </span>
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">Enabled</span>
    </div>
  );
}

function ReviewPublishRail() {
  return (
    <aside className="space-y-3">
      <CreatePanel title="Review & Publish Summary" info>
        <div className="grid grid-cols-[120px_1fr] gap-4">
          <div className="rounded-[10px] border border-slate-200 bg-white p-4 text-center">
            <span className="block text-[11px] font-extrabold text-slate-500">Model readiness</span>
            <b className="mt-3 block text-[32px] leading-none text-emerald-600">92%</b>
          </div>
          <div className="space-y-2 text-[12px]">
            <SummaryLine label="Version" value="v1.0.0" />
            <SummaryLine label="Destinations selected" value="3" />
            <SummaryLine label="Approvals complete" value="2 / 2" />
            <SummaryLine label="Checks passed" value="6 / 7" />
            <SummaryLine label="Warning items" value="1" success />
            <SummaryLine label="Expected publish time" value="< 2 mins" />
          </div>
        </div>
      </CreatePanel>

      <CreatePanel title="Recommended Final Actions" action="View all actions">
        <div className="space-y-3">
          <TemplateUseRow icon={Info} tone="orange" title="Resolve NLQ synonym prompts" detail="Improve prompt clarity for 3 queries in the test set." />
          <TemplateUseRow icon={Sparkles} tone="blue" title="Attach consumer announcement" detail="Notify analytics users about the new semantic model release." />
          <TemplateUseRow icon={FileText} tone="green" title="Add change log entry" detail="Document key changes and release notes for this version." />
        </div>
      </CreatePanel>

      <CreatePanel title="What happens after publish">
        <div className="space-y-3">
          <EnablementRow icon={Database} tone="purple" title="Creates versioned semantic asset" detail="A new version is created with full lineage and metadata." />
          <EnablementRow icon={Network} tone="blue" title="Updates enterprise catalog and lineage" detail="Model is registered in the catalog with assets and lineage." />
          <EnablementRow icon={ShieldCheck} tone="green" title="Enables governed consumption across BI and AI" detail="Certified metrics and dimensions available to consumers." />
          <EnablementRow icon={FileText} tone="orange" title="Logs approvals, policies, and audit evidence" detail="All governance actions are captured for audit and traceability." />
        </div>
      </CreatePanel>
    </aside>
  );
}

function FormRow({ label, required = false, info = false, children }: { label: string; required?: boolean; info?: boolean; children: React.ReactNode }) {
  return (
    <div className="semantic-create-form-row grid gap-2">
      <label className="flex items-center gap-1 pt-2 text-[12px] font-extrabold text-slate-700">
        {label}{required ? <span className="text-orange-600">*</span> : null}{info ? <Info className="h-3.5 w-3.5 text-slate-400" /> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function TextInput({ value }: { value: string }) {
  return <input defaultValue={value} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-800 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />;
}

const contextualSelectOptions: Record<string, string[]> = {
  "Finance & Performance": ["Finance & Performance", "Claims Revenue", "Provider Network", "Member Experience"],
  "Revenue Analytics": ["Revenue Analytics", "Finance Data Team", "Claims Operations", "Provider Performance Office"],
  "Semantic Platform Team": ["Semantic Platform Team", "Data Governance Team", "BI Enablement Team", "Analytics Engineering"],
  "HealthCorp": ["HealthCorp", "Claims Operations", "Provider Management", "Finance Workspace"],
  "Production": ["Production", "UAT", "Development", "Sandbox"],
  "High": ["High", "Medium", "Low", "Critical"],
  "Enterprise Finance Lakehouse": ["Enterprise Finance Lakehouse", "Claims Gold Warehouse", "Provider Curated Lakehouse", "Finance KPI Store"],
  "finance_gold": ["finance_gold", "claims_gold", "provider_gold", "semantic_publish"],
  "payer_performance": ["payer_performance", "claims_revenue", "provider_quality", "member_experience"],
  "Payer Performance": ["Payer Performance", "Claims Revenue", "Provider Quality", "Member Utilization"],
  "Monthly plan-provider performance": ["Monthly plan-provider performance", "Claim service month", "Provider contract period", "Member coverage month"],
  "Claims": ["Claims", "Member", "Provider", "Plan", "Calendar"],
  "Auto-detected + curated": ["Auto-detected + curated", "Manual curation only", "Import from existing model", "AI-assisted suggestions"],
  "Business-safe inner / left joins": ["Business-safe inner / left joins", "Left joins only", "Inner joins only", "Relationship-specific joins"],
  "Revenue Governance": ["Revenue Governance", "Finance Governance", "Claims Data Stewardship", "Enterprise Data Council"],
  "Semantic Review Board": ["Semantic Review Board", "Finance Approval Board", "Data Governance Council", "BI Certification Group"],
  "Certified": ["Certified", "Draft", "Validated", "Deprecated"],
  "Finance governed access": ["Finance governed access", "Enterprise read-only", "Steward-approved access", "Restricted PHI access"],
  "Payer Performance Semantic Product": ["Payer Performance Semantic Product", "Claims Revenue Semantic Product", "Provider Quality Product", "Finance KPI Product"],
  "Internal analytics": ["Internal analytics", "Confidential analytics", "PHI restricted", "Public metadata only"],
  "v1.0.0": ["v1.0.0", "v0.9.0", "v1.1.0-draft", "v2.0.0"],
  "HealthCorp Semantic Catalog": ["HealthCorp Semantic Catalog", "Finance Certified Catalog", "Enterprise Data Catalog", "BI Semantic Registry"],
  "Certified / Enterprise": ["Certified / Enterprise", "Workspace only", "Shared with finance", "Restricted consumers"],
  "90%": ["90%", "85%", "95%", "98%"],
  "24": ["24", "12", "36", "50"],
  "Low": ["Low", "Medium", "High", "Strict"],
};

function SelectBox({ value, options }: { value: string; options?: string[] }) {
  const selectOptions = options ?? contextualSelectOptions[value] ?? [value];
  const [selected, setSelected] = useState(value);
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-[13px] font-semibold text-slate-800 shadow-sm hover:border-orange-200">
        <span className="truncate">{selected}</span><ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-[42px] z-40 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {selectOptions.map((option) => (
            <button key={option} onClick={() => { setSelected(option); setOpen(false); }} className={`block h-9 w-full truncate px-3 text-left text-[12px] font-bold ${option === selected ? "bg-orange-50 text-orange-700" : "text-slate-700 hover:bg-slate-50"}`}>{option}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TokenSelect({ tokens, searchable = false }: { tokens: string[] | readonly string[]; searchable?: boolean }) {
  return (
    <div className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        {searchable ? <Search className="mx-1 h-4 w-4 text-slate-400" /> : null}
        {tokens.map((token) => <span key={token} className="inline-flex h-7 items-center gap-1 rounded-md bg-orange-50 px-2 text-[11px] font-extrabold text-orange-700">{token}<X className="h-3 w-3" /></span>)}
      </div>
    </div>
  );
}

function ChoicePill({ icon: Icon, label, tone, selected = false }: { icon: LucideIcon; label: string; tone: Tone; selected?: boolean }) {
  return (
    <button className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold shadow-sm ${selected ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700 hover:border-orange-200"}`}>
      <Icon className={`h-4 w-4 ${selected ? "text-orange-600" : toneText[tone]}`} />{label}
    </button>
  );
}

function ChoiceCard({ icon: Icon, title, detail, tone, selected = false }: { icon: LucideIcon; title: string; detail: string; tone: Tone; selected?: boolean }) {
  return (
    <button className={`grid min-h-[92px] grid-cols-[40px_1fr] gap-3 rounded-[10px] border p-3 text-left shadow-sm ${selected ? "border-orange-300 bg-orange-50/60" : "border-slate-200 bg-white hover:border-orange-200"}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span>
        <b className="block text-[12px] text-slate-950">{title}</b>
        <span className="mt-1 block text-[11px] font-medium leading-4 text-slate-600">{detail}</span>
      </span>
    </button>
  );
}

function RadioGroup({ items, active }: { items: string[]; active: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <button key={item} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold ${index === active ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700"}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${index === active ? "bg-orange-600" : "bg-slate-300"}`} />{item}
        </button>
      ))}
    </div>
  );
}

function FooterActions({ secondary, primary, onSecondary, onPrimary }: { secondary: string; primary: string; onSecondary: () => void; onPrimary: () => void }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700 shadow-sm hover:border-orange-200 hover:text-orange-600">
        <Save className="h-4 w-4" /> Save Draft
      </button>
      <div className="flex gap-2">
        <button onClick={onSecondary} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700 shadow-sm hover:border-orange-200 hover:text-orange-600"><ArrowLeft className="h-4 w-4" />{secondary}</button>
        <button onClick={onPrimary} className="inline-flex h-10 items-center gap-2 rounded-lg border border-orange-500 bg-orange-600 px-4 text-[12px] font-extrabold text-white shadow-sm hover:bg-orange-700">{primary}<ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function CreatePanel({ title, info = false, action, children }: { title: string; info?: boolean; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-slate-950">{title}{info ? <Info className="h-3.5 w-3.5 text-slate-400" /> : null}</h3>
        {action ? <button className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700 hover:text-orange-600">{action}<ArrowRight className="h-3.5 w-3.5" /></button> : null}
      </div>
      {children}
    </section>
  );
}

function SideAssetRow({ title, detail, icon: Icon, tone, action }: { title: string; detail: string; icon: LucideIcon; tone: Tone; action: string }) {
  return (
    <button className="grid w-full grid-cols-[38px_1fr_auto] items-center gap-3 border-b border-slate-100 px-3 py-3 text-left last:border-b-0 hover:bg-orange-50/40">
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{title}</b>
        <span className="block truncate text-[11px] font-medium text-slate-500">{detail}</span>
      </span>
      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-600">{action}</span>
    </button>
  );
}

function GuidanceList({ items }: { items: readonly string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="grid grid-cols-[18px_1fr] gap-2 text-[12px] font-semibold leading-5 text-slate-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /><span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function ImpactTable({ rows }: { rows: readonly { label: string; value: string; icon: LucideIcon; tone: Tone }[] }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {rows.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
          <span className={`grid h-8 w-8 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
          <span className="text-[12px] font-semibold text-slate-600">{label}</span>
          <b className="text-[12px] text-slate-950">{value}</b>
        </div>
      ))}
    </div>
  );
}

function SourceAssetRow({ name, type, domain, fields, included, icon: Icon }: { name: string; type: string; domain: string; fields: string; included: boolean; icon: LucideIcon }) {
  return (
    <div className="semantic-create-source-row grid items-center border-t border-slate-100 px-3 py-2.5">
      <span className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 text-slate-500" /><b className="truncate text-[12px] text-slate-950">{name}</b></span>
      <span className="text-[12px] font-semibold text-slate-600">{type}</span>
      <span className="text-[12px] font-semibold text-slate-600">{domain}</span>
      <span className="text-[12px] font-bold text-slate-700">{fields}</span>
      <span className={`grid h-5 w-5 place-items-center rounded ${included ? "bg-emerald-600 text-white" : "border border-slate-300 text-transparent"}`}><Check className="h-3 w-3" /></span>
    </div>
  );
}

function PromptRow({ text, icon: Icon = Sparkles }: { text: string; icon?: LucideIcon }) {
  return (
    <div className="grid grid-cols-[32px_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600"><Icon className="h-4 w-4" /></span>
      <span className="text-[12px] font-semibold text-slate-700">{text}</span>
    </div>
  );
}

function EntityRow({ entity, source, keys, attributes, status }: { entity: string; source: string; keys: string; attributes: string; status: string }) {
  return (
    <div className="semantic-create-entity-row grid items-center border-t border-slate-100 px-3 py-2.5">
      <b className="truncate text-[12px] text-slate-950">{entity}</b>
      <span className="truncate text-[12px] font-semibold text-slate-600">{source}</span>
      <span className="truncate text-[12px] font-semibold text-slate-600">{keys}</span>
      <span className="text-[12px] font-bold text-slate-700">{attributes}</span>
      <StatusPill status={status} />
    </div>
  );
}

function RelationshipCard({ title, detail, icon: Icon, tone }: { title: string; detail: string; icon: LucideIcon; tone: Tone }) {
  return (
    <button className="grid min-h-[86px] grid-cols-[38px_1fr] gap-3 rounded-[10px] border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-orange-200">
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span><b className="block text-[12px] text-slate-950">{title}</b><span className="mt-1 block text-[11px] font-semibold text-slate-500">{detail}</span></span>
    </button>
  );
}

function MiniNode({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`grid h-12 place-items-center rounded-lg border text-[12px] font-extrabold ${toneMap[tone]}`}>{label}</span>;
}

function MetricRow({ metric, formula, grain, status }: { metric: string; formula: string; grain: string; status: string }) {
  return (
    <div className="semantic-create-metric-row grid items-center border-t border-slate-100 px-3 py-2.5">
      <b className="truncate text-[12px] text-slate-950">{metric}</b>
      <span className="truncate text-[12px] font-semibold text-slate-600">{formula}</span>
      <span className="truncate text-[12px] font-semibold text-slate-600">{grain}</span>
      <StatusPill status={status} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const className = status === "Mapped" || status === "Valid" || status === "Passed" || status === "Ready" || status === "Validated"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : status === "Review" || status === "Needs review"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-slate-50 text-slate-600";
  return <span className={`w-fit rounded-md border px-2 py-1 text-[11px] font-extrabold ${className}`}>{status}</span>;
}

function ReviewCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[38px_1fr] gap-3 rounded-[10px] border border-slate-200 bg-white p-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-orange-100 bg-orange-50 text-orange-600"><Icon className="h-5 w-5" /></span>
      <span className="min-w-0"><span className="block text-[11px] font-extrabold text-slate-500">{label}</span><b className="mt-1 block truncate text-[12px] text-slate-950">{value}</b></span>
    </div>
  );
}

function ReviewCheckRow({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_86px] items-center gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0">
      <span className="text-[12px] font-semibold text-slate-700">{label}</span>
      <b className="text-[12px] text-slate-950">{value}</b>
      <StatusPill status={status} />
    </div>
  );
}

function PublishConfirmDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[520px] rounded-[16px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-[18px] font-extrabold text-slate-950">Publish semantic model?</h2><p className="mt-2 text-[13px] font-medium leading-5 text-slate-600">This will create version v1.0 and expose governed consumption endpoints for selected tools.</p></div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700">Cancel</button>
          <button onClick={onConfirm} className="h-10 rounded-lg border border-orange-500 bg-orange-600 px-4 text-[12px] font-extrabold text-white">Publish model</button>
        </div>
      </div>
    </div>
  );
}

function PublishSuccessDialog({ onStay, onOpenStudio }: { onStay: () => void; onOpenStudio: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[520px] rounded-[16px] border border-slate-200 bg-white p-5 text-center shadow-2xl">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></span>
        <h2 className="mt-4 text-[20px] font-extrabold text-slate-950">Semantic model published</h2>
        <p className="mx-auto mt-2 max-w-[380px] text-[13px] font-medium leading-5 text-slate-600">Payer Performance Semantic Layer is now available in the Modeling Workbench and ready for governed BI and NLQ consumption.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={onStay} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700">Stay here</button>
          <button onClick={onOpenStudio} className="h-10 rounded-lg border border-orange-500 bg-orange-600 px-4 text-[12px] font-extrabold text-white">Open Semantic Studio</button>
        </div>
      </div>
    </div>
  );
}
