import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Braces,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Columns3,
  Database,
  FileText,
  Filter,
  Folder,
  Grid2X2,
  Globe2,
  Info,
  Link2,
  ListChecks,
  Loader2,
  Rocket,
  Save,
  Search,
  ShieldCheck,
  Table2,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type StepId = 1 | 2 | 3 | 4 | 5;
type Tone = "green" | "purple" | "orange" | "blue" | "slate";
type PublishState = "confirm" | "publishing" | "success" | null;

const steps = ["Basics", "Dataset & Scope", "Rule Logic", "Thresholds & Alerts", "Review & Publish"] as const;

const toneMap: Record<Tone, string> = {
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  purple: "border-purple-100 bg-purple-50 text-purple-600",
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  slate: "border-slate-100 bg-slate-50 text-slate-600",
};

const toneText: Record<Tone, string> = {
  green: "text-emerald-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  blue: "text-blue-600",
  slate: "text-slate-600",
};

const starters = [
  { title: "Missing Required Fields", detail: "Check for nulls in required fields", icon: ShieldCheck, tone: "green" },
  { title: "Reference Integrity Check", detail: "Validate foreign key relationships", icon: Link2, tone: "purple" },
  { title: "Freshness SLA Monitor", detail: "Ensure data is updated within SLA", icon: Clock3, tone: "orange" },
] as const;

const recommendedDatasets = [
  { title: "Provider Master", detail: "reference integrity checks", icon: Table2, tone: "green" },
  { title: "Policy Metadata", detail: "coverage and policy rule validation", icon: FileText, tone: "purple" },
  { title: "Member Eligibility", detail: "enrichment for claims validation", icon: Database, tone: "orange" },
] as const;

const basicsImpactRows = [
  { label: "Estimated datasets", value: "3", icon: Database, tone: "green" },
  { label: "Expected rules", value: "12 - 18", icon: Braces, tone: "purple" },
  { label: "Coverage type", value: "Structured + Semi-structured", icon: Grid2X2, tone: "blue" },
  { label: "Alert routing", value: "Governance Ops", icon: AlertTriangle, tone: "orange" },
] as const;

const scopeImpactRows = [
  { label: "Selected assets", value: "4", icon: Table2, tone: "purple" },
  { label: "Focus fields", value: "5", icon: FileText, tone: "purple" },
  { label: "Estimated records", value: "17.6M", icon: Database, tone: "green" },
  { label: "Processing mode", value: "Scheduled daily", icon: Clock3, tone: "blue" },
] as const;

const ruleImpactRows = [
  { label: "Fields covered", value: "2", icon: FileText, tone: "blue" },
  { label: "Rule complexity", value: "Moderate", icon: ListChecks, tone: "orange" },
  { label: "Estimated failure volume", value: "842", icon: Database, tone: "purple" },
  { label: "Execution mode", value: "Scheduled daily", icon: Clock3, tone: "orange" },
] as const;

const alertImpactRows = [
  { label: "Datasets covered", value: "3", icon: FileText, tone: "blue" },
  { label: "Alerting complexity", value: "Moderate", icon: ListChecks, tone: "orange" },
  { label: "Estimated critical alerts", value: "5", icon: Bell, tone: "purple" },
  { label: "Processing mode", value: "Scheduled daily", icon: Clock3, tone: "orange" },
] as const;

const publishImpactRows = [
  { label: "Datasets covered", value: "3", icon: FileText, tone: "green" },
  { label: "Expected rules", value: "4", icon: ListChecks, tone: "green" },
  { label: "Estimated monthly alerts", value: "18", icon: Bell, tone: "orange" },
  { label: "Processing mode", value: "Scheduled daily", icon: Clock3, tone: "orange" },
  { label: "Affected teams", value: "2", icon: Users, tone: "green" },
] as const;

const includedAssets = [
  { name: "Claims Header", type: "Table", records: "12.4M", updated: "2h ago", included: true, icon: Table2 },
  { name: "Claims Line", type: "Table", records: "58.1M", updated: "2h ago", included: true, icon: Table2 },
  { name: "Provider Reference", type: "File", records: "248K", updated: "1d ago", included: true, icon: FileText },
  { name: "Adjustment Feed", type: "File", records: "1.1M", updated: "5h ago", included: false, icon: FileText },
] as const;

const logicPatterns = [
  { title: "Missing Required Value", detail: "Check for nulls, blanks, or empty fields", icon: ShieldCheck, tone: "green" },
  { title: "Valid Reference Match", detail: "Validate values exist in reference datasets", icon: Link2, tone: "purple" },
  { title: "Standard Format Validation", detail: "Ensure values match expected patterns", icon: Braces, tone: "orange" },
] as const;

const alertPatterns = [
  { title: "Critical Data Loss Alert", detail: "for required field failures", icon: Bell, tone: "orange" },
  { title: "Reference Drift Watch", detail: "for integrity degradation", icon: TrendingUp, tone: "orange" },
  { title: "SLA Breach Notification", detail: "for freshness / latency issues", icon: Clock3, tone: "purple" },
] as const;

const thresholdRows = [
  { rule: "Provider ID completeness check", metric: "Null / blank rate", condition: "must be <=", threshold: "0.5", severity: "Critical" },
  { rule: "Provider reference integrity", metric: "Match rate", condition: "must be >=", threshold: "99.0", severity: "High" },
  { rule: "Billing NPI format validation", metric: "Regex pass rate", condition: "must be >=", threshold: "98.0", severity: "Medium" },
  { rule: "Provider cross-field consistency", metric: "Consistency score", condition: "must be >=", threshold: "97.0", severity: "Low" },
] as const;

export default function CreateDataQualityRuleSet() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [publishState, setPublishState] = useState<PublishState>(null);

  useEffect(() => {
    if (publishState !== "publishing") return undefined;
    const timer = window.setTimeout(() => setPublishState("success"), 1800);
    return () => window.clearTimeout(timer);
  }, [publishState]);

  return (
    <div className="space-y-4">
      <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-card">
        <div className="text-[12px] font-semibold text-slate-600">
          <button onClick={() => navigate("/studios")} className="hover:text-orange-600">Studios</button>
          <span className="mx-2 text-slate-300">/</span>
          <button onClick={() => navigate("/studios/data-quality")} className="hover:text-orange-600">Data Quality Studio</button>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900">Create Rule Set</span>
        </div>

        <div className="mt-4">
          <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Create Rule Set</h1>
          <p className="mt-2 text-[13px] font-medium leading-5 text-slate-700">Define a reusable quality rule set for structured, semi-structured, or unstructured assets.</p>
        </div>

        <RuleStepper activeStep={activeStep} setActiveStep={setActiveStep} />
        {activeStep === 1 ? (
          <BasicsStep onCancel={() => navigate("/studios/data-quality")} onContinue={() => setActiveStep(2)} />
        ) : activeStep === 2 ? (
          <DatasetScopeStep onBack={() => setActiveStep(1)} onContinue={() => setActiveStep(3)} />
        ) : activeStep === 3 ? (
          <RuleLogicStep onBack={() => setActiveStep(2)} onContinue={() => setActiveStep(4)} />
        ) : activeStep === 4 ? (
          <ThresholdsAlertsStep onBack={() => setActiveStep(3)} onContinue={() => setActiveStep(5)} />
        ) : (
          <ReviewPublishStep onBack={() => setActiveStep(4)} onPublish={() => setPublishState("confirm")} />
        )}
      </section>
      {publishState === "confirm" ? <PublishConfirmDialog onClose={() => setPublishState(null)} onConfirm={() => setPublishState("publishing")} /> : null}
      {publishState === "publishing" ? <PublishingDialog onClose={() => setPublishState(null)} /> : null}
      {publishState === "success" ? <PublishSuccessDialog onStay={() => setPublishState(null)} onOpenStudio={() => navigate("/studios/data-quality")} /> : null}
    </div>
  );
}

