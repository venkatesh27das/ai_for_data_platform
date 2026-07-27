"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AssistantPanel,
  Button,
  Card,
  ConfirmationPanel,
  Field,
  FormSection,
  LoadingButton,
  LoadingState,
  MultiSelect,
  ProgressBar,
  ReviewChecklist,
  ScoreIndicator,
  StatusBadge,
  Stepper,
  Tabs,
  TagInput,
} from "@/src/components/ui";
import { useMockData } from "@/src/hooks/use-mock-data";
import type {
  Connector,
  KPI,
  ProjectDraft,
  ReadinessAssessment,
  Recommendation,
} from "@/src/models";
import { mockServices } from "@/src/services/mock-services";
import { useProjectDraftStore } from "@/src/stores/project-draft-store";
import {
  scopeSchema,
  useCaseSchema,
  type ScopeValues,
  type UseCaseValues,
} from "./schema";

export type WorkflowStep =
  | "use-case"
  | "scope"
  | "sources"
  | "success"
  | "governance"
  | "review"
  | "created";

const topSteps = [
  { key: "use-case", title: "Use Case & Objectives", subtitle: "Define the business intent" },
  { key: "scope", title: "Scope & Domains", subtitle: "Identify domain and entities" },
  { key: "sources", title: "Sources & Assets", subtitle: "Connect data and content" },
  { key: "success", title: "Success Criteria", subtitle: "Define quality and KPIs" },
  { key: "governance", title: "Governance & Access", subtitle: "Ownership and policies" },
  { key: "review", title: "Review & Create", subtitle: "Confirm and create project" },
] as const;

const stepRoutes: Record<Exclude<WorkflowStep, "created">, string> = {
  "use-case": "/projects/new/use-case",
  scope: "/projects/new/scope",
  sources: "/projects/new/sources",
  success: "/projects/new/success",
  governance: "/projects/new/governance",
  review: "/projects/new/review",
};

function WorkflowHeader({
  step,
  nextLabel,
  onNext,
  busy = false,
}: {
  step: Exclude<WorkflowStep, "created">;
  nextLabel: string;
  onNext?: () => void;
  busy?: boolean;
}) {
  const saveDraft = useProjectDraftStore((state) => state.saveDraft);
  const lastSavedAt = useProjectDraftStore((state) => state.lastSavedAt);
  const current = topSteps.findIndex((item) => item.key === step) + 1;
  return (
    <>
      <div className="workflow-title-row">
        <div>
          <Link href="/projects" className="back-link"><ArrowLeft size={14} /> Back to Projects</Link>
          <h1>New Knowledge Project</h1>
          <p>Define the purpose, scope and initial configuration for your knowledge product.</p>
        </div>
        <div className="workflow-title-row__actions">
          <Button variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
          <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
          {onNext ? <LoadingButton loading={busy} onClick={onNext}>{nextLabel} <ArrowRight size={16} /></LoadingButton> : null}
        </div>
      </div>
      {lastSavedAt ? <div className="draft-saved" role="status"><Check size={14} /> Draft saved locally</div> : null}
      <Stepper items={topSteps} current={current} />
    </>
  );
}

function WorkflowFooter({
  previous,
  nextLabel,
  onNext,
  busy = false,
}: {
  previous?: string;
  nextLabel: string;
  onNext: () => void;
  busy?: boolean;
}) {
  const saveDraft = useProjectDraftStore((state) => state.saveDraft);
  return (
    <footer className="workflow-footer">
      {previous ? <Link href={previous}><ArrowLeft size={15} /> Previous</Link> : <span />}
      <div><Button variant="secondary" onClick={saveDraft}>Save Draft</Button><LoadingButton loading={busy} onClick={onNext}>{nextLabel} <ArrowRight size={16} /></LoadingButton></div>
    </footer>
  );
}

function WorkflowRail({
  items,
  current = 0,
}: {
  items: { title: string; subtitle: string }[];
  current?: number;
}) {
  return (
    <aside className="workflow-rail">
      {items.map((item, index) => (
        <div className={index === current ? "workflow-rail__active" : ""} key={item.title}>
          <span>{index + 1}</span>
          <p><strong>{item.title}</strong><small>{item.subtitle}</small></p>
        </div>
      ))}
      <div className="workflow-rail__help"><strong>Need help?</strong><a href="#guide">View the project guide ↗</a></div>
    </aside>
  );
}

