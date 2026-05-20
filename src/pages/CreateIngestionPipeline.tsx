import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cloud,
  Code2,
  Database,
  File,
  FileJson,
  FileText,
  FileUp,
  Flag,
  Folder,
  Grid2X2,
  Info,
  Layers,
  ListChecks,
  Package,
  Radio,
  Play,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  Tag,
  User,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Tone = "orange" | "blue" | "green" | "purple" | "slate";
type CreateStep = 1 | 2 | 3 | 4 | 5;
type WizardConfig = {
  pipelineName: string;
  ownerTeam: string;
  businessPurpose: string;
  domain: string;
  mode: string;
  sourceType: string;
  starter: string;
  connectorMode: "existing" | "new";
  connector: string;
  targetZone: string;
  schedule: string;
  publishMode: "active" | "draft";
  notifyStakeholders: boolean;
  createRunbook: boolean;
};

const toneMap: Record<Tone, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  slate: "border-slate-100 bg-slate-50 text-slate-600",
};

const steps = ["Pipeline Basics", "Source & Connection", "Mapping & Validation", "Target & Schedule", "Review & Publish"] as const;

const domains = [
  { title: "Structured", detail: "Relational, tables, records", icon: Grid2X2, tone: "green" },
  { title: "Semi-Structured", detail: "JSON, XML, Avro, Parquet", icon: FileJson, tone: "purple", selected: true },
  { title: "Unstructured", detail: "Text, PDF, images, files", icon: FileText, tone: "blue" },
] as const;

const modes = [
  { title: "Batch", detail: "Scheduled bulk ingestion", icon: ListChecks, tone: "orange", selected: true },
  { title: "Incremental", detail: "Capture changes over time", icon: ArrowRight, tone: "green" },
  { title: "Streaming", detail: "Real-time event ingestion", icon: Radio, tone: "purple" },
] as const;

const sources = [
  { title: "Cloud Storage", detail: "S3, ADLS, GCS", icon: Cloud, tone: "orange", selected: true },
  { title: "Databases", detail: "SQL, NoSQL, Warehouse", icon: Database, tone: "blue" },
  { title: "SaaS Apps", detail: "Salesforce, Veeva, SAP", icon: Cloud, tone: "blue" },
  { title: "APIs", detail: "REST, GraphQL, Webhooks", icon: Code2, tone: "purple" },
  { title: "File Uploads", detail: "CSV, JSON, PDF, DOC", icon: FileUp, tone: "green" },
  { title: "Streaming", detail: "Kafka, Event Hubs", icon: Radio, tone: "orange" },
] as const;

const summary = [
  { label: "Studio", value: "Ingestion Studio", icon: Package, tone: "orange" },
  { label: "Pipeline Type", value: "Batch", icon: ListChecks, tone: "orange" },
  { label: "Source Type", value: "Cloud Storage", icon: Cloud, tone: "orange" },
  { label: "Data Domain", value: "Semi-Structured", icon: Grid2X2, tone: "purple" },
  { label: "Target Zone", value: "Bronze", icon: Layers, tone: "orange" },
  { label: "Environment", value: "Production", icon: ShieldCheck, tone: "green" },
] as const;

const nextSteps = [
  { title: "Connect ADLS container", detail: "Set up connection to your cloud storage container", icon: FileText },
  { title: "Define landing path", detail: "Configure the source path and file filters", icon: FileJson },
  { title: "Set schedule and validation rules", detail: "Define frequency and data quality checks", icon: ListChecks },
] as const;

const sourceSummary = [
  { label: "Mode", value: "Batch", icon: ListChecks, tone: "blue" },
  { label: "Domain", value: "Semi-Structured", icon: FileJson, tone: "purple" },
  { label: "Source Type", value: "Cloud Storage", icon: Cloud, tone: "orange" },
  { label: "Starter", value: "Start from Blank", icon: FileText, tone: "orange" },
] as const;

const sourceStepSummary = [
  { label: "Studio", value: "Ingestion Studio", icon: Package, tone: "orange" },
  { label: "Pipeline Name", value: "Claims Intake Bronze Loader", icon: FileText, tone: "orange" },
  { label: "Pipeline Type", value: "Batch", icon: ListChecks, tone: "orange" },
  { label: "Source Type", value: "Cloud Storage", icon: Cloud, tone: "orange" },
  { label: "Connector", value: "ADLS", icon: Database, tone: "purple" },
  { label: "Target Zone", value: "Bronze", icon: Layers, tone: "purple" },
  { label: "Schedule", value: "Daily at 02:00 AM", icon: Calendar, tone: "green" },
  { label: "Environment", value: "Production", icon: ShieldCheck, tone: "green" },
] as const;

const sourceNextSteps = [
  { title: "Review file mapping sample", detail: "Preview files and mapped fields." },
  { title: "Define schema and validation rules", detail: "Configure data types and quality checks." },
  { title: "Set landing target and schedule", detail: "Choose target zone and define cadence." },
] as const;

const connectorInsights = [
  { label: "Last Successful Sync", value: "15 min ago", icon: Clock, valueTone: "text-emerald-600" },
  { label: "Average Daily Files", value: "124", icon: BarChart3, valueTone: "text-slate-950" },
  { label: "Freshness SLA", value: "On Track", icon: ShieldCheck, valueTone: "text-emerald-600" },
  { label: "Access Scope", value: "Read Only", icon: Grid2X2, valueTone: "text-slate-950" },
] as const;

const mappingSummary = [
  { label: "Mode", value: "Batch", icon: ListChecks, tone: "blue" },
  { label: "Domain", value: "Semi-Structured", icon: FileJson, tone: "purple" },
  { label: "Source Type", value: "Cloud Storage", icon: Cloud, tone: "orange" },
  { label: "Connector", value: "ADLS - Claims Landing Storage", icon: ShieldCheck, tone: "green" },
] as const;

const detectedFields = [
  { name: "claim_id", type: "string", value: "CLM-102984", required: true },
  { name: "member_id", type: "string", value: "MBR-88214", required: true },
  { name: "provider_npi", type: "string", value: "1780654321" },
  { name: "service_date", type: "date", value: "2026-05-17", required: true },
  { name: "billed_amount", type: "decimal", value: "1250.75" },
  { name: "diagnosis_code", type: "string", value: "M54.5" },
  { name: "line_items", type: "array", value: "3 items" },
  { name: "ingestion_timestamp", type: "timestamp", value: "2026-05-18T08:14:32Z" },
] as const;

const schemaMappings = [
  { source: "claim_id", target: "claim_id", type: "string", transform: "none", status: "Mapped" },
  { source: "member_id", target: "member_id", type: "string", transform: "none", status: "Mapped" },
  { source: "service_date", target: "service_date", type: "date", transform: "parse date", status: "Mapped" },
  { source: "billed_amount", target: "billed_amount", type: "decimal(10,2)", transform: "cast", status: "Mapped" },
  { source: "diagnosis_code", target: "diagnosis_code", type: "string", transform: "uppercase", status: "Mapped" },
  { source: "ingestion_timestamp", target: "load_ts", type: "timestamp", transform: "standardize UTC", status: "Needs review" },
] as const;

const validationRules = [
  { title: "Schema Drift Detection", detail: "Alert on new or missing fields." },
  { title: "Required Fields Check", detail: "claim_id, member_id, service_date must not be null." },
  { title: "Data Type Validation", detail: "Validate date and numeric fields." },
  { title: "Duplicate Record Check", detail: "Based on claim_id + service_date." },
  { title: "Threshold Alert", detail: "Warn if failed records exceed 2%." },
] as const;

const mappingNextSteps = [
  { title: "Define landing target structure", detail: "Design the target schema and partitions." },
  { title: "Set run schedule and retry policy", detail: "Configure frequency, retries, and alerts." },
  { title: "Review publish-ready configuration", detail: "Validate all settings before publishing." },
] as const;