function BasicsStep({ onCancel, onContinue }: { onCancel: () => void; onContinue: () => void }) {
  return (
    <div className="data-quality-create-grid mt-5">
      <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-[18px] font-extrabold text-slate-950">Rule Set Details</h2>
        <div className="mt-5 space-y-4">
          <FormRow label="Rule Set Name" required><TextInput value="Provider Completeness & Reference Validation" /></FormRow>
          <FormRow label="Description" required>
            <div>
              <textarea className="h-[76px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium leading-5 text-slate-800 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue="Validate provider data completeness and reference integrity across claims and master data to ensure accurate reporting and downstream processing." />
              <div className="-mt-6 pr-3 text-right text-[11px] font-semibold text-slate-500">115/500</div>
            </div>
          </FormRow>
          <FormRow label="Quality Domain" required info>
            <div className="grid grid-cols-1 gap-2 min-[720px]:grid-cols-2 min-[1500px]:grid-cols-4">
              <ChoicePill selected icon={ShieldCheck} label="Completeness" tone="green" />
              <ChoicePill icon={Target} label="Accuracy" tone="purple" />
              <ChoicePill icon={Clock3} label="Timeliness" tone="orange" />
              <ChoicePill icon={Link2} label="Consistency" tone="blue" />
            </div>
          </FormRow>
          <FormRow label="Asset Type" required info>
            <div className="grid grid-cols-1 gap-2 min-[720px]:grid-cols-2 min-[1500px]:grid-cols-3">
              <ChoicePill selected icon={Grid2X2} label="Structured" tone="green" />
              <ChoicePill selected icon={Braces} label="Semi-structured" tone="green" />
              <ChoicePill icon={FileText} label="Unstructured" tone="blue" />
            </div>
          </FormRow>
          <FormRow label="Applies To" required info><TokenSelect tokens={["Claims Bronze", "Provider Master", "Policy Metadata"]} searchable /></FormRow>
          <FormRow label="Business Owner" required info><SelectBox value="Data Governance Team" /></FormRow>
          <FormRow label="Tags" info><TokenSelect tokens={["PII", "Provider", "Critical", "SLA"]} /></FormRow>
          <FormRow label="Execution Mode" required info><RadioGroup items={["Batch Scan", "On Ingestion", "Scheduled"]} active={2} /></FormRow>
          <FormRow label="Scan Frequency" required info><SelectBox value="Daily" /></FormRow>
          <FormRow label="Rule Set Visibility" required info><RadioGroup items={["Private Workspace", "Shared Template", "Certified Enterprise"]} active={1} /></FormRow>
        </div>
        <FooterActions left="Save Draft" secondary="Cancel" primary="Continue to Dataset & Scope" onSecondary={onCancel} onPrimary={onContinue} />
      </section>

      <aside className="space-y-4">
        <CreatePanel title="Suggested Starters" info>
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            {starters.map((starter) => <SideAssetRow key={starter.title} {...starter} action="Use" />)}
          </div>
          <button className="mt-3 ml-auto flex items-center gap-2 text-[12px] font-extrabold text-blue-600 hover:text-orange-600">Browse all templates <ArrowRight className="h-4 w-4" /></button>
        </CreatePanel>
        <CreatePanel title="Best Practices" info><GuidanceList items={["Start with critical fields and high-impact datasets.", "Align thresholds with business SLAs.", "Map alerts to data owners for accountability.", "Reuse and adapt templates to standardize rules."]} /></CreatePanel>
        <CreatePanel title="Impact Preview" info><ImpactTable rows={basicsImpactRows} /></CreatePanel>
      </aside>
    </div>
  );
}

function DatasetScopeStep({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="data-quality-create-grid mt-5">
      <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-[18px] font-extrabold text-slate-950">Dataset & Scope</h2>
        <div className="mt-5 space-y-4">
          <FormRow label="Primary Dataset" required><SelectBox value="Claims Bronze" searchable /></FormRow>
          <FormRow label="Related Datasets"><TokenSelect tokens={["Provider Master", "Policy Metadata", "Member Eligibility"]} /></FormRow>
          <FormRow label="Environment / Data Layer" required>
            <div className="grid grid-cols-3 gap-2">
              <ChoicePill selected icon={Database} label="Bronze" tone="green" />
              <ChoicePill icon={Database} label="Silver" tone="slate" />
              <ChoicePill icon={Database} label="Gold" tone="slate" />
            </div>
          </FormRow>
          <FormRow label="Business Domain" required>
            <div className="grid grid-cols-2 gap-2 min-[1500px]:grid-cols-4">
              <ChoicePill selected icon={Folder} label="Claims" tone="green" />
              <ChoicePill selected icon={Folder} label="Provider" tone="green" />
              <ChoicePill icon={Folder} label="Policy" tone="slate" />
              <ChoicePill icon={Folder} label="Finance" tone="slate" />
            </div>
          </FormRow>
          <FormRow label="Asset Scope" required>
            <div className="grid grid-cols-1 gap-2 min-[1500px]:grid-cols-3">
              <ScopeCard icon={Database} title="Entire dataset" detail="Validate all tables/files in the dataset" />
              <ScopeCard selected icon={Folder} title="Selected tables / files" detail="Choose specific tables or files to include" />
              <ScopeCard icon={Columns3} title="Column-level scope" detail="Target specific columns or fields" />
            </div>
          </FormRow>
          <FormRow label="Included Assets">
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="flex h-9 items-center gap-2 border-b border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-500">
                <Search className="h-4 w-4" /><span>Search assets...</span>
              </div>
              <div className="data-quality-assets-row grid bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                <span>Asset Name</span><span>Type</span><span>Records</span><span>Last Updated</span><span>Include</span>
              </div>
              {includedAssets.map((asset) => <AssetRow key={asset.name} {...asset} />)}
            </div>
          </FormRow>
          <FormRow label="Column / Field Focus">
            <div>
              <TokenSelect tokens={["provider_id", "claim_id", "service_date", "policy_number", "billing_npi"]} />
              <p className="mt-1 text-[11px] font-medium text-slate-500">Optional: target high-priority fields for focused validation.</p>
            </div>
          </FormRow>
          <FormRow label="Data Filters">
            <div className="space-y-1.5">
              <FilterRow field="processing_date" operator=">=" value="last 30 days" />
              <FilterRow field="source_system" operator="=" value="CORE_CLAIMS" />
              <FilterRow field="market" operator="in" value="Commercial, Medicare" />
              <button className="text-[12px] font-extrabold text-blue-600 hover:text-orange-600">+ Add Filter</button>
            </div>
          </FormRow>
          <FormRow label="Sampling Strategy" required><RadioGroup items={["Full scan", "Sample 10%", "Sample 25%", "Custom"]} active={2} /></FormRow>
          <FormRow label="Estimated Scan Window">
            <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-3 min-[740px]:grid-cols-3">
              <ScanMetric icon={Database} label="Estimated records" value="17.6M" tone="green" />
              <ScanMetric icon={Clock3} label="Approx run time" value="14 min" tone="purple" />
              <ScanMetric icon={CalendarDays} label="Refresh cadence" value="Daily" tone="orange" />
            </div>
          </FormRow>
        </div>
        <FooterActions left="Save Draft" secondary="Back to Basics" primary="Continue to Rule Logic" onSecondary={onBack} onPrimary={onContinue} />
      </section>

      <aside className="space-y-4">
        <CreatePanel title="Recommended Datasets" info>
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            {recommendedDatasets.map((dataset) => <SideAssetRow key={dataset.title} {...dataset} action="Add" />)}
          </div>
          <button className="mt-3 ml-auto flex items-center gap-2 text-[12px] font-extrabold text-blue-600 hover:text-orange-600">Browse all assets <ArrowRight className="h-4 w-4" /></button>
        </CreatePanel>
        <CreatePanel title="Scope Guidance"><GuidanceList items={["Include only the datasets needed for this rule set.", "Prioritize high-volume and business-critical assets.", "Limit scope for faster initial rollout.", "Add reference datasets when validating integrity or consistency."]} /></CreatePanel>
        <CreatePanel title="Scope Impact Preview" info><ImpactTable rows={scopeImpactRows} /></CreatePanel>
        <section className="grid grid-cols-[28px_1fr] gap-3 rounded-[12px] border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
          <Info className="h-5 w-5 text-blue-600" />
          <p className="text-[12px] font-semibold leading-5 text-slate-700"><b className="block text-slate-950">Why this matters</b>Precise scope improves performance, reduces alert noise, and increases trust in your data quality outcomes.</p>
        </section>
      </aside>
    </div>
  );
}