function WorkflowTip({ children }: { children: React.ReactNode }) {
  return <div className="workflow-tip"><span>💡</span><div><strong>Tip</strong><p>{children}</p></div></div>;
}

function Recommendations({
  loader,
  actionLabel,
}: {
  loader: () => Promise<Recommendation[]>;
  actionLabel?: string;
}) {
  const { data, loading } = useMockData(`recommendations-${actionLabel ?? "default"}`, loader);
  return loading ? <LoadingState rows={4} /> : <AssistantPanel recommendations={data ?? []} actionLabel={actionLabel} />;
}

function UseCaseStep() {
  const router = useRouter();
  const draft = useProjectDraftStore((state) => state.draft);
  const updateDraft = useProjectDraftStore((state) => state.updateDraft);
  const recommendationLoader = useCallback(
    () => mockServices.recommendations.getProjectRecommendations(draft),
    [draft],
  );
  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<UseCaseValues>({
      resolver: zodResolver(useCaseSchema),
      defaultValues: {
        projectName: draft.projectName,
        businessDomain: draft.businessDomain,
        primaryUseCase: draft.primaryUseCase,
        intendedConsumers: draft.intendedConsumers,
        businessProblem: draft.businessProblem,
        expectedOutcomes: draft.expectedOutcomes,
        questions: draft.questions,
        entities: draft.entities,
        relationships: draft.relationships,
      },
    });
  const submit = handleSubmit((values) => {
    updateDraft(values);
    router.push(stepRoutes.scope);
  });
  return (
    <div className="page workflow-page">
      <WorkflowHeader step="use-case" nextLabel="Save & Continue" onNext={() => void submit()} />
      <div className="workflow-layout">
        <form className="workflow-main" onSubmit={submit}>
          <FormSection title="1. Use Case & Objectives">
            <div className="form-grid form-grid--two">
              <div className="form-stack">
                <Field label="Project Name" required error={errors.projectName?.message}><input {...register("projectName")} aria-invalid={Boolean(errors.projectName)} /></Field>
                <Field label="Business Domain" required error={errors.businessDomain?.message}><select {...register("businessDomain")}><option>Procurement</option><option>Customer</option><option>Legal</option><option>Operations</option></select></Field>
                <Field label="Primary Use Case" required error={errors.primaryUseCase?.message}><textarea {...register("primaryUseCase")} /></Field>
                <MultiSelect label="Intended Consumers *" options={["AI Agent / Copilot", "Analytics Application", "RAG Application", "API / Integration", "Other"]} values={watch("intendedConsumers")} onChange={(values) => setValue("intendedConsumers", values, { shouldValidate: true })} />
                {errors.intendedConsumers ? <span className="field__error">{errors.intendedConsumers.message}</span> : null}
                <Field label="Business Problem / Opportunity" required error={errors.businessProblem?.message}><textarea {...register("businessProblem")} /></Field>
                <Field label="Expected Outcomes" required error={errors.expectedOutcomes?.message}><textarea {...register("expectedOutcomes")} /></Field>
              </div>
              <div className="form-stack">
                <TagInput label="Example Questions / Tasks" values={watch("questions")} onChange={(values) => setValue("questions", values, { shouldValidate: true })} placeholder="Add a business question and press Enter" />
                {errors.questions ? <span className="field__error">{errors.questions.message}</span> : null}
                <TagInput label="Critical Business Entities (Top 10)" values={watch("entities")} onChange={(values) => setValue("entities", values, { shouldValidate: true })} placeholder="Add entity" />
                {errors.entities ? <span className="field__error">{errors.entities.message}</span> : null}
                <TagInput label="Key Relationships (Examples)" values={watch("relationships")} onChange={(values) => setValue("relationships", values, { shouldValidate: true })} placeholder="Add relationship" />
              </div>
            </div>
          </FormSection>
          <Button type="submit">Save & Continue <ArrowRight size={16} /></Button>
        </form>
        <div className="workflow-aside"><Recommendations loader={recommendationLoader} actionLabel="Generate from use case" /><WorkflowTip>You can save this project as a draft and complete the remaining steps later.</WorkflowTip></div>
      </div>
    </div>
  );
}

