import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Braces,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Cloud,
  Code2,
  Database,
  FileJson,
  FileText,
  Grid2X2,
  Image,
  Info,
  KeyRound,
  Layers,
  Link,
  ListChecks,
  Loader2,
  Lock,
  Maximize2,
  Minus,
  Network,
  PlayCircle,
  Plus,
  Rocket,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Tag,
  Trash2,
  Upload,
  UploadCloud,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type StepId = 1 | 2 | 3 | 4;
type Tone = "orange" | "blue" | "green" | "purple" | "teal" | "red" | "slate";

const steps = ["Basics", "Source & Modality", "Processing Flow", "Review & Publish"] as const;

const toneClasses: Record<Tone, { icon: string; border: string; text: string; soft: string; line: string }> = {
  orange: { icon: "bg-orange-50 text-orange-600 border-orange-100", border: "border-orange-300", text: "text-orange-600", soft: "bg-orange-50", line: "bg-orange-500" },
  blue: { icon: "bg-blue-50 text-blue-600 border-blue-100", border: "border-blue-300", text: "text-blue-600", soft: "bg-blue-50", line: "bg-blue-500" },
  green: { icon: "bg-emerald-50 text-emerald-600 border-emerald-100", border: "border-emerald-300", text: "text-emerald-600", soft: "bg-emerald-50", line: "bg-emerald-500" },
  purple: { icon: "bg-purple-50 text-purple-600 border-purple-100", border: "border-purple-300", text: "text-purple-600", soft: "bg-purple-50", line: "bg-purple-500" },
  teal: { icon: "bg-cyan-50 text-cyan-700 border-cyan-100", border: "border-cyan-300", text: "text-cyan-700", soft: "bg-cyan-50", line: "bg-cyan-500" },
  red: { icon: "bg-red-50 text-red-600 border-red-100", border: "border-red-300", text: "text-red-600", soft: "bg-red-50", line: "bg-red-500" },
  slate: { icon: "bg-slate-50 text-slate-600 border-slate-100", border: "border-slate-200", text: "text-slate-600", soft: "bg-slate-50", line: "bg-slate-300" },
};

const sourceCards = [
  { label: "Blob Storage", icon: Cloud, tone: "purple" },
  { label: "SharePoint", icon: Boxes, tone: "teal" },
  { label: "SFTP", icon: Network, tone: "teal" },
  { label: "API", icon: Code2, tone: "purple" },
  { label: "Database", icon: Database, tone: "blue" },
  { label: "S3", icon: Boxes, tone: "orange" },
] as const;

const flowNodes = [
  { title: "Source", detail: "S3 · Claims Docs", meta: "PDF, Images", footer: "120 files", icon: FileText, tone: "green" },
  { title: "OCR", detail: "Text Recognition", meta: "Engine: AWS Textract", icon: Wand2, tone: "purple" },
  { title: "Layout Parser", detail: "Document Layout", meta: "Detect sections, blocks", icon: Grid2X2, tone: "blue" },
  { title: "Table Extraction", detail: "Extract Tables", meta: "Structure: Auto detect", icon: Table2, tone: "orange" },
  { title: "Key Value Extraction", detail: "Extract Key Fields", meta: "Rule Set: Claims_v1", icon: KeyRound, tone: "purple" },
] as const;

const branchNodes = [
  { title: "PII Detection", detail: "Detect & Mask PII", meta: "Policy: PII_Default", icon: ShieldCheck, tone: "teal" },
  { title: "Classification", detail: "Document Classification", meta: "Model: Claims_Classifier", icon: Network, tone: "orange" },
] as const;