function RuleLogicStep({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="data-quality-create-grid mt-5">
      <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-[18px] font-extrabold text-slate-950">Rule Logic</h2>

        <NumberedSection number={1} title="Rule Configuration">
          <FormRow label="Rule Type" required>
            <div className="grid grid-cols-1 gap-2 min-[980px]:grid-cols-2 min-[1500px]:grid-cols-4">
              <ChoicePill selected icon={ShieldCheck} label="Completeness Check" tone="green" />
              <ChoicePill icon={Link2} label="Reference Validation" tone="purple" />
              <ChoicePill icon={Braces} label="Pattern / Format Check" tone="orange" />
              <ChoicePill icon={Users} label="Cross-field Consistency" tone="blue" />
            </div>
          </FormRow>
          <div className="grid gap-3 min-[980px]:grid-cols-2">
            <FormRow label="Rule Name" required compact><TextInput value="Provider ID completeness check" /></FormRow>
            <FormRow label="Severity Level" required compact><SelectBox value="Critical" /></FormRow>
          </div>
          <div className="grid gap-3 min-[980px]:grid-cols-2">
            <FormRow label="Rule Description" compact>
              <textarea className="h-[62px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium leading-5 text-slate-800 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue="Ensure provider_id is populated for all claims records and flag records with missing or blank values." />
            </FormRow>
            <FormRow label="Severity" compact>
              <div>
                <TokenSelect tokens={["billing_npi"]} />
                <div className="mt-3 grid grid-cols-2 gap-2 min-[760px]:grid-cols-4">
                  <SeverityPill selected label="Critical" />
                  <SeverityPill label="High" />
                  <SeverityPill label="Medium" />
                  <SeverityPill label="Low" />
                </div>
              </div>
            </FormRow>
          </div>
        </NumberedSection>

        <NumberedSection number={2} title="Condition Builder">
          <div className="mb-3 flex flex-wrap items-center gap-8 text-[12px] font-semibold text-slate-700">
            <span>Match Mode:</span>
            <RadioGroup items={["All conditions", "Any condition"]} active={0} />
          </div>
          <div className="space-y-1.5">
            <ConditionRow index={1} field="provider_id" operator="is not null" value="--" />
            <div className="ml-8 text-[10px] font-extrabold text-slate-500">AND</div>
            <ConditionRow index={2} field="provider_id" operator="!=" value={'""'} />
            <div className="ml-8 text-[10px] font-extrabold text-slate-500">AND</div>
            <ConditionRow index={3} field="billing_npi" operator="matches regex" value="^[0-9]{10}$" />
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <SmallOutlineButton label="Add Condition" />
            <SmallOutlineButton label="Add Rule Group" />
          </div>
        </NumberedSection>

        <NumberedSection number={3} title="Validation Actions">
          <div className="grid grid-cols-1 gap-2 min-[900px]:grid-cols-2 min-[1500px]:grid-cols-4">
            <CheckTile checked label="Flag record for review" />
            <CheckTile checked label="Exclude from downstream gold publish" />
            <CheckTile checked label="Trigger stewardship task" />
            <CheckTile label="Auto-remediate using default value" />
          </div>
          <div className="mt-3 grid gap-3 min-[900px]:grid-cols-[minmax(220px,.8fr)_minmax(0,1.4fr)]">
            <div>
              <label className="mb-1 block text-[12px] font-extrabold text-slate-600">Failure Code</label>
              <SelectBox value="DQ_PROVIDER_MISSING" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-extrabold text-slate-600">Business Rationale</label>
              <div>
                <textarea className="h-[64px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium leading-4 text-slate-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue="Provider identifiers are mandatory for downstream reporting, attribution, and compliance. Missing identifiers can lead to incorrect reporting, payment errors, and regulatory issues." />
                <div className="-mt-5 pr-3 text-right text-[10px] font-semibold text-slate-500">143/500</div>
              </div>
            </div>
          </div>
        </NumberedSection>

        <NumberedSection number={4} title="Test Logic Preview">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[12px] leading-5 text-slate-700">
            provider_id <span className="text-orange-600">IS NOT NULL</span> <span className="text-blue-600">AND</span> provider_id &lt;&gt; <span className="text-orange-600">''</span> <span className="text-blue-600">AND</span> REGEXP_LIKE(billing_npi, <span className="text-red-500">'^[0-9]&#123;10&#125;$'</span>)
          </div>
          <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 min-[900px]:grid-cols-4">
            <PreviewMetric icon={FileText} label="Target fields" value="2" tone="blue" />
            <PreviewMetric icon={ListChecks} label="Effective conditions" value="3" tone="slate" />
            <PreviewMetric icon={ShieldCheck} label="Estimated pass rate" value="96.2%" tone="green" />
            <PreviewMetric icon={AlertTriangle} label="Sample failures" value="842" tone="orange" />
          </div>
        </NumberedSection>

        <FooterActions left="Save Draft" secondary="Back to Dataset & Scope" primary="Continue to Thresholds & Alerts" onSecondary={onBack} onPrimary={onContinue} />
      </section>

      <aside className="space-y-4">
        <CreatePanel title="Suggested Logic Patterns" info>
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            {logicPatterns.map((pattern) => <SideAssetRow key={pattern.title} {...pattern} action="Use" />)}
          </div>
          <button className="mt-3 ml-auto flex items-center gap-2 text-[12px] font-extrabold text-blue-600 hover:text-orange-600">Browse all patterns <ArrowRight className="h-4 w-4" /></button>
        </CreatePanel>
        <CreatePanel title="Logic Guidance" info>
          <GuidanceList items={["Keep rules atomic and focused on a single validation.", "Use business-critical fields first in your conditions.", "Avoid conflicting or overlapping conditions.", "Validate format separately from presence or reference."]} />
        </CreatePanel>
        <CreatePanel title="Rule Impact Preview" info><ImpactTable rows={ruleImpactRows} /></CreatePanel>
        <CreatePanel title="Sample Records" info>
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            <div className="grid grid-cols-[1fr_1fr_1fr_68px] gap-2 bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
              <span>claim_id</span><span>provider_id</span><span>billing_npi</span><span>status</span>
            </div>
            <SampleRecord claim="CLM-1001245" provider="PRV-78901" npi="1234567890" status="Pass" />
            <SampleRecord claim="CLM-1001246" provider="--" npi="0987654321" status="Fail" />
            <SampleRecord claim="CLM-1001247" provider="PRV-34567" npi="12345A7890" status="Fail" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-[12px] font-semibold text-slate-500">
            <span>Showing 3 of 3 sample records</span>
            <button className="inline-flex items-center gap-2 font-extrabold text-blue-600 hover:text-orange-600">View more samples <ArrowRight className="h-4 w-4" /></button>
          </div>
        </CreatePanel>
      </aside>
    </div>
  );
}