function ScopeStep() {
  const router = useRouter();
  const draft = useProjectDraftStore((state) => state.draft);
  const updateDraft = useProjectDraftStore((state) => state.updateDraft);
  const recommendationLoader = useCallback(
    () => mockServices.recommendations.getProjectRecommendations(draft),
    [draft],
  );
  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<ScopeValues>({ resolver: zodResolver(scopeSchema), defaultValues: {
      primaryDomain: draft.primaryDomain,
      subDomains: draft.subDomains,
      businessFunctions: draft.businessFunctions,
      regions: draft.regions,
      expectedSystems: draft.expectedSystems,
      timeHorizon: draft.timeHorizon,
      updateFrequency: draft.updateFrequency,
      sensitivity: draft.sensitivity,
      scopeBoundary: draft.scopeBoundary,
      exclusions: draft.exclusions,
    } });
  const submit = handleSubmit((values) => { updateDraft(values); router.push(stepRoutes.sources); });
  return (
    <div className="page workflow-page">
      <WorkflowHeader step="scope" nextLabel="Next: Sources & Assets" onNext={() => void submit()} />
      <div className="workflow-layout">
        <form className="workflow-main" onSubmit={submit}>
          <FormSection title="2. Scope & Domains">
            <div className="form-grid form-grid--two">
              <div className="form-stack">
                <Field label="Primary Domain" required error={errors.primaryDomain?.message}><select {...register("primaryDomain")}><option>Procurement</option><option>Customer</option><option>Legal</option></select></Field>
                <TagInput label="Sub-domains in Scope *" values={watch("subDomains")} onChange={(values) => setValue("subDomains", values, { shouldValidate: true })} />
                <TagInput label="Business Functions Involved *" values={watch("businessFunctions")} onChange={(values) => setValue("businessFunctions", values, { shouldValidate: true })} />
                <Field label="Knowledge Scope Boundary" required error={errors.scopeBoundary?.message}><textarea {...register("scopeBoundary")} /></Field>
                <TagInput label="Critical Entity Classes *" values={draft.entities} onChange={(entities) => updateDraft({ entities })} />
                <TagInput label="Priority Relationship Types" values={draft.relationships} onChange={(relationships) => updateDraft({ relationships })} />
              </div>
              <div className="form-stack">
                <TagInput label="Geographies / Regions *" values={watch("regions")} onChange={(values) => setValue("regions", values, { shouldValidate: true })} />
                <MultiSelect label="Systems Expected In Scope *" options={["SAP Vendor Master", "CLM / Contracts Repository", "Supplier Portal", "Incident Management", "Product Hierarchy", "Invoice / AP System"]} values={watch("expectedSystems")} onChange={(values) => setValue("expectedSystems", values, { shouldValidate: true })} />
                <Field label="Time Horizon / Historical Coverage" required><select {...register("timeHorizon")}><option>12 months</option><option>24 months</option><option>36 months</option><option>Full history</option></select></Field>
                <Field label="Update Frequency Needed" required><select {...register("updateFrequency")}><option>Daily</option><option>Weekly</option><option>Real-time</option></select></Field>
                <Field label="Data Sensitivity" required><select {...register("sensitivity")}><option>Confidential</option><option>Internal</option><option>Restricted</option></select></Field>
                <Field label="Out of Scope / Exclusions" required error={errors.exclusions?.message}><textarea {...register("exclusions")} /></Field>
              </div>
            </div>
          </FormSection>
          <WorkflowFooter previous={stepRoutes["use-case"]} nextLabel="Next: Sources & Assets" onNext={() => void submit()} />
        </form>
        <div className="workflow-aside"><Recommendations loader={recommendationLoader} actionLabel="Generate suggested scope" /><WorkflowTip>A well-defined scope improves model accuracy and reduces noise.</WorkflowTip></div>
      </div>
    </div>
  );
}

const sourceSubsteps = [
  { title: "Select Sources", subtitle: "Connect data and content sources" },
  { title: "Discovered Assets", subtitle: "Review discovered assets" },
  { title: "Select Relevant Assets", subtitle: "Choose assets for this project" },
  { title: "Asset Classification", subtitle: "Classify and tag assets" },
  { title: "Refresh & Ingestion", subtitle: "Define refresh and ingestion" },
];