export default function ProcessingExtractionStudio() {
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [publishDialog, setPublishDialog] = useState<"confirm" | "publishing" | "success" | null>(null);
  const navigate = useNavigate();
  const actionLabel = activeStep === 4 ? "Publish Pipeline" : "Continue";

  useEffect(() => {
    if (publishDialog !== "publishing") return undefined;
    const timer = window.setTimeout(() => setPublishDialog("success"), 2200);
    return () => window.clearTimeout(timer);
  }, [publishDialog]);

  const content = useMemo(() => {
    if (activeStep === 1) return <BasicsStep />;
    if (activeStep === 2) return <SourceStep />;
    if (activeStep === 3) return <ProcessingFlowStep />;
    return <ReviewStep onPublish={() => setPublishDialog("confirm")} />;
  }, [activeStep]);

  return (
    <div className="space-y-4">
      <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-500">
              <button onClick={() => navigate("/studios")} className="hover:text-orange-600">Studios</button>
              <span>/</span>
              <span>Processing & Extraction Studio</span>
              <span>/</span>
              <span className="text-slate-800">Create Pipeline</span>
            </div>
            <h1 className="text-[26px] font-extrabold leading-tight text-slate-950">Create Extraction Pipeline</h1>
            <p className="mt-1 text-[13px] text-slate-700">Configure a reusable pipeline to ingest, parse, enrich, and publish structured or unstructured data assets.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <HeaderButton
              icon={ArrowLeft}
              label={activeStep === 1 ? "Back to Studios" : "Back"}
              onClick={() => activeStep === 1 ? navigate("/studios") : setActiveStep((activeStep - 1) as StepId)}
            />
            <HeaderButton icon={Save} label="Save Draft" />
            <button onClick={() => activeStep === 4 ? setPublishDialog("confirm") : setActiveStep((activeStep + 1) as StepId)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-orange-500 px-5 text-[13px] font-extrabold text-white shadow-sm orange-gradient">
              {actionLabel} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <Stepper activeStep={activeStep} setActiveStep={setActiveStep} />
        {content}
      </section>
      {publishDialog === "confirm" ? <PublishConfirmDialog onClose={() => setPublishDialog(null)} onConfirm={() => setPublishDialog("publishing")} /> : null}
      {publishDialog === "publishing" ? <PublishingDialog onClose={() => setPublishDialog(null)} /> : null}
      {publishDialog === "success" ? <PublishSuccessDialog onStay={() => setPublishDialog(null)} onBackToStudios={() => navigate("/studios")} /> : null}
    </div>
  );
}

function Stepper({ activeStep, setActiveStep }: { activeStep: StepId; setActiveStep: (step: StepId) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 py-4 min-[1000px]:grid-cols-4">
      {steps.map((label, index) => {
        const number = (index + 1) as StepId;
        const done = number < activeStep;
        const active = number === activeStep;
        return (
          <button key={label} onClick={() => setActiveStep(number)} className={`flex min-w-0 items-center gap-3 border-b-2 pb-3 text-left ${active ? "border-orange-500 text-orange-600" : "border-slate-200 text-slate-700"}`}>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[13px] font-extrabold ${done ? "border-emerald-200 bg-emerald-50 text-emerald-600" : active ? "border-orange-500 bg-orange-500 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
              {done ? <Check className="h-4 w-4" /> : number}
            </span>
            <span className="truncate text-[13px] font-extrabold">{number}. {label}</span>
          </button>
        );
      })}
    </div>
  );
}

function BasicsStep() {
  return (
    <div className="studio-basics-grid mt-4">
      <StudioPanel title="Pipeline Basics" className="studio-area-basics">
        <div className="grid gap-3">
          <FieldRow label="Pipeline Name" value="Claims Document Extraction v2" />
          <FieldRow label="Description" value="Extract entities, tables, and metadata from claims-related PDF and DOCX documents." wide />
          <div className="grid gap-3 min-[900px]:grid-cols-2">
            <CompactSelect label="Business Domain" value="Claims Operations" />
            <CompactSelect label="Workspace" value="HealthCorp / Production" />
          </div>
          <div className="grid gap-3 min-[900px]:grid-cols-2">
            <CompactSelect label="Owner / Team" value="Data Platform Engineering" />
          </div>
        </div>
        <FormLabel label="Extraction Template" />
        <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
          <ChoiceCard selected icon={FileText} title="PDF Extraction Starter" detail="OCR, layout, and metadata extraction" tone="red" dense />
          <ChoiceCard icon={Code2} title="Multimodal Parsing Flow" detail="Text, tables, and image understanding" tone="blue" dense />
          <ChoiceCard icon={FileJson} title="Contract Intelligence" detail="Clause extraction and entity mapping" tone="purple" dense />
        </div>
        <FormLabel label="Processing Mode" />
        <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-4">
          <ModePill selected icon={Wand2} label="OCR" />
          <ModePill icon={Table2} label="Table Extraction" />
          <ModePill selected icon={Tag} label="Metadata Enrichment" />
          <ModePill icon={Grid2X2} label="Chunking" />
        </div>
      </StudioPanel>

      <StudioPanel title="Pipeline Preview" className="studio-area-preview">
        <PipelinePreview nodes={["Ingest", "OCR + Parse", "Chunk & Enrich", "Validate", "Publish"]} icons={[UploadCloud, Grid2X2, Tag, ShieldCheck, Upload]} compact />
      </StudioPanel>

      <StudioPanel title="Recommended Starters" action="View all templates" className="studio-area-starters">
        <StarterList />
      </StudioPanel>

      <StudioPanel title="Input & Output Configuration" className="studio-area-io">
        <div className="grid grid-cols-2 gap-3 min-[1100px]:grid-cols-5">
          {sourceCards.slice(0, 5).map((item, index) => <SourceChoice key={item.label} {...item} selected={index === 0} />)}
        </div>
        <FormatChips formats={["PDF", "DOCX", "Images", "JSON"]} />
        <div className="mt-4 grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
          <MiniSelect label="Destination Layer" value="Bronze / Raw Extracts" />
          <MiniSelect label="Publish To" value="Claims Knowledge Layer" />
          <MiniSelect label="Schedule" value="Run on upload" />
        </div>
      </StudioPanel>

      <StudioPanel title="Configuration Summary" className="studio-area-summary">
        <SummaryRows rows={[["Source", "Blob Storage"], ["Formats", "PDF, DOCX"], ["Mode", "OCR, Metadata Enrichment"], ["Destination", "Bronze / Claims Knowledge Layer"], ["Runtime Profile", "Standard"]]} />
      </StudioPanel>

      <StudioPanel title="Best Practices" className="studio-area-practices">
        <GuidanceList items={["Validate file metadata and naming conventions to ensure consistency.", "Enable chunk quality checks to improve downstream accuracy.", "Publish lineage and data quality metrics for governance."]} />
      </StudioPanel>
    </div>
  );
}

function SourceStep() {
  return (
    <div className="studio-source-grid mt-4">
      <StudioPanel title="Source Selection" className="studio-source-selection">
        <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-3 min-[1500px]:grid-cols-6">
          {sourceCards.map((item, index) => <SourceChoice key={item.label} {...item} selected={index === 0} />)}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 min-[1000px]:grid-cols-4">
          <MiniInput label="Connection Name" value="Claims Intake Blob" />
          <MiniInput label="Storage Account / Bucket" value="hc-claims-raw-prod" />
          <MiniInput label="Container / Path" value="/incoming/claims/docs/" />
          <MiniSelect label="Region / Endpoint" value="East US" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
          <SegmentGroup label="Authentication Mode" items={["Managed Identity", "Access Key", "Service Principal"]} active={0} icons={[Network, KeyRound, Lock]} />
          <SegmentGroup label="Ingestion Mode" items={["Batch Load", "Event Triggered", "Scheduled Sync"]} active={1} icons={[Upload, Zap, Calendar]} />
        </div>
      </StudioPanel>

      <StudioPanel title="Pipeline Preview" className="studio-source-preview">
        <PipelinePreview nodes={["Ingest", "Detect Modality", "Parse & Extract", "Enrich", "Validate", "Publish"]} icons={[UploadCloud, Wand2, FileText, Network, ShieldCheck, Upload]} compact />
      </StudioPanel>

      <StudioPanel title="Modality & Formats" className="studio-source-modality">
        <FormLabel label="Select Modalities" />
        <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-3 min-[1500px]:grid-cols-6">
          <ChoiceCard selected icon={FileText} title="Documents" detail="" tone="purple" compact dense />
          <ChoiceCard selected icon={Image} title="Images" detail="" tone="green" compact dense />
          <ChoiceCard icon={Table2} title="Tables / CSV" detail="" tone="teal" compact dense />
          <ChoiceCard selected icon={Braces} title="JSON / Semi-structured" detail="" tone="purple" compact dense />
          <DisabledChoice icon={Sparkles} title="Audio" />
          <DisabledChoice icon={PlayCircle} title="Video" />
        </div>
        <FormatChips formats={["PDF", "DOCX", "TXT", "PNG", "JPG", "JSON"]} />
        <FormLabel label="Optional sample files for validation" />
        <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 text-center text-[12px] font-semibold text-slate-500">
          <UploadCloud className="mx-auto mb-1 h-6 w-6 text-slate-500" />
          Drag and drop files here, or <span className="text-blue-600">browse</span>
          <span className="block text-[11px] font-medium">PDF, DOCX, PNG, JPG, JSON up to 100 MB each</span>
        </div>
      </StudioPanel>

      <StudioPanel title="Selected Configuration" className="studio-source-config">
        <SummaryRows rows={[["Source", "Blob Storage"], ["Connection", "Claims Intake Blob"], ["Ingestion", "Event Triggered"], ["Modalities", "Documents, Images, JSON"], ["Formats", "PDF, DOCX, TXT, PNG, JPG, JSON"], ["Destination", "Bronze / Claims Knowledge Layer"]]} />
      </StudioPanel>

      <StudioPanel title="Source Rules & Filters" className="studio-source-rules">
        <div className="grid grid-cols-1 gap-3 min-[1000px]:grid-cols-4">
          <MiniInput label="File naming pattern" value="claims_*" />
          <MiniSelect label="Max file size" value="100 MB" />
          <MiniSelect label="Language detection" value="Auto" />
          <MiniSelect label="Duplicate handling" value="Skip existing" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
          <Toggle label="Include subfolders" />
          <Toggle label="Auto-detect metadata" />
          <Toggle label="Validate on ingest" />
        </div>
      </StudioPanel>

      <StudioPanel title="Compatibility Guidance" className="studio-source-guidance">
        <GuidanceList items={["Enable metadata extraction for better downstream search and governance.", "Use sample files to validate OCR and parsing quality before publish.", "Restrict file patterns to reduce noisy or irrelevant ingestions."]} />
      </StudioPanel>

      <StudioPanel title="Source Health" className="studio-source-health">
        <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
          <HealthMetric icon={CheckCircle2} label="Connection Status" value="Healthy" tone="green" />
          <HealthMetric icon={Calendar} label="Last Sync Check" value="5 min ago" tone="slate" />
          <HealthMetric icon={SlidersHorizontal} label="Expected Daily Volume" value="12.4K files" tone="blue" />
        </div>
      </StudioPanel>
    </div>
  );
}

function ProcessingFlowStep() {
  const [workView, setWorkView] = useState<"canvas" | "code">("canvas");
  const [validateOpen, setValidateOpen] = useState(false);

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 min-[1200px]:grid-cols-[280px_minmax(0,1fr)] min-[1500px]:grid-cols-[280px_minmax(0,1fr)_300px]">
      <StudioPanel title="Add Processing Step">
        <label className="relative mb-3 block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-[12px] outline-none focus:border-orange-300" placeholder="Search steps..." />
        </label>
        <StepLibrary />
        <button className="mt-4 flex w-full items-center justify-center gap-2 text-[12px] font-extrabold text-orange-600">View all steps in library <ArrowRight className="h-4 w-4" /></button>
      </StudioPanel>

      <div className="relative min-h-[610px] overflow-x-auto overflow-y-hidden rounded-[14px] border border-slate-200 bg-white shadow-card">
        {workView === "canvas" ? <div className="studio-canvas-bg absolute inset-0" /> : null}
        <div className="relative z-10 flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <IconButton icon={Boxes} />
            <IconButton icon={Minus} label="-" />
            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-extrabold">100%</span>
            <IconButton icon={Plus} label="+" />
            <IconButton icon={Maximize2} />
          </div>
          <div className="flex items-center gap-2">
            <HeaderButton icon={ShieldCheck} label="Validate Flow" onClick={() => setValidateOpen(true)} />
            <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-[12px] font-bold">
              <button onClick={() => setWorkView("canvas")} className={`rounded-md px-4 py-2 ${workView === "canvas" ? "bg-orange-50 text-orange-600" : "text-slate-700"}`}>Canvas</button>
              <button onClick={() => setWorkView("code")} className={`rounded-md px-4 py-2 ${workView === "code" ? "bg-orange-50 text-orange-600" : "text-slate-700"}`}>Code</button>
            </div>
          </div>
        </div>
        {workView === "canvas" ? <FlowCanvas /> : <FlowCodeView />}
      </div>

      <StudioPanel title="Key Value Extraction" className="min-[1200px]:col-span-2 min-[1500px]:col-span-1">
        <div className="space-y-3">
          <MiniInput label="Step Name" value="Key Value Extraction" />
          <label className="block">
            <FormLabel label="Description" />
            <textarea className="h-[72px] w-full resize-none rounded-lg border border-slate-200 p-3 text-[12px] font-semibold outline-none focus:border-orange-300" value="Extract key fields from document using configured rules" readOnly />
          </label>
          <MiniSelect label="Rule Set" value="Claims_v1" />
          <MiniInput label="Confidence Threshold" value="0.85" />
          <MiniSelect label="Extraction Mode" value="Structured" />
          <CheckLine label="Enable Fuzzy Matching" checked />
          <CheckLine label="Capture Unmapped Fields" />
          <MiniSelect label="Output Format" value="JSON" />
          <MiniSelect label="Output Schema" value="Claims_Extraction_Schema_v1" />
          <button className="flex h-10 w-full items-center justify-between border-t border-slate-100 pt-3 text-[12px] font-bold text-slate-700">Advanced Options <ChevronRight className="h-4 w-4" /></button>
          <button className="flex h-10 items-center gap-2 text-[12px] font-extrabold text-red-600"><Trash2 className="h-4 w-4" /> Delete Step</button>
        </div>
      </StudioPanel>
      {validateOpen ? <ValidateFlowDialog onClose={() => setValidateOpen(false)} /> : null}
    </div>
  );
}

function ReviewStep({ onPublish }: { onPublish: () => void }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 min-[1300px]:grid-cols-[minmax(0,1.15fr)_minmax(0,.95fr)_360px]">
      <div className="space-y-3">
        <StudioPanel title="Pipeline Overview">
          <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2">
            {[
              ["Pipeline Name", "Claims Document Extraction v2"],
              ["Template", "PDF Extraction Starter"],
              ["Business Domain", "Claims Operations"],
              ["Runtime Profile", "Standard"],
              ["Owner / Team", "Data Platform Engineering"],
              ["Version", "v1.0.0"],
              ["Workspace", "HealthCorp / Production"],
              ["Last Edited", "10 min ago"],
            ].map(([label, value]) => <MiniInput key={label} label={label} value={value} />)}
          </div>
        </StudioPanel>
        <StudioPanel title="Processing Flow Review">
          <div className="overflow-x-auto pb-2"><FlowReview /></div>
        </StudioPanel>
        <StudioPanel title="Notes & Release Comments">
          <textarea className="h-[72px] w-full resize-none rounded-lg border border-slate-200 p-3 text-[12px] font-medium text-slate-700" value="Initial production-ready claims extraction pipeline with OCR, layout parsing, table extraction, PII masking, and classification." readOnly />
          <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-500"><span>102 / 1000 characters</span><span>Last updated: 10 min ago</span></div>
        </StudioPanel>
      </div>
      <div className="space-y-3">
        <StudioPanel title="Source & Modality Summary" badge="Healthy">
          <SummaryRows rows={[["Source", "Blob Storage"], ["Connection", "Claims Intake Blob"], ["Ingestion", "Event Triggered"], ["Modalities", "Documents, Images, JSON"], ["Formats", "PDF, DOCX, TXT, PNG, JPG, JSON"], ["Destination", "Bronze / Claims Knowledge Layer"]]} />
        </StudioPanel>
        <StudioPanel title="Validation & Readiness">
          <Checklist items={["Connection validated", "Sample file test passed", "Schema mapping complete", "Output destination available", "Governance policy attached", "No blocking configuration issues", "Approval not required for this workspace"]} />
        </StudioPanel>
        <StudioPanel title="Publish Configuration">
          <SummaryRows rows={[["Publish as", "Reusable Pipeline"], ["Visibility", "Team"], ["Register in Catalog", "Enabled"], ["Enable lineage tracking", "Enabled"], ["Alert on failures", "Enabled"], ["Notify team", "Data Platform Engineering"]]} toggles />
        </StudioPanel>
      </div>
      <StudioPanel title="Ready to Publish">
        <div className="py-5 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600"><Check className="h-9 w-9" /></div>
          <p className="mt-4 text-[15px] font-extrabold text-slate-950">All required checks passed</p>
          <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-5 py-2 text-[12px] font-extrabold text-emerald-700">Ready</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PublishMetric label="Total Steps" value="7" icon={FileJson} tone="purple" />
          <PublishMetric label="Supported Formats" value="6" icon={Grid2X2} tone="orange" />
          <PublishMetric label="Estimated Runtime" value="4.2 min" icon={Calendar} tone="blue" />
          <PublishMetric label="Validation Score" value="96.8%" icon={ShieldCheck} tone="green" />
        </div>
        <h3 className="mt-5 text-[14px] font-extrabold text-slate-950">Artifacts on publish</h3>
        <Checklist items={["Pipeline Spec", "Output Schema", "Metadata Rules", "Lineage Record"]} compact />
        <button onClick={onPublish} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-extrabold text-white orange-gradient"><Rocket className="h-4 w-4" /> Publish Now</button>
        <button className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-[13px] font-extrabold text-slate-700"><PlayCircle className="h-4 w-4" /> Run Final Test</button>
      </StudioPanel>
    </div>
  );
}