const validationInsights = [
  { label: "Mapped Fields", value: "18 / 20", icon: CheckCircle2, valueTone: "text-emerald-600" },
  { label: "Auto-Mapped", value: "14", icon: BarChart3, valueTone: "text-emerald-600" },
  { label: "Fields Needing Review", value: "2", icon: FileText, valueTone: "text-orange-600" },
  { label: "Validation Pass Rate", value: "95.2%", icon: ShieldCheck, valueTone: "text-emerald-600" },
] as const;

const targetZones = [
  { title: "Bronze", detail: "Raw standardized landing", icon: Layers, selected: true },
  { title: "Silver", detail: "Conformed and refined data", icon: Database },
  { title: "Quarantine", detail: "Invalid or rejected data", icon: ShieldCheck },
] as const;

const scheduleOptions = [
  { title: "Daily", icon: Calendar, selected: true },
  { title: "Hourly", icon: Clock },
  { title: "Weekly", icon: Calendar },
  { title: "Event-Driven", icon: Zap },
] as const;

const targetNextSteps = [
  { title: "Review publish-ready configuration", detail: "Confirm destination, cadence, and alerting." },
  { title: "Validate final dependencies", detail: "Check connector access and output table settings." },
  { title: "Publish and activate pipeline", detail: "Make the pipeline available for scheduled execution." },
] as const;

const operationalInsights = [
  { label: "Estimated Daily Files", value: "124", icon: BarChart3, valueTone: "text-emerald-600" },
  { label: "Retention Policy", value: "90 days", icon: Calendar, valueTone: "text-emerald-600" },
  { label: "Retry Policy", value: "3 attempts", icon: RefreshCw, valueTone: "text-emerald-600" },
  { label: "Alert Coverage", value: "Enabled", icon: Bell, valueTone: "text-emerald-600" },
] as const;

const publishReadiness = [
  { label: "Connector Health", value: "Healthy" },
  { label: "Validation Status", value: "Passed" },
  { label: "Schedule Status", value: "Active-ready" },
  { label: "Alert Coverage", value: "Enabled" },
  { label: "Estimated Daily Files", value: "124" },
] as const;

const deploymentNotes = [
  "Pipeline will be registered in the studio catalog",
  "Daily runs will start at next scheduled window",
  "Monitoring, alerts, and run logs will become available",
] as const;

const prePublishChecks = [
  "Source connection verified",
  "Schema mapping completed",
  "Validation rules enabled",
  "Target table configured",
  "Schedule and retries defined",
  "Alerting configured",
  "Access permissions validated",
] as const;