function SourcesStep() {
  const router = useRouter();
  const draft = useProjectDraftStore((state) => state.draft);
  const updateDraft = useProjectDraftStore((state) => state.updateDraft);
  const [activeTab, setActiveTab] = useState("All Connectors");
  const [error, setError] = useState("");
  const { data: connectors, loading } = useMockData("connectors", mockServices.discovery.listConnectors);
  const recommendationLoader = useCallback(
    () => mockServices.recommendations.getProjectRecommendations(draft),
    [draft],
  );
  const toggle = (connector: Connector) => {
    const selected = draft.selectedConnectorIds.includes(connector.id);
    updateDraft({ selectedConnectorIds: selected ? draft.selectedConnectorIds.filter((id) => id !== connector.id) : [...draft.selectedConnectorIds, connector.id] });
    setError("");
  };
  const next = () => {
    if (draft.selectedConnectorIds.length === 0) { setError("Select at least one source before continuing."); return; }
    router.push(stepRoutes.success);
  };
  return (
    <div className="page workflow-page">
      <WorkflowHeader step="sources" nextLabel="Next: Success Criteria" onNext={next} />
      <div className="workflow-layout workflow-layout--rail">
        <WorkflowRail items={sourceSubsteps} />
        <div className="workflow-main">
          <FormSection title="1. Select Sources" description="Connect enterprise systems, repositories and data platforms to discover assets.">
            <Tabs items={["All Connectors", "Databases", "Data Platforms", "Documents & Content", "APIs & Applications", "Catalogs & Governance"]} active={activeTab} onChange={setActiveTab} />
            <div className="connector-toolbar"><input aria-label="Search connectors" placeholder="Search connectors…" /><Button variant="secondary">Filter</Button></div>
            {loading ? <LoadingState /> : <div className="connector-table" role="table" aria-label="Available connectors">
              <div role="row" className="connector-table__header"><span>Connector</span><span>Type</span><span>Description</span><span>Connection Status</span><span>Actions</span></div>
              {(connectors ?? []).map((connector) => {
                const selected = draft.selectedConnectorIds.includes(connector.id);
                return <div role="row" className={selected ? "connector-table__selected" : ""} key={connector.id}><strong>{connector.name}</strong><span>{connector.type}</span><span>{connector.description}</span><StatusBadge status={connector.status} /><Button variant={selected ? "outline" : "secondary"} size="compact" onClick={() => toggle(connector)}>{selected ? "Selected" : connector.status === "Connected" ? "Configure" : "Connect"}</Button></div>;
              })}
            </div>}
            {error ? <p className="field__error" role="alert">{error}</p> : null}
          </FormSection>
          <WorkflowFooter previous={stepRoutes.scope} nextLabel="Next: Success Criteria" onNext={next} />
        </div>
        <div className="workflow-aside"><Recommendations loader={recommendationLoader} actionLabel="Auto-connect recommended sources" /><WorkflowTip>You can connect more sources later from the project workspace.</WorkflowTip></div>
      </div>
    </div>
  );
}

const successSubsteps = [
  { title: "KPI Framework", subtitle: "Define KPIs and targets" },
  { title: "Quality Criteria", subtitle: "Define quality dimensions" },
  { title: "Validation Approach", subtitle: "Set validation methods" },
  { title: "Acceptance Thresholds", subtitle: "Define pass/fail criteria" },
];