function ThresholdsAlertsStep({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="data-quality-create-grid mt-5">
      <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-[18px] font-extrabold text-slate-950">Thresholds & Alerts</h2>

        <NumberedSection number={1} title="Threshold Configuration">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <div className="min-w-[840px]">
              <div className="data-quality-threshold-row grid bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                <span>Rule</span><span>Metric / Evaluation</span><span>Condition</span><span>Threshold</span><span>Severity</span><span />
              </div>
              {thresholdRows.map((row) => <ThresholdRow key={row.rule} {...row} />)}
            </div>
          </div>
          <SmallOutlineButton label="Add Threshold" />
        </NumberedSection>

        <NumberedSection number={2} title="Alert Trigger Rules">
          <div className="grid gap-3 min-[900px]:grid-cols-[minmax(220px,1fr)_minmax(260px,1fr)]">
            <div>
              <label className="mb-1 block text-[12px] font-extrabold text-slate-600">Trigger when</label>
              <SelectBox value="Threshold breached" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-extrabold text-slate-600">Alert frequency</label>
              <RadioGroup items={["Real-time", "Scheduled digest", "End of run"]} active={2} />
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border border-slate-100 bg-white p-3 min-[900px]:grid-cols-[minmax(190px,.7fr)_minmax(190px,.8fr)_1fr_1fr]">
            <CounterField label="Consecutive failures before alert" value="2" />
            <div>
              <label className="mb-1 block text-[12px] font-extrabold text-slate-600">Minimum impacted records</label>
              <div className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700">100</div>
            </div>
            <ToggleRow label="Auto-create stewardship task" enabled />
            <ToggleRow label="Pause downstream certification on critical failure" enabled />
          </div>
        </NumberedSection>

        <NumberedSection number={3} title="Notification & Routing">
          <div>
            <label className="mb-2 block text-[12px] font-extrabold text-slate-600">Channels</label>
            <div className="grid grid-cols-2 gap-2 min-[900px]:grid-cols-4">
              <ChannelPill selected icon={Bell} label="Email" tone="green" />
              <ChannelPill selected icon={TrendingUp} label="Slack" tone="green" />
              <ChannelPill selected icon={Users} label="Teams" tone="green" />
              <ChannelPill icon={Target} label="PagerDuty" tone="slate" />
            </div>
          </div>
          <div className="grid gap-3 min-[900px]:grid-cols-4">
            <div><label className="mb-1 block text-[12px] font-extrabold text-slate-600">Primary recipients</label><SelectBox value="Data Governance Team" /></div>
            <div><label className="mb-1 block text-[12px] font-extrabold text-slate-600">Escalation owner</label><SelectBox value="Provider Data Steward" /></div>
            <div><label className="mb-1 block text-[12px] font-extrabold text-slate-600">SLA for acknowledgement</label><SelectBox value="30 min" /></div>
            <div><label className="mb-1 block text-[12px] font-extrabold text-slate-600">Escalation after</label><SelectBox value="2 alerts in 24h" /></div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-extrabold text-slate-600">Alert Message Template</label>
            <textarea
              className="h-[58px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium leading-4 text-slate-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              defaultValue={'Data Quality alert: The rule "{rule_name}" for dataset "{dataset}" has breached the threshold.\nMetric "{metric}" is {value} (threshold {threshold}). Severity: {severity}. Please review and take action.'}
            />
          </div>
        </NumberedSection>

        <NumberedSection number={4} title="Threshold Preview">
          <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
            <ThresholdMetric icon={Database} label="Total active thresholds" value="4" tone="green" />
            <ThresholdMetric icon={Target} label="Estimated monthly alerts" value="18" tone="purple" />
            <ThresholdMetric icon={AlertTriangle} label="Highest severity" value="Critical" tone="orange" />
            <ThresholdMetric icon={Bell} label="Notification channels" value="3" tone="blue" />
          </div>
          <div className="mt-3 grid grid-cols-[28px_1fr] items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2 text-[12px] font-semibold text-slate-700">
            <Info className="h-4 w-4 text-blue-600" />
            <span>If provider_id null rate exceeds 0.5%, send Critical alert to Data Governance Team and create stewardship task.</span>
          </div>
        </NumberedSection>

        <FooterActions left="Save Draft" secondary="Back to Rule Logic" primary="Continue to Review & Publish" onSecondary={onBack} onPrimary={onContinue} />
      </section>

      <aside className="space-y-4">
        <CreatePanel title="Recommended Alert Patterns" info>
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            {alertPatterns.map((pattern) => <SideAssetRow key={pattern.title} {...pattern} action="Use" />)}
          </div>
          <button className="mt-3 ml-auto flex items-center gap-2 text-[12px] font-extrabold text-blue-600 hover:text-orange-600">Browse all patterns <ArrowRight className="h-4 w-4" /></button>
        </CreatePanel>
        <CreatePanel title="Alert Guidance" info>
          <GuidanceList items={["Use stricter thresholds for mandatory identifiers.", "Align severity to downstream business impact.", "Avoid alert fatigue by setting sensible failure counts.", "Route critical alerts to accountable owners."]} />
        </CreatePanel>
        <CreatePanel title="Alert Impact Preview" info><ImpactTable rows={alertImpactRows} /></CreatePanel>
        <CreatePanel title="Notification Preview" info>
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            <NotificationRow label="Event" value="Provider completeness breach" icon={Bell} tone="blue" />
            <NotificationRow label="Severity" value="Critical" icon={AlertTriangle} tone="orange" badge />
            <NotificationRow label="Channel" value="Email, Slack, Teams" icon={ShieldCheck} tone="green" />
            <NotificationRow label="Routed to" value="Data Governance Team" icon={FileText} tone="blue" />
          </div>
        </CreatePanel>
      </aside>
    </div>
  );
}