export default function CreateIngestionPipeline() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<CreateStep>(1);
  const [publishDialog, setPublishDialog] = useState<"confirm" | "success" | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [config, setConfig] = useState<WizardConfig>({
    pipelineName: "Claims Intake Bronze Loader",
    ownerTeam: "Provider Analytics",
    businessPurpose: "Ingest payer and claims intake files from ADLS into Bronze zone for downstream processing.",
    domain: "Semi-Structured",
    mode: "Batch",
    sourceType: "Cloud Storage",
    starter: "Start from Blank",
    connectorMode: "existing",
    connector: "ADLS - Claims Landing Storage",
    targetZone: "Bronze",
    schedule: "Daily",
    publishMode: "active",
    notifyStakeholders: true,
    createRunbook: true,
  });
  const updateConfig = <Key extends keyof WizardConfig>(key: Key, value: WizardConfig[Key]) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };
  const saveDraft = () => {
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2200);
  };

  const configurationSummary = [
    { label: "Studio", value: "Ingestion Studio", icon: Package, tone: "orange" },
    { label: "Pipeline Name", value: config.pipelineName, icon: FileText, tone: "orange" },
    { label: "Pipeline Type", value: config.mode, icon: ListChecks, tone: "orange" },
    { label: "Source Type", value: config.sourceType, icon: Cloud, tone: "orange" },
    { label: "Data Domain", value: config.domain, icon: Grid2X2, tone: "purple" },
    { label: "Connector", value: config.connector.replace(" - Claims Landing Storage", ""), icon: Database, tone: "purple" },
    { label: "Target Zone", value: config.targetZone, icon: Layers, tone: "purple" },
    { label: "Schedule", value: `${config.schedule} at 02:00 AM`, icon: Calendar, tone: "green" },
    { label: "Environment", value: "Production", icon: ShieldCheck, tone: "green" },
  ] as const;

  return (
    <>
      <section className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-card">
        <div className="px-5 pb-4 pt-5">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-500">
            <button onClick={() => navigate("/studios")} className="hover:text-orange-600">Studios</button>
            <span>/</span>
            <button onClick={() => navigate("/studios/ingestion")} className="hover:text-orange-600">Ingestion Studio</button>
            <span>/</span>
            <span className="text-slate-900">Create Pipeline</span>
          </div>
          <h1 className="mt-3 text-[26px] font-extrabold leading-tight text-slate-950">Create Ingestion Pipeline</h1>
          <p className="mt-1 text-[13px] font-medium text-slate-700">Configure a new ingestion pipeline for structured, semi-structured, or unstructured data sources.</p>
        </div>

        <Stepper activeStep={activeStep} onStep={setActiveStep} />

        <div className="ingestion-create-grid px-5 pb-6">
          {activeStep === 1 ? <PipelineBasicsStep config={config} updateConfig={updateConfig} /> : activeStep === 2 ? <SourceConnectionStep config={config} updateConfig={updateConfig} /> : activeStep === 3 ? <MappingValidationStep config={config} /> : activeStep === 4 ? <TargetScheduleStep config={config} updateConfig={updateConfig} /> : <ReviewPublishStep config={config} updateConfig={updateConfig} />}

          <aside className="space-y-4">
            <SidePanel title="Configuration Summary">
              <div className="space-y-5">
                {(activeStep === 1 ? configurationSummary.filter((item) => item.label !== "Connector" && item.label !== "Schedule") : configurationSummary).map((item) => <SummaryRow key={item.label} {...item} />)}
              </div>
            </SidePanel>

            {activeStep === 5 ? <PublishReadinessPanel /> : (
              <SidePanel title="Recommended Next">
                <div className="space-y-4">
                  {activeStep === 1
                    ? nextSteps.map((item, index) => <NextStep key={item.title} index={index + 1} {...item} />)
                    : (activeStep === 2 ? sourceNextSteps : activeStep === 3 ? mappingNextSteps : targetNextSteps).map((item, index) => <NumberedNextStep key={item.title} index={index + 1} {...item} />)}
                </div>
              </SidePanel>
            )}

            {activeStep === 1 ? <BestPracticesPanel /> : activeStep === 2 ? <ConnectorInsightsPanel /> : activeStep === 3 ? <ValidationInsightsPanel /> : activeStep === 4 ? <OperationalInsightsPanel /> : <DeploymentNotesPanel />}
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-4 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          {activeStep > 1 ? <button onClick={() => setActiveStep((activeStep - 1) as CreateStep)} className="mr-auto inline-flex h-10 min-w-[112px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-800 shadow-sm hover:border-orange-200"><ArrowLeft className="h-4 w-4" /> Back</button> : null}
          <button onClick={() => navigate("/studios/ingestion")} className="h-10 min-w-[112px] rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-800 shadow-sm hover:border-orange-200">Cancel</button>
          <button onClick={saveDraft} className="h-10 min-w-[150px] rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-800 shadow-sm hover:border-orange-200">Save as Draft</button>
          <button onClick={() => activeStep < 5 ? setActiveStep((activeStep + 1) as CreateStep) : setPublishDialog("confirm")} className="inline-flex h-10 min-w-[240px] items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-extrabold text-white orange-gradient">
            {activeStep === 1 ? "Continue to Source & Connection" : activeStep === 2 ? "Continue to Mapping & Validation" : activeStep === 3 ? "Continue to Target & Schedule" : activeStep === 4 ? "Continue to Review & Publish" : "Publish Pipeline"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
      {draftSaved ? <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-extrabold text-emerald-800 shadow-card">Draft saved</div> : null}
      {publishDialog === "confirm" ? <PublishPipelineDialog config={config} onClose={() => setPublishDialog(null)} onConfirm={() => setPublishDialog("success")} onSaveDraft={saveDraft} /> : null}
      {publishDialog === "success" ? <PublishSuccessDialog config={config} onStay={() => setPublishDialog(null)} onBackToIngestion={() => navigate("/studios/ingestion")} /> : null}
    </>
  );
}

function Stepper({ activeStep, onStep }: { activeStep: CreateStep; onStep: (step: CreateStep) => void }) {
  return (
    <div className="px-8 pb-5 pt-2">
      <div className="grid grid-cols-1 gap-3 min-[980px]:grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto]">
        {steps.map((step, index) => {
          const number = index + 1;
          const active = number === activeStep;
          const complete = number < activeStep;
          return (
            <div key={step} className={`contents ${active ? "text-orange-600" : "text-slate-600"}`}>
              <button onClick={() => onStep(number as CreateStep)} className="flex min-w-0 items-center gap-3 text-left">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[12px] font-extrabold ${complete ? "border-emerald-500 bg-emerald-500 text-white" : active ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 bg-slate-50 text-slate-600"}`}>{complete ? <Check className="h-4 w-4" /> : number}</span>
                <span className="whitespace-nowrap text-[12px] font-extrabold">{step}</span>
              </button>
              {index < steps.length - 1 ? <span className="hidden h-px self-center bg-slate-200 min-[980px]:block" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PublishPipelineDialog({ config, onClose, onConfirm, onSaveDraft }: { config: WizardConfig; onClose: () => void; onConfirm: () => void; onSaveDraft: () => void }) {
  const rows = [
    ["Pipeline Name", config.pipelineName, Database],
    ["Studio", "Ingestion Studio", Package],
    ["Source Type", config.sourceType, Cloud],
    ["Connector", config.connector, Folder],
    ["Target Zone", config.targetZone, Database],
    ["Schedule", `${config.schedule} at 02:00 AM UTC`, Clock],
    ["Environment", "Production", ShieldCheck],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 backdrop-blur-[1px]">
      <section className="w-full max-w-[620px] rounded-[14px] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600">
              <Rocket className="h-9 w-9" />
            </span>
            <div>
              <h2 className="text-[24px] font-extrabold leading-tight text-slate-950">Publish Pipeline</h2>
              <p className="mt-2 text-[13px] font-medium text-slate-600">You are about to publish and activate this ingestion pipeline.</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close publish dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 p-5">
          <div className="space-y-4">
            {rows.map(([label, value, Icon]) => (
              <div key={label} className="grid grid-cols-[24px_minmax(130px,.55fr)_minmax(0,1fr)] items-center gap-4">
                <Icon className="h-5 w-5 text-slate-600" />
                <b className="text-[12px] text-slate-600">{label}</b>
                <span className="text-[12px] font-extrabold text-slate-800">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid min-h-[44px] grid-cols-[28px_1fr] items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-4 w-4" /></span>
            <b className="text-[13px] text-emerald-800">All pre-publish checks passed.</b>
          </div>

          <h3 className="mt-6 text-[15px] font-extrabold text-slate-950">What happens next</h3>
          <div className="mt-3 space-y-3">
            {deploymentNotes.map((note, index) => (
              <div key={note} className="grid grid-cols-[24px_1fr] items-start gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-orange-50 text-[11px] font-extrabold text-orange-600">{index + 1}</span>
                <span className="text-[12px] font-semibold text-slate-600">{note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button onClick={onClose} className="h-10 px-2 text-[13px] font-extrabold text-slate-800 hover:text-orange-600">Back to Review</button>
          <div className="flex flex-wrap gap-3">
            <button onClick={onSaveDraft} className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-800 shadow-sm hover:border-orange-200">Save as Draft</button>
            <button onClick={onConfirm} className="h-10 min-w-[170px] rounded-lg px-5 text-[13px] font-extrabold text-white orange-gradient">Confirm & Publish</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PublishSuccessDialog({ config, onStay, onBackToIngestion }: { config: WizardConfig; onStay: () => void; onBackToIngestion: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 backdrop-blur-[1px]">
      <section className="w-full max-w-[520px] rounded-[14px] border border-slate-200 bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-9 w-9" />
        </div>
        <h2 className="mt-4 text-[24px] font-extrabold text-slate-950">Pipeline Published</h2>
        <p className="mx-auto mt-2 max-w-[380px] text-[13px] font-medium leading-5 text-slate-600">
          {config.pipelineName} is {config.publishMode === "active" ? "active" : "saved as an inactive draft"}. {config.schedule} runs will start at 02:00 AM UTC when activated and monitoring is enabled.
        </p>
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-left">
          <b className="block text-[13px] text-emerald-800">Publish completed successfully.</b>
          <span className="mt-1 block text-[12px] font-medium text-slate-600">The pipeline is registered in the studio catalog and ready for scheduled execution.</span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={onStay} className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-extrabold text-slate-800 shadow-sm hover:border-orange-200">Stay Here</button>
          <button onClick={onBackToIngestion} className="inline-flex h-10 min-w-[220px] items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-extrabold text-white orange-gradient">Back to Ingestion Studio <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </div>
  );
}

function PipelineBasicsStep({ config, updateConfig }: { config: WizardConfig; updateConfig: <Key extends keyof WizardConfig>(key: Key, value: WizardConfig[Key]) => void }) {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-[15px] font-extrabold text-slate-950">Pipeline Basics</h2>
      <div className="mt-4 grid gap-4 min-[950px]:grid-cols-2">
        <TextField label="Pipeline Name" required value={config.pipelineName} onChange={(value) => updateConfig("pipelineName", value)} />
        <SelectField label="Owner Team" required value={config.ownerTeam} icon={User} onChange={(value) => updateConfig("ownerTeam", value)} />
        <TextField label="Business Purpose / Description" required value={config.businessPurpose} onChange={(value) => updateConfig("businessPurpose", value)} />
        <TagField />
      </div>

      <ChoiceSection title="Choose Data Domain">
        <div className="grid grid-cols-1 gap-3 min-[850px]:grid-cols-3">
          {domains.map((item) => <ChoiceCard key={item.title} {...item} active={config.domain === item.title} onClick={() => updateConfig("domain", item.title)} />)}
        </div>
      </ChoiceSection>

      <ChoiceSection title="Choose Ingestion Mode">
        <div className="grid grid-cols-1 gap-3 min-[850px]:grid-cols-3">
          {modes.map((item) => <ChoiceCard key={item.title} {...item} active={config.mode === item.title} onClick={() => updateConfig("mode", item.title)} />)}
        </div>
      </ChoiceSection>

      <ChoiceSection title="Select Primary Source Type">
        <div className="grid grid-cols-1 gap-3 min-[850px]:grid-cols-2 min-[1450px]:grid-cols-3">
          {sources.map((item) => <ChoiceCard key={item.title} {...item} active={config.sourceType === item.title} onClick={() => updateConfig("sourceType", item.title)} />)}
        </div>
      </ChoiceSection>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <ChoiceSection title="Starter Options" tight>
          <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2">
            <WideChoice active={config.starter === "Start from Blank"} onClick={() => updateConfig("starter", "Start from Blank")} icon={FileText} title="Start from Blank" detail="Build the pipeline configuration from scratch" />
            <WideChoice active={config.starter === "Use a Template"} onClick={() => updateConfig("starter", "Use a Template")} icon={ListChecks} title="Use a Template" detail="Choose from prebuilt pipeline templates" />
          </div>
        </ChoiceSection>
        <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-blue-600"><Info className="h-3.5 w-3.5" /></span>
          Recommended templates are optimized for cloud storage ingestion patterns and Bronze zone landing.
        </p>
      </div>
    </div>
  );
}

function SourceConnectionStep({ config, updateConfig }: { config: WizardConfig; updateConfig: <Key extends keyof WizardConfig>(key: Key, value: WizardConfig[Key]) => void }) {
  const [connectionTested, setConnectionTested] = useState(true);
  const sourceSummaryItems = [
    { label: "Mode", value: config.mode, icon: ListChecks, tone: "blue" },
    { label: "Domain", value: config.domain, icon: FileJson, tone: "purple" },
    { label: "Source Type", value: config.sourceType, icon: Cloud, tone: "orange" },
    { label: "Starter", value: config.starter, icon: FileText, tone: "orange" },
  ] as const;
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1450px]:grid-cols-4">
        {sourceSummaryItems.map((item) => <MiniSummaryCard key={item.label} {...item} />)}
      </div>

      <h2 className="mt-4 text-[15px] font-extrabold text-slate-950">Connector Setup</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 min-[860px]:grid-cols-2">
        <button onClick={() => updateConfig("connectorMode", "existing")} className={`inline-flex h-10 items-center gap-3 rounded-lg border px-4 text-left text-[12px] font-extrabold ${config.connectorMode === "existing" ? "border-orange-400 bg-orange-50/30 text-slate-950" : "border-slate-200 bg-white text-slate-700"}`}>
          <Database className="h-4 w-4 text-orange-600" /> Use Existing Connector
        </button>
        <button onClick={() => updateConfig("connectorMode", "new")} className={`inline-flex h-10 items-center gap-3 rounded-lg border px-4 text-left text-[12px] font-extrabold ${config.connectorMode === "new" ? "border-orange-400 bg-orange-50/30 text-slate-950" : "border-slate-200 bg-white text-slate-700"}`}>
          <span className="text-xl font-medium leading-none text-slate-500">+</span> Create New Connector
        </button>
      </div>

      <div className="mt-4 grid gap-4 border-b border-slate-100 pb-4 min-[900px]:grid-cols-[minmax(0,1.4fr)_auto_minmax(120px,.5fr)_minmax(120px,.55fr)_minmax(130px,.6fr)]">
        <label className="block">
          <FieldLabel label={config.connectorMode === "existing" ? "Select Connector" : "New Connector Name"} required />
          <span className="relative flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-900 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
            {config.connectorMode === "existing" ? (
              <select value={config.connector} onChange={(event) => updateConfig("connector", event.target.value)} className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-9 text-[12px] font-semibold outline-none">
                <option>ADLS - Claims Landing Storage</option>
                <option>S3 - Research Intake Bucket</option>
                <option>Snowflake - Analytics Warehouse</option>
                <option>SharePoint - Provider Docs</option>
              </select>
            ) : (
              <input value={config.connector} onChange={(event) => updateConfig("connector", event.target.value)} className="h-full min-w-0 flex-1 bg-transparent pr-9 text-[12px] font-semibold outline-none" />
            )}
            <ChevronDown className="absolute right-3 h-4 w-4 text-slate-600" />
          </span>
        </label>
        <button onClick={() => setConnectionTested(true)} className="self-end rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-extrabold text-emerald-700 hover:border-orange-200">{connectionTested ? "Connected" : "Validate"}</button>
        <MetaBlock label="Connector Category" value="Cloud Storage" />
        <MetaBlock label="Authentication" value="Managed Identity" />
        <MetaBlock label="Owner Team" value={config.ownerTeam} />
      </div>

      <h2 className="mt-4 text-[15px] font-extrabold text-slate-950">Connection Details</h2>
      <div className="mt-3 grid gap-3 min-[900px]:grid-cols-2">
        <IconTextField label="Storage Account / Bucket" required value="hcclaimsadlsprod" icon={Database} />
        <IconTextField label="Container / Path" required value="landing/claims/intake/" icon={Folder} />
        <TextField label="Region / Endpoint" value="East US" />
        <SelectOnly label="File Format" required value="JSON" />
        <SelectOnly label="Compression" value="None" />
        <div className="flex items-end justify-between rounded-lg px-1 pb-2">
          <span className="text-[12px] font-extrabold text-slate-700">Recursive Scan</span>
          <Toggle on />
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <h2 className="text-[15px] font-extrabold text-slate-950">Source Filters</h2>
        <div className="mt-3 grid gap-4 min-[900px]:grid-cols-[minmax(0,1fr)_140px_minmax(140px,.7fr)_minmax(180px,1fr)]">
          <TextField label="Filename Pattern" value="claims_*.json" />
          <div className="flex items-end justify-between rounded-lg px-1 pb-2">
            <span className="text-[11px] font-extrabold text-slate-600">Include Subfolders</span>
            <Toggle on />
          </div>
          <TextField label="Max File Size" value="500 MB" />
          <SelectOnly label="Arrival Pattern" value="Daily batch drop" />
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <h2 className="text-[15px] font-extrabold text-slate-950">Connection Validation</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 min-[950px]:grid-cols-[180px_1fr]">
          <button onClick={() => setConnectionTested(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-orange-400 bg-white px-5 text-[13px] font-extrabold text-orange-600 hover:bg-orange-50"><Zap className="h-4 w-4" /> Test Connection</button>
          <div className="grid min-h-[70px] grid-cols-[44px_1fr] items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-5 w-5" /></span>
            <div>
              <b className="block text-[13px] text-emerald-800">{connectionTested ? "Connection verified successfully. 124 files discovered in the selected path." : "Connection test has not been run yet."}</b>
              <span className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-500">
                <span>Last tested: 2 min ago</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Schema sample available</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MappingValidationStep({ config }: { config: WizardConfig }) {
  const [autoMapped, setAutoMapped] = useState(false);
  const [validationRun, setValidationRun] = useState(true);
  const mappingSummaryItems = [
    { label: "Mode", value: config.mode, icon: ListChecks, tone: "blue" },
    { label: "Domain", value: config.domain, icon: FileJson, tone: "purple" },
    { label: "Source Type", value: config.sourceType, icon: Cloud, tone: "orange" },
    { label: "Connector", value: config.connector, icon: ShieldCheck, tone: "green" },
  ] as const;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 rounded-[12px] border border-slate-200 bg-white p-3 shadow-sm min-[900px]:grid-cols-2 min-[1450px]:grid-cols-4">
        {mappingSummaryItems.map((item) => <MiniSummaryCard key={item.label} {...item} />)}
      </div>

      <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-[15px] font-extrabold text-slate-950">Schema Mapping & Validation</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-3 min-[900px]:grid-cols-3">
          <SelectField label="Sample File" value="claims_2026_05_18.json" icon={File} />
          <MiniMeta icon={FileText} label="Detected Records" value="124" />
          <MiniMeta icon={FileJson} label="Format" value="JSON" />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 min-[1250px]:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
          <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-3">
              <h3 className="text-[14px] font-extrabold text-slate-950">Detected Source Fields</h3>
              <label className="relative mt-2 block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="h-8 w-full rounded-md border border-slate-200 pl-9 pr-3 text-[12px] outline-none focus:border-orange-300" placeholder="Search fields" />
              </label>
            </div>
            <div className="grid grid-cols-[28px_minmax(130px,1fr)_84px_minmax(120px,.8fr)] border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500">
              <span className="h-4 w-4 rounded border border-slate-300 bg-white" />
              <span>Field Name</span><span>Type</span><span>Sample Value</span>
            </div>
            <div className="divide-y divide-slate-100">
              {detectedFields.map((field) => <DetectedFieldRow key={field.name} {...field} />)}
            </div>
            <p className="px-3 py-2 text-[11px] font-medium text-slate-500">8 fields detected</p>
          </div>

          <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-3">
              <h3 className="text-[14px] font-extrabold text-slate-950">Target Schema Mapping</h3>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">Target Zone: <span className="text-orange-600">●</span> Bronze</span>
            </div>
            <div className="grid grid-cols-[minmax(92px,.85fr)_28px_minmax(92px,.9fr)_minmax(86px,.75fr)_minmax(86px,.75fr)_82px] border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500">
              <span>Source Field</span><span /><span>Target Column</span><span>Target Type</span><span>Transform</span><span>Status</span>
            </div>
            <div className="divide-y divide-slate-100">
              {schemaMappings.map((mapping) => <MappingRow key={`${mapping.source}-${mapping.target}`} {...mapping} />)}
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[11px] font-medium text-slate-500">Showing 6 of 8 source fields</span>
              <button onClick={() => setAutoMapped(true)} className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-extrabold text-slate-700"><RefreshCw className="h-3.5 w-3.5" /> {autoMapped ? "Remaining Mapped" : "Auto Map Remaining"}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-[15px] font-extrabold text-slate-950">Validation Rules</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1450px]:grid-cols-5">
          {validationRules.map((rule, index) => <ValidationRuleCard key={rule.title} index={index + 1} {...rule} />)}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 min-[900px]:grid-cols-[44px_1fr_auto]">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-6 w-6" /></span>
          <div>
            <b className="block text-[14px] text-emerald-800">{validationRun ? "Validation preview passed. 118 records valid, 6 flagged for review." : "Run validation preview to refresh these results."}</b>
            <span className="mt-2 flex flex-wrap gap-5 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-600" />2 type mismatches</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-600" />4 duplicate candidates</span>
            </span>
          </div>
          <button onClick={() => setValidationRun(true)} className="inline-flex h-9 items-center justify-center gap-2 self-center rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-800"><Play className="h-4 w-4" /> Run Validation Preview</button>
        </div>
      </div>
    </div>
  );
}

function TargetScheduleStep({ config, updateConfig }: { config: WizardConfig; updateConfig: <Key extends keyof WizardConfig>(key: Key, value: WizardConfig[Key]) => void }) {
  const mappingSummaryItems = [
    { label: "Mode", value: config.mode, icon: ListChecks, tone: "blue" },
    { label: "Domain", value: config.domain, icon: FileJson, tone: "purple" },
    { label: "Source Type", value: config.sourceType, icon: Cloud, tone: "orange" },
    { label: "Connector", value: config.connector, icon: ShieldCheck, tone: "green" },
  ] as const;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 rounded-[12px] border border-slate-200 bg-white p-3 shadow-sm min-[900px]:grid-cols-2 min-[1450px]:grid-cols-4">
        {mappingSummaryItems.map((item) => <MiniSummaryCard key={item.label} {...item} />)}
      </div>

      <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-[15px] font-extrabold text-slate-950">Target & Schedule</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 min-[1180px]:grid-cols-2">
          <div className="rounded-[10px] border border-slate-200 bg-white p-3">
            <h3 className="mb-3 flex items-center gap-3 text-[14px] font-extrabold text-slate-950"><StepBubble value="1" />Target Destination</h3>
            <div className="grid grid-cols-1 gap-3 min-[1500px]:grid-cols-3">
              {targetZones.map((zone) => <TargetZoneCard key={zone.title} {...zone} active={config.targetZone === zone.title} onClick={() => updateConfig("targetZone", zone.title)} />)}
            </div>
            <div className="mt-4 grid gap-3 min-[900px]:grid-cols-2">
              <IconTextField label="Catalog / Database" required value="claims_bronze" icon={Database} />
              <IconTextField label="Target Table" required value="bronze_claims_intake" icon={Grid2X2} />
              <IconTextField label="Storage Path" required value="/bronze/claims/intake/" icon={Folder} />
              <SelectOnly label="Output Format" value="Delta" />
              <SelectOnly label="Write Mode" value="Append" />
              <SelectOnly label="Partition Strategy" value="ingestion_date" />
            </div>
            <div className="mt-3 grid gap-3 min-[900px]:grid-cols-2">
              <ToggleRow label="Schema Evolution" />
              <ToggleRow label="Quarantine Invalid Records" />
            </div>
            <p className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
              Bronze zone receives raw standardized data exactly as ingested. Downstream processes will refine and transform for analytics.
            </p>
          </div>

          <div className="rounded-[10px] border border-slate-200 bg-white p-3">
            <h3 className="mb-3 flex items-center gap-3 text-[14px] font-extrabold text-slate-950"><StepBubble value="2" />Run Schedule</h3>
            <div className="grid grid-cols-2 gap-3 min-[1500px]:grid-cols-4">
              {scheduleOptions.map((option) => <ScheduleCard key={option.title} {...option} active={config.schedule === option.title} onClick={() => updateConfig("schedule", option.title)} />)}
            </div>
            <div className="mt-4 grid gap-3 min-[900px]:grid-cols-3">
              <IconTextField label="Start Time" required value="02:00 AM" icon={Clock} />
              <SelectOnly label="Time Zone" value="UTC" />
              <SelectOnly label="Expected Arrival Window" value="01:00 AM - 02:00 AM" />
              <TextField label="Retry Attempts" value="3" />
              <SelectOnly label="Retry Interval" value="15 min" />
              <TextField label="SLA Threshold" value="30 min" />
            </div>
            <label className="mt-3 block">
              <FieldLabel label="Cron Expression (read-only)" />
              <span className="relative flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-[12px] font-semibold text-slate-600">
                0 2 * * *
                <FileText className="absolute right-3 h-4 w-4 text-slate-500" />
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-[10px] border border-slate-200 bg-white p-3">
          <h3 className="mb-3 flex items-center gap-3 text-[14px] font-extrabold text-slate-950"><StepBubble value="3" />Notifications & Operational Settings</h3>
          <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
            <NotificationCard icon={Bell} title="Enable failure alerts" detail="Get notified on pipeline failures" />
            <NotificationCard icon={ShieldCheck} title="Enable SLA breach alerts" detail="Get notified on SLA threshold breach" />
            <NotificationCard icon={Zap} title="Notify on schema drift" detail="Get notified on schema changes" />
          </div>
          <div className="mt-3 grid gap-3 min-[900px]:grid-cols-2">
            <SelectField label="Notification Channel" required value="Ops & Data Engineering" icon={User} />
            <SelectField label="Owner Escalation" required value="Provider Analytics" icon={User} />
          </div>
          <div className="mt-3 grid min-h-[50px] grid-cols-[36px_1fr] items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-5 w-5" /></span>
            <div>
              <b className="block text-[13px] text-emerald-800">Schedule validated successfully. Target table and run cadence are ready for publishing.</b>
              <span className="text-[11px] font-semibold text-slate-600">Estimated daily volume: 124 files <span className="mx-2 text-emerald-600">●</span> Retention: 90 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewPublishStep({ config, updateConfig }: { config: WizardConfig; updateConfig: <Key extends keyof WizardConfig>(key: Key, value: WizardConfig[Key]) => void }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const mappingSummaryItems = [
    { label: "Mode", value: config.mode, icon: ListChecks, tone: "blue" },
    { label: "Domain", value: config.domain, icon: FileJson, tone: "purple" },
    { label: "Source Type", value: config.sourceType, icon: Cloud, tone: "orange" },
    { label: "Connector", value: config.connector, icon: ShieldCheck, tone: "green" },
  ] as const;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 rounded-[12px] border border-slate-200 bg-white p-3 shadow-sm min-[900px]:grid-cols-2 min-[1450px]:grid-cols-4">
        {mappingSummaryItems.map((item) => <MiniSummaryCard key={item.label} {...item} />)}
      </div>

      <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-[15px] font-extrabold text-slate-950">Review & Publish</h2>

        <ReviewSection number="1" title="Pipeline Overview">
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 p-3 min-[900px]:grid-cols-3">
            <ReviewInfo icon={Database} label="Pipeline Name" value={config.pipelineName} />
            <ReviewInfo icon={User} label="Owner Team" value={config.ownerTeam} />
            <ReviewInfo icon={Database} label="Connector" value={config.connector} />
            <ReviewInfo icon={FileText} label="Business Purpose" value={config.businessPurpose} />
            <ReviewInfo icon={Tag} label="Tags" value="Claims, Bronze, ADLS" />
            <ReviewInfo icon={Folder} label="Source Path" value="landing/claims/intake/" />
          </div>
        </ReviewSection>

        <ReviewSection number="2" title="Schema & Validation Review">
          <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-3 min-[1450px]:grid-cols-6">
            <ReviewMetric icon={FileJson} label="Source Fields" value="8 detected" tone="purple" />
            <ReviewMetric icon={CheckCircle2} label="Mapped Fields" value="6 mapped, 2 auto-derived" tone="green" />
            <ReviewMetric icon={CheckCircle2} label="Validation Pass Rate" value="95.2%" tone="green" />
            <ReviewMetric icon={FileText} label="Records Previewed" value="124" tone="blue" />
            <ReviewMetric icon={Flag} label="Flags for Review" value="6" tone="orange" />
            <ReviewMetric icon={ShieldCheck} label="Rules Enabled" value="5" tone="purple" />
          </div>
          <div className="mt-3 grid min-h-[48px] grid-cols-[36px_1fr_auto] items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-5 w-5" /></span>
            <div>
              <b className="block text-[13px] text-emerald-800">Validation preview passed. Schema mapping and data quality rules are ready for production.</b>
              <span className="text-[11px] font-semibold text-slate-600">118 valid records <span className="mx-2 text-emerald-600">●</span> 6 flagged for review</span>
            </div>
            <button onClick={() => setDetailsOpen(true)} className="h-8 rounded-md border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-800 hover:border-orange-200">View Details</button>
          </div>
          {detailsOpen ? <ValidationDetailsDialog onClose={() => setDetailsOpen(false)} /> : null}
        </ReviewSection>

        <ReviewSection number="3" title="Target & Schedule Review">
          <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200 min-[900px]:grid-cols-4">
            {[
              ["Target Zone", config.targetZone, Layers, "orange"],
              ["Catalog / Database", "claims_bronze", Grid2X2, "blue"],
              ["Target Table", "bronze_claims_intake", Database, "purple"],
              ["Output Format", "Delta", RefreshCw, "green"],
              ["Write Mode", "Append", FileText, "green"],
              ["Run Schedule", `${config.schedule} at 02:00 AM UTC`, Clock, "blue"],
              ["Retry Policy", "3 attempts, every 15 min", Zap, "blue"],
              ["SLA Threshold", "30 min", Clock, "orange"],
              ["Partition Strategy", "ingestion_date", Layers, "slate"],
              ["Notification Channel", "Ops & Data Engineering", Bell, "green"],
            ].map(([label, value, Icon, tone]) => <ReviewGridItem key={label as string} label={label as string} value={value as string} icon={Icon as LucideIcon} tone={tone as Tone} />)}
          </div>
        </ReviewSection>

        <ReviewSection number="4" title="Publish Settings">
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 min-[900px]:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,.7fr))]">
            <div>
              <FieldLabel label="Activation Mode" />
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-orange-300 bg-orange-50/30 text-[12px] font-semibold text-slate-800">
                <button onClick={() => updateConfig("publishMode", "active")} className="flex items-center gap-2 px-3 py-2 text-left"><span className={`h-4 w-4 rounded-full ${config.publishMode === "active" ? "border-4 border-orange-500" : "border border-slate-300"}`} />Publish and activate now</button>
                <button onClick={() => updateConfig("publishMode", "draft")} className="flex items-center gap-2 border-l border-orange-100 px-3 py-2 text-left"><span className={`h-4 w-4 rounded-full ${config.publishMode === "draft" ? "border-4 border-orange-500" : "border border-slate-300"}`} />Publish as draft / inactive</button>
              </div>
            </div>
            <ReviewInfo icon={FileText} label="Version" value="v1.0" />
            <ReviewInfo icon={ShieldCheck} label="Environment" value="Production" />
            <ReviewInfo icon={CheckCircle2} label="Approval Status" value="Ready to publish" />
            <button onClick={() => updateConfig("notifyStakeholders", !config.notifyStakeholders)} className="flex items-center gap-2 text-left text-[12px] font-semibold text-slate-700"><span className={`grid h-4 w-4 place-items-center rounded ${config.notifyStakeholders ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-transparent"}`}><Check className="h-3 w-3" /></span>Notify stakeholders after publishing</button>
            <button onClick={() => updateConfig("createRunbook", !config.createRunbook)} className="flex items-center gap-2 text-left text-[12px] font-semibold text-slate-700"><span className={`grid h-4 w-4 place-items-center rounded ${config.createRunbook ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-transparent"}`}><Check className="h-3 w-3" /></span>Create runbook entry</button>
          </div>
        </ReviewSection>

        <ReviewSection number="5" title="Pre-Publish Checklist">
          <div className="grid grid-cols-2 gap-2 min-[900px]:grid-cols-4 min-[1450px]:grid-cols-7">
            {prePublishChecks.map((item) => <ChecklistPill key={item} label={item} />)}
          </div>
          <div className="mt-3 grid min-h-[42px] grid-cols-[32px_1fr] items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-5 w-5" /></span>
            <b className="text-[13px] text-emerald-800">All pre-publish checks passed. This pipeline is ready to be published and scheduled.</b>
          </div>
        </ReviewSection>
      </div>
    </div>
  );
}

function ReviewSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3 rounded-[10px] border border-slate-200 bg-white p-3">
      <h3 className="mb-3 flex items-center gap-3 text-[14px] font-extrabold text-slate-950"><StepBubble value={number} />{title}</h3>
      {children}
    </section>
  );
}

function ValidationDetailsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4">
      <section className="w-full max-w-[560px] rounded-[14px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-slate-950">Validation Details</h2>
            <p className="mt-2 text-[13px] font-medium text-slate-600">Schema preview completed with production-ready quality checks.</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close validation details"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {[
            ["Records reviewed", "124"],
            ["Valid records", "118"],
            ["Flagged for review", "6"],
            ["Type mismatches", "2"],
            ["Duplicate candidates", "4"],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[1fr_auto] px-4 py-3 text-[13px]">
              <span className="font-semibold text-slate-600">{label}</span>
              <b className="text-slate-950">{value}</b>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="h-10 rounded-lg px-5 text-[13px] font-extrabold text-white orange-gradient">Done</button>
        </div>
      </section>
    </div>
  );
}

function ReviewInfo({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[28px_1fr] items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-slate-600" />
      <span className="min-w-0">
        <span className="block text-[10px] font-extrabold text-slate-500">{label}</span>
        <b className="block text-[12px] leading-4 text-slate-900">{value}</b>
      </span>
    </div>
  );
}

function ReviewMetric({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  return (
    <div className="grid min-h-[58px] grid-cols-[34px_1fr] items-center gap-3 rounded-lg border border-slate-200 p-3">
      <Icon className={`h-5 w-5 ${tone === "green" ? "text-emerald-600" : tone === "orange" ? "text-orange-600" : tone === "purple" ? "text-purple-600" : "text-blue-600"}`} />
      <span><span className="block text-[10px] font-extrabold text-slate-500">{label}</span><b className="block text-[12px] text-slate-950">{value}</b></span>
    </div>
  );
}

function ReviewGridItem({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  return (
    <div className="grid min-h-[54px] grid-cols-[28px_1fr] items-center gap-3 border-b border-r border-slate-100 p-3">
      <Icon className={`h-5 w-5 ${tone === "green" ? "text-emerald-600" : tone === "orange" ? "text-orange-600" : tone === "purple" ? "text-purple-600" : tone === "blue" ? "text-blue-600" : "text-slate-600"}`} />
      <span className="min-w-0"><span className="block text-[10px] font-extrabold text-slate-500">{label}</span><b className="block truncate text-[12px] text-slate-950">{value}</b></span>
    </div>
  );
}

function ChecklistPill({ label }: { label: string }) {
  return (
    <div className="flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-100 bg-white px-2 text-[11px] font-semibold text-slate-700">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-3.5 w-3.5" /></span>
      <span className="leading-3">{label}</span>
    </div>
  );
}

function StepBubble({ value }: { value: string }) {
  return <span className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-slate-50 text-[12px] font-extrabold text-slate-700">{value}</span>;
}

function TargetZoneCard({ title, detail, icon: Icon, selected, active: controlledActive, onClick }: { title: string; detail: string; icon: LucideIcon; selected?: boolean; active?: boolean; onClick?: () => void }) {
  const [localActive, setLocalActive] = useState(Boolean(selected));
  const active = controlledActive ?? localActive;
  return (
    <button onClick={onClick ?? (() => setLocalActive(!active))} className={`grid min-h-[62px] grid-cols-[28px_34px_1fr] items-center gap-3 rounded-lg border p-3 text-left ${active ? "border-orange-400 bg-orange-50/40" : "border-slate-200 bg-white"}`}>
      <span className={`h-4 w-4 rounded-full border ${active ? "border-orange-500 bg-orange-500 ring-4 ring-orange-50" : "border-slate-300 bg-white"}`} />
      <Icon className={`h-6 w-6 ${active ? "text-orange-600" : "text-slate-500"}`} />
      <span className="min-w-0">
        <b className="block text-[12px] text-slate-950">{title}</b>
        <span className="block text-[10px] font-medium leading-3 text-slate-500">{detail}</span>
      </span>
    </button>
  );
}

function ScheduleCard({ title, icon: Icon, selected, active: controlledActive, onClick }: { title: string; icon: LucideIcon; selected?: boolean; active?: boolean; onClick?: () => void }) {
  const [localActive, setLocalActive] = useState(Boolean(selected));
  const active = controlledActive ?? localActive;
  return (
    <button onClick={onClick ?? (() => setLocalActive(!active))} className={`flex h-14 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold ${active ? "border-orange-400 bg-orange-50/40 text-orange-700" : "border-slate-200 bg-white text-slate-800"}`}>
      <Icon className="h-5 w-5" /> {title}
    </button>
  );
}

function ToggleRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-1 py-1">
      <span className="text-[12px] font-extrabold text-slate-700">{label}</span>
      <Toggle on />
    </div>
  );
}

function NotificationCard({ title, detail, icon: Icon }: { title: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="grid min-h-[58px] grid-cols-[34px_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <Icon className="h-5 w-5 text-emerald-600" />
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{title}</b>
        <span className="block truncate text-[11px] text-slate-500">{detail}</span>
      </span>
      <Toggle on />
    </div>
  );
}

function MiniMeta({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="grid min-h-[48px] grid-cols-[34px_1fr] items-center gap-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>
        <span className="block text-[10px] font-extrabold text-slate-500">{label}</span>
        <b className="block text-[12px] text-slate-950">{value}</b>
      </span>
    </div>
  );
}

function DetectedFieldRow({ name, type, value, required }: { name: string; type: string; value: string; required?: boolean }) {
  return (
    <div className="grid grid-cols-[28px_minmax(130px,1fr)_84px_minmax(120px,.8fr)] items-center px-3 py-2 text-[11px] font-medium text-slate-700">
      <span className="grid h-4 w-4 place-items-center rounded bg-emerald-500 text-white"><Check className="h-3 w-3" /></span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{name}</span>
        {required ? <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700">Required</span> : null}
      </span>
      <span>{type}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function MappingRow({ source, target, type, transform, status }: { source: string; target: string; type: string; transform: string; status: string }) {
  const needsReview = status === "Needs review";
  return (
    <div className="grid grid-cols-[minmax(92px,.85fr)_28px_minmax(92px,.9fr)_minmax(86px,.75fr)_minmax(86px,.75fr)_82px] items-center px-3 py-2 text-[11px] font-medium text-slate-700">
      <span className="truncate">{source}</span>
      <span className="text-slate-500">↪</span>
      <span className="truncate">{target}</span>
      <span className="truncate">{type}</span>
      <span className="truncate">{transform}</span>
      <span className={`w-fit rounded-md border px-2 py-1 text-[10px] font-extrabold ${needsReview ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{status}</span>
    </div>
  );
}

function ValidationRuleCard({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="min-h-[78px] rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-start gap-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-orange-200 bg-orange-50 text-[10px] font-extrabold text-orange-700">{index}</span>
          <span className="min-w-0">
            <b className="block text-[11px] leading-4 text-slate-950">{title}</b>
            <span className="mt-1 block text-[10px] leading-3 text-slate-500">{detail}</span>
          </span>
        </span>
        <Toggle on />
      </div>
      <span className="mt-2 flex items-center gap-2 text-[10px] font-extrabold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-600" />Enabled</span>
    </div>
  );
}

function TextField({ label, value, required, onChange }: { label: string; value: string; required?: boolean; onChange?: (value: string) => void }) {
  const [localValue, setLocalValue] = useState(value);
  const currentValue = onChange ? value : localValue;
  const handleChange = (nextValue: string) => {
    if (onChange) {
      onChange(nextValue);
    } else {
      setLocalValue(nextValue);
    }
  };
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input value={currentValue} onChange={(event) => handleChange(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
    </label>
  );
}

function IconTextField({ label, value, required, icon: Icon }: { label: string; value: string; required?: boolean; icon: LucideIcon }) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <span className="relative block">
        <input defaultValue={value} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-[12px] font-medium text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
        <Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

function SelectField({ label, value, required, icon: Icon, onChange }: { label: string; value: string; required?: boolean; icon: LucideIcon; onChange?: (value: string) => void }) {
  const [localValue, setLocalValue] = useState(value);
  const currentValue = onChange ? value : localValue;
  const handleChange = (nextValue: string) => {
    if (onChange) {
      onChange(nextValue);
    } else {
      setLocalValue(nextValue);
    }
  };
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <span className="relative flex h-9 items-center rounded-lg border border-slate-200 bg-white pl-3 text-[12px] font-medium text-slate-900 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
        <Icon className="mr-3 h-4 w-4 text-slate-500" />
        <select value={currentValue} onChange={(event) => handleChange(event.target.value)} className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-9 text-[12px] font-medium outline-none">
          {[value, "Provider Analytics", "Ops & Data Engineering", "Ingestion Studio", "Claims Platform"].filter((item, index, arr) => arr.indexOf(item) === index).map((item) => <option key={item}>{item}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
      </span>
    </label>
  );
}

function SelectOnly({ label, value, required }: { label: string; value: string; required?: boolean }) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <span className="relative block">
        <select defaultValue={value} className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-[12px] font-medium text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100">
          {[value, "JSON", "CSV", "Parquet", "Delta", "None", "Append", "Overwrite", "UTC", "15 min", "30 min", "Daily batch drop", "ingestion_date"].filter((item, index, arr) => arr.indexOf(item) === index).map((item) => <option key={item}>{item}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
      </span>
    </label>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-end border-l border-slate-100 pl-4">
      <span className="block text-[11px] font-extrabold text-slate-600">{label}</span>
      <b className="mt-2 block text-[12px] text-slate-950">{value}</b>
    </div>
  );
}

function TagField() {
  return (
    <label className="block">
      <FieldLabel label="Tags" />
      <span className="relative flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
        {["Claims", "Bronze", "ADLS"].map((tag) => (
          <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">{tag} ×</span>
        ))}
        <ChevronDown className="absolute right-3 h-4 w-4 text-slate-600" />
      </span>
    </label>
  );
}

function MiniSummaryCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="grid min-h-[58px] grid-cols-[42px_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <span className="block text-[10px] font-extrabold text-slate-500">{label}</span>
        <b className="block truncate text-[12px] text-slate-950">{value}</b>
      </span>
    </div>
  );
}

function Toggle({ on = false }: { on?: boolean }) {
  const [enabled, setEnabled] = useState(on);
  return (
    <button type="button" onClick={() => setEnabled(!enabled)} className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${enabled ? "justify-end bg-emerald-500" : "justify-start bg-slate-200"}`} aria-pressed={enabled}>
      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
    </button>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return <span className="mb-1.5 block text-[11px] font-extrabold text-slate-600">{label} {required ? <span className="text-orange-600">*</span> : null}</span>;
}

function ChoiceSection({ title, children, tight = false }: { title: string; children: React.ReactNode; tight?: boolean }) {
  return (
    <div className={tight ? "" : "mt-5"}>
      <h3 className="mb-3 flex items-center gap-2 text-[14px] font-extrabold text-slate-950">{title}<Info className="h-3.5 w-3.5 text-slate-400" /></h3>
      {children}
    </div>
  );
}

function ChoiceCard({ title, detail, icon: Icon, tone, selected, active: controlledActive, onClick }: { title: string; detail: string; icon: LucideIcon; tone: Tone; selected?: boolean; active?: boolean; onClick?: () => void }) {
  const [localActive, setLocalActive] = useState(Boolean(selected));
  const active = controlledActive ?? localActive;
  return (
    <button onClick={onClick ?? (() => setLocalActive(!active))} className={`relative grid min-h-[60px] grid-cols-[42px_1fr] items-center gap-3 rounded-lg border p-3 text-left transition hover:border-orange-200 ${active ? "border-orange-400 bg-orange-50/35" : "border-slate-200 bg-white"}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-950">{title}</b>
        <span className="block truncate text-[11px] font-medium text-slate-600">{detail}</span>
      </span>
      {active ? <span className="absolute right-3 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-white"><Check className="h-3.5 w-3.5" /></span> : null}
    </button>
  );
}

function WideChoice({ title, detail, icon: Icon, selected, active: controlledActive, onClick }: { title: string; detail: string; icon: LucideIcon; selected?: boolean; active?: boolean; onClick?: () => void }) {
  const [localActive, setLocalActive] = useState(Boolean(selected));
  const active = controlledActive ?? localActive;
  return (
    <button onClick={onClick ?? (() => setLocalActive(!active))} className={`grid min-h-[58px] grid-cols-[42px_1fr] items-center gap-3 rounded-lg border p-3 text-left ${active ? "border-orange-400 bg-orange-50/35" : "border-slate-200 bg-white"}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-lg border ${active ? toneMap.orange : toneMap.blue}`}><Icon className="h-5 w-5" /></span>
      <span><b className="block text-[12px] text-slate-950">{title}</b><span className="text-[11px] font-medium text-slate-600">{detail}</span></span>
    </button>
  );
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-[15px] font-extrabold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function BestPracticesPanel() {
  return (
    <SidePanel title="Best Practices">
      <div className="space-y-4">
        {["Validate schemas early to ensure data quality.", "Configure SLA monitoring for timely alerts.", "Use metadata tagging for better data discovery."].map((item) => (
          <div key={item} className="flex items-start gap-3 text-[12px] font-semibold text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

function ConnectorInsightsPanel() {
  return (
    <SidePanel title="Connector Insights">
      <div className="space-y-4">
        {connectorInsights.map(({ label, value, icon: Icon, valueTone }) => (
          <div key={label} className="grid grid-cols-[22px_1fr_auto] items-center gap-3">
            <Icon className="h-4 w-4 text-blue-600" />
            <span className="text-[12px] font-semibold text-slate-600">{label}</span>
            <b className={`text-[12px] ${valueTone ?? "text-slate-950"}`}>{value}</b>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

function ValidationInsightsPanel() {
  return (
    <SidePanel title="Validation Insights">
      <div className="space-y-4">
        {validationInsights.map(({ label, value, icon: Icon, valueTone }) => (
          <div key={label} className="grid grid-cols-[22px_1fr_auto] items-center gap-3">
            <Icon className={`h-4 w-4 ${label.includes("Review") ? "text-orange-600" : "text-blue-600"}`} />
            <span className="text-[12px] font-semibold text-slate-600">{label}</span>
            <b className={`text-[12px] ${valueTone}`}>{value}</b>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

function OperationalInsightsPanel() {
  return (
    <SidePanel title="Operational Insights">
      <div className="space-y-4">
        {operationalInsights.map(({ label, value, icon: Icon, valueTone }) => (
          <div key={label} className="grid grid-cols-[22px_1fr_auto] items-center gap-3">
            <Icon className={`h-4 w-4 ${label.includes("Retention") ? "text-orange-600" : label.includes("Alert") ? "text-purple-600" : "text-blue-600"}`} />
            <span className="text-[12px] font-semibold text-slate-600">{label}</span>
            <b className={`text-[12px] ${valueTone}`}>{value}</b>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

function PublishReadinessPanel() {
  return (
    <SidePanel title="Publish Readiness">
      <div className="space-y-4">
        {publishReadiness.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-[22px_1fr_auto] items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-[12px] font-semibold text-slate-600">{label}</span>
            <b className="text-[12px] text-emerald-600">{value}</b>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

function DeploymentNotesPanel() {
  return (
    <SidePanel title="Deployment Notes">
      <div className="space-y-4">
        {deploymentNotes.map((note, index) => (
          <div key={note} className="grid grid-cols-[28px_1fr] items-start gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-50 text-[12px] font-extrabold text-blue-600">{index + 1}</span>
            <span className="text-[12px] font-semibold leading-5 text-slate-600">{note}</span>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

function SummaryRow({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3">
      <Icon className={`h-5 w-5 ${tone === "orange" ? "text-orange-600" : tone === "purple" ? "text-purple-600" : tone === "green" ? "text-emerald-600" : "text-slate-600"}`} />
      <b className="truncate text-[12px] text-slate-900">{label}</b>
      <span className="text-right text-[12px] font-semibold text-slate-600">{value}</span>
    </div>
  );
}

function NextStep({ index, title, detail, icon: Icon }: { index: number; title: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="grid grid-cols-[34px_24px_1fr] items-start gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon className="h-4 w-4" /></span>
      <span className="grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-600">{index}</span>
      <span className="min-w-0">
        <b className="block text-[12px] text-slate-950">{title}</b>
        <span className="block text-[11px] font-medium leading-4 text-slate-500">{detail}</span>
      </span>
    </div>
  );
}

function NumberedNextStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="grid grid-cols-[28px_1fr] items-start gap-3">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-50 text-[12px] font-extrabold text-blue-600">{index}</span>
      <span className="min-w-0">
        <b className="block text-[12px] text-slate-950">{title}</b>
        <span className="block text-[11px] font-medium leading-4 text-slate-500">{detail}</span>
      </span>
    </div>
  );
}