function SuccessStep() {
  const router = useRouter();
  const draft = useProjectDraftStore((state) => state.draft);
  const updateDraft = useProjectDraftStore((state) => state.updateDraft);
  const [error, setError] = useState("");
  const updateKpi = (id: string, patch: Partial<KPI>) => updateDraft({ kpis: draft.kpis.map((kpi) => kpi.id === id ? { ...kpi, ...patch } : kpi) });
  const next = () => {
    if (draft.kpis.length < 3) { setError("Define at least three KPIs before continuing."); return; }
    router.push(stepRoutes.governance);
  };
  return (
    <div className="page workflow-page">
      <WorkflowHeader step="success" nextLabel="Next: Governance & Access" onNext={next} />
      <div className="workflow-layout workflow-layout--rail">
        <WorkflowRail items={successSubsteps} />
        <div className="workflow-main">
          <FormSection title="1. KPI Framework" description="Define key performance indicators to measure the success of your knowledge product.">
            <div className="form-section__toolbar"><Button variant="secondary" size="compact" onClick={() => updateDraft({ kpis: [...draft.kpis, { id: `kpi-${Date.now()}`, name: "New KPI", definition: "Define a measurable knowledge outcome", target: 90, operator: ">=", unit: "%", method: "Automated", frequency: "Daily" }] })}><Plus size={14} /> Add KPI</Button></div>
            <div className="kpi-table">
              <div className="kpi-table__header"><span>KPI Name</span><span>Definition</span><span>Target</span><span>Unit</span><span>Measurement Method</span><span>Frequency</span><span>Actions</span></div>
              {draft.kpis.map((kpi) => <div key={kpi.id}><strong>{kpi.name}</strong><span>{kpi.definition}</span><input aria-label={`${kpi.name} target`} type="number" value={kpi.target} onChange={(event) => updateKpi(kpi.id, { target: Number(event.target.value) })} /><select aria-label={`${kpi.name} unit`} value={kpi.unit} onChange={(event) => updateKpi(kpi.id, { unit: event.target.value as KPI["unit"] })}><option>%</option><option>hrs</option><option>/5</option><option>ms</option></select><select aria-label={`${kpi.name} method`} value={kpi.method} onChange={(event) => updateKpi(kpi.id, { method: event.target.value })}><option>Automated</option><option>Human Validation</option><option>Benchmark Set</option><option>System Logs</option></select><select aria-label={`${kpi.name} frequency`} value={kpi.frequency} onChange={(event) => updateKpi(kpi.id, { frequency: event.target.value as KPI["frequency"] })}><option>Daily</option><option>Weekly</option><option>Monthly</option></select><button aria-label={`Delete ${kpi.name}`} onClick={() => updateDraft({ kpis: draft.kpis.filter((item) => item.id !== kpi.id) })}><Trash2 size={15} /></button></div>)}
            </div>
            {error ? <p className="field__error">{error}</p> : null}
          </FormSection>
          <div className="form-grid form-grid--two">
            <FormSection title="2. Overall Success Definition"><Field label="Overall Success Rule" required><select value={draft.overallSuccessRule} onChange={(event) => updateDraft({ overallSuccessRule: event.target.value })}><option>All KPIs must meet or exceed their targets</option><option>Critical KPIs must pass</option></select></Field><div className="inline-fields"><Field label="Minimum KPIs that must pass"><input type="number" defaultValue="90" /></Field><Field label="Evaluation Window"><select defaultValue="Last 30 days"><option>Last 30 days</option><option>Last 90 days</option></select></Field></div></FormSection>
            <FormSection title="3. Business Impact"><TagInput label="Expected Business Impact" values={["Reduce risk exposure", "Improve decision making", "Ensure compliance"]} onChange={() => undefined} /><div className="inline-fields"><Field label="Target ROI / Benefit"><input defaultValue="25%" /></Field><Field label="Time to Realize Value"><select defaultValue="6–12 months"><option>6–12 months</option><option>12–18 months</option></select></Field></div></FormSection>
          </div>
          <WorkflowFooter previous={stepRoutes.sources} nextLabel="Next: Governance & Access" onNext={next} />
        </div>
        <div className="workflow-aside"><AssistantPanel recommendations={[{ id: "kpi-user", title: "Add user adoption", detail: "Track usage impact alongside model quality.", tone: "ai" }, { id: "kpi-cost", title: "Track cost efficiency", detail: "Measure cost per successful knowledge query.", tone: "warning" }]} actionLabel="Suggest more KPIs" /><WorkflowTip>Good success criteria are specific, measurable, aligned and time-bound.</WorkflowTip><Card title="Preview"><dl className="summary-counts"><div><dt>KPIs Defined</dt><dd>{draft.kpis.length}</dd></div><div><dt>Quality Dimensions</dt><dd>5</dd></div><div><dt>Validation Methods</dt><dd>3</dd></div></dl></Card></div>
      </div>
    </div>
  );
}