function StudioPanel({ title, children, action, badge, className = "" }: { title: string; children: React.ReactNode; action?: string; badge?: string; className?: string }) {
  return (
    <section className={`rounded-[14px] border border-slate-200 bg-white p-4 shadow-card ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950">{title}{title.includes("Guidance") || title.includes("Practices") ? <Info className="h-4 w-4 text-slate-400" /> : null}</h2>
        {action ? <button className="flex items-center gap-2 text-[12px] font-bold text-slate-700 hover:text-orange-600">{action}<ArrowRight className="h-4 w-4" /></button> : null}
        {badge ? <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[12px] font-extrabold text-emerald-700"><CheckCircle2 className="mr-1 inline h-4 w-4" />{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}

function HeaderButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return <button onClick={onClick} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-extrabold text-slate-800 shadow-sm hover:border-orange-200"><Icon className="h-4 w-4" /> {label}</button>;
}

function FieldRow({ label, value, wide, select, compact }: { label: string; value: string; wide?: boolean; select?: boolean; compact?: boolean }) {
  return (
    <label className={`grid grid-cols-1 items-start gap-2 ${compact ? "min-[800px]:grid-cols-[120px_1fr]" : "min-[800px]:grid-cols-[150px_1fr]"} ${wide ? "min-[800px]:items-start" : "min-[800px]:items-center"}`}>
      <FormLabel label={label} bare />
      <div className="relative">
        {wide ? <textarea value={value} readOnly className="h-[54px] w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-semibold outline-none" /> : <input value={value} readOnly className="h-9 w-full rounded-lg border border-slate-200 px-3 text-[12px] font-semibold outline-none" />}
        {select ? <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /> : null}
      </div>
    </label>
  );
}

function FormLabel({ label, bare = false }: { label: string; bare?: boolean }) {
  return <span className={`${bare ? "whitespace-nowrap" : "mb-2 mt-4 flex"} items-center gap-1 text-[12px] font-extrabold text-slate-700`}>{label}<Info className="inline h-3.5 w-3.5 text-slate-400" /></span>;
}

function ChoiceCard({ selected, icon: Icon, title, detail, tone, compact, dense }: { selected?: boolean; icon: LucideIcon; title: string; detail: string; tone: Tone; compact?: boolean; dense?: boolean }) {
  return (
    <button className={`relative grid ${dense ? "min-h-[62px] grid-cols-[34px_1fr] gap-2 px-2.5 py-2" : "min-h-[66px] grid-cols-[38px_1fr] gap-3 p-3"} items-center rounded-lg border text-left ${selected ? "border-orange-400 bg-orange-50/30" : "border-slate-200 bg-white"}`}>
      <span className={`grid ${dense ? "h-8 w-8" : "h-9 w-9"} place-items-center rounded-lg border ${toneClasses[tone].icon}`}><Icon className={dense ? "h-[18px] w-[18px]" : "h-5 w-5"} /></span>
      <span className="min-w-0"><b className={`block ${dense ? "text-[11.5px] leading-3" : "truncate text-[12px]"} text-slate-950`}>{title}</b>{compact ? null : <span className={`${dense ? "mt-0.5 line-clamp-2 text-[10.5px] leading-3" : "mt-1 text-[11px] leading-4"} block text-slate-500`}>{detail}</span>}</span>
      {selected ? <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-white"><Check className="h-3.5 w-3.5" /></span> : null}
    </button>
  );
}

function ModePill({ selected, icon: Icon, label }: { selected?: boolean; icon: LucideIcon; label: string }) {
  return <button className={`relative flex h-12 items-center gap-2 rounded-lg border px-3 text-left text-[11.5px] font-extrabold ${selected ? "border-orange-400 bg-orange-50/40 text-slate-950" : "border-slate-200 bg-white text-slate-800"}`}><Icon className="h-5 w-5 shrink-0 text-orange-500" /> <span className="min-w-0 leading-3">{label}</span>{selected ? <Check className="absolute right-2 top-2 h-4 w-4 rounded-full bg-orange-500 p-0.5 text-white" /> : <Circle className="absolute right-2 top-2 h-4 w-4 text-slate-400" />}</button>;
}

function SourceChoice({ selected, label, icon: Icon, tone }: { selected?: boolean; label: string; icon: LucideIcon; tone: Tone }) {
  return <ChoiceCard selected={selected} icon={Icon} title={label} detail="" tone={tone} compact dense />;
}

function PipelinePreview({ nodes, icons, compact = false }: { nodes: string[]; icons: LucideIcon[]; compact?: boolean }) {
  return (
    <div className="flex min-h-[88px] items-center overflow-x-auto pb-2">
      {nodes.map((node, index) => {
        const Icon = icons[index];
        return (
          <div key={node} className="flex items-center">
            <div className={`${compact ? "h-[86px] w-[84px]" : "h-[86px] w-[104px]"} grid shrink-0 place-items-center rounded-lg border border-slate-200 bg-white p-2 text-center`}>
              <Icon className="mb-2 h-6 w-6 text-orange-500" />
              <b className="text-[11px] leading-3 text-slate-950">{node}</b>
            </div>
            {index < nodes.length - 1 ? <div className="flex w-10 items-center"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /><span className="h-px flex-1 bg-orange-300" /><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /></div> : null}
          </div>
        );
      })}
    </div>
  );
}

function StarterList() {
  const starters = [
    ["PDF Extraction Starter", "OCR, layout detection, and metadata extraction", FileText, "red"],
    ["Multimodal Parsing Flow", "Text, tables, and image understanding", Code2, "blue"],
    ["Contract Intelligence", "Clause extraction and entity mapping", FileJson, "purple"],
  ] as const;
  return <div className="space-y-2">{starters.map(([title, detail, Icon, tone]) => <button key={title} className="grid w-full grid-cols-[38px_1fr_20px] items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-left hover:border-orange-200"><span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneClasses[tone as Tone].icon}`}><Icon className="h-5 w-5" /></span><span><b className="block text-[12px] text-slate-950">{title}</b><span className="text-[11px] text-slate-500">{detail}</span></span><ArrowRight className="h-4 w-4 text-slate-400" /></button>)}</div>;
}