function ReviewPublishStep({ onBack, onPublish }: { onBack: () => void; onPublish: () => void }) {
  return (
    <div className="data-quality-create-grid mt-5">
      <section className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-[18px] font-extrabold text-slate-950">Review & Publish</h2>

        <NumberedSection number={1} title="Rule Set Summary">
          <div className="grid overflow-hidden rounded-lg border border-slate-200 min-[900px]:grid-cols-3 min-[1500px]:grid-cols-6">
            <SummaryTile icon={FileText} label="Rule Set Name" value="Provider Completeness & Reference Validation" />
            <SummaryTile icon={ShieldCheck} label="Quality Domain" value="Completeness" />
            <SummaryTile icon={Grid2X2} label="Asset Type" value="Structured + Semi-structured" />
            <SummaryTile icon={Users} label="Owner" value="Data Governance Team" />
            <SummaryTile icon={CalendarDays} label="Execution Mode" value="Scheduled Daily" />
            <SummaryTile icon={Globe2} label="Visibility" value="Shared Template" />
          </div>
        </NumberedSection>

        <NumberedSection number={2} title="Dataset & Scope">
          <ReviewGrid>
            <ReviewCell icon={Database} label="Primary Dataset" value="Claims Bronze" tone="green" />
            <ReviewCell icon={Link2} label="Related Datasets" value="Provider Master, Policy Metadata, Member Eligibility" tone="purple" />
            <ReviewCell icon={Grid2X2} label="Included Assets" value="4" tone="blue" />
            <ReviewCell icon={FileText} label="Focus Fields" value="provider_id, claim_id, service_date, policy_number, billing_npi" tone="orange" />
            <ReviewCell icon={Filter} label="Data Filters" value="processing_date >= last 30 days, source_system = CORE_CLAIMS, market in Commercial/Medicare" tone="blue" />
            <ReviewCell icon={Target} label="Sampling Strategy" value="Sample 25%" tone="green" />
          </ReviewGrid>
        </NumberedSection>

        <NumberedSection number={3} title="Rule Logic">
          <ReviewGrid columns={4}>
            <ReviewCell icon={Braces} label="Rule Type" value="Completeness Check" tone="purple" />
            <ReviewCell icon={AlertTriangle} label="Severity Level" value="Critical" tone="orange" />
            <ReviewCell icon={ListChecks} label="Match Mode" value="All conditions" tone="blue" />
            <ReviewCell icon={TrendingUp} label="Validation Actions" value="Flag for review, Exclude from downstream gold publish, Trigger stewardship task" tone="orange" />
          </ReviewGrid>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <span className="block text-[12px] font-extrabold text-slate-600">Conditions (3)</span>
            <div className="mt-3 grid gap-3 text-[12px] font-semibold text-slate-800 min-[900px]:grid-cols-3">
              {["provider_id is not null", "provider_id != \"\"", "billing_npi matches regex ^[0-9]{10}$"].map((condition) => (
                <span key={condition} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{condition}</span>
              ))}
            </div>
          </div>
        </NumberedSection>

        <NumberedSection number={4} title="Thresholds & Alerts">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <div className="min-w-[840px]">
              <div className="data-quality-review-threshold-row grid bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                <span>Rule</span><span>Metric / Evaluation</span><span>Condition</span><span>Threshold</span><span>Severity</span>
              </div>
              {thresholdRows.map((row) => <ReviewThresholdRow key={row.rule} {...row} />)}
            </div>
          </div>
        </NumberedSection>

        <NumberedSection number={5} title="Publish Configuration">
          <ReviewGrid columns={4}>
            <ReviewCell icon={Users} label="Approval Workflow" value="Data Steward Review" tone="blue" />
            <ReviewCell icon={ShieldCheck} label="Certification Tag" value="Certified Quality Rule" tone="green" />
            <ReviewCell icon={Bell} label="Notify Channels" value="Email, Slack, Teams" tone="purple" />
            <ReviewCell icon={Clock3} label="Effective From" value="Immediately after publish" tone="blue" />
          </ReviewGrid>
          <div className="mt-3">
            <label className="mb-1 block text-[12px] font-extrabold text-slate-600">Change Note</label>
            <textarea className="h-[44px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue="Initial publication of provider completeness rule set for claims quality monitoring." />
          </div>
        </NumberedSection>

        <section className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
          <h3 className="text-[13px] font-extrabold text-slate-950">Pre-publish Validation</h3>
          <div className="mt-3 grid gap-3 min-[900px]:grid-cols-4">
            {["Required fields completed", "Dataset scope selected", "Logic test preview passed", "Alert routing configured"].map((item) => (
              <span key={item} className="flex items-center gap-2 text-[12px] font-semibold text-slate-700"><Check className="h-4 w-4 rounded-full border border-emerald-200 bg-white p-0.5 text-emerald-600" />{item}</span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-[12px] font-semibold text-orange-900">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span>1 recommendation: consider elevating Provider reference integrity severity if used for downstream certification.</span>
          </div>
        </section>

        <FooterActions left="Save Draft" secondary="Back to Thresholds & Alerts" primary="Publish Rule Set" onSecondary={onBack} onPrimary={onPublish} />
      </section>

      <aside className="space-y-4">
        <CreatePanel title="Publish Readiness" info>
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            <ReadinessRow icon={ShieldCheck} label="Overall status" value="Ready" tone="green" badge />
            <ReadinessRow icon={Clock3} label="Estimated publish time" value="< 1 min" tone="blue" />
            <ReadinessRow icon={FileText} label="Version" value="v1.0" tone="blue" />
            <ReadinessRow icon={Users} label="Approver" value="Data Steward" tone="slate" />
          </div>
        </CreatePanel>
        <CreatePanel title="Impact Preview" info><ImpactTable rows={publishImpactRows} /></CreatePanel>
        <CreatePanel title="Notification Preview" info>
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            <NotificationRow label="Event" value="Provider completeness breach" icon={Bell} tone="blue" />
            <NotificationRow label="Severity" value="Critical" icon={AlertTriangle} tone="orange" badge />
            <NotificationRow label="Channels" value="Email / Slack / Teams" icon={ShieldCheck} tone="green" />
            <NotificationRow label="Routed to" value="Data Governance Team" icon={FileText} tone="blue" />
          </div>
        </CreatePanel>
      </aside>
    </div>
  );
}

function RuleStepper({ activeStep, setActiveStep }: { activeStep: StepId; setActiveStep: (step: StepId) => void }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 min-[900px]:grid-cols-5">
      {steps.map((label, index) => {
        const number = index + 1;
        const active = number === activeStep;
        const done = number < activeStep;
        const reachable = number <= 5;
        return (
          <button key={label} onClick={() => reachable ? setActiveStep(number as StepId) : undefined} className="grid grid-cols-[34px_auto_minmax(24px,1fr)] items-center gap-3 text-left">
            <span className={`grid h-8 w-8 place-items-center rounded-full border text-[13px] font-extrabold ${done ? "border-emerald-200 bg-emerald-50 text-emerald-600" : active ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 bg-white text-slate-700"}`}>{done ? <Check className="h-4 w-4" /> : number}</span>
            <span className="whitespace-nowrap text-[12px] font-extrabold text-slate-700">{label}</span>
            <span className={`hidden h-px min-[900px]:block ${index === steps.length - 1 ? "bg-transparent" : "bg-slate-300"}`} />
          </button>
        );
      })}
    </div>
  );
}

function NumberedSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-slate-100 py-4 last:border-b-0">
      <h3 className="mb-3 flex items-center gap-3 text-[13px] font-extrabold text-slate-950">
        <span className="grid h-6 w-6 place-items-center rounded-full border border-slate-300 bg-white text-[12px] text-slate-700">{number}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FormRow({ label, required = false, info = false, compact = false, children }: { label: string; required?: boolean; info?: boolean; compact?: boolean; children: React.ReactNode }) {
  return (
    <div className={`${compact ? "grid gap-2" : "data-quality-form-row grid gap-2"}`}>
      <label className="flex items-center gap-2 pt-2 text-[13px] font-extrabold text-slate-700">
        <span>{label}</span>{required ? <span className="text-orange-600">*</span> : null}{info ? <Info className="h-4 w-4 text-slate-400" /> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function TextInput({ value }: { value: string }) {
  return <input className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-800 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" defaultValue={value} />;
}

function ChoicePill({ icon: Icon, label, tone, selected = false }: { icon: LucideIcon; label: string; tone: Tone; selected?: boolean }) {
  const [isSelected, setIsSelected] = useState(selected);
  return (
    <button onClick={() => setIsSelected(!isSelected)} className={`flex h-9 min-w-0 items-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold ${isSelected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"}`}>
      <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-600" : toneText[tone]}`} /><span className="truncate">{label}</span>{isSelected ? <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" /> : null}
    </button>
  );
}

function ScopeCard({ icon: Icon, title, detail, selected = false }: { icon: LucideIcon; title: string; detail: string; selected?: boolean }) {
  const [isSelected, setIsSelected] = useState(selected);
  return (
    <button onClick={() => setIsSelected(!isSelected)} className={`grid min-h-[66px] grid-cols-[34px_1fr_18px] items-center gap-3 rounded-lg border p-3 text-left ${isSelected ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-white"}`}>
      <Icon className={`h-5 w-5 ${isSelected ? "text-emerald-600" : "text-slate-600"}`} />
      <span className="min-w-0"><b className="block text-[12px] text-slate-950">{title}</b><span className="mt-1 block text-[11px] leading-4 text-slate-500">{detail}</span></span>
      <span className={`grid h-4 w-4 place-items-center rounded-full border ${isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>{isSelected ? <Check className="h-3 w-3" /> : null}</span>
    </button>
  );
}

function TokenSelect({ tokens, searchable = false }: { tokens: string[]; searchable?: boolean }) {
  const [items, setItems] = useState(tokens);
  const addToken = () => {
    const next = searchable ? "new_asset" : "new_tag";
    if (!items.includes(next)) setItems([...items, next]);
  };
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">{items.map((token) => <span key={token} className="inline-flex h-6 items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-2 text-[11px] font-extrabold text-blue-700">{token} <button onClick={() => setItems(items.filter((item) => item !== token))} aria-label={`Remove ${token}`}><X className="h-3 w-3" /></button></span>)}</div>
      <button onClick={addToken} className="grid h-6 w-6 place-items-center rounded-md hover:bg-slate-100" aria-label="Add token"><ChevronDown className="h-4 w-4 shrink-0 text-slate-600" /></button>{searchable ? <button onClick={addToken} aria-label="Search and add token"><Search className="h-4 w-4 shrink-0 text-slate-500" /></button> : null}
    </div>
  );
}

function SelectBox({ value, searchable = false }: { value: string; searchable?: boolean }) {
  const options = [value, "Claims Silver", "Provider Master", "Critical", "Daily", "Weekly", "Data Steward Review"];
  const [index, setIndex] = useState(0);
  const current = options[index % options.length];
  return (
    <button onClick={() => setIndex(index + 1)} className="flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left text-[13px] font-medium text-slate-800">
      <span>{current}</span><span className="flex items-center gap-2">{searchable ? <Search className="h-4 w-4 text-slate-500" /> : null}<ChevronDown className="h-4 w-4 text-slate-600" /></span>
    </button>
  );
}

function RadioGroup({ items, active }: { items: string[]; active: number }) {
  const [selectedIndex, setSelectedIndex] = useState(active);
  return <div className="flex flex-wrap gap-6 py-1">{items.map((item, index) => <button key={item} onClick={() => setSelectedIndex(index)} className="flex items-center gap-2 text-[13px] font-medium text-slate-700"><span className={`grid h-4 w-4 place-items-center rounded-full border ${index === selectedIndex ? "border-orange-500" : "border-slate-300"}`}>{index === selectedIndex ? <span className="h-2 w-2 rounded-full bg-orange-500" /> : null}</span>{item}</button>)}</div>;
}

function SeverityPill({ label, selected = false }: { label: string; selected?: boolean }) {
  const [isSelected, setIsSelected] = useState(selected);
  return (
    <button onClick={() => setIsSelected(!isSelected)} className={`flex h-8 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold ${isSelected ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-700"}`}>
      {isSelected ? <AlertTriangle className="h-3.5 w-3.5" /> : null}{label}
    </button>
  );
}

function ThresholdRow({ rule, metric, condition, threshold, severity }: { rule: string; metric: string; condition: string; threshold: string; severity: string }) {
  const [visible, setVisible] = useState(true);
  const [thresholdValue, setThresholdValue] = useState(threshold);
  if (!visible) return null;
  return (
    <div className="data-quality-threshold-row grid border-t border-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-700">
      <span className="truncate">{rule}</span>
      <SelectBox value={metric} />
      <SelectBox value={condition} />
      <div className="grid grid-cols-[1fr_34px] overflow-hidden rounded-lg border border-slate-200 bg-white">
        <input value={thresholdValue} onChange={(event) => setThresholdValue(event.target.value)} className="min-w-0 px-3 py-2 outline-none" />
        <span className="grid place-items-center border-l border-slate-200 text-slate-500">%</span>
      </div>
      <SeveritySelect severity={severity} />
      <button onClick={() => setVisible(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600" aria-label="Delete threshold"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="grid min-h-[66px] grid-cols-[32px_1fr] items-center gap-2 border-b border-r border-slate-100 p-3 last:border-r-0">
      <Icon className="h-5 w-5 text-blue-700" />
      <span className="min-w-0">
        <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{label}</span>
        <b className="mt-1 block text-[11px] leading-4 text-slate-950">{value}</b>
      </span>
    </div>
  );
}

function ReviewGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 4 }) {
  return <div className={`grid overflow-hidden rounded-lg border border-slate-200 ${columns === 4 ? "min-[900px]:grid-cols-2 min-[1500px]:grid-cols-4" : "min-[900px]:grid-cols-2"}`}>{children}</div>;
}

function ReviewCell({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  return (
    <div className="grid grid-cols-[32px_1fr] items-center gap-3 border-b border-r border-slate-100 p-3 last:border-r-0">
      <Icon className={`h-5 w-5 ${toneText[tone]}`} />
      <span className="min-w-0">
        <span className="block text-[11px] font-bold text-slate-500">{label}</span>
        <b className="mt-1 block text-[12px] leading-4 text-slate-950">{value}</b>
      </span>
    </div>
  );
}

function ReviewThresholdRow({ rule, metric, condition, threshold, severity }: { rule: string; metric: string; condition: string; threshold: string; severity: string }) {
  return (
    <div className="data-quality-review-threshold-row grid border-t border-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-700">
      <span className="truncate">{rule}</span>
      <span>{metric}</span>
      <span>{condition}</span>
      <span>{threshold} <span className="text-slate-400">%</span></span>
      <span className={`flex items-center gap-2 font-extrabold ${severity === "Critical" ? "text-red-600" : severity === "High" ? "text-orange-600" : severity === "Medium" ? "text-amber-600" : "text-emerald-600"}`}><span className="h-2 w-2 rounded-full bg-current" />{severity}</span>
    </div>
  );
}

function ReadinessRow({ icon: Icon, label, value, tone, badge = false }: { icon: LucideIcon; label: string; value: string; tone: Tone; badge?: boolean }) {
  return (
    <div className="grid grid-cols-[32px_1fr_auto] items-center gap-2 border-b border-slate-100 px-3 py-3 text-[12px] font-semibold last:border-b-0">
      <Icon className={`h-5 w-5 ${toneText[tone]}`} />
      <span className="text-slate-600">{label}</span>
      {badge ? <span className="rounded-md bg-emerald-50 px-4 py-1 text-[12px] font-extrabold text-emerald-700">{value}</span> : <b className="text-right text-slate-800">{value}</b>}
    </div>
  );
}

function SeveritySelect({ severity }: { severity: string }) {
  const severities = ["Critical", "High", "Medium", "Low"];
  const [severityIndex, setSeverityIndex] = useState(Math.max(0, severities.indexOf(severity)));
  const current = severities[severityIndex % severities.length];
  const styles = current === "Critical" ? "border-red-200 bg-red-50 text-red-700" : current === "High" ? "border-orange-200 bg-orange-50 text-orange-700" : current === "Medium" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return (
    <button onClick={() => setSeverityIndex(severityIndex + 1)} className={`flex h-9 items-center justify-between gap-2 rounded-lg border px-3 text-[12px] font-extrabold ${styles}`}>
      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-current" />{current}</span><ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}

function CounterField({ label, value }: { label: string; value: string }) {
  const [count, setCount] = useState(Number(value));
  return (
    <div>
      <label className="mb-1 block text-[12px] font-extrabold text-slate-600">{label}</label>
      <div className="grid h-9 grid-cols-[36px_1fr_36px] overflow-hidden rounded-lg border border-slate-200 bg-white text-[13px] font-extrabold text-slate-700">
        <button onClick={() => setCount(Math.max(0, count - 1))} className="border-r border-slate-200 text-slate-500">−</button>
        <span className="grid place-items-center">{count}</span>
        <button onClick={() => setCount(count + 1)} className="border-l border-slate-200 text-blue-600">+</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, enabled = false }: { label: string; enabled?: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <button onClick={() => setIsEnabled(!isEnabled)} className="flex items-center justify-between gap-3 text-left text-[12px] font-extrabold leading-4 text-slate-700">
      <span>{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 ${isEnabled ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`block h-4 w-4 rounded-full bg-white ${isEnabled ? "ml-4" : ""}`} /></span>
    </button>
  );
}

function ChannelPill({ icon: Icon, label, tone, selected = false }: { icon: LucideIcon; label: string; tone: Tone; selected?: boolean }) {
  const [isSelected, setIsSelected] = useState(selected);
  return (
    <button onClick={() => setIsSelected(!isSelected)} className={`flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[12px] font-extrabold ${isSelected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"}`}>
      <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-600" : toneText[tone]}`} />{label}
    </button>
  );
}

function ThresholdMetric({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  return (
    <div className="grid min-h-[58px] grid-cols-[42px_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span>
      <span><span className="block text-[11px] font-semibold text-slate-500">{label}</span><b className="block text-[18px] leading-tight text-slate-950">{value}</b></span>
    </div>
  );
}

function NotificationRow({ label, value, icon: Icon, tone, badge = false }: { label: string; value: string; icon: LucideIcon; tone: Tone; badge?: boolean }) {
  return (
    <div className="grid grid-cols-[28px_1fr_auto] items-center gap-2 border-b border-slate-100 px-3 py-3 text-[12px] font-semibold last:border-b-0">
      <Icon className={`h-4 w-4 ${toneText[tone]}`} />
      <span className="text-slate-600">{label}</span>
      {badge ? <span className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-extrabold text-red-700">{value}</span> : <b className="text-right text-slate-700">{value}</b>}
    </div>
  );
}

function ConditionRow({ index, field, operator, value }: { index: number; field: string; operator: string; value: string }) {
  const [visible, setVisible] = useState(true);
  const [currentValue, setCurrentValue] = useState(value);
  if (!visible) return null;
  return (
    <div className="grid grid-cols-[32px_minmax(135px,1fr)_minmax(120px,.78fr)_minmax(135px,1fr)_36px] items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-300 bg-white text-[12px] font-extrabold text-slate-700">{index}</span>
      <SelectBox value={field} />
      <SelectBox value={operator} />
      <input value={currentValue} onChange={(event) => setCurrentValue(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
      <button onClick={() => setVisible(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600" aria-label="Delete condition"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

function SmallOutlineButton({ label }: { label: string }) {
  const [clicked, setClicked] = useState(false);
  return <button onClick={() => setClicked(true)} className={`h-8 rounded-lg border px-4 text-[12px] font-extrabold ${clicked ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-white text-blue-600 hover:border-orange-200 hover:text-orange-600"}`}>{clicked ? "Added" : `+ ${label}`}</button>;
}

function CheckTile({ label, checked = false }: { label: string; checked?: boolean }) {
  const [isChecked, setIsChecked] = useState(checked);
  return (
    <button onClick={() => setIsChecked(!isChecked)} className="flex min-h-10 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left text-[12px] font-semibold text-slate-700">
      <span className={`grid h-4 w-4 place-items-center rounded border ${isChecked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"}`}>{isChecked ? <Check className="h-3 w-3" /> : null}</span>
      {label}
    </button>
  );
}

function PreviewMetric({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  return (
    <div className="grid grid-cols-[28px_1fr] items-center gap-2 border-r border-slate-100 px-3 py-3 last:border-r-0">
      <Icon className={`h-4 w-4 ${toneText[tone]}`} />
      <span>
        <span className="block text-[11px] font-semibold text-slate-500">{label}</span>
        <b className="block text-[18px] leading-tight text-slate-950">{value}</b>
      </span>
    </div>
  );
}

function SampleRecord({ claim, provider, npi, status }: { claim: string; provider: string; npi: string; status: "Pass" | "Fail" }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_68px] gap-2 border-t border-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-700">
      <span>{claim}</span><span>{provider}</span><span>{npi}</span>
      <span className={`w-fit rounded-md border px-3 py-0.5 text-[11px] font-extrabold ${status === "Pass" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{status}</span>
    </div>
  );
}

function CreatePanel({ title, info = false, children }: { title: string; info?: boolean; children: React.ReactNode }) {
  return <section className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm"><h2 className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950">{title}{info ? <Info className="h-4 w-4 text-slate-400" /> : null}</h2><div className="mt-4">{children}</div></section>;
}

function SideAssetRow({ title, detail, icon: Icon, tone, action }: { title: string; detail: string; icon: LucideIcon; tone: Tone; action: string }) {
  const [used, setUsed] = useState(false);
  return <div className="grid grid-cols-[34px_1fr_auto] items-center gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0"><span className={`grid h-8 w-8 place-items-center rounded-lg border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><b className="block truncate text-[12px] text-slate-950">{title}</b><span className="block truncate text-[11px] font-medium text-slate-500">{detail}</span></span><button onClick={() => setUsed(!used)} className={`h-8 rounded-lg border px-3 text-[12px] font-extrabold ${used ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-800 hover:border-orange-200 hover:text-orange-600"}`}>{used ? (action === "Add" ? "Added" : "Used") : action}</button></div>;
}

function GuidanceList({ items }: { items: readonly string[] }) {
  return <div className="space-y-3">{items.map((item) => <div key={item} className="flex items-start gap-2 text-[12px] font-semibold leading-5 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{item}</span></div>)}</div>;
}

function ImpactTable({ rows }: { rows: readonly { label: string; value: string; icon: LucideIcon; tone: Tone }[] }) {
  return <div className="overflow-hidden rounded-[10px] border border-slate-200">{rows.map((row) => <div key={row.label} className="grid grid-cols-[34px_1fr_auto] items-center gap-2 border-b border-slate-100 px-3 py-3 last:border-b-0"><row.icon className={`h-4 w-4 ${toneText[row.tone]}`} /><span className="text-[12px] font-bold text-slate-600">{row.label}</span><b className={`text-right text-[12px] ${toneText[row.tone]}`}>{row.value}</b></div>)}</div>;
}

function AssetRow({ name, type, records, updated, included, icon: Icon }: { name: string; type: string; records: string; updated: string; included: boolean; icon: LucideIcon }) {
  const [isIncluded, setIsIncluded] = useState(included);
  return <div className="data-quality-assets-row grid border-t border-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-700"><span className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 text-purple-600" /><span className="truncate">{name}</span></span><span>{type}</span><span>{records}</span><span>{updated}</span><button onClick={() => setIsIncluded(!isIncluded)} className={`h-4 w-8 rounded-full p-0.5 ${isIncluded ? "bg-emerald-500" : "bg-slate-300"}`} aria-label={`Toggle ${name}`}><span className={`block h-3 w-3 rounded-full bg-white ${isIncluded ? "ml-4" : ""}`} /></button></div>;
}

function FilterRow({ field, operator, value }: { field: string; operator: string; value: string }) {
  const [visible, setVisible] = useState(true);
  const [currentValue, setCurrentValue] = useState(value);
  if (!visible) return null;
  return <div className="grid grid-cols-[28px_minmax(120px,.9fr)_66px_minmax(160px,1fr)_24px] items-center gap-2"><span className="grid h-7 place-items-center rounded-md border border-slate-200"><Filter className="h-3.5 w-3.5 text-slate-600" /></span><span className="rounded-md border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700">{field}</span><span className="rounded-md border border-slate-200 px-3 py-1.5 text-center text-[12px] font-semibold text-slate-700">{operator}</span><input value={currentValue} onChange={(event) => setCurrentValue(event.target.value)} className="rounded-md border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 outline-none focus:border-orange-300" /><button onClick={() => setVisible(false)} aria-label={`Remove ${field} filter`}><X className="h-4 w-4 text-slate-500" /></button></div>;
}

function ScanMetric({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  return <div className="grid grid-cols-[38px_1fr] items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-lg ${toneMap[tone]}`}><Icon className="h-5 w-5" /></span><span><span className="block text-[11px] font-semibold text-slate-500">{label}</span><b className="block text-[18px] leading-tight text-slate-950">{value}</b></span></div>;
}

function FooterActions({ left, secondary, primary, onSecondary, onPrimary }: { left: string; secondary: string; primary: string; onSecondary?: () => void; onPrimary?: () => void }) {
  const [saved, setSaved] = useState(false);
  return <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><button onClick={() => setSaved(true)} className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-5 text-[13px] font-extrabold shadow-sm ${saved ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-800 hover:border-orange-200 hover:text-orange-600"}`}><Save className="h-4 w-4" /> {saved ? "Draft Saved" : left}</button><div className="flex flex-wrap gap-3"><button onClick={onSecondary} className="h-11 rounded-lg border border-slate-200 bg-white px-8 text-[13px] font-extrabold text-slate-800 shadow-sm hover:border-orange-200 hover:text-orange-600">{secondary}</button><button onClick={onPrimary} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-orange-500 px-5 text-[13px] font-extrabold text-white shadow-sm orange-gradient">{primary} <ArrowRight className="h-4 w-4" /></button></div></div>;
}

function ModalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-8 backdrop-blur-[2px]">
      {children}
    </div>
  );
}

function PublishConfirmDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell>
      <section className="w-[min(860px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-7 pt-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[22px] font-extrabold leading-tight text-slate-950">Publish Provider Completeness rule set?</h2>
              <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[12px] font-extrabold text-emerald-700">Ready</span>
            </div>
            <p className="mt-2 text-[13px] font-medium leading-5 text-slate-600">Publishing will create version v1.0, activate scheduled daily scans, and notify configured owners for critical alerts.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close publish dialog"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4 px-7 py-5 min-[820px]:grid-cols-[1fr_280px]">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-[14px] font-extrabold text-slate-950">Publish Summary</h3>
            <div className="mt-3 grid gap-3 text-[12px] font-semibold text-slate-700 min-[620px]:grid-cols-2">
              <SummaryLine label="Rule set" value="Provider Completeness & Reference Validation" />
              <SummaryLine label="Version" value="v1.0" />
              <SummaryLine label="Dataset" value="Claims Bronze" />
              <SummaryLine label="Rules" value="4 active rules" />
              <SummaryLine label="Schedule" value="Daily" />
              <SummaryLine label="Approver" value="Data Steward" />
            </div>
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-[12px] font-semibold leading-5 text-orange-900">
              One recommendation remains non-blocking: consider elevating Provider reference integrity severity for downstream certification.
            </div>
          </div>
          <div className="space-y-3">
            <StatusCheck label="Required fields completed" />
            <StatusCheck label="Dataset scope selected" />
            <StatusCheck label="Logic test preview passed" />
            <StatusCheck label="Alert routing configured" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-7 py-4">
          <button onClick={onClose} className="h-11 rounded-lg border border-slate-200 bg-white px-7 text-[13px] font-extrabold text-slate-800 shadow-sm">Cancel</button>
          <button onClick={onConfirm} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-7 text-[13px] font-extrabold text-white orange-gradient">Confirm & Publish <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </ModalShell>
  );
}

function PublishingDialog({ onClose }: { onClose: () => void }) {
  const progress = [
    "Saving versioned rule set",
    "Registering quality template",
    "Activating scheduled scan",
    "Configuring alert routes",
    "Publishing governance metadata",
  ] as const;

  return (
    <ModalShell>
      <section className="w-[min(760px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-7 pt-6">
          <div>
            <h2 className="text-[22px] font-extrabold leading-tight text-slate-950">Publishing rule set</h2>
            <p className="mt-2 text-[13px] font-medium text-slate-600">Registering the rule set and enabling production controls.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close publishing dialog"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-7 pt-5">
          <div className="flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[76%] rounded-full orange-gradient" /></div>
            <span className="text-[13px] font-extrabold text-slate-600">76%</span>
          </div>
        </div>
        <div className="px-7 py-5">
          <div className="space-y-3 rounded-lg border border-slate-200 p-4">
            {progress.map((item, index) => (
              <div key={item} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 text-[12px] font-semibold text-slate-700">
                <span className={`grid h-6 w-6 place-items-center rounded-full ${index < 3 ? "bg-emerald-500 text-white" : index === 3 ? "bg-orange-50 text-orange-600" : "border border-slate-300 text-slate-300"}`}>{index < 3 ? <Check className="h-4 w-4" /> : index === 3 ? <Loader2 className="h-4 w-4 animate-spin" /> : null}</span>
                <span>{item}</span>
                <span className={index < 3 ? "text-emerald-600" : index === 3 ? "text-orange-600" : "text-slate-400"}>{index < 3 ? "Completed" : index === 3 ? "In progress" : "Pending"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end px-7 pb-6">
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-200 px-7 text-[13px] font-extrabold text-white"><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</button>
        </div>
      </section>
    </ModalShell>
  );
}

function PublishSuccessDialog({ onStay, onOpenStudio }: { onStay: () => void; onOpenStudio: () => void }) {
  return (
    <ModalShell>
      <section className="w-[min(620px,calc(100vw-32px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="px-8 pt-8 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600">
            <Rocket className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-[24px] font-extrabold leading-tight text-slate-950">Rule Set Published</h2>
          <p className="mx-auto mt-2 max-w-[460px] text-[13px] font-medium leading-5 text-slate-600">
            Provider Completeness & Reference Validation is now versioned, shared as a template, and scheduled for production scans.
          </p>
        </div>
        <div className="mx-8 mt-6 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <div className="grid gap-3 text-[12px] font-semibold text-slate-700 min-[560px]:grid-cols-2">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Version v1.0 published</span>
            <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-blue-600" /> Daily scan active</span>
            <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-orange-600" /> Alerts routed</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Governance metadata saved</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 px-8 py-5">
          <button onClick={onStay} className="h-11 rounded-lg border border-slate-200 bg-white px-7 text-[13px] font-extrabold text-slate-800 shadow-sm">Stay Here</button>
          <button onClick={onOpenStudio} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-7 text-[13px] font-extrabold text-white orange-gradient">Open Data Quality Studio <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </ModalShell>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{label}</span><b className="mt-1 block text-slate-950">{value}</b></div>;
}

function StatusCheck({ label }: { label: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[12px] font-extrabold text-slate-700"><span>{label}</span><Check className="h-4 w-4 text-emerald-600" /></div>;
}