const governanceSubsteps = [
  { title: "Ownership", subtitle: "Define owners and stewards" },
  { title: "Access Control", subtitle: "Manage roles and permissions" },
  { title: "Data Classification", subtitle: "Classify sensitivity and data types" },
  { title: "Policies & Compliance", subtitle: "Apply policies and standards" },
  { title: "Audit & Monitoring", subtitle: "Enable audit and monitoring" },
];

function GovernanceStep() {
  const router = useRouter();
  const draft = useProjectDraftStore((state) => state.draft);
  const updateDraft = useProjectDraftStore((state) => state.updateDraft);
  const [tab, setTab] = useState("Roles & Groups");
  const recommendationLoader = useCallback(() => mockServices.recommendations.getGovernanceRecommendations(draft), [draft]);
  const next = () => router.push(stepRoutes.review);
  return (
    <div className="page workflow-page">
      <WorkflowHeader step="governance" nextLabel="Next: Review & Create" onNext={next} />
      <div className="workflow-layout workflow-layout--rail">
        <WorkflowRail items={governanceSubsteps} current={1} />
        <div className="workflow-main">
          <FormSection title="2. Access Control" description="Define who can access, manage and consume this knowledge product and its assets.">
            <Tabs items={["Roles & Groups", "Permissions", "Row & Column Level Security", "Consumption Access"]} active={tab} onChange={setTab} />
            <div className="form-section__toolbar"><span><strong>Role Assignments</strong><small>Assign roles to users and groups for this project.</small></span><Button variant="secondary" size="compact"><Plus size={14} /> Add Role Assignment</Button></div>
            <div className="role-table">
              <div className="role-table__header"><span>Role</span><span>Type</span><span>Principals</span><span>Description</span><span>Access Level</span><span>Actions</span></div>
              {draft.roles.map((role) => <div key={role.id}><strong>{role.role}</strong><span>{role.type}</span><span>{role.principals}</span><span>{role.description}</span><StatusBadge status={role.accessLevel} tone={role.accessLevel === "Full Access" ? "ai" : role.accessLevel === "Read" ? "warning" : "info"} /><span className="row-actions"><button aria-label={`Edit ${role.role}`}><Pencil size={14} /></button><button aria-label={`Delete ${role.role}`} onClick={() => updateDraft({ roles: draft.roles.filter((item) => item.id !== role.id) })}><Trash2 size={14} /></button></span></div>)}
            </div>
          </FormSection>
          <FormSection title="Public / External Access" description="Control external access to published assets and APIs.">
            <label className="toggle-row"><span><strong>Public Access</strong><small>Allow public access to published assets</small></span><input type="checkbox" checked={draft.publicAccess} onChange={(event) => updateDraft({ publicAccess: event.target.checked })} /></label>
            <label className="toggle-row"><span><strong>API Access</strong><small>Allow external applications to access via API</small></span><input type="checkbox" checked={draft.apiAccess} onChange={(event) => updateDraft({ apiAccess: event.target.checked })} /></label>
            <Field label="Allowed Domains (Optional)"><input value={draft.allowedDomains} onChange={(event) => updateDraft({ allowedDomains: event.target.value })} /></Field>
          </FormSection>
          <WorkflowFooter previous={stepRoutes.success} nextLabel="Next: Review & Create" onNext={next} />
        </div>
        <div className="workflow-aside"><Recommendations loader={recommendationLoader} actionLabel="Run access review" /><Card title="Data Classification Summary"><div className="drawer-score"><ScoreIndicator score={62} size="large" label="Assets" /><dl><div><dt>Confidential</dt><dd>18</dd></div><div><dt>Internal</dt><dd>24</dd></div><div><dt>Public</dt><dd>20</dd></div></dl></div></Card><Card title="Policy Compliance"><strong className="large-success">92%</strong><ProgressBar value={92} /><dl className="summary-counts"><div><dt>Access Control</dt><dd>95%</dd></div><div><dt>Data Protection</dt><dd>90%</dd></div><div><dt>Audit & Monitoring</dt><dd>90%</dd></div></dl></Card></div>
      </div>
    </div>
  );
}