function FormatChips({ formats }: { formats: string[] }) {
  return (
    <div className="mt-4">
      <FormLabel label="Supported Formats" />
      <div className="flex flex-wrap gap-2">
        {formats.map((format) => <span key={format} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-extrabold text-slate-700"><FileText className="h-4 w-4 text-blue-600" />{format}<span className="text-slate-400">×</span></span>)}
        <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 text-[12px] font-semibold text-slate-600"><Plus className="h-4 w-4" /> Add format</button>
      </div>
    </div>
  );
}

function MiniSelect({ label, value }: { label: string; value: string }) {
  return <label className="block"><FormLabel label={label} /><span className="relative block"><input value={value} readOnly className="h-9 w-full rounded-lg border border-slate-200 px-3 pr-9 text-[12px] font-semibold outline-none" /><ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /></span></label>;
}

function CompactSelect({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid min-w-0 grid-cols-[112px_minmax(0,1fr)] items-center gap-2">
      <FormLabel label={label} bare />
      <span className="relative min-w-0">
        <input value={value} readOnly className="h-9 w-full rounded-lg border border-slate-200 px-3 pr-8 text-[12px] font-semibold outline-none" />
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

function MiniInput({ label, value }: { label: string; value: string }) {
  return <label className="block"><FormLabel label={label} /><input value={value} readOnly className="h-9 w-full rounded-lg border border-slate-200 px-3 text-[12px] font-semibold outline-none" /></label>;
}

function SummaryRows({ rows, toggles = false }: { rows: readonly (readonly [string, string])[]; toggles?: boolean }) {
  return <div className="divide-y divide-slate-100">{rows.map(([label, value], index) => <div key={label} className="grid grid-cols-[110px_1fr] items-center gap-3 py-2 text-[12px]"><span className="flex items-center gap-2 font-extrabold text-slate-700">{summaryIcon(index)}{label}:</span><span className="flex items-center gap-2 font-medium text-slate-600">{toggles && value === "Enabled" ? <span className="h-4 w-8 rounded-full bg-emerald-500 p-0.5"><span className="block h-3 w-3 translate-x-4 rounded-full bg-white" /></span> : null}{value}</span></div>)}</div>;
}

function summaryIcon(index: number) {
  const icons = [Cloud, Link, Zap, Layers, FileText, Database];
  const Icon = icons[index % icons.length];
  return <Icon className="h-4 w-4 text-blue-600" />;
}

function GuidanceList({ items }: { items: string[] }) {
  return <div className="space-y-2">{items.map((item, index) => <div key={item} className="grid grid-cols-[38px_1fr] items-center gap-3 rounded-lg bg-slate-50/70 p-2"><span className={`grid h-9 w-9 place-items-center rounded-lg border ${toneClasses[index === 0 ? "purple" : index === 1 ? "green" : "orange"].icon}`}><ListChecks className="h-5 w-5" /></span><span className="text-[12px] leading-4 text-slate-600">{item}</span></div>)}</div>;
}

function SegmentGroup({ label, items, active, icons }: { label: string; items: string[]; active: number; icons: LucideIcon[] }) {
  return (
    <div>
      <FormLabel label={label} />
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, index) => {
          const Icon = icons[index];
          return <button key={item} className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-2 text-[11px] font-extrabold ${index === active ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700"}`}><Icon className="h-4 w-4" />{item}</button>;
        })}
      </div>
    </div>
  );
}

function DisabledChoice({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return <button className="relative grid min-h-[62px] grid-cols-[34px_1fr] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-slate-400"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white"><Icon className="h-[18px] w-[18px]" /></span><b className="text-[11.5px] leading-3">{title}</b><span className="absolute right-2 top-2 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold">Soon</span></button>;
}

function Toggle({ label }: { label: string }) {
  return <div className="flex items-center gap-3 text-[12px] font-semibold text-slate-700"><span className="h-5 w-9 rounded-full bg-orange-500 p-0.5"><span className="block h-4 w-4 translate-x-4 rounded-full bg-white" /></span>{label}<Info className="h-3.5 w-3.5 text-slate-400" /></div>;
}

function HealthMetric({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  return <div className="grid min-h-[72px] grid-cols-[40px_1fr] items-center gap-3 rounded-lg border border-slate-200 p-3"><Icon className={`h-6 w-6 ${toneClasses[tone].text}`} /><span><span className="block text-[12px] font-semibold text-slate-500">{label}</span><b className="text-[18px] text-slate-950">{value}</b></span></div>;
}

function StepLibrary() {
  const groups = [
    ["EXTRACTION", [["OCR (Text Recognition)", Wand2], ["Document Layout Parser", FileText], ["Table Extraction", Table2], ["Key Value Extraction", KeyRound], ["Form & Field Extraction", FileJson], ["Barcode / QR Extraction", Wand2]]],
    ["TRANSFORMATION", [["Text Normalization", FileText], ["Data Standardization", Grid2X2], ["PII Detection & Masking", ShieldCheck], ["Language Detection", Sparkles], ["Chunking / Splitting", Layers]]],
    ["ENRICHMENT", [["NER (Entity Recognition)", Tag], ["Classification", Network], ["Mapping & Lookup", Link]]],
  ] as const;
  return <div className="space-y-4">{groups.map(([group, items]) => <div key={group}><h3 className="mb-2 text-[11px] font-extrabold tracking-wide text-slate-500">{group}</h3><div className="space-y-1">{items.map(([label, Icon]) => <button key={label} className="grid h-8 w-full grid-cols-[24px_1fr_16px] items-center gap-2 rounded-md px-1 text-left text-[12px] font-semibold text-slate-700 hover:bg-orange-50"><span className="grid h-6 w-6 place-items-center rounded-md bg-blue-50 text-blue-600"><Icon className="h-4 w-4" /></span>{label}<Boxes className="h-3.5 w-3.5 text-slate-400" /></button>)}</div></div>)}</div>;
}

function IconButton({ icon: Icon, label }: { icon: LucideIcon; label?: string }) {
  return <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-[13px] font-extrabold text-slate-700">{label ?? <Icon className="h-4 w-4" />}</button>;
}

function FlowCanvas() {
  return (
    <div className="relative z-10 mt-16 min-h-[470px] w-[850px] px-5">
      <div className="flex items-center justify-start">
        {flowNodes.map((node, index) => <CanvasNode key={node.title} {...node} connector={index < flowNodes.length - 1} />)}
        <button className="ml-1 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white"><Plus className="h-4 w-4" /></button>
      </div>
      <div className="ml-[372px] h-10 w-px bg-slate-800" />
      <div className="ml-[284px] flex items-center">
        {branchNodes.map((node, index) => <CanvasNode key={node.title} {...node} connector={index < branchNodes.length - 1} />)}
        <button className="ml-1 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white"><Plus className="h-4 w-4" /></button>
      </div>
      <div className="absolute bottom-3 left-8 h-[92px] w-[180px] rounded-lg border border-slate-300 bg-white/90 p-3">
        <div className="h-full rounded border border-slate-400 p-2">
          <div className="grid grid-cols-5 gap-2">
            {["green", "purple", "blue", "orange", "purple", "teal", "orange"].map((tone, index) => <span key={`${tone}-${index}`} className={`h-5 rounded border ${toneClasses[tone as Tone].border} ${toneClasses[tone as Tone].soft}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasNode({ title, detail, meta, footer, icon: Icon, tone, connector }: { title: string; detail: string; meta: string; footer?: string; icon: LucideIcon; tone: Tone; connector?: boolean }) {
  return (
    <div className="flex items-center">
      <div className={`h-[100px] w-[130px] rounded-lg border-2 bg-white p-2.5 shadow-sm ${toneClasses[tone].border}`}>
        <span className={`grid h-6 w-6 place-items-center rounded-md ${toneClasses[tone].soft} ${toneClasses[tone].text}`}><Icon className="h-3.5 w-3.5" /></span>
        <b className="mt-2 block text-[11px] leading-3 text-slate-950">{title}</b>
        <span className="mt-1 block text-[11px] leading-3 text-slate-700">{detail}</span>
        <span className="block text-[10px] leading-3 text-slate-600">{meta}</span>
        {footer ? <span className="mt-1 block text-[10px] font-bold text-emerald-600">{footer}</span> : null}
      </div>
      {connector ? <div className="flex w-8 items-center"><span className={`h-2 w-2 rounded-full ${toneClasses[tone].line}`} /><span className="h-px flex-1 bg-slate-400" /></div> : null}
    </div>
  );
}

function FlowCodeView() {
  const code = `pipeline:
  name: claims_document_extraction_v2
  runtime_profile: standard
  source:
    type: s3
    path: s3://claims-docs/incoming
    formats: [pdf, docx, png, jpg, json]
  steps:
    - id: source
      type: document_source
      emits: raw_documents
    - id: ocr
      type: text_recognition
      engine: aws_textract
      input: raw_documents
    - id: layout_parser
      type: document_layout_parser
      detects: [sections, blocks, tables]
    - id: table_extraction
      type: table_extraction
      structure: auto_detect
    - id: key_value_extraction
      type: key_value_extraction
      rule_set: Claims_v1
      confidence_threshold: 0.85
    - id: pii_detection
      type: pii_masking
      policy: PII_Default
    - id: classification
      type: document_classification
      model: Claims_Classifier
  output:
    format: json
    schema: Claims_Extraction_Schema_v1
    destination: bronze.claims_knowledge_layer`;

  return (
    <div className="relative z-10 grid min-h-[540px] gap-3 p-4 min-[900px]:grid-cols-[minmax(0,1fr)_250px]">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <span className="flex items-center gap-2 text-[12px] font-extrabold text-slate-200"><Code2 className="h-4 w-4 text-orange-400" /> pipeline.yml</span>
          <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-extrabold text-emerald-300">Valid YAML</span>
        </div>
        <pre className="h-[480px] overflow-auto p-4 text-[12px] leading-5 text-slate-100"><code>{code}</code></pre>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <h3 className="text-[13px] font-extrabold text-slate-950">Code Summary</h3>
          <SummaryRows rows={[["Steps", "7"], ["Branches", "1"], ["Output", "JSON"], ["Schema", "Claims_Extraction_Schema_v1"]]} />
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3">
          <h3 className="text-[13px] font-extrabold text-blue-950">Generated From Canvas</h3>
          <p className="mt-2 text-[12px] font-medium leading-4 text-blue-800">Edits in this code view are represented as the same governed pipeline specification used by publish and validation.</p>
        </div>
      </div>
    </div>
  );
}

function CheckLine({ label, checked = false }: { label: string; checked?: boolean }) {
  return <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-700"><span className={`grid h-4 w-4 place-items-center rounded border ${checked ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 bg-white"}`}>{checked ? <Check className="h-3 w-3" /> : null}</span>{label}</label>;
}

function FlowReview() {
  return <div className="flex min-w-[760px] items-center py-3">{flowNodes.map((node, index) => <CanvasNode key={node.title} {...node} connector={index < flowNodes.length - 1} />)}<div className="-ml-[410px] mt-[170px] flex">{branchNodes.map((node, index) => <CanvasNode key={node.title} {...node} connector={index < branchNodes.length - 1} />)}</div></div>;
}

function Checklist({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return <div className={`${compact ? "mt-2" : ""} space-y-2`}>{items.map((item, index) => <div key={item} className="flex items-center justify-between gap-3 text-[12px] font-semibold text-slate-700"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{item}</span>{compact || index < items.length - 1 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Info className="h-4 w-4 text-slate-400" />}</div>)}</div>;
}

function PublishMetric({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  return <div className="min-h-[82px] rounded-lg border border-slate-200 p-3"><Icon className={`h-5 w-5 ${toneClasses[tone].text}`} /><span className="mt-2 block text-center text-[11px] font-semibold text-slate-500">{label}</span><b className="block text-center text-[24px] text-slate-950">{value}</b></div>;
}

function PublishConfirmDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell>
      <div className="w-[min(920px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-7 pt-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[22px] font-extrabold leading-tight text-slate-950">Publish Claims Document Extraction v2?</h2>
              <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[12px] font-extrabold text-emerald-700">Ready</span>
            </div>
            <p className="mt-2 text-[13px] font-medium text-slate-600">Review the final publish settings before promoting this reusable pipeline to production.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close publish dialog"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4 px-7 py-5 min-[860px]:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-[14px] font-extrabold text-slate-950">Publish Summary</h3>
            <SummaryRows rows={[["Pipeline Name", "Claims Document Extraction v2"], ["Version", "v1.0.0"], ["Publish Type", "Reusable Pipeline"], ["Workspace", "HealthCorp / Production"], ["Destination", "Bronze / Claims Knowledge Layer"], ["Visibility", "Team"], ["Runtime Profile", "Standard"]]} />
            <h3 className="mt-4 text-[14px] font-extrabold text-slate-950">Enabled Controls</h3>
            <ControlChecklist items={["Catalog registration enabled", "Lineage tracking enabled", "Governance policy attached", "Failure alerts enabled", "Output schema validated"]} />
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-[14px] font-extrabold text-slate-950">Validation Snapshot</h3>
              <StatusRows rows={[["Connection validated", "Passed"], ["Sample file test", "Passed"], ["Schema mapping", "Passed"], ["Output destination", "Passed"], ["Approval requirement", "Not required"]]} />
            </div>
            <div className="grid grid-cols-[36px_1fr] gap-3 rounded-lg border border-orange-200 bg-orange-50/40 p-4">
              <Info className="mt-1 h-6 w-6 text-orange-600" />
              <p className="text-[13px] font-semibold leading-5 text-orange-900">Publishing will register the pipeline in the catalog, save the versioned specification, and make it available for production use.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-7 py-4">
          <button onClick={onClose} className="h-11 rounded-lg border border-slate-200 bg-white px-7 text-[13px] font-extrabold text-slate-800 shadow-sm">Cancel</button>
          <button className="h-11 rounded-lg border border-slate-200 bg-white px-7 text-[13px] font-extrabold text-slate-800 shadow-sm">Run Final Test</button>
          <button onClick={onConfirm} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-7 text-[13px] font-extrabold text-white orange-gradient">Confirm & Publish <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </ModalShell>
  );
}

function ValidateFlowDialog({ onClose }: { onClose: () => void }) {
  const checks = [
    ["Graph connectivity", "Passed", "All processing nodes have valid upstream and downstream links."],
    ["Required configuration", "Passed", "OCR engine, rule set, output schema, and runtime profile are configured."],
    ["Branch compatibility", "Passed", "PII Detection and Classification can run after Layout Parser."],
    ["Schema mapping", "Passed", "Claims_Extraction_Schema_v1 covers all mapped extracted fields."],
    ["Quality safeguards", "Warning", "Add a chunk quality threshold before publish for better downstream scoring."],
  ] as const;

  return (
    <ModalShell>
      <div className="w-[min(820px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-7 pt-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[22px] font-extrabold leading-tight text-slate-950">Validate Processing Flow</h2>
              <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[12px] font-extrabold text-emerald-700">96.8% score</span>
            </div>
            <p className="mt-2 text-[13px] font-medium text-slate-600">Checks connectivity, required settings, schema readiness, and production safeguards before publish.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close validation dialog"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4 px-7 py-5 min-[820px]:grid-cols-[1fr_260px]">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-[14px] font-extrabold text-slate-950">Validation Results</h3>
            <div className="mt-3 space-y-2">
              {checks.map(([title, status, detail]) => (
                <div key={title} className="grid grid-cols-[28px_1fr_auto] items-start gap-3 rounded-lg bg-slate-50/80 p-3">
                  <span className={`grid h-7 w-7 place-items-center rounded-full ${status === "Passed" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                    {status === "Passed" ? <Check className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                  </span>
                  <span>
                    <b className="block text-[12px] text-slate-950">{title}</b>
                    <span className="mt-1 block text-[11px] leading-4 text-slate-600">{detail}</span>
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${status === "Passed" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 p-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600"><ShieldCheck className="h-8 w-8" /></div>
              <b className="mt-3 block text-[24px] leading-none text-slate-950">Ready</b>
              <span className="mt-1 block text-[12px] font-semibold text-slate-500">No blocking issues</span>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-4">
              <h3 className="text-[13px] font-extrabold text-orange-950">Recommended Fix</h3>
              <p className="mt-2 text-[12px] font-medium leading-4 text-orange-900">Enable chunk quality checks before final publish to improve downstream retrieval and governance metrics.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-7 py-4">
          <button onClick={onClose} className="h-11 rounded-lg border border-slate-200 bg-white px-7 text-[13px] font-extrabold text-slate-800 shadow-sm">Close</button>
          <button onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-7 text-[13px] font-extrabold text-white orange-gradient">Apply Recommendation <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </ModalShell>
  );
}

function PublishingDialog({ onClose }: { onClose: () => void }) {
  const progress = [
    ["Saving versioned pipeline specification", "Completed"],
    ["Registering pipeline in catalog", "Completed"],
    ["Creating output schema", "Completed"],
    ["Attaching governance controls", "Completed"],
    ["Validating runtime configuration", "Completed"],
    ["Deploying pipeline runtime", "In progress"],
    ["Publishing artifacts", "Pending"],
  ] as const;

  return (
    <ModalShell>
      <div className="w-[min(900px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-7 pt-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[22px] font-extrabold leading-tight text-slate-950">Publishing Claims Document Extraction v2</h2>
              <span className="rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-extrabold text-blue-700">In Progress</span>
            </div>
            <p className="mt-2 text-[13px] font-medium text-slate-600">Registering pipeline, creating runtime configuration, and enabling production controls.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close publishing dialog"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-7 pt-5">
          <div className="flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[72%] rounded-full orange-gradient" /></div>
            <span className="text-[13px] font-extrabold text-slate-600">72% complete</span>
          </div>
        </div>

        <div className="grid gap-4 px-7 py-5 min-[860px]:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-[14px] font-extrabold text-slate-950">Publishing Progress</h3>
            <div className="mt-4 space-y-4">
              {progress.map(([label, status]) => <ProgressStep key={label} label={label} status={status} />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <SummaryRows rows={[["Pipeline", "Claims Document Extraction v2"], ["Version", "v1.0.0"], ["Workspace", "HealthCorp / Production"], ["Destination", "Bronze / Claims Knowledge Layer"]]} />
              <div className="mt-4 border-t border-slate-100 pt-4 text-[13px] font-semibold text-slate-700">
                <p className="flex justify-between gap-3"><span>Estimated time remaining:</span><b>~18 sec</b></p>
                <p className="mt-3 flex justify-between gap-3"><span>Current activity:</span><b>Deploying pipeline runtime</b></p>
              </div>
            </div>
            <div className="grid grid-cols-[36px_1fr] gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
              <Info className="mt-1 h-6 w-6 text-blue-600" />
              <p className="text-[13px] font-semibold leading-5 text-blue-900">Do not close this window while publishing. The pipeline will be registered in the catalog and made available for production use.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 px-7 pb-6">
          <button className="h-11 rounded-lg border border-slate-200 bg-white px-8 text-[13px] font-extrabold text-slate-800 shadow-sm">View Details</button>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-200 px-8 text-[13px] font-extrabold text-white"><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</button>
        </div>
      </div>
    </ModalShell>
  );
}

function PublishSuccessDialog({ onStay, onBackToStudios }: { onStay: () => void; onBackToStudios: () => void }) {
  return (
    <ModalShell>
      <div className="w-[min(620px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="px-8 pt-8 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600">
            <Check className="h-11 w-11" />
          </div>
          <h2 className="mt-5 text-[24px] font-extrabold leading-tight text-slate-950">Pipeline Published Successfully</h2>
          <p className="mx-auto mt-2 max-w-[470px] text-[13px] font-medium leading-5 text-slate-600">
            Claims Document Extraction v2 is now registered in the catalog, versioned, and available for production use.
          </p>
        </div>

        <div className="mx-8 mt-6 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <div className="grid gap-3 text-[12px] font-semibold text-slate-700 min-[560px]:grid-cols-2">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Version v1.0.0 published</span>
            <span className="flex items-center gap-2"><Database className="h-4 w-4 text-blue-600" /> Catalog registration complete</span>
            <span className="flex items-center gap-2"><Network className="h-4 w-4 text-blue-600" /> Lineage tracking enabled</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Production controls active</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 px-8 py-5">
          <button onClick={onStay} className="h-11 rounded-lg border border-slate-200 bg-white px-7 text-[13px] font-extrabold text-slate-800 shadow-sm">Stay Here</button>
          <button onClick={onBackToStudios} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-7 text-[13px] font-extrabold text-white orange-gradient">Back to Studios <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-8 backdrop-blur-[2px]">
      {children}
    </div>
  );
}

function ControlChecklist({ items }: { items: string[] }) {
  return (
    <div className="mt-2 divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item} className="flex items-center justify-between gap-3 py-2 text-[12px] font-semibold text-slate-700">
          <span className="flex items-center gap-2"><Boxes className="h-4 w-4 text-slate-500" />{item}</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
      ))}
    </div>
  );
}

function StatusRows({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return (
    <div className="mt-3 divide-y divide-slate-100">
      {rows.map(([label, status]) => (
        <div key={label} className="flex items-center justify-between gap-4 py-3 text-[12px] font-semibold text-slate-700">
          <span>{label}</span>
          <span className={`rounded-full px-4 py-1.5 text-[11px] font-extrabold ${status === "Passed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{status}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressStep({ label, status }: { label: string; status: "Completed" | "In progress" | "Pending" }) {
  const completed = status === "Completed";
  const running = status === "In progress";
  return (
    <div className="grid grid-cols-[24px_1fr_auto] items-center gap-3 text-[12px] font-semibold">
      <span className={`grid h-6 w-6 place-items-center rounded-full ${completed ? "bg-emerald-500 text-white" : running ? "bg-white text-orange-600" : "border border-slate-300 text-slate-300"}`}>
        {completed ? <Check className="h-4 w-4" /> : running ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
      </span>
      <span className="text-slate-700">{label}</span>
      <span className={completed ? "text-emerald-600" : running ? "text-orange-600" : "text-slate-400"}>{status}</span>
    </div>
  );
}