function SummaryRail({ draft }: { draft: ProjectDraft }) {
  return (
    <aside className="review-summary">
      <h2><FileCheck2 size={17} /> Project Summary</h2>
      <dl><div><dt>Project Name</dt><dd>{draft.projectName}</dd></div><div><dt>Domain</dt><dd>{draft.businessDomain}</dd></div><div><dt>Intended Consumers</dt><dd>{draft.intendedConsumers.join(", ")}</dd></div><div><dt>Primary Objective</dt><dd>{draft.primaryUseCase}</dd></div></dl>
      {[
        ["1. Use Case & Objectives", `${draft.questions.length} questions · ${draft.entities.length} entities`],
        ["2. Scope & Domains", `${draft.regions.join(", ")} · ${draft.timeHorizon}`],
        ["3. Sources & Assets", `${draft.selectedConnectorIds.length} sources · ${draft.selectedAssetCount} selected assets`],
        ["4. Success Criteria", `${draft.kpis.length} KPIs defined`],
        ["5. Governance & Access", `${draft.roles.length} role assignments · ${draft.classification}`],
      ].map(([title, detail]) => <div className="review-summary__section" key={title}><strong>{title}</strong><button aria-label={`Edit ${title}`}>Edit</button><p>{detail}</p></div>)}
    </aside>
  );
}

function ReviewStep() {
  const router = useRouter();
  const draft = useProjectDraftStore((state) => state.draft);
  const markCreated = useProjectDraftStore((state) => state.markCreated);
  const [assessment, setAssessment] = useState<ReadinessAssessment | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { void mockServices.readiness.validateProjectReadiness(draft).then(setAssessment); }, [draft]);
  const createProject = async () => {
    if (!assessment?.ready) return;
    setBusy(true);
    const result = await mockServices.projects.create(draft);
    markCreated(result.id);
    router.push("/projects/new/created");
  };
  return (
    <div className="page workflow-page">
      <WorkflowHeader step="review" nextLabel="Create Project" onNext={() => void createProject()} busy={busy} />
      <div className="review-layout">
        <SummaryRail draft={draft} />
        <div className="review-main">
          <Card title="Readiness Check">
            {!assessment ? <LoadingState rows={5} /> : <>
              <div className={assessment.ready ? "readiness-banner readiness-banner--ready" : "readiness-banner readiness-banner--warning"}><CheckCircle2 size={30} /><div><strong>{assessment.ready ? "Project is ready to create" : "Project requires attention"}</strong><p>{assessment.ready ? "All critical validations passed. Your project meets readiness requirements." : "Resolve required fields before creating this project."}</p></div><ScoreIndicator score={assessment.score} size="large" label="Readiness" /></div>
              <ReviewChecklist checks={assessment.checks} />
            </>}
          </Card>
          <Card title="What will be created"><div className="manifest-grid">{[["Knowledge product", draft.projectName], ["Connected sources", String(draft.selectedConnectorIds.length)], ["Selected assets", String(draft.selectedAssetCount)], ["Estimated entity classes", String(draft.entities.length)], ["Estimated relationship types", String(draft.relationships.length)], ["Test scenarios configured", String(draft.questions.length)], ["APIs / interfaces", "Context API, Graph Query, Search API"], ["Graph assets", "Domain Graph, Evidence Graph, Semantic Graph"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></Card>
          <Card className="ai-summary"><h2><Sparkles size={18} /> AI-generated setup summary</h2><p>The platform will build {draft.projectName} by integrating {draft.selectedConnectorIds.length} enterprise sources and curating {draft.selectedAssetCount} high-value assets across {draft.businessDomain.toLowerCase()}, contracts, financials and operational performance. The graph will include {draft.entities.length} entity classes and {draft.relationships.length} relationship types, exposed through governed query and retrieval interfaces.</p></Card>
          <div className="post-create-options"><label><input type="checkbox" defaultChecked /> Start discovery and build immediately after creation</label><label><input type="checkbox" defaultChecked /> Run baseline validation tests after first build</label></div>
        </div>
        <div className="workflow-aside"><AssistantPanel recommendations={[{ id: "final-classify", title: "Classify two remaining assets", detail: "Complete the classification review before publication.", tone: "warning" }, { id: "final-thresholds", title: "Add financial risk thresholds", detail: "Include them during baseline validation.", tone: "ai" }, { id: "final-refresh", title: "Start with daily refresh", detail: "Move critical event domains to near-real-time later.", tone: "success" }]} actionLabel="Resolve remaining warnings" /><Card title="Outcome Summary"><dl className="summary-counts"><div><dt>Connected Sources</dt><dd>{draft.selectedConnectorIds.length}</dd></div><div><dt>Selected Assets</dt><dd>{draft.selectedAssetCount}</dd></div><div><dt>KPIs Defined</dt><dd>{draft.kpis.length}</dd></div><div><dt>Policies Applied</dt><dd>{draft.policies.length}</dd></div></dl></Card></div>
      </div>
      <WorkflowFooter previous={stepRoutes.governance} nextLabel="Create Project" onNext={() => void createProject()} busy={busy} />
    </div>
  );
}

function CreatedStep() {
  const draft = useProjectDraftStore((state) => state.draft);
  const createdProjectId = useProjectDraftStore((state) => state.createdProjectId) ?? "KPJ-2025-0007";
  return (
    <div className="page created-page">
      <div className="created-page__main">
        <div className="created-title"><h1>Project Created Successfully! 🎉</h1><p>Your knowledge project has been created and is ready to begin.</p></div>
        <Card className="created-summary">
          <div className="created-summary__identity"><span className="success-orb"><Check size={38} /></span><div><h2>{draft.projectName} <StatusBadge status="Active" /></h2><p>Project ID: {createdProjectId} · Created today by Akhil Kumar</p></div></div>
          <div className="created-metrics">{[["Domain", draft.businessDomain], ["Assets", `${draft.selectedAssetCount} Selected`], ["Entity Classes", `${draft.entities.length} Estimated`], ["Relationships", `${draft.relationships.length} Estimated`], ["Readiness Score", "92 / 100"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          <h2>What&apos;s Next?</h2><p>Kickstart your project by running the following recommended actions.</p>
          <div className="next-action-grid">{[["Ingest New Data", "Schedule data ingestion or connect new sources.", "Ingest Data"], ["Run Quality Assessment", "Assess data and knowledge quality.", "Run Assessment"], ["Explore Knowledge Assets", "Browse discovered entities and relationships.", "Explore Assets"], ["Publish & Serve", "Publish this knowledge graph for applications.", "Publish Project"]].map(([title, detail, action]) => <article key={title}><span><Sparkles size={19} /></span><h3>{title}</h3><p>{detail}</p><Button variant="outline" size="compact">{action}</Button></article>)}</div>
        </Card>
        <Card title="Project Overview"><dl className="project-overview"><div><dt>Project Name</dt><dd>{draft.projectName}</dd></div><div><dt>Created By</dt><dd>Akhil Kumar</dd></div><div><dt>Project ID</dt><dd>{createdProjectId}</dd></div><div><dt>Status</dt><dd><StatusBadge status="Active" /></dd></div><div><dt>Business Domain</dt><dd>{draft.businessDomain}</dd></div><div><dt>Current Phase</dt><dd>Data Ingestion</dd></div><div><dt>Description</dt><dd>{draft.primaryUseCase}</dd></div><div><dt>Next Milestone</dt><dd>First Quality Assessment</dd></div></dl></Card>
      </div>
      <aside className="created-page__aside">
        <ConfirmationPanel title="Your project is live!" description="You can configure settings, assets and governance from the project dashboard."><Link className="button button--primary button--default full-width" href={`/projects/${createdProjectId}`}>Open Project Dashboard</Link><Link className="button button--secondary button--default full-width" href="/projects">View All Projects</Link></ConfirmationPanel>
        <Card title="Next Steps">{["Set up data ingestion schedule", "Invite team members", "Configure alerts", "Review governance policies"].map((item) => <Link className="next-step-link" href={`/projects/${createdProjectId}`} key={item}><CheckCircle2 size={17} />{item}<ArrowRight size={15} /></Link>)}</Card>
        <Card title="Need Help?"><p>Visit our documentation or contact support for help.</p><a className="text-link" href="#documentation">Documentation ↗</a></Card>
      </aside>
    </div>
  );
}

export function ProjectWorkflow({ step }: { step: WorkflowStep }) {
  if (step === "use-case") return <UseCaseStep />;
  if (step === "scope") return <ScopeStep />;
  if (step === "sources") return <SourcesStep />;
  if (step === "success") return <SuccessStep />;
  if (step === "governance") return <GovernanceStep />;
  if (step === "review") return <ReviewStep />;
  return <CreatedStep />;
}
