import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Cloud,
  Database,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Folder,
  GitBranch,
  GitFork,
  History,
  HeartPulse,
  Link as LinkIcon,
  ListChecks,
  Server,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  Users,
  Workflow,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import DemoFlowModal, { type DemoFlow } from "../components/common/DemoFlowModal";
import EntityDrawer from "../components/common/EntityDrawer";
import type { DrawerEntity } from "../types";

type JourneyStatus = "In Design" | "Running" | "Pending Review" | "Awaiting Approval" | "Complete";
type JourneyHealth = "Healthy" | "At Risk" | "Blocked";
type JourneyType = "Structured" | "Unstructured" | "Hybrid";
type StageState = "Complete" | "Running" | "Pending Review" | "Not Started";
type Panel = "help" | "configuration" | "logs" | "artifact" | "approvals" | null;
type DetailTab = "Overview" | "Pipeline" | "Artifacts" | "Approvals" | "Runs & Logs";

interface JourneyOverview {
  headline: string;
  healthScore: number;
  dataAssets: { input: number; output: number };
  recordsProcessed: string;
  qualityRules: number;
  lastRun: string;
  upcomingMilestones: Array<{ title: string; detail: string; date: string; note: string }>;
  stakeholders: Array<{ initials: string; role: string; name: string }>;
  platforms: string[];
  recommendedActions: string[];
  risks: string[];
  recentActivity: Array<{ title: string; detail: string; time: string; level: "Info" | "Warning" | "Success" }>;
}

interface JourneyStage {
  title: string;
  state: StageState;
  progress: Array<{ item: string; status: string }>;
  artifacts: Array<{ name: string; tag: string; type: string; updated: string }>;
  summary: Array<[string, string]>;
  logs: Array<{ time: string; message: string; level: "Info" | "Warning" | "Error" }>;
}

interface JourneyRecord {
  id: string;
  drawerId: string;
  name: string;
  type: JourneyType;
  domain: string;
  owner: string;
  initials: string;
  status: JourneyStatus;
  health: JourneyHealth;
  progress: number;
  updated: string;
  startDate: string;
  targetDate: string;
  cloud: string;
  favorite: boolean;
  executionTargets: Array<{ label: string; value: string }>;
  approvals: Array<{ title: string; status: "Pending" | "Approved"; owner: string; due: string }>;
  stages: JourneyStage[];
  overview: JourneyOverview;
}

const stageTitles = [
  "Source Onboarding & Ingestion",
  "Storage, Processing & Extraction",
  "Data Modeling & Transformation",
  "Data Quality & Validation",
  "Data Productization & Publishing",
  "Context & Semantic Enablement",
  "Consumption, Access & Reuse",
] as const;

const baseStages = (runningIndex: number, pendingIndex = 3): JourneyStage[] => stageTitles.map((title, index) => {
  const state: StageState = index < runningIndex ? "Complete" : index === runningIndex ? "Running" : index === pendingIndex ? "Pending Review" : "Not Started";
  return {
    title,
    state,
    progress: [
      { item: index === 0 ? "Source connection" : "Stage setup", status: index < runningIndex ? "Complete" : index === runningIndex ? "In Progress" : "Pending" },
      { item: index === 1 ? "Extraction rules" : "Policy validation", status: index < runningIndex ? "Complete" : index === runningIndex ? "In Progress" : "Pending" },
      { item: index === 2 ? "Transformation logic" : "Owner review", status: index < runningIndex ? "Complete" : "Pending" },
      { item: "Output validation", status: index < runningIndex ? "Complete" : "Pending" },
    ],
    artifacts: [
      { name: `${title.split(" ")[0]} workbook`, tag: index < runningIndex ? "v1.2" : "Draft", type: "Document", updated: index < runningIndex ? "Today" : "Pending" },
      { name: `${title.split(" ")[0]} run notes`, tag: state, type: "Runbook", updated: state === "Not Started" ? "Not created" : "2h ago" },
    ],
    summary: [
      ["Input Datasets", String(8 + index)],
      ["Output Datasets", String(Math.max(2, 7 - index))],
      ["Quality Rules", String(12 + index * 3)],
      ["Records Processed", index <= runningIndex ? `${14 + index}.7 M` : "Pending"],
      ["Last Run", index <= runningIndex ? "Today 10:25 AM" : "Not started"],
      ["Next Run", index <= runningIndex ? "Today 02:00 PM" : "After approval"],
    ],
    logs: [
      { time: "10:25 AM", message: `${title} validation started`, level: "Info" },
      { time: "10:31 AM", message: state === "Pending Review" ? "Approval checkpoint waiting on data steward" : "Rules executed successfully", level: state === "Pending Review" ? "Warning" : "Info" },
      { time: "10:42 AM", message: state === "Not Started" ? "Stage queued after upstream completion" : "Artifacts synchronized to workspace", level: "Info" },
    ],
  };
});

const initialJourneys: JourneyRecord[] = [
  {
    id: "claims-trusted",
    drawerId: "jr-claims-modernization",
    name: "Claims to Trusted Data Product",
    type: "Hybrid",
    domain: "Claims",
    owner: "Priya Nair",
    initials: "PN",
    status: "Running",
    health: "Healthy",
    progress: 48,
    updated: "Jun 06, 2025 10:30 AM",
    startDate: "May 20, 2025",
    targetDate: "Jun 30, 2025",
    cloud: "Azure",
    favorite: true,
    executionTargets: [
      { label: "Execution Target", value: "Azure" },
      { label: "Compute", value: "Azure Databricks (Photon)" },
      { label: "Orchestration", value: "Azure Data Factory" },
      { label: "Repository", value: "Azure DevOps - claims-data-jobs" },
    ],
    approvals: [
      { title: "Transformation stage checkpoint", status: "Approved", owner: "Claims Data Office", due: "Completed" },
      { title: "Data quality exception", status: "Pending", owner: "Priya Nair", due: "Due tomorrow" },
      { title: "Product publication review", status: "Pending", owner: "Governance", due: "Due Jun 24" },
    ],
    stages: baseStages(2, 3),
    overview: {
      headline: "This journey ingests, transforms, and publishes trusted claims data as a governed, high-quality data product. The team is modeling claim facts, member/provider relationships, and policy rules for downstream analytics and operations.",
      healthScore: 92,
      dataAssets: { input: 10, output: 5 },
      recordsProcessed: "16.7M",
      qualityRules: 18,
      lastRun: "Today 10:25 AM",
      upcomingMilestones: [
        { title: "Data Quality & Validation Review", detail: "Stage 4 Review", date: "Jun 16, 2025", note: "4 days left" },
        { title: "Publishing Readiness Check", detail: "Stage 5 Review", date: "Jun 23, 2025", note: "11 days left" },
        { title: "Go-Live Target", detail: "Journey Go-Live", date: "Jun 30, 2025", note: "18 days left" },
      ],
      stakeholders: [
        { initials: "PN", role: "Owner", name: "Priya Nair" },
        { initials: "RS", role: "Engineering Lead", name: "Rahul Singh" },
        { initials: "AM", role: "Business Reviewer", name: "Anjali Mehta" },
        { initials: "SI", role: "Data Steward", name: "Sneha Iyer" },
      ],
      platforms: ["Azure", "Azure Databricks (Photon)", "Azure Data Factory", "Azure DevOps", "Claims semantic layer"],
      recommendedActions: ["Complete transformation logic", "Review pending validation checks", "Resolve 2 pending approvals", "Prepare stage 4 review package"],
      risks: ["Pending validation checks could impact stage 4 timeline.", "2 approval bottlenecks in current stage.", "Dependency on claims semantic layer readiness."],
      recentActivity: [
        { title: "Transformation job 'claims_model_transformation_v2' started", detail: "Data Factory Pipeline · Priya Nair", time: "Today 10:25 AM", level: "Warning" },
        { title: "Policy validation ruleset updated", detail: "Policy Engine · Rahul Singh", time: "Today 09:45 AM", level: "Success" },
        { title: "Storage extraction job completed", detail: "Data Factory Pipeline · System", time: "Today 08:15 AM", level: "Success" },
        { title: "Approval requested for stage 3 deliverables", detail: "Priya Nair · Requested", time: "Yesterday 04:12 PM", level: "Info" },
      ],
    },
  },
  {
    id: "provider-360",
    drawerId: "jr-provider-ingestion",
    name: "Provider 360 Ingestion",
    type: "Structured",
    domain: "Provider Mgmt",
    owner: "Rahul Singh",
    initials: "RS",
    status: "Running",
    health: "Healthy",
    progress: 62,
    updated: "Jun 06, 2025 09:15 AM",
    startDate: "May 14, 2025",
    targetDate: "Jun 18, 2025",
    cloud: "AWS",
    favorite: false,
    executionTargets: [
      { label: "Execution Target", value: "AWS" },
      { label: "Compute", value: "EMR Serverless" },
      { label: "Orchestration", value: "MWAA" },
      { label: "Repository", value: "GitHub - provider-ingestion" },
    ],
    approvals: [
      { title: "Schema change approval", status: "Pending", owner: "Sneha Iyer", due: "Due today" },
      { title: "Source access review", status: "Approved", owner: "Security", due: "Completed" },
    ],
    stages: baseStages(1, 2),
    overview: {
      headline: "This journey consolidates roster, credentialing, network, and facility feeds into a Provider 360 ingestion foundation. Current work is focused on extraction rules, schema drift handling, and dependable daily loads.",
      healthScore: 94,
      dataAssets: { input: 8, output: 4 },
      recordsProcessed: "8.9M",
      qualityRules: 21,
      lastRun: "Today 09:05 AM",
      upcomingMilestones: [
        { title: "Schema Drift Review", detail: "Stage 3 Entry Check", date: "Jun 10, 2025", note: "2 days left" },
        { title: "Provider Golden Record Preview", detail: "Stage 4 Validation", date: "Jun 14, 2025", note: "6 days left" },
        { title: "Go-Live Target", detail: "Journey Go-Live", date: "Jun 18, 2025", note: "10 days left" },
      ],
      stakeholders: [
        { initials: "RS", role: "Owner", name: "Rahul Singh" },
        { initials: "SI", role: "Data Steward", name: "Sneha Iyer" },
        { initials: "PN", role: "Platform Lead", name: "Priya Nair" },
        { initials: "AM", role: "Network Reviewer", name: "Anjali Mehta" },
      ],
      platforms: ["AWS", "EMR Serverless", "MWAA", "GitHub provider-ingestion", "Provider directory"],
      recommendedActions: ["Approve roster schema change", "Finalize NPI and taxonomy match rules", "Reconcile facility affiliation deltas", "Promote extraction template to stage 3"],
      risks: ["Schema changes from two network feeds need steward approval.", "Credentialing source has intermittent freshness delays.", "Duplicate NPI matches require reviewer confirmation."],
      recentActivity: [
        { title: "Provider roster ingestion completed", detail: "MWAA DAG · System", time: "Today 09:05 AM", level: "Success" },
        { title: "Schema drift detected in credentialing feed", detail: "Quality Monitor · Sneha Iyer", time: "Today 08:40 AM", level: "Warning" },
        { title: "Facility affiliation rules updated", detail: "EMR Serverless · Rahul Singh", time: "Yesterday 06:10 PM", level: "Success" },
        { title: "Source access review closed", detail: "Security · Approved", time: "Yesterday 02:25 PM", level: "Success" },
      ],
    },
  },
  {
    id: "sales-mart",
    drawerId: "jr-claims-modernization",
    name: "Sales Performance Mart",
    type: "Structured",
    domain: "Sales",
    owner: "Anjali Mehta",
    initials: "AM",
    status: "Pending Review",
    health: "At Risk",
    progress: 30,
    updated: "Jun 06, 2025 08:45 AM",
    startDate: "May 28, 2025",
    targetDate: "Jul 05, 2025",
    cloud: "Snowflake",
    favorite: false,
    executionTargets: [
      { label: "Execution Target", value: "Snowflake" },
      { label: "Compute", value: "Warehouse: SALES_XL" },
      { label: "Orchestration", value: "Airflow" },
      { label: "Repository", value: "GitHub - sales-mart" },
    ],
    approvals: [{ title: "Quality review", status: "Pending", owner: "Sales Data Office", due: "Overdue" }],
    stages: baseStages(3, 3),
    overview: {
      headline: "This journey builds a governed sales performance mart for territory, quota, pipeline, and bookings analysis. The mart is in quality review while revenue attribution and late-arriving opportunity updates are being reconciled.",
      healthScore: 78,
      dataAssets: { input: 7, output: 3 },
      recordsProcessed: "4.2M",
      qualityRules: 27,
      lastRun: "Today 08:45 AM",
      upcomingMilestones: [
        { title: "Quality Exception Review", detail: "Stage 4 Review", date: "Jun 07, 2025", note: "Overdue" },
        { title: "Finance Reconciliation Sign-off", detail: "Revenue Check", date: "Jun 19, 2025", note: "12 days left" },
        { title: "Go-Live Target", detail: "Journey Go-Live", date: "Jul 05, 2025", note: "28 days left" },
      ],
      stakeholders: [
        { initials: "AM", role: "Owner", name: "Anjali Mehta" },
        { initials: "RS", role: "Engineering Lead", name: "Rahul Singh" },
        { initials: "PN", role: "Finance Reviewer", name: "Priya Nair" },
        { initials: "SI", role: "Data Steward", name: "Sneha Iyer" },
      ],
      platforms: ["Snowflake", "Warehouse SALES_XL", "Airflow", "GitHub sales-mart", "Power BI semantic model"],
      recommendedActions: ["Close overdue quality review", "Resolve quota hierarchy mismatches", "Validate revenue attribution exceptions", "Send finance reconciliation packet"],
      risks: ["Quality review is overdue and holding stage progression.", "Quota hierarchy updates changed territory rollups.", "Revenue attribution exceptions could affect executive dashboard totals."],
      recentActivity: [
        { title: "Opportunity snapshot mart refreshed", detail: "Airflow · System", time: "Today 08:45 AM", level: "Success" },
        { title: "Revenue attribution rule failed threshold", detail: "Snowflake Task · Anjali Mehta", time: "Today 08:12 AM", level: "Warning" },
        { title: "Quota hierarchy override uploaded", detail: "Sales Ops · Priya Nair", time: "Yesterday 05:35 PM", level: "Info" },
        { title: "Quality review reminder sent", detail: "Sales Data Office · Pending", time: "Yesterday 03:20 PM", level: "Warning" },
      ],
    },
  },
  {
    id: "customer-360",
    drawerId: "jr-customer-docs",
    name: "Customer 360 Data Product",
    type: "Hybrid",
    domain: "Customer 360",
    owner: "Rohan Mehta",
    initials: "RM",
    status: "Awaiting Approval",
    health: "Healthy",
    progress: 70,
    updated: "Jun 05, 2025 04:00 PM",
    startDate: "May 04, 2025",
    targetDate: "Jun 21, 2025",
    cloud: "Azure",
    favorite: true,
    executionTargets: [
      { label: "Execution Target", value: "Azure" },
      { label: "Compute", value: "Databricks SQL" },
      { label: "Orchestration", value: "ADF" },
      { label: "Repository", value: "Azure DevOps - customer-360" },
    ],
    approvals: [
      { title: "Publication approval", status: "Pending", owner: "Customer Data Office", due: "Due today" },
      { title: "Privacy review", status: "Approved", owner: "Security", due: "Completed" },
    ],
    stages: baseStages(4, 4),
    overview: {
      headline: "This journey publishes a Customer 360 data product that blends profile, policy, consent, engagement, and support signals. The product is packaged and awaiting publication approval for certified consumption.",
      healthScore: 90,
      dataAssets: { input: 12, output: 6 },
      recordsProcessed: "22.4M",
      qualityRules: 34,
      lastRun: "Yesterday 04:00 PM",
      upcomingMilestones: [
        { title: "Publication Approval", detail: "Stage 5 Gate", date: "Jun 07, 2025", note: "Due today" },
        { title: "Semantic Model Sync", detail: "Stage 6 Enablement", date: "Jun 14, 2025", note: "7 days left" },
        { title: "Go-Live Target", detail: "Journey Go-Live", date: "Jun 21, 2025", note: "14 days left" },
      ],
      stakeholders: [
        { initials: "RM", role: "Owner", name: "Rohan Mehta" },
        { initials: "PN", role: "Privacy Lead", name: "Priya Nair" },
        { initials: "AM", role: "Business Reviewer", name: "Anjali Mehta" },
        { initials: "SI", role: "Data Steward", name: "Sneha Iyer" },
      ],
      platforms: ["Azure", "Databricks SQL", "Azure Data Factory", "Azure DevOps", "Customer 360 semantic model"],
      recommendedActions: ["Approve publication package", "Confirm consent masking policy", "Schedule semantic model sync", "Notify analytics consumers"],
      risks: ["Publication approval is required before certified release.", "Consent policy mapping must stay aligned with privacy review.", "Semantic sync window may collide with support analytics refresh."],
      recentActivity: [
        { title: "Customer product package generated", detail: "Databricks SQL · Rohan Mehta", time: "Yesterday 04:00 PM", level: "Success" },
        { title: "Privacy scan completed", detail: "Security · Approved", time: "Yesterday 02:18 PM", level: "Success" },
        { title: "Consent masking policy attached", detail: "Policy Engine · Priya Nair", time: "Yesterday 01:40 PM", level: "Info" },
        { title: "Publication approval requested", detail: "Customer Data Office · Pending", time: "Jun 05 04:00 PM", level: "Warning" },
      ],
    },
  },
  {
    id: "provider-contract-nlp",
    drawerId: "jr-provider-ingestion",
    name: "Provider Contract Clause Extraction",
    type: "Unstructured",
    domain: "Provider Mgmt",
    owner: "Sneha Iyer",
    initials: "SI",
    status: "In Design",
    health: "Healthy",
    progress: 12,
    updated: "Jun 04, 2025 01:10 PM",
    startDate: "Jun 10, 2025",
    targetDate: "Jul 25, 2025",
    cloud: "Databricks",
    favorite: false,
    executionTargets: [
      { label: "Execution Target", value: "Databricks" },
      { label: "Compute", value: "Serverless SQL + Vector Search" },
      { label: "Orchestration", value: "Databricks Workflows" },
      { label: "Repository", value: "GitHub - contract-ai" },
    ],
    approvals: [{ title: "Design review", status: "Pending", owner: "Procurement", due: "Due Jun 12" }],
    stages: baseStages(0, 1),
    overview: {
      headline: "This journey designs an unstructured pipeline that extracts reimbursement, termination, renewal, and compliance clauses from provider contracts. The team is defining the document pattern, vector index, and review controls before build starts.",
      healthScore: 88,
      dataAssets: { input: 5, output: 2 },
      recordsProcessed: "1.1K docs",
      qualityRules: 12,
      lastRun: "Not started",
      upcomingMilestones: [
        { title: "Design Review", detail: "Stage 1 Gate", date: "Jun 12, 2025", note: "2 days after start" },
        { title: "Clause Taxonomy Freeze", detail: "Extraction Scope", date: "Jun 20, 2025", note: "10 days after start" },
        { title: "Go-Live Target", detail: "Journey Go-Live", date: "Jul 25, 2025", note: "45 days left" },
      ],
      stakeholders: [
        { initials: "SI", role: "Owner", name: "Sneha Iyer" },
        { initials: "RS", role: "AI Engineering Lead", name: "Rahul Singh" },
        { initials: "PN", role: "Compliance Reviewer", name: "Priya Nair" },
        { initials: "AM", role: "Procurement Lead", name: "Anjali Mehta" },
      ],
      platforms: ["Databricks", "Serverless SQL", "Vector Search", "GitHub contract-ai", "Contract repository"],
      recommendedActions: ["Complete design review checklist", "Confirm clause taxonomy", "Select gold standard sample contracts", "Define human review thresholds"],
      risks: ["Design approval is needed before document ingestion starts.", "Clause taxonomy gaps may reduce extraction precision.", "Gold standard samples must cover regional contract variants."],
      recentActivity: [
        { title: "Design workspace created", detail: "Databricks Workflows · Sneha Iyer", time: "Jun 04 01:10 PM", level: "Info" },
        { title: "Contract repository access requested", detail: "Procurement · Pending", time: "Jun 04 12:40 PM", level: "Warning" },
        { title: "Initial clause taxonomy drafted", detail: "AI Engineering · Rahul Singh", time: "Jun 03 05:15 PM", level: "Info" },
        { title: "Design review scheduled", detail: "Procurement · Due Jun 12", time: "Jun 03 03:00 PM", level: "Info" },
      ],
    },
  },
];

const cloudOptions = ["Multi-Cloud", "AWS", "Azure", "GCP", "Snowflake", "Databricks"];
const dateOptions = ["Last 7 days", "Last 30 days", "This month", "This quarter", "Custom range"];
const toneMap: Record<string, string> = {
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
};

export default function DataJourney() {
  const [journeys, setJourneys] = useState<JourneyRecord[]>(initialJourneys);
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const [flow, setFlow] = useState<DemoFlow | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(initialJourneys[0].id);
  const [detailJourneyId, setDetailJourneyId] = useState<string | null>(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(2);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cloudFilter, setCloudFilter] = useState("Multi-Cloud");
  const [dateRange, setDateRange] = useState("May 07, 2025 - Jun 06, 2025");
  const [page, setPage] = useState(1);
  const [artifact, setArtifact] = useState<JourneyStage["artifacts"][number] | null>(null);
  const pageSize = 5;

  const domains = useMemo(() => Array.from(new Set(journeys.map((journey) => journey.domain))), [journeys]);
  const owners = useMemo(() => Array.from(new Set(journeys.map((journey) => journey.owner))), [journeys]);

  const filtered = useMemo(() => {
    return journeys.filter((journey) => {
      const query = [journey.name, journey.type, journey.domain, journey.owner, journey.status, journey.health, journey.cloud].join(" ").toLowerCase();
      return (
        query.includes(search.toLowerCase()) &&
        (!typeFilter || journey.type === typeFilter) &&
        (!domainFilter || journey.domain === domainFilter) &&
        (!ownerFilter || journey.owner === ownerFilter) &&
        (!statusFilter || journey.status === statusFilter) &&
        (cloudFilter === "Multi-Cloud" || journey.cloud === cloudFilter)
      );
    });
  }, [cloudFilter, domainFilter, journeys, ownerFilter, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected = journeys.find((journey) => journey.id === selectedId) ?? filtered[0] ?? journeys[0];
  const selectedStage = selected.stages[Math.min(selectedStageIndex, selected.stages.length - 1)];
  const pendingApprovals = selected.approvals.filter((approval) => approval.status === "Pending");

  const metrics = useMemo(() => [
    { title: "Active Journeys", value: String(journeys.filter((j) => j.status !== "Complete").length), delta: "+5 from last week", icon: ShieldCheck, tone: "orange", action: () => setFlow(portfolioMetricFlow("Active Journeys", "active delivery work")) },
    { title: "In Design", value: String(journeys.filter((j) => j.status === "In Design").length), delta: "-2 from last week", icon: Pencil, tone: "orange", negative: true, action: () => setFlow(portfolioMetricFlow("In Design", "journeys still being planned")) },
    { title: "Running", value: String(journeys.filter((j) => j.status === "Running").length), delta: "+3 from last week", icon: Workflow, tone: "green", action: () => setFlow(portfolioMetricFlow("Running", "journeys with active execution")) },
    { title: "Awaiting Approval", value: String(journeys.filter((j) => j.status === "Awaiting Approval").length), delta: "+1 from last week", icon: FileText, tone: "orange", action: () => setFlow(portfolioMetricFlow("Awaiting Approval", "journeys blocked by approval")) },
    { title: "Completed (This Month)", value: String(journeys.filter((j) => j.status === "Complete").length), delta: "+10 from last month", icon: CheckCircle2, tone: "green", action: () => setFlow(portfolioMetricFlow("Completed This Month", "completed journey outcomes")) },
    { title: "Avg. Journey Health", value: "92%", delta: "Healthy", icon: Pencil, tone: "orange", chart: true, action: () => setFlow(healthFlow(journeys)) },
  ], [journeys]);

  const activeFilterLabel = [
    search ? `Search: ${search}` : "",
    typeFilter ? `Type: ${typeFilter}` : "",
    domainFilter ? `Domain: ${domainFilter}` : "",
    ownerFilter ? `Owner: ${ownerFilter}` : "",
    statusFilter ? `Status: ${statusFilter}` : "",
    cloudFilter !== "Multi-Cloud" ? `Cloud: ${cloudFilter}` : "",
  ].filter(Boolean).join(" / ");

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setDomainFilter("");
    setOwnerFilter("");
    setStatusFilter("");
    setCloudFilter("Multi-Cloud");
    setPage(1);
  };

  const selectJourney = (journey: JourneyRecord) => {
    setSelectedId(journey.id);
    const activeIndex = journey.stages.findIndex((stage) => stage.state === "Running" || stage.state === "Pending Review");
    setSelectedStageIndex(activeIndex >= 0 ? activeIndex : 0);
    setActiveMenu(null);
  };

  const toggleFavorite = (id: string) => {
    setJourneys((current) => current.map((journey) => journey.id === id ? { ...journey, favorite: !journey.favorite } : journey));
  };

  const openJourneyDetail = (journey: JourneyRecord) => {
    selectJourney(journey);
    setDetailJourneyId(journey.id);
  };

  const detailJourney = detailJourneyId ? journeys.find((journey) => journey.id === detailJourneyId) : null;

  if (detailJourney) {
    const detailStage = detailJourney.stages[Math.min(selectedStageIndex, detailJourney.stages.length - 1)];
    return (
      <>
        <JourneyDetailScreen
          journey={detailJourney}
          selectedStageIndex={selectedStageIndex}
          selectedStage={detailStage}
          onBack={() => setDetailJourneyId(null)}
          onStageChange={setSelectedStageIndex}
          onToggleFavorite={toggleFavorite}
          onOpenConfig={() => setPanel("configuration")}
          onOpenLogs={() => setPanel("logs")}
          onOpenApprovals={() => setPanel("approvals")}
          onOpenArtifact={(item) => { setArtifact(item); setPanel("artifact"); }}
          onAction={(action) => setFlow(journeyActionFlow(action, detailJourney.name))}
        />
        {activeMenu === "new" ? <NewJourneyWizard onClose={() => setActiveMenu(null)} onCreate={(journey) => { setJourneys((current) => [journey, ...current]); setSelectedId(journey.id); setDetailJourneyId(journey.id); setSelectedStageIndex(0); setActiveMenu(null); }} /> : null}
        <SidePanel panel={panel} journey={detailJourney} stage={detailStage} artifact={artifact} onClose={() => setPanel(null)} onFlow={setFlow} />
        <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
        <DemoFlowModal flow={flow} onClose={() => setFlow(null)} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <section className="rounded-[18px] border border-slate-200 bg-white px-6 py-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Data Journey</h1>
              <p className="mt-2 text-[13px] text-slate-700">Plan, run, govern, and publish end-to-end data delivery journeys.</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button onClick={() => setPanel("help")} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-800 shadow-sm hover:border-orange-200">Templates</button>
              <button onClick={() => setPanel("help")} className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-800 shadow-sm hover:border-orange-200 min-[1300px]:flex">Governance Rules</button>
              <button onClick={() => setActiveMenu("new")} className="flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-[12px] font-bold text-white shadow-sm">
                <Plus className="h-4 w-4" /> New Journey
              </button>
              <button onClick={() => setPanel("help")} className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-orange-50 hover:text-orange-600" aria-label="Open journey help"><CircleHelp className="h-5 w-5" /></button>
            </div>
          </div>
        </section>

        <section className="journey-kpi-grid">
          {metrics.map((metric) => <PortfolioMetric key={metric.title} {...metric} onClick={() => { metric.action(); setPage(1); }} />)}
        </section>

        <section className="overflow-visible rounded-[14px] border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-bold text-slate-950">Journey Inventory ({filtered.length})</h2>
                <p className="mt-1 text-[12px] font-medium text-slate-500">{activeFilterLabel || "All journeys across the selected workspace"}</p>
                <p className="mt-3 text-[12px] font-medium text-slate-500">Click a journey or use Preview to open the expanded journey workspace.</p>
              </div>
              <span className="text-[12px] font-semibold text-slate-500">Showing {paged.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
            <label className="relative h-10 min-w-[280px] flex-1">
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="h-full w-full rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search journeys..." />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </label>
            <FilterSelect id="type-filter" openId={activeMenu} setOpenId={setActiveMenu} label="Type" value={typeFilter || "All"} items={["All", "Structured", "Unstructured", "Hybrid"]} onSelect={(value) => { setTypeFilter(value === "All" ? "" : value); setPage(1); }} />
            <FilterSelect id="domain-filter" openId={activeMenu} setOpenId={setActiveMenu} label="Domain" value={domainFilter || "All"} items={["All", ...domains]} onSelect={(value) => { setDomainFilter(value === "All" ? "" : value); setPage(1); }} />
            <FilterSelect id="owner-filter" openId={activeMenu} setOpenId={setActiveMenu} label="Owner" value={ownerFilter || "All"} items={["All", ...owners]} wide onSelect={(value) => { setOwnerFilter(value === "All" ? "" : value); setPage(1); }} />
            <FilterSelect id="status-filter" openId={activeMenu} setOpenId={setActiveMenu} label="Status" value={statusFilter || "All"} items={["All", "In Design", "Running", "Pending Review", "Awaiting Approval", "Complete"]} wide onSelect={(value) => { setStatusFilter(value === "All" ? "" : value); setPage(1); }} />
            <FilterSelect id="cloud-filter" openId={activeMenu} setOpenId={setActiveMenu} label="Cloud" value={cloudFilter} items={cloudOptions} wide onSelect={(value) => { setCloudFilter(value); setPage(1); }} />
            <div className="relative">
              <button onClick={() => setActiveMenu(activeMenu === "date" ? null : "date")} className="flex h-10 min-w-[238px] items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-900">
                {dateRange} <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
              </button>
              <SelectMenu open={activeMenu === "date"} items={dateOptions} value={dateRange} onSelect={(value) => { setDateRange(value); setActiveMenu(null); }} align="right" />
            </div>
            {(search || typeFilter || domainFilter || ownerFilter || statusFilter || cloudFilter !== "Multi-Cloud") ? (
              <button onClick={clearFilters} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 hover:border-orange-200 hover:text-orange-600">Clear</button>
            ) : null}
          </div>
          <JourneyInventory rows={paged} selectedId={selected.id} actionMenuId={activeMenu?.startsWith("row:") ? activeMenu.replace("row:", "") : null} onSelect={selectJourney} onPreview={openJourneyDetail} onOpen={(journey) => setDrawer({ type: "journey", id: journey.drawerId })} onToggleFavorite={toggleFavorite} onMenu={(id) => setActiveMenu(activeMenu === `row:${id}` ? null : `row:${id}`)} onAction={(action, journey) => setFlow(journeyActionFlow(action, journey.name))} />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>{filtered.length ? `${totalPages} page${totalPages === 1 ? "" : "s"} available` : "No journeys match the current filters"}</span>
            <div className="flex items-center gap-2">
              <PageButton disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="h-4 w-4" /></PageButton>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <PageButton key={item} active={item === page} onClick={() => setPage(item)}>{item}</PageButton>)}
              <PageButton disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight className="h-4 w-4" /></PageButton>
            </div>
          </div>
        </section>

      </div>

      {activeMenu === "new" ? <NewJourneyWizard onClose={() => setActiveMenu(null)} onCreate={(journey) => { setJourneys((current) => [journey, ...current]); setSelectedId(journey.id); setSelectedStageIndex(0); setActiveMenu(null); }} /> : null}
      <SidePanel panel={panel} journey={selected} stage={selectedStage} artifact={artifact} onClose={() => setPanel(null)} onFlow={setFlow} />
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
      <DemoFlowModal flow={flow} onClose={() => setFlow(null)} />
    </>
  );
}

function JourneyDetailScreen({ journey, selectedStageIndex, selectedStage, onBack, onStageChange, onToggleFavorite, onOpenConfig, onOpenLogs, onOpenApprovals, onOpenArtifact, onAction }: { journey: JourneyRecord; selectedStageIndex: number; selectedStage: JourneyStage; onBack: () => void; onStageChange: (index: number) => void; onToggleFavorite: (id: string) => void; onOpenConfig: () => void; onOpenLogs: () => void; onOpenApprovals: () => void; onOpenArtifact: (artifact: JourneyStage["artifacts"][number]) => void; onAction: (action: string) => void }) {
  const pendingApprovals = journey.approvals.filter((approval) => approval.status === "Pending");
  const approvedApprovals = journey.approvals.length - pendingApprovals.length;
  const [activeTab, setActiveTab] = useState<DetailTab>("Overview");
  const tabs: DetailTab[] = ["Overview", "Pipeline", "Artifacts", "Approvals", "Runs & Logs"];

  return (
    <div className="space-y-3">
      <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-card">
        <div className="text-[12px] font-semibold text-slate-500">
          Data Journey <span className="px-2 text-slate-300">/</span> Journey Inventory <span className="px-2 text-slate-300">/</span> <span className="text-slate-800">{journey.name}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-[12px] font-bold text-slate-700 hover:text-orange-600"><ArrowLeft className="h-4 w-4" />Back to Journey Inventory</button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[26px] font-extrabold leading-none text-slate-950">{journey.name}</h1>
              <TypeBadge type={journey.type} />
              <button onClick={() => onToggleFavorite(journey.id)} className={journey.favorite ? "text-orange-500" : "text-slate-400"} aria-label="Toggle favorite"><Star className="h-4 w-4 fill-current" /></button>
              <button onClick={() => onAction("More options")} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-orange-600" aria-label="Open journey options"><MoreVertical className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-[13px] text-slate-700">Track, govern, and operationalize this end-to-end data delivery journey.</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button onClick={() => onAction("Run Journey")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-[12px] font-bold text-white shadow-sm"><Play className="h-4 w-4" />Run Journey</button>
            <button onClick={onOpenLogs} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-800 shadow-sm hover:border-orange-200"><FileText className="h-4 w-4" />View Logs</button>
            <button onClick={onOpenConfig} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-800 shadow-sm hover:border-orange-200"><Pencil className="h-4 w-4" />Edit Configuration</button>
            <button onClick={() => onAction("Actions")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-800 shadow-sm hover:border-orange-200">Actions <ChevronDown className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm min-[1180px]:grid-cols-4 min-[1500px]:grid-cols-8">
          <JourneyInfoTile label="Type" value={journey.type} icon={GitFork} />
          <JourneyInfoTile label="Domain" value={journey.domain} icon={Cloud} />
          <JourneyInfoTile label="Owner" value={journey.owner} initials={journey.initials} />
          <JourneyInfoTile label="Start Date" value={journey.startDate} icon={CalendarDays} />
          <JourneyInfoTile label="Target Go-Live" value={journey.targetDate} icon={CalendarDays} />
          <JourneyInfoTile label="Overall Progress" value={`${journey.progress}%`} progress={journey.progress} />
          <JourneyInfoTile label="Status" value={journey.status} dot={journey.status === "Running" ? "green" : "orange"} />
          <JourneyInfoTile label="Health" value={journey.health} dot={journey.health === "Healthy" ? "green" : "orange"} />
        </div>
      </section>

      <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-card">
        <nav className="flex flex-wrap gap-7 border-b border-slate-200 px-5 pt-3 text-[13px] font-semibold text-slate-600">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-1 pb-3 ${tab === activeTab ? "border-orange-600 text-orange-600" : "border-transparent hover:text-slate-950"}`}>{tab}</button>
          ))}
        </nav>
        {activeTab === "Overview" ? <JourneyOverviewScreen journey={journey} selectedStageIndex={selectedStageIndex} selectedStage={selectedStage} onStageChange={onStageChange} onOpenApprovals={onOpenApprovals} onAction={onAction} /> : null}
        {activeTab === "Pipeline" ? <PipelineScreen journey={journey} selectedStageIndex={selectedStageIndex} selectedStage={selectedStage} pendingApprovals={pendingApprovals.length} approvedApprovals={approvedApprovals} onStageChange={onStageChange} onOpenLogs={onOpenLogs} onOpenApprovals={onOpenApprovals} onOpenArtifact={onOpenArtifact} onAction={onAction} /> : null}
        {activeTab === "Artifacts" ? <ArtifactsScreen journey={journey} onOpenArtifact={onOpenArtifact} /> : null}
        {activeTab === "Approvals" ? <ApprovalsTab journey={journey} onOpenApprovals={onOpenApprovals} /> : null}
        {activeTab === "Runs & Logs" ? <RunsLogsTab journey={journey} onOpenLogs={onOpenLogs} /> : null}
      </section>
    </div>
  );
}

function JourneyOverviewScreen({ journey, selectedStageIndex, selectedStage, onStageChange, onOpenApprovals, onAction }: { journey: JourneyRecord; selectedStageIndex: number; selectedStage: JourneyStage; onStageChange: (index: number) => void; onOpenApprovals: () => void; onAction: (action: string) => void }) {
  const overview = journey.overview;
  const pendingApprovals = journey.approvals.filter((approval) => approval.status === "Pending").length;
  const nextMilestone = overview.upcomingMilestones[0];
  return (
    <div className="space-y-3 bg-slate-50/50 p-4">
      <div className="journey-overview-kpis">
        <OverviewKpi icon={Play} label="Current Stage" title={selectedStage.title} value={selectedStage.state} tone="orange" />
        <OverviewKpi icon={Users} label="Pending Approvals" title={String(pendingApprovals)} value="View all approvals" tone="orange" onClick={onOpenApprovals} />
        <OverviewKpi icon={CalendarDays} label="Upcoming Milestone" title={nextMilestone.title} value={`Due ${nextMilestone.date}`} tone="orange" />
        <OverviewKpi icon={HeartPulse} label="Journey Health" title={`${overview.healthScore}%`} value={journey.health} tone="green" chart />
        <div className="min-h-[118px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><Database className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold leading-4 text-slate-500">Data Assets</p>
              <AssetLine label="Input Datasets" value={overview.dataAssets.input} />
              <AssetLine label="Output Datasets" value={overview.dataAssets.output} />
            </div>
          </div>
        </div>
      </div>

      <div className="journey-overview-main">
        <section className="journey-area-snapshot rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4">
            <h2 className="text-[15px] font-extrabold text-slate-950">Journey Snapshot</h2>
            <div className="mt-4">
              <OverviewStageRail stages={journey.stages} selectedStageIndex={selectedStageIndex} onStageChange={onStageChange} />
            </div>
            <p className="mt-4 text-[13px] font-medium leading-6 text-slate-700">{overview.headline}</p>
          </div>
          <div className="grid grid-cols-1 border-t border-slate-200 sm:grid-cols-3">
            <SnapshotMetric icon={Database} label="Records Processed" value={overview.recordsProcessed} />
            <SnapshotMetric icon={ShieldCheck} label="Quality Rules" value={String(overview.qualityRules)} />
            <SnapshotMetric icon={CalendarDays} label="Last Run" value={overview.lastRun} />
          </div>
        </section>

        <section className="journey-area-stakeholders rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-extrabold text-slate-950">Key Stakeholders</h2>
          <div className="mt-3 space-y-2.5">
            {overview.stakeholders.map((stakeholder) => <StakeholderRow key={`${stakeholder.role}-${stakeholder.name}`} {...stakeholder} />)}
          </div>
        </section>

        <section className="journey-area-actions rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-extrabold text-slate-950">Recommended Actions</h2>
          <div className="mt-3 space-y-2">
            {overview.recommendedActions.map((action) => (
              <button key={action} onClick={() => onAction(action)} className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 text-left text-[12px] font-bold text-slate-700 hover:border-orange-200 hover:bg-orange-50/40">
                <span className="flex min-w-0 items-center gap-2"><ListChecks className="h-4 w-4 shrink-0 text-slate-500" /><span className="truncate">{action}</span></span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
              </button>
            ))}
          </div>
        </section>

        <section className="journey-area-deps rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-extrabold text-slate-950">Dependencies & Platforms</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {overview.platforms.map((platform, index) => <PlatformChip key={platform} label={platform} icon={index === 0 ? Cloud : index === overview.platforms.length - 1 ? Box : Server} />)}
          </div>
        </section>

        <section className="journey-area-activity rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-extrabold text-slate-950">Recent Activity</h2>
          <div className="relative mt-3 space-y-3 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
            {overview.recentActivity.map((activity) => <OverviewActivity key={`${activity.time}-${activity.title}`} {...activity} />)}
          </div>
        </section>

        <section className="journey-area-milestones rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-extrabold text-slate-950">Upcoming Milestones</h2>
          <div className="relative mt-3 space-y-3 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
            {overview.upcomingMilestones.map((milestone) => <OverviewMilestone key={milestone.title} {...milestone} />)}
          </div>
        </section>

        <section className="journey-area-risks rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-extrabold text-slate-950">Risks & Attention Areas</h2>
          <div className="mt-4 space-y-4">
            {overview.risks.map((risk, index) => <RiskLine key={risk} text={risk} icon={index === 0 ? AlertTriangle : index === 1 ? Users : LinkIcon} />)}
          </div>
          <button onClick={() => onAction("View risks")} className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600">View all risks <ExternalLink className="h-3.5 w-3.5" /></button>
        </section>
      </div>
    </div>
  );
}

function PipelineScreen({ journey, selectedStageIndex, selectedStage, pendingApprovals, approvedApprovals, onStageChange, onOpenLogs, onOpenApprovals, onOpenArtifact, onAction }: { journey: JourneyRecord; selectedStageIndex: number; selectedStage: JourneyStage; pendingApprovals: number; approvedApprovals: number; onStageChange: (index: number) => void; onOpenLogs: () => void; onOpenApprovals: () => void; onOpenArtifact: (artifact: JourneyStage["artifacts"][number]) => void; onAction: (action: string) => void }) {
  const inputDatasets = getSummaryValue(selectedStage, "Input Datasets");
  const outputDatasets = getSummaryValue(selectedStage, "Output Datasets");
  const qualityRules = getSummaryValue(selectedStage, "Quality Rules");
  const recordsProcessed = getSummaryValue(selectedStage, "Records Processed");
  const lastRun = getSummaryValue(selectedStage, "Last Run");
  const currentArtifacts = stageDeliverables(selectedStage);
  return (
    <div className="bg-slate-50/50 p-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-extrabold text-slate-950">Journey Pipeline</h2>
          <div className="flex flex-wrap gap-4 text-[11px] font-semibold text-slate-600">
            <Legend color="bg-emerald-500" label="Complete" />
            <Legend color="bg-orange-600" label="In Progress" />
            <Legend color="bg-amber-500" label="Pending Review" />
            <Legend color="bg-slate-300" label="Not Started" />
          </div>
        </div>
        <JourneyTimeline stages={journey.stages} selectedStageIndex={selectedStageIndex} onStageChange={onStageChange} />
      </section>

      <section className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600"><Workflow className="h-7 w-7" /></span>
          <div className="min-w-[260px] flex-1">
            <h2 className="text-[21px] font-extrabold leading-6 text-slate-950">Stage {selectedStageIndex + 1}: {selectedStage.title}</h2>
            <p className="mt-2 text-[12px] font-medium text-slate-600">{stageDescription(journey, selectedStage)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StagePill dot label={selectedStage.state} tone={selectedStage.state === "Complete" ? "green" : selectedStage.state === "Running" ? "orange" : selectedStage.state === "Pending Review" ? "amber" : "slate"} />
            <StagePill label={`Owner: ${journey.owner}`} initials={journey.initials} tone="orange" />
            <StagePill label="Engineering Lead: Rahul Singh" initials="RS" tone="orange" />
            <StagePill icon={CalendarDays} label={`Last Updated: ${lastRun}`} tone="slate" />
            <StagePill dot label="Stage SLA: On Track" tone="green" />
          </div>
        </div>
      </section>

      <div className="journey-pipeline-detail-grid mt-3">
        <PipelinePanel title="A. Stage Overview">
          <PipelineFact label="Objective" value={stageObjective(journey, selectedStage)} />
          {journey.executionTargets.map((target) => <PipelineFact key={target.label} label={target.label} value={target.value} />)}
          <PipelineFact label="Upstream Dependency" value={selectedStageIndex > 0 ? journey.stages[selectedStageIndex - 1].title : "Source readiness"} />
          <PipelineFact label="Downstream Handoff" value={journey.stages[selectedStageIndex + 1]?.title ?? "Consumption readiness"} />
        </PipelinePanel>

        <PipelinePanel title="B. Progress Checklist">
          <div className="space-y-2.5">
            {selectedStage.progress.map((item) => <StatusLine key={item.item} {...item} />)}
          </div>
        </PipelinePanel>

        <PipelinePanel title="C. Stage Metrics">
          <PipelineMetric label="Input Datasets" value={inputDatasets} />
          <PipelineMetric label="Output Datasets" value={outputDatasets} />
          <PipelineMetric label="Transformation Rules" value={qualityRules} />
          <PipelineMetric label="Records Processed" value={recordsProcessed} />
          <PipelineMetric label="Last Run Duration" value={selectedStage.state === "Not Started" ? "Pending" : "24 min"} />
          <PipelineMetric label="Data Freshness" value={selectedStage.state === "Not Started" ? "Pending" : "2 hrs"} />
        </PipelinePanel>

        <PipelinePanel title="D. Inputs & Outputs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <b className="mb-2 block text-[11px] text-slate-950">Inputs</b>
              <MiniList items={stageInputs(journey)} />
            </div>
            <div>
              <b className="mb-2 block text-[11px] text-slate-950">Outputs</b>
              <MiniList items={stageOutputs(journey)} />
            </div>
          </div>
        </PipelinePanel>

        <PipelinePanel title="E. Artifacts & Deliverables">
          <div className="space-y-2">
            {currentArtifacts.map((artifact) => <ArtifactRow key={artifact.name} artifact={artifact} onClick={() => onOpenArtifact(artifact)} />)}
          </div>
          <button onClick={() => currentArtifacts[0] && onOpenArtifact(currentArtifacts[0])} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600">View all artifacts <ExternalLink className="h-3.5 w-3.5" /></button>
        </PipelinePanel>

        <PipelinePanel title="F. Approvals & Dependencies">
          <div className="grid grid-cols-2 gap-2">
            <ApprovalCount label="Pending approvals" value={String(pendingApprovals)} tone="orange" />
            <DependencyTile text={journey.overview.risks[2] ?? "Dependency review pending"} />
            <ApprovalCount label="Approved" value={String(approvedApprovals)} tone="green" />
            <DependencyTile text="Dependency on stage review readiness" />
          </div>
          <button onClick={onOpenApprovals} className="mt-3 text-[12px] font-bold text-blue-600">View approvals</button>
        </PipelinePanel>

        <PipelinePanel title="G. Recent Stage Activity">
          <div className="space-y-2.5">
            {selectedStage.logs.map((log) => <StageLogLine key={`${log.time}-${log.message}`} log={log} />)}
          </div>
          <button onClick={onOpenLogs} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600">View all activity <ExternalLink className="h-3.5 w-3.5" /></button>
        </PipelinePanel>

        <PipelinePanel title="H. Risks & Attention Areas">
          <div className="space-y-3">
            {journey.overview.risks.map((risk, index) => <RiskLine key={risk} text={risk} icon={index === 0 ? AlertTriangle : index === 1 ? Users : LinkIcon} />)}
          </div>
          <button onClick={() => onAction("View risks")} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600">View all risks <ExternalLink className="h-3.5 w-3.5" /></button>
        </PipelinePanel>
      </div>
    </div>
  );
}

function ArtifactsScreen({ journey, onOpenArtifact }: { journey: JourneyRecord; onOpenArtifact: (artifact: JourneyStage["artifacts"][number]) => void }) {
  const artifacts = useMemo(() => journeyArtifactRows(journey), [journey]);
  const [selectedId, setSelectedId] = useState(artifacts[1]?.id ?? artifacts[0]?.id ?? "");
  const selected = artifacts.find((artifact) => artifact.id === selectedId) ?? artifacts[0];
  const drafts = artifacts.filter((artifact) => artifact.status === "Draft").length;
  const inReview = artifacts.filter((artifact) => artifact.status === "In Review" || artifact.status === "Pending Review").length;
  const approved = artifacts.filter((artifact) => artifact.status === "Approved").length;

  return (
    <div className="bg-slate-50/50 p-4">
      <div className="journey-artifacts-layout">
        <div className="min-w-0 space-y-3">
          <section className="journey-artifact-metrics">
            <ArtifactMetric icon={FileText} label="Total Artifacts" value={String(artifacts.length)} tone="slate" />
            <ArtifactMetric icon={FileText} label="Drafts" value={String(drafts)} tone="orange" />
            <ArtifactMetric icon={History} label="In Review" value={String(inReview)} tone="amber" />
            <ArtifactMetric icon={CheckCircle2} label="Approved" value={String(approved)} tone="green" />
            <ArtifactMetric icon={CalendarDays} label="Recently Updated" value="2 today" tone="blue" />
            <ArtifactMetric icon={Cloud} label="Storage Health" value="100% synced" tone="green" />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
              <label className="relative h-9 min-w-[210px] flex-1">
                <input className="h-full w-full rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-[12px] outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search artifacts..." />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </label>
              {["Type: All", "Stage: All", "Status: All", "Owner: All"].map((filter) => <button key={filter} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-bold text-slate-700">{filter}<ChevronDown className="h-3.5 w-3.5" /></button>)}
              <div className="ml-auto flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {["All Artifacts", "Deliverables", "Working Docs"].map((tab) => <button key={tab} className={`h-8 rounded-md px-3 text-[11px] font-extrabold ${tab === "All Artifacts" ? "bg-orange-600 text-white shadow-sm" : "text-slate-600"}`}>{tab}</button>)}
              </div>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-600 px-3 text-[12px] font-bold text-white"><Upload className="h-4 w-4" />Upload Artifact</button>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700"><Folder className="h-4 w-4" />Create Folder</button>
            </div>
            <div className="overflow-hidden">
              <div className="w-full">
                <div className="journey-artifact-row bg-slate-50 px-3 py-3 text-[10px] font-extrabold uppercase text-slate-500">
                  <span>Artifact Name</span><span>Type</span><span>Stage</span><span>Owner</span><span>Last Updated</span><span>Version</span><span>Status</span><span>Actions</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {artifacts.map((artifact) => <ArtifactTableRow key={artifact.id} artifact={artifact} selected={artifact.id === selected.id} onSelect={() => setSelectedId(artifact.id)} />)}
                </div>
              </div>
            </div>
          </section>

          <div className="journey-artifact-bottom">
            <ArtifactCollections journey={journey} total={artifacts.length} />
            <ArtifactActivity artifacts={artifacts} />
            <ArtifactGovernance journey={journey} />
          </div>
        </div>

        <aside className="space-y-3">
          <SelectedArtifactPanel artifact={selected} onPreview={() => onOpenArtifact(toStageArtifact(selected))} />
          <ArtifactVersions artifact={selected} />
          <ArtifactRelatedActions />
        </aside>
      </div>
    </div>
  );
}

function ApprovalsTab({ journey, onOpenApprovals }: { journey: JourneyRecord; onOpenApprovals: () => void }) {
  const approvals = useMemo(() => journeyApprovalRows(journey), [journey]);
  const [selectedId, setSelectedId] = useState(approvals[0]?.id ?? "");
  const selected = approvals.find((approval) => approval.id === selectedId) ?? approvals[0];
  const pending = approvals.filter((approval) => approval.status === "Pending" || approval.status === "Pending Review").length;
  const approved = approvals.filter((approval) => approval.status === "Approved").length;
  const awaiting = approvals.filter((approval) => approval.status === "In Review").length;

  return (
    <div className="bg-slate-50/50 p-4">
      <div className="journey-approvals-layout">
        <div className="min-w-0 space-y-3">
          <section className="journey-approval-metrics">
            <ArtifactMetric icon={History} label="Pending Approvals" value={String(pending)} tone="orange" />
            <ArtifactMetric icon={CheckCircle2} label="Approved" value={String(approved)} tone="green" />
            <ArtifactMetric icon={Users} label="Awaiting Reviewers" value={String(awaiting)} tone="blue" />
            <ArtifactMetric icon={ShieldCheck} label="Approval SLA" value="96%" tone="green" />
            <ArtifactMetric icon={AlertTriangle} label="Escalations" value="0" tone="slate" />
            <ArtifactMetric icon={Sparkles} label="Recent Decisions" value="2 today" tone="blue" />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
              <label className="relative h-9 min-w-[220px] flex-1">
                <input className="h-full w-full rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-[12px] outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search approvals..." />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </label>
              {["Type: All", "Stage: All", "Status: All", "Owner: All"].map((filter) => <button key={filter} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-bold text-slate-700">{filter}<ChevronDown className="h-3.5 w-3.5" /></button>)}
              <div className="ml-auto flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {["All Requests", "Pending", "Approved", "Review Packages"].map((tab) => <button key={tab} className={`h-8 rounded-md px-3 text-[11px] font-extrabold ${tab === "All Requests" ? "bg-orange-600 text-white shadow-sm" : "text-slate-600"}`}>{tab}</button>)}
              </div>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-600 px-3 text-[12px] font-bold text-white"><Upload className="h-4 w-4" />Request Approval</button>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700"><Folder className="h-4 w-4" />Create Review Package</button>
            </div>
            <div className="overflow-hidden">
              <div className="journey-approval-row bg-slate-50 px-3 py-3 text-[10px] font-extrabold uppercase text-slate-500">
                <span>Request Name</span><span>Type</span><span>Stage</span><span>Owner</span><span>Submitted</span><span>Reviewers</span><span>Due Date</span><span>Status</span><span>Actions</span>
              </div>
              <div className="divide-y divide-slate-100">
                {approvals.map((approval) => <ApprovalTableRow key={approval.id} approval={approval} selected={approval.id === selected.id} onSelect={() => setSelectedId(approval.id)} />)}
              </div>
            </div>
          </section>

          <div className="journey-approval-bottom">
            <ApprovalCollections pending={pending} approved={approved} />
            <ApprovalActivity approvals={approvals} />
            <ApprovalGovernance journey={journey} />
          </div>
        </div>

        <aside className="space-y-3">
          <SelectedApprovalPanel approval={selected} />
          <ApprovalTimeline approval={selected} />
          <ApprovalRelatedActions onOpenApprovals={onOpenApprovals} />
        </aside>
      </div>
    </div>
  );
}

function RunsLogsTab({ journey, onOpenLogs }: { journey: JourneyRecord; onOpenLogs: () => void }) {
  const runs = useMemo(() => journeyRunRows(journey), [journey]);
  const [selectedId, setSelectedId] = useState(runs[0]?.id ?? "");
  const selected = runs.find((run) => run.id === selectedId) ?? runs[0];
  const successful = runs.filter((run) => run.status === "Successful").length;
  const failed = runs.filter((run) => run.status === "Failed").length;
  const running = runs.filter((run) => run.status === "Running").length;

  return (
    <div className="bg-slate-50/50 p-4">
      <div className="journey-runs-layout">
        <div className="min-w-0 space-y-3">
          <section className="journey-run-metrics">
            <ArtifactMetric icon={ListChecks} label="Total Runs" value={String(runs.length + 22)} tone="blue" />
            <ArtifactMetric icon={CheckCircle2} label="Successful" value={String(successful + 16)} tone="green" />
            <ArtifactMetric icon={X} label="Failed" value={String(failed + 2)} tone="orange" />
            <ArtifactMetric icon={Play} label="Running Now" value={String(running)} tone="blue" />
            <ArtifactMetric icon={History} label="Avg Duration" value={`${selected.duration} min`} tone="amber" />
            <ArtifactMetric icon={ShieldCheck} label="Last Run Status" value={selected.status} tone={selected.status === "Failed" ? "orange" : "green"} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
              <label className="relative h-9 min-w-[220px] flex-1">
                <input className="h-full w-full rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-[12px] outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search runs or logs..." />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </label>
              {["Run Type: All", "Stage: All", "Status: All", "Owner: All", "Time Range: Last 7 Days"].map((filter) => <button key={filter} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-bold text-slate-700">{filter}<ChevronDown className="h-3.5 w-3.5" /></button>)}
              <button onClick={onOpenLogs} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700"><Download className="h-4 w-4" />Export Logs</button>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-600 px-3 text-[12px] font-bold text-white"><Play className="h-4 w-4" />Trigger Run</button>
            </div>
            <div className="overflow-hidden">
              <div className="journey-run-row bg-slate-50 px-3 py-3 text-[10px] font-extrabold uppercase text-slate-500">
                <span>Run ID</span><span>Run Type</span><span>Stage</span><span>Triggered By</span><span>Start Time</span><span>Duration</span><span>Status</span><span>Actions</span>
              </div>
              <div className="divide-y divide-slate-100">
                {runs.map((run) => <RunTableRow key={run.id} run={run} selected={run.id === selected.id} onSelect={() => setSelectedId(run.id)} />)}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3 text-[12px] font-semibold text-slate-500">
              <span>Showing 1 to 6 of {runs.length + 22} runs</span>
              <span className="flex items-center gap-2"><button className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-400"><ChevronLeft className="h-4 w-4" /></button><b className="grid h-7 w-7 place-items-center rounded-md border border-orange-300 text-orange-600">1</b><span>2</span><span>3</span><span>4</span><button className="grid h-7 w-7 place-items-center rounded-md border border-slate-200"><ChevronRight className="h-4 w-4" /></button></span>
            </div>
          </section>

          <div className="journey-run-bottom">
            <RunTimeline runs={runs} />
            <FailureSummary runs={runs} />
            <RunSystemCompute journey={journey} />
          </div>
        </div>

        <aside className="space-y-3">
          <SelectedRunPanel run={selected} onOpenLogs={onOpenLogs} />
          <RunLogEvents run={selected} onOpenLogs={onOpenLogs} />
          <RunRelatedActions onOpenLogs={onOpenLogs} />
        </aside>
      </div>
    </div>
  );
}

interface ArtifactRecord {
  id: string;
  name: string;
  type: string;
  stage: string;
  owner: string;
  initials: string;
  lastUpdated: string;
  version: string;
  status: "Draft" | "In Review" | "Pending Review" | "Approved" | "Not Started";
  size: string;
  reviewers: Array<{ name: string; initials: string }>;
}

interface ApprovalRecord {
  id: string;
  name: string;
  type: string;
  stage: string;
  owner: string;
  initials: string;
  submitted: string;
  reviewers: Array<{ name: string; initials: string }>;
  dueDate: string;
  status: "Pending" | "In Review" | "Pending Review" | "Approved" | "Not Started";
  version: string;
}

interface RunRecord {
  id: string;
  runType: "Manual" | "Scheduled";
  stage: string;
  triggeredBy: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "Successful" | "Failed" | "Running" | "Queued" | "Cancelled";
  recordsProcessed: string;
  outputDatasets: number;
}

function ArtifactMetric({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "slate" | "orange" | "amber" | "green" | "blue" }) {
  const classes = {
    slate: "bg-slate-50 text-slate-600",
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  }[tone];
  return <div className="flex min-h-[68px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${classes}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-[10px] font-extrabold text-slate-500">{label}</span><b className="mt-0.5 block text-[18px] leading-6 text-slate-950">{value}</b></span></div>;
}

function ArtifactTableRow({ artifact, selected, onSelect }: { artifact: ArtifactRecord; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={`journey-artifact-row w-full px-3 py-3 text-left text-[12px] transition hover:bg-orange-50/50 ${selected ? "bg-orange-50/60" : "bg-white"}`}>
      <span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-blue-600" /><b className="truncate text-slate-900">{artifact.name}</b></span>
      <span className="truncate text-slate-700">{artifact.type}</span>
      <span className="truncate text-slate-700" title={artifact.stage}>{artifact.stage}</span>
      <Owner initials={artifact.initials} name={artifact.owner} />
      <span className="truncate text-slate-600" title={artifact.lastUpdated}>{artifact.lastUpdated}</span>
      <b className="text-slate-700">{artifact.version}</b>
      <StatusPill status={artifact.status} />
      <span className="flex justify-end"><MoreVertical className="h-4 w-4 text-slate-500" /></span>
    </button>
  );
}

function SelectedArtifactPanel({ artifact, onPreview }: { artifact: ArtifactRecord; onPreview: () => void }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3"><h2 className="text-[15px] font-extrabold text-slate-950">Selected Artifact</h2><ExternalLink className="h-4 w-4 text-slate-500" /></div>
      <div className="mt-4 flex items-start gap-3">
        <FileText className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold leading-5 text-slate-950">{artifact.name}</h3>
          <div className="mt-3 grid grid-cols-[82px_1fr] gap-x-3 gap-y-2 text-[12px]">
            <span className="font-semibold text-slate-500">Owner:</span><Owner initials={artifact.initials} name={artifact.owner} />
            <span className="font-semibold text-slate-500">Version:</span><b>{artifact.version}</b>
            <span className="font-semibold text-slate-500">Type:</span><b>{artifact.type}</b>
            <span className="font-semibold text-slate-500">Size:</span><b>{artifact.size}</b>
            <span className="font-semibold text-slate-500">Last Updated:</span><b>{artifact.lastUpdated}</b>
            <span className="font-semibold text-slate-500">Stage:</span><b>{artifact.stage}</b>
            <span className="font-semibold text-slate-500">Reviewers:</span><span className="flex flex-wrap gap-2">{artifact.reviewers.map((reviewer) => <Owner key={reviewer.name} initials={reviewer.initials} name={reviewer.name} />)}</span>
          </div>
          <div className="mt-3"><StatusPill status={artifact.status} /></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={onPreview} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><Eye className="h-4 w-4" />Preview</button>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><History className="h-4 w-4" />History</button>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><Share2 className="h-4 w-4" />Share</button>
      </div>
    </section>
  );
}

function ArtifactVersions({ artifact }: { artifact: ArtifactRecord }) {
  const versions = [artifact.version, "v1.7", "v1.6", "v1.5"];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="text-[15px] font-extrabold text-slate-950">Recent Versions</h2><button className="text-[12px] font-bold text-blue-600">View all</button></div>
      <div className="relative mt-3 space-y-3 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
        {versions.map((version, index) => (
          <div key={version} className="grid grid-cols-[18px_44px_1fr_86px] items-center gap-2 text-[12px]">
            <span className="relative z-10 grid h-3 w-3 place-items-center rounded-full bg-white">
              <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
            </span>
            <b>{version}</b>
            <span className="text-slate-600">{index === 0 ? artifact.lastUpdated : index === 1 ? "Yesterday 05:30 PM" : "Jun 05 02:10 PM"}</span>
            <span className="truncate text-right font-semibold text-slate-600">{index % 2 ? "Priya Nair" : artifact.owner}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArtifactRelatedActions() {
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-[15px] font-extrabold text-slate-950">Related Actions</h2><div className="mt-3 space-y-2">{["Request review", "Compare versions", "Attach to approval package", "Move to final deliverables"].map((action) => <button key={action} className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-[12px] font-bold text-slate-700">{action}<ChevronRight className="h-4 w-4" /></button>)}</div></section>;
}

function ArtifactCollections({ journey, total }: { journey: JourneyRecord; total: number }) {
  const collections = [["Stage Deliverables", total - 1], ["Working Documents", 5], ["Approved Outputs", 3], ["Audit & Logs", 2]] as const;
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-[15px] font-extrabold text-slate-950">Artifact Collections</h2><div className="mt-3 grid grid-cols-2 gap-3 min-[1500px]:grid-cols-4">{collections.map(([name, count]) => <div key={name} className="rounded-xl border border-slate-200 p-3"><Folder className="h-7 w-7 text-orange-500" /><b className="mt-3 block text-[12px] leading-4 text-slate-900">{name}</b><span className="mt-1 block text-[11px] font-semibold text-slate-500">{count} artifacts</span></div>)}</div><button className="mt-4 text-[12px] font-bold text-blue-600">View all collections →</button></section>;
}

function ArtifactActivity({ artifacts }: { artifacts: ArtifactRecord[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold text-slate-950">Recent Activity</h2>
        <button className="text-[12px] font-bold text-blue-600">View all</button>
      </div>
      <div className="mt-3 space-y-2.5">
        {artifacts.slice(0, 5).map((artifact, index) => (
          <div key={artifact.id} className="grid min-h-[48px] grid-cols-[10px_minmax(0,1fr)] gap-3 text-[11px]">
            <span className={`mt-1.5 h-2 w-2 rounded-full ${index % 3 === 0 ? "bg-blue-500" : index % 3 === 1 ? "bg-amber-500" : "bg-emerald-500"}`} />
            <div className="min-w-0">
              <div className="truncate text-[12px] font-extrabold leading-4 text-slate-900" title={artifact.name}>{artifact.name}</div>
              <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-[11px] font-semibold leading-4 text-slate-500">
                <span className="min-w-0 truncate">{index === 0 ? "Updated" : artifact.status} · {artifact.lastUpdated}</span>
                <span className="shrink-0 text-right">{artifact.owner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArtifactGovernance({ journey }: { journey: JourneyRecord }) {
  const repo = journey.executionTargets.find((target) => target.label === "Repository")?.value ?? "Governed repository";
  const rows = [
    ["Primary Storage", journey.cloud.includes("AWS") ? "S3 governed bucket" : journey.cloud.includes("Snowflake") ? "Snowflake stage" : "Azure Blob Storage"],
    ["Repository", repo],
    ["Retention Policy", "365 days"],
    ["Access Control", "Governed by workspace groups"],
    ["Audit Logging", "Enabled"],
  ];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-[15px] font-extrabold text-slate-950">Storage & Governance</h2>
      <div className="mt-3 divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="py-3 text-[12px] first:pt-0 last:pb-0">
            <span className="block text-[11px] font-extrabold uppercase leading-4 text-slate-500">{label}</span>
            <b className="mt-1 block whitespace-normal break-words text-[13px] leading-5 text-slate-950">{value}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApprovalTableRow({ approval, selected, onSelect }: { approval: ApprovalRecord; selected: boolean; onSelect: () => void }) {
  const iconClass = approval.status === "Approved" ? "text-emerald-600" : approval.status === "Not Started" ? "text-slate-500" : "text-orange-600";
  return (
    <button onClick={onSelect} className={`journey-approval-row w-full px-3 py-3 text-left text-[12px] transition hover:bg-orange-50/50 ${selected ? "border-l-2 border-orange-500 bg-orange-50/60" : "bg-white"}`}>
      <span className="flex min-w-0 items-center gap-2"><Box className={`h-4 w-4 shrink-0 ${iconClass}`} /><b className="truncate text-slate-900" title={approval.name}>{approval.name}</b></span>
      <span className="truncate text-slate-700">{approval.type}</span>
      <span className="truncate text-slate-700" title={approval.stage}>{approval.stage}</span>
      <Owner initials={approval.initials} name={approval.owner} />
      <span className="truncate text-slate-600" title={approval.submitted}>{approval.submitted}</span>
      <span className="font-semibold text-slate-700">{approval.reviewers.length} reviewer{approval.reviewers.length === 1 ? "" : "s"}</span>
      <span className="truncate text-slate-700">{approval.dueDate}</span>
      <StatusPill status={approval.status} />
      <span className="flex justify-end"><MoreVertical className="h-4 w-4 text-slate-500" /></span>
    </button>
  );
}

function SelectedApprovalPanel({ approval }: { approval: ApprovalRecord }) {
  const checklist = [
    ["Artifacts attached", "Complete"],
    ["Stage notes included", "Complete"],
    ["Reviewer comments addressed", approval.status === "Approved" ? "Complete" : "Pending"],
    ["Final sign-off", approval.status === "Approved" ? "Complete" : "Pending"],
  ] as const;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3"><h2 className="text-[15px] font-extrabold text-slate-950">Selected Approval</h2><ExternalLink className="h-4 w-4 text-slate-500" /></div>
      <div className="mt-4 flex items-start gap-3">
        <Box className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold leading-5 text-slate-950">{approval.name}</h3>
          <div className="mt-3 grid grid-cols-[78px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[12px]">
            <span className="font-semibold text-slate-500">Type:</span><b>{approval.type}</b>
            <span className="font-semibold text-slate-500">Version:</span><b>{approval.version}</b>
            <span className="font-semibold text-slate-500">Owner:</span><Owner initials={approval.initials} name={approval.owner} />
            <span className="font-semibold text-slate-500">Submitted:</span><b>{approval.submitted}</b>
            <span className="font-semibold text-slate-500">Status:</span><StatusPill status={approval.status} />
            <span className="font-semibold text-slate-500">Due:</span><b>{approval.dueDate}</b>
            <span className="font-semibold text-slate-500">Stage:</span><b className="min-w-0 leading-4">{approval.stage}</b>
            <span className="font-semibold text-slate-500">Reviewers:</span><span className="flex min-w-0 flex-wrap gap-2">{approval.reviewers.map((reviewer) => <Owner key={reviewer.name} initials={reviewer.initials} name={reviewer.name} />)}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <h3 className="text-[12px] font-extrabold text-slate-950">Approval Checklist Summary</h3>
        <div className="mt-2 space-y-2">
          {checklist.map(([item, status]) => <div key={item} className="flex items-center justify-between gap-3 text-[11px]"><span className="flex min-w-0 items-center gap-2"><span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${status === "Complete" ? "bg-emerald-500 text-white" : "bg-orange-100 text-orange-600"}`}>{status === "Complete" ? <Check className="h-3 w-3" /> : "!"}</span><span className="truncate font-semibold text-slate-700">{item}</span></span><b className={status === "Complete" ? "text-emerald-600" : "text-orange-600"}>{status}</b></div>)}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><Eye className="h-4 w-4" />Preview</button>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><History className="h-4 w-4" />History</button>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><Users className="h-4 w-4" />Remind</button>
      </div>
    </section>
  );
}

function ApprovalTimeline({ approval }: { approval: ApprovalRecord }) {
  const rows = [
    ["Request submitted", approval.submitted, approval.owner, "done"],
    ["Reviewer notified", "Today 09:11 AM", "System", "done"],
    ["Reviewer comments received", "Today 10:05 AM", approval.reviewers[0]?.name ?? "Reviewer", approval.status === "Not Started" ? "next" : "done"],
    ["Awaiting final sign-off", "Current", "-", approval.status === "Approved" ? "done" : "next"],
  ] as const;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-[15px] font-extrabold text-slate-950">Approval Timeline</h2>
      <div className="relative mt-3 space-y-3 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
        {rows.map(([label, time, actor, state]) => (
          <div key={label} className="grid grid-cols-[14px_minmax(0,1fr)_82px] gap-2 text-[11px]">
            <span className="relative z-10 grid h-3 w-3 place-items-center rounded-full bg-white">
              <span className={`h-2.5 w-2.5 rounded-full ${state === "done" ? "bg-emerald-500" : "border border-slate-400 bg-white"}`} />
            </span>
            <span className="min-w-0"><b className="block truncate text-slate-800">{label}</b><span className="text-slate-500">{actor}</span></span>
            <span className="text-right font-semibold text-slate-500">{time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApprovalRelatedActions({ onOpenApprovals }: { onOpenApprovals: () => void }) {
  const actions = ["Reassign reviewers", "Escalate approval", "Attach additional artifact", "Convert to final deliverable"];
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-[15px] font-extrabold text-slate-950">Related Actions</h2><div className="mt-3 space-y-2">{actions.map((action, index) => <button key={action} onClick={index === 0 ? onOpenApprovals : undefined} className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-[12px] font-bold text-slate-700">{action}<ChevronRight className="h-4 w-4" /></button>)}</div></section>;
}

function ApprovalCollections({ pending, approved }: { pending: number; approved: number }) {
  const collections = [["Pending Requests", pending], ["Approved Items", approved], ["Review Packages", 3], ["Audit Trail", 2]] as const;
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-[15px] font-extrabold text-slate-950">Approval Collections</h2><div className="mt-3 grid grid-cols-2 gap-3 min-[1500px]:grid-cols-4">{collections.map(([name, count]) => <div key={name} className="rounded-xl border border-slate-200 p-3"><Folder className="h-7 w-7 text-orange-500" /><b className="mt-3 block text-[12px] leading-4 text-slate-900">{name}</b><span className="mt-1 block text-[11px] font-semibold text-slate-500">{count}</span></div>)}</div><button className="mt-4 text-[12px] font-bold text-blue-600">View all collections →</button></section>;
}

function ApprovalActivity({ approvals }: { approvals: ApprovalRecord[] }) {
  const verbs: Record<ApprovalRecord["status"], string> = {
    Pending: "Submitted",
    "In Review": "Moved to review",
    "Pending Review": "Sent for review",
    Approved: "Approved",
    "Not Started": "Queued",
  };
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="text-[15px] font-extrabold text-slate-950">Recent Activity</h2><button className="text-[12px] font-bold text-blue-600">View all</button></div>
      <div className="mt-3 space-y-2.5">
        {approvals.slice(0, 5).map((approval, index) => (
          <div key={approval.id} className="grid min-h-[48px] grid-cols-[10px_minmax(0,1fr)] gap-3 text-[11px]">
            <span className={`mt-1.5 h-2 w-2 rounded-full ${approval.status === "Approved" ? "bg-emerald-500" : approval.status === "In Review" ? "bg-blue-500" : index % 2 ? "bg-amber-500" : "bg-orange-500"}`} />
            <div className="min-w-0">
              <div className="truncate text-[12px] font-extrabold leading-4 text-slate-900" title={approval.name}>{approval.name}</div>
              <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-[11px] font-semibold leading-4 text-slate-500">
                <span className="min-w-0 truncate">{verbs[approval.status]} · {approval.submitted}</span>
                <span className="shrink-0 text-right">{approval.owner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApprovalGovernance({ journey }: { journey: JourneyRecord }) {
  const rows = [
    ["Approval Policy", `${journey.domain} Governance v2`],
    ["Escalation Rule", "24 hrs no response"],
    ["Audit Logging", "Enabled"],
    ["Retention", "365 days"],
    ["Access Control", "Azure AD groups"],
    ["SLA Status", "On Track"],
  ];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-[15px] font-extrabold text-slate-950">Governance & SLA</h2>
      <div className="mt-3 divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 py-2.5 text-[12px] first:pt-0 last:pb-0">
            <span className="font-semibold text-slate-500">{label}</span>
            <b className={`min-w-0 break-words ${value === "Enabled" || value === "On Track" ? "text-emerald-600" : "text-slate-950"}`}>{value}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function RunTableRow({ run, selected, onSelect }: { run: RunRecord; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={`journey-run-row w-full px-3 py-3 text-left text-[12px] transition hover:bg-orange-50/50 ${selected ? "border-l-2 border-orange-500 bg-orange-50/60" : "bg-white"}`}>
      <b className="text-blue-600">{run.id}</b>
      <span className="flex min-w-0 items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full border border-slate-200"><UserIcon type={run.runType} /></span><span className="truncate text-slate-700">{run.runType}</span></span>
      <span className="truncate text-slate-700" title={run.stage}>{run.stage}</span>
      <span className="truncate text-slate-700">{run.triggeredBy}</span>
      <span className="truncate text-slate-600" title={run.startTime}>{run.startTime}</span>
      <span className="font-semibold text-slate-700">{run.status === "Queued" ? "—" : `${run.duration} min`}</span>
      <RunStatusPill status={run.status} />
      <span className="flex justify-end"><MoreVertical className="h-4 w-4 text-slate-500" /></span>
    </button>
  );
}

function UserIcon({ type }: { type: RunRecord["runType"] }) {
  return type === "Manual" ? <Users className="h-3.5 w-3.5 text-slate-600" /> : <History className="h-3.5 w-3.5 text-slate-600" />;
}

function RunStatusPill({ status }: { status: RunRecord["status"] }) {
  const classes: Record<RunRecord["status"], string> = {
    Successful: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Failed: "bg-rose-50 text-rose-700 border-rose-100",
    Running: "bg-blue-50 text-blue-700 border-blue-100",
    Queued: "bg-orange-50 text-orange-700 border-orange-100",
    Cancelled: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const dots: Record<RunRecord["status"], string> = {
    Successful: "bg-emerald-500",
    Failed: "bg-rose-500",
    Running: "bg-blue-500",
    Queued: "bg-orange-500",
    Cancelled: "bg-slate-400",
  };
  return <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${classes[status]}`}><span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />{status}</span>;
}

function SelectedRunPanel({ run, onOpenLogs }: { run: RunRecord; onOpenLogs: () => void }) {
  const facts = [
    ["Triggered By", run.triggeredBy],
    ["Duration", `${run.duration} min`],
    ["Trigger Type", run.runType],
    ["Stage", run.stage],
    ["Status", run.status],
    ["Records Processed", run.recordsProcessed],
    ["Start Time", run.startTime],
    ["Output Datasets", String(run.outputDatasets)],
    ["End Time", run.endTime],
  ];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3"><h2 className="text-[15px] font-extrabold text-slate-950">Selected Run</h2><ExternalLink className="h-4 w-4 text-slate-500" /></div>
      <div className="mt-2 flex items-center justify-between gap-3"><b className="text-[18px] text-blue-600">{run.id}</b><RunStatusPill status={run.status} /></div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
        {facts.map(([label, value]) => <div key={label} className="min-w-0"><span className="block text-[10px] font-extrabold uppercase text-slate-500">{label}</span><b className={`mt-0.5 block break-words leading-4 ${value === "Successful" ? "text-emerald-600" : value === "Failed" ? "text-rose-600" : "text-slate-950"}`}>{value}</b></div>)}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={onOpenLogs} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><FileText className="h-4 w-4" />Full Log</button>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><History className="h-4 w-4" />Re-run</button>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-700"><Download className="h-4 w-4" />Download</button>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <h3 className="text-[12px] font-extrabold text-slate-950">Execution Steps</h3>
        <div className="relative mt-3 space-y-2.5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200">
          {runExecutionSteps(run).map((step) => (
            <div key={step.label} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2 text-[11px]">
              <span className="relative z-10 grid h-4 w-4 place-items-center rounded-full bg-white">
                <CheckCircle2 className={`h-3.5 w-3.5 ${run.status === "Failed" && step.level === "warn" ? "text-rose-500" : "text-emerald-500"}`} />
              </span>
              <span className="min-w-0">
                <b className="block truncate font-semibold text-slate-700" title={step.label}>{step.label}</b>
                <span className="mt-0.5 block text-slate-500">{step.time} · {step.duration}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RunLogEvents({ run, onOpenLogs }: { run: RunRecord; onOpenLogs: () => void }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="text-[15px] font-extrabold text-slate-950">Recent Log Events</h2><button onClick={onOpenLogs} className="text-[12px] font-bold text-blue-600">View Full Log</button></div>
      <div className="mt-3 space-y-2.5">
        {runLogEvents(run).map((event) => {
          const Icon = event.icon;
          return (
            <div key={`${event.time}-${event.message}`} className="grid grid-cols-[18px_minmax(0,1fr)] gap-2 text-[11px]">
              <Icon className={`mt-0.5 h-3.5 w-3.5 ${event.level === "WARN" ? "text-orange-500" : event.level === "SUCCESS" ? "text-emerald-500" : "text-blue-500"}`} />
              <span className="min-w-0">
                <span className="flex items-center gap-2"><span className="font-semibold text-slate-500">{event.time}</span><b className={event.level === "WARN" ? "text-orange-600" : event.level === "SUCCESS" ? "text-emerald-600" : "text-blue-600"}>{event.level}</b></span>
                <span className="mt-0.5 block truncate text-slate-700" title={event.message}>{event.message}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RunRelatedActions({ onOpenLogs }: { onOpenLogs: () => void }) {
  const actions = ["Investigate failed runs", "Compare run outputs", "Open monitoring dashboard", "Create alert rule"];
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-[15px] font-extrabold text-slate-950">Related Actions</h2><div className="mt-3 space-y-2">{actions.map((action, index) => <button key={action} onClick={index === 0 ? onOpenLogs : undefined} className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-[12px] font-bold text-slate-700">{action}<ChevronRight className="h-4 w-4" /></button>)}</div></section>;
}

function RunTimeline({ runs }: { runs: RunRecord[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-[15px] font-extrabold text-slate-950">Run Timeline</h2>
      <div className="relative mt-3 space-y-3 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
        {runs.slice(0, 5).map((run) => (
          <div key={run.id} className="grid grid-cols-[12px_92px_minmax(0,1fr)] gap-3 text-[11px]">
            <span className="relative z-10 grid h-3 w-3 place-items-center rounded-full bg-white">
              <span className={`h-2.5 w-2.5 rounded-full ${run.status === "Successful" ? "bg-emerald-500" : run.status === "Failed" ? "bg-rose-500" : run.status === "Running" ? "bg-blue-500" : "bg-slate-400"}`} />
            </span>
            <span className="font-semibold text-slate-500">{run.startTime.replace("Today ", "").replace("Yesterday ", "")}</span>
            <b className={`truncate ${run.status === "Failed" ? "text-rose-600" : run.status === "Successful" ? "text-emerald-600" : "text-blue-600"}`}>{run.id} {run.status === "Successful" ? "completed successfully" : run.status.toLowerCase()}</b>
          </div>
        ))}
      </div>
      <button className="mt-4 text-[12px] font-bold text-blue-600">View full timeline →</button>
    </section>
  );
}

function FailureSummary({ runs }: { runs: RunRecord[] }) {
  const failed = runs.filter((run) => run.status === "Failed").length + 2;
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950"><AlertTriangle className="h-4 w-4 text-rose-500" />Failure Summary</h2><div className="mt-4 grid grid-cols-[86px_1fr] gap-4"><div className="border-r border-slate-100 pr-4 text-center"><b className="block text-[28px] leading-none text-rose-600">{failed}</b><span className="mt-2 block text-[11px] font-bold text-slate-700">Failed Runs</span><span className="text-[10px] font-semibold text-slate-500">Last 7 days</span></div><div className="space-y-2 text-[12px]"><b className="block text-[11px] text-slate-950">Top Failure Reasons</b>{["Data quality check failed", "Source system timeout", "Schema validation error"].map((reason, index) => <div key={reason} className="flex justify-between gap-3"><span className="text-slate-600">{reason}</span><b>{index === 0 ? "2" : index === 1 ? "1" : "0"}</b></div>)}</div></div><button className="mt-4 text-[12px] font-bold text-blue-600">View all failures →</button></section>;
}

function RunSystemCompute({ journey }: { journey: JourneyRecord }) {
  const rows = [
    ["Execution Target", journey.cloud],
    ["Compute", journey.executionTargets.find((target) => target.label === "Compute")?.value ?? "Workspace compute"],
    ["Orchestration", journey.executionTargets.find((target) => target.label === "Orchestration")?.value ?? "Managed orchestration"],
    ["Logging", journey.cloud === "AWS" ? "CloudWatch Logs" : journey.cloud === "Snowflake" ? "Snowflake event table" : "Azure Monitor / Log Analytics"],
    ["Repository", journey.executionTargets.find((target) => target.label === "Repository")?.value ?? "Governed repository"],
  ];
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-[15px] font-extrabold text-slate-950">System & Compute</h2><div className="mt-3 divide-y divide-slate-100">{rows.map(([label, value], index) => <div key={label} className="grid grid-cols-[118px_minmax(0,1fr)] gap-3 py-2.5 text-[12px] first:pt-0 last:pb-0"><span className="flex items-center gap-2 font-semibold text-slate-500">{index === 0 ? <Cloud className="h-4 w-4 text-blue-600" /> : index === 1 ? <Server className="h-4 w-4 text-blue-600" /> : <Database className="h-4 w-4 text-blue-600" />}{label}</span><b className="min-w-0 break-words text-slate-950">{value}</b></div>)}</div></section>;
}

function JourneyTimeline({ stages, selectedStageIndex, onStageChange, compact = false }: { stages: JourneyStage[]; selectedStageIndex: number; onStageChange: (index: number) => void; compact?: boolean }) {
  return (
    <div className={compact ? "journey-overview-timeline" : "journey-pipeline-grid"}>
      {stages.map((stage, index) => (
        <div key={stage.title} className="contents">
          <PipelineStage index={index + 1} title={stage.title} state={stage.state} selected={index === selectedStageIndex} onClick={() => onStageChange(index)} compact={compact} />
          {index < stages.length - 1 ? <PipelineArrow /> : null}
        </div>
      ))}
    </div>
  );
}

function OverviewStageRail({ stages, selectedStageIndex, onStageChange }: { stages: JourneyStage[]; selectedStageIndex: number; onStageChange: (index: number) => void }) {
  return (
    <div className="relative">
      <div className="absolute left-[7%] right-[7%] top-[18px] h-px bg-slate-200" aria-hidden="true" />
      <div className="journey-overview-rail">
        {stages.map((stage, index) => (
          <div key={stage.title} className="contents">
            <OverviewStageNode index={index} stage={stage} selected={index === selectedStageIndex} onClick={() => onStageChange(index)} />
            {index < stages.length - 1 ? <OverviewRailArrow /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewRailArrow() {
  return <div className="z-10 hidden h-9 items-center justify-center xl:flex" aria-hidden="true"><ArrowRight className="h-4 w-4 text-slate-400" /></div>;
}

function OverviewStageNode({ index, stage, selected, onClick }: { index: number; stage: JourneyStage; selected: boolean; onClick: () => void }) {
  const complete = stage.state === "Complete";
  const running = stage.state === "Running";
  const pending = stage.state === "Pending Review";
  const circleClass = complete ? "bg-emerald-500 text-white" : running ? "bg-orange-500 text-white" : pending ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
  const textClass = complete ? "text-emerald-600" : running || pending ? "text-orange-600" : "text-slate-500";
  return (
    <button onClick={onClick} className={`relative flex min-w-0 flex-col items-center rounded-lg px-1.5 py-1.5 text-center transition hover:bg-orange-50/70 ${selected ? "bg-orange-50 ring-1 ring-orange-200" : ""}`}>
      <span className={`z-10 grid h-9 w-9 place-items-center rounded-full text-[12px] font-extrabold shadow-sm ${circleClass}`}>{complete ? <Check className="h-4 w-4" /> : index + 1}</span>
      <span className="mt-2 min-h-[38px] text-[10px] font-extrabold leading-[12px] text-slate-950">{shortStageTitle(stage.title)}</span>
      <span className={`mt-1 text-[10px] font-extrabold ${textClass}`}>{stage.state}</span>
    </button>
  );
}

function SelectMenu({ open, items, value, onSelect, align = "left", widthClass = "w-56" }: { open: boolean; items: readonly string[]; value: string; onSelect: (value: string) => void; align?: "left" | "right"; widthClass?: string }) {
  if (!open) return null;
  return (
    <div className={`absolute top-[46px] z-40 max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl scrollbar-soft ${widthClass} ${align === "right" ? "right-0" : "left-0"}`}>
      {items.map((item) => (
        <button key={item} onClick={() => onSelect(item)} className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[12px] font-semibold leading-4 ${item === value ? "bg-orange-50 text-orange-600" : "text-slate-700 hover:bg-orange-50/60"}`}>
          {item}{item === value ? <Check className="h-4 w-4" /> : null}
        </button>
      ))}
    </div>
  );
}

function JourneyInfoTile({ label, value, icon: Icon, initials, progress, dot }: { label: string; value: string; icon?: LucideIcon; initials?: string; progress?: number; dot?: "green" | "orange" }) {
  return (
    <div className="min-h-[70px] border-b border-r border-slate-100 p-3 last:border-r-0">
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
        {Icon ? <Icon className="h-4 w-4" /> : initials ? <span className="grid h-6 w-6 place-items-center rounded-full bg-orange-600 text-[10px] text-white">{initials}</span> : null}
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {dot ? <span className={`h-2 w-2 rounded-full ${dot === "green" ? "bg-emerald-500" : "bg-orange-500"}`} /> : null}
        <b className={`${dot === "green" ? "text-emerald-600" : dot === "orange" ? "text-orange-600" : "text-slate-950"} text-[13px]`}>{value}</b>
        {typeof progress === "number" ? <span className="h-1.5 min-w-[72px] overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-orange-500" style={{ width: `${progress}%` }} /></span> : null}
      </div>
    </div>
  );
}

function OverviewKpi({ icon: Icon, label, title, value, tone, chart, onClick }: { icon: LucideIcon; label: string; title: string; value: string; tone: "orange" | "green"; chart?: boolean; onClick?: () => void }) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper onClick={onClick} className="min-h-[118px] rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm">
      <div className="flex h-full items-start gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}><Icon className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-extrabold leading-4 text-slate-500">{label}</span>
          <b className="journey-kpi-title mt-1 block text-[16px] leading-[19px] text-slate-950">{title}</b>
          <span className={`mt-2 block text-[12px] font-extrabold ${tone === "green" ? "text-emerald-600" : "text-orange-600"}`}>{value}</span>
        </span>
        {chart ? <svg className="mt-8 hidden h-8 w-20 shrink-0 min-[1450px]:block" viewBox="0 0 112 42" fill="none" aria-hidden="true"><path d="M3 30 L18 32 L32 24 L46 28 L60 16 L73 20 L87 12 L108 18" stroke="#059669" strokeWidth="3" /><path d="M3 30 L18 32 L32 24 L46 28 L60 16 L73 20 L87 12 L108 18" stroke="#bbf7d0" strokeWidth="8" strokeLinecap="round" opacity=".45" /></svg> : null}
      </div>
    </Wrapper>
  );
}

function AssetLine({ label, value }: { label: string; value: number }) {
  return <div className="mt-2.5 flex items-center justify-between gap-3 border-b border-slate-100 pb-2 text-[12px] last:border-0 last:pb-0"><span className="truncate font-bold text-slate-600">{label}</span><b className="text-slate-950">{value}</b></div>;
}

function SnapshotMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex min-h-[76px] items-center gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><Icon className="h-5 w-5 shrink-0 text-slate-600" /><span className="min-w-0"><span className="block text-[11px] font-extrabold text-slate-500">{label}</span><b className="mt-1 block text-[17px] leading-5 text-slate-950">{value}</b></span></div>;
}

function StakeholderRow({ initials, role, name }: { initials: string; role: string; name: string }) {
  return <div className="flex items-center gap-3 text-[12px]"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">{initials}</span><span className="min-w-0"><span className="block font-semibold text-slate-500">{role}</span><b className="block truncate text-slate-900">{name}</b></span></div>;
}

function PlatformChip({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] font-bold text-slate-700"><Icon className="h-4 w-4 text-blue-600" />{label}</span>;
}

function OverviewActivity({ title, detail, time, level }: JourneyOverview["recentActivity"][number]) {
  const color = level === "Success" ? "bg-emerald-500" : level === "Warning" ? "bg-orange-500" : "bg-blue-500";
  return <div className="flex items-start justify-between gap-3 text-[12px]"><span className="flex min-w-0 gap-3"><span className="relative z-10 mt-1.5 grid h-2.5 w-2.5 shrink-0 place-items-center rounded-full bg-white"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /></span><span className="min-w-0"><b className="block truncate text-slate-900">{title}</b><span className="text-slate-500">{detail}</span></span></span><span className="shrink-0 text-right font-semibold text-slate-500">{time}</span></div>;
}

function OverviewMilestone({ title, detail, date, note }: JourneyOverview["upcomingMilestones"][number]) {
  return <div className="flex items-start justify-between gap-3 text-[12px]"><span className="flex min-w-0 gap-3"><span className="relative z-10 mt-1 grid h-3 w-3 shrink-0 place-items-center rounded-full bg-white"><span className="h-3 w-3 rounded-full border-2 border-orange-500 bg-white" /></span><span className="min-w-0"><b className="block text-slate-900">{title}</b><span className="text-slate-500">{detail}</span></span></span><span className="shrink-0 text-right"><b className="block text-slate-900">{date}</b><span className="text-slate-500">{note}</span></span></div>;
}

function RiskLine({ text, icon: Icon }: { text: string; icon: LucideIcon }) {
  return <div className="flex items-start gap-3 text-[12px] font-medium text-slate-700"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />{text}</div>;
}

function StagePill({ label, tone, icon: Icon, initials, dot }: { label: string; tone: "green" | "orange" | "amber" | "slate"; icon?: LucideIcon; initials?: string; dot?: boolean }) {
  const classes = {
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    orange: "border-orange-100 bg-orange-50 text-orange-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-white text-slate-700",
  }[tone];
  const dotClass = tone === "green" ? "bg-emerald-500" : tone === "orange" ? "bg-orange-500" : tone === "amber" ? "bg-amber-500" : "bg-slate-400";
  return (
    <span className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-[12px] font-bold ${classes}`}>
      {dot ? <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} /> : null}
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {initials ? <span className="grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-[9px] text-white">{initials}</span> : null}
      {label}
    </span>
  );
}

function PipelinePanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="mb-3 text-[13px] font-extrabold text-slate-950">{title}</h3>{children}</section>;
}

function PipelineFact({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[118px_1fr] gap-3 py-1.5 text-[12px]"><span className="font-semibold text-slate-500">{label}</span><b className="min-w-0 text-slate-900">{value}</b></div>;
}

function PipelineMetric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 py-1.5 text-[12px]"><span className="font-semibold text-slate-600">{label}</span><b className="text-slate-950">{value}</b></div>;
}

function MiniList({ items }: { items: string[] }) {
  return <div className="space-y-2">{items.map((item) => <div key={item} className="flex items-center gap-2 text-[12px] font-semibold text-slate-700"><FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />{item}</div>)}</div>;
}

function DependencyTile({ text }: { text: string }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] font-semibold leading-4 text-slate-700">{text}</div>;
}

function StageLogLine({ log }: { log: JourneyStage["logs"][number] }) {
  const dot = log.level === "Warning" ? "bg-orange-500" : log.level === "Error" ? "bg-rose-500" : "bg-emerald-500";
  return <div className="flex items-start justify-between gap-3 text-[12px]"><span className="flex min-w-0 gap-2"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} /><span className="truncate font-semibold text-slate-800">{log.message}</span></span><span className="shrink-0 font-semibold text-slate-500">{log.time}</span></div>;
}

function FilterSelect({ id, openId, setOpenId, label, value, items, wide = false, onSelect }: { id: string; openId: string | null; setOpenId: (value: string | null) => void; label: string; value: string; items: string[]; wide?: boolean; onSelect: (value: string) => void }) {
  const open = openId === id;
  return (
    <div className="relative">
      <button onClick={() => setOpenId(open ? null : id)} className={`flex h-10 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-[12px] text-slate-900 ${wide ? "min-w-[168px]" : "min-w-[132px]"}`}>
        <span className="min-w-0 truncate"><span className="font-semibold text-slate-600">{label}:</span> <span className="font-bold text-slate-950">{value}</span></span><ChevronDown className="h-4 w-4 shrink-0" />
      </button>
      <SelectMenu open={open} items={items} value={value} widthClass={wide ? "w-52" : "w-44"} onSelect={(item) => { onSelect(item); setOpenId(null); }} />
    </div>
  );
}

function PortfolioMetric({ title, value, delta, icon: Icon, tone, negative, chart, onClick }: { title: string; value: string; delta: string; icon: LucideIcon; tone: keyof typeof toneMap; negative?: boolean; chart?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-[78px] items-center gap-3 rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-orange-200">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <b className="block text-[12px] leading-4 text-slate-950">{title}</b>
        <span className="mt-1 block text-[22px] font-extrabold leading-none text-slate-950">{value}</span>
        <span className={`mt-1.5 block text-[11px] font-bold leading-4 ${negative ? "text-orange-600" : "text-emerald-600"}`}>{delta}</span>
      </span>
      {chart ? <svg className="hidden h-9 w-16 shrink-0 min-[1500px]:block" viewBox="0 0 96 44" fill="none" aria-hidden="true"><path d="M2 34 L18 25 L32 28 L45 19 L61 22 L74 14 L94 19" stroke="#dcfce7" strokeWidth="8" strokeLinecap="round" /><path d="M2 32 L18 23 L32 26 L45 17 L61 20 L74 12 L94 17" stroke="#16a34a" strokeWidth="3" /></svg> : null}
    </button>
  );
}

function JourneyInventory({ rows, selectedId, actionMenuId, onSelect, onPreview, onOpen, onToggleFavorite, onMenu, onAction }: { rows: JourneyRecord[]; selectedId: string; actionMenuId: string | null; onSelect: (journey: JourneyRecord) => void; onPreview: (journey: JourneyRecord) => void; onOpen: (journey: JourneyRecord) => void; onToggleFavorite: (id: string) => void; onMenu: (id: string) => void; onAction: (action: string, journey: JourneyRecord) => void }) {
  return (
    <div className="text-[12px]">
      <div className="journey-inventory-row hidden items-center border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold text-slate-500 xl:grid">
        <span>Journey Name</span><span>Type</span><span>Domain</span><span>Owner</span><span>Current Stage</span><span>Progress</span><span>Status</span><span>Last Updated</span><span>Health</span><span>Actions</span>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((journey) => {
          const currentStage = journey.stages.find((stage) => stage.state === "Running" || stage.state === "Pending Review") ?? journey.stages[journey.stages.length - 1];
          return (
            <div key={journey.id} onClick={() => onPreview(journey)} role="button" tabIndex={0} className={`relative w-full cursor-pointer px-4 py-2.5 text-left transition hover:bg-orange-50/60 ${journey.id === selectedId ? "border-y border-orange-200 bg-orange-50/30" : "bg-white"}`}>
              <div className="journey-inventory-row hidden items-center xl:grid">
                <span className="flex min-w-0 items-center gap-2">
                  <button onClick={(event) => { event.stopPropagation(); onToggleFavorite(journey.id); }} className={journey.favorite ? "text-orange-500" : "text-slate-300"} aria-label="Toggle favorite"><Star className="h-3.5 w-3.5 fill-current" /></button>
                  <GitFork className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <button onClick={(event) => { event.stopPropagation(); onPreview(journey); }} className="truncate text-left text-[12px] font-bold text-slate-900 hover:text-orange-600" title={journey.name}>{journey.name}</button>
                </span>
                <TypeBadge type={journey.type} />
                <span className="truncate text-[12px] text-slate-700" title={journey.domain}>{journey.domain}</span>
                <Owner initials={journey.initials} name={journey.owner} />
                <span className="truncate text-[12px] text-slate-700" title={currentStage.title}>{currentStage.title}</span>
                <MiniProgress value={journey.progress} />
                <StatusText status={journey.status} />
                <span className="truncate text-[11px] text-slate-600" title={journey.updated}>{formatInventoryDate(journey.updated)}</span>
                <Health health={journey.health} />
                <span className="flex items-center justify-end gap-2">
                  <button onClick={(event) => { event.stopPropagation(); onSelect(journey); onPreview(journey); }} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 hover:border-orange-200 hover:text-orange-600"><Eye className="h-3.5 w-3.5" />Preview</button>
                  <button onClick={(event) => { event.stopPropagation(); onMenu(journey.id); }} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-orange-50 hover:text-orange-600" aria-label="Open row actions"><MoreVertical className="h-3.5 w-3.5" /></button>
                </span>
              </div>
              <div className="grid gap-3 xl:hidden">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0"><b className="block truncate text-slate-950">{journey.name}</b><span className="text-xs text-slate-500">{journey.domain} · {currentStage.title}</span></span>
                  <TypeBadge type={journey.type} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3"><Owner initials={journey.initials} name={journey.owner} /><MiniProgress value={journey.progress} /><StatusText status={journey.status} /><Health health={journey.health} /><button onClick={(event) => { event.stopPropagation(); onPreview(journey); }} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700"><Eye className="h-3.5 w-3.5" />Preview</button></div>
              </div>
              {actionMenuId === journey.id ? <ActionMenu journey={journey} onAction={(action) => onAction(action, journey)} /> : null}
            </div>
          );
        })}
        {!rows.length ? <div className="px-4 py-10 text-center text-[13px] font-semibold text-slate-500">No journeys match the current filters.</div> : null}
      </div>
    </div>
  );
}

function ActionMenu({ journey, onAction }: { journey: JourneyRecord; onAction: (action: string) => void }) {
  const actions = ["View details", journey.status === "Running" ? "Pause stage" : "Resume stage", "Request approval", "Attach artifact", "Duplicate journey", "Archive"];
  return (
    <div onClick={(event) => event.stopPropagation()} className="absolute right-4 top-10 z-30 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{journey.name}</p>
      {actions.map((action) => <button key={action} onClick={() => onAction(action)} className="h-8 w-full rounded-lg px-2 text-left text-[12px] font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600">{action}</button>)}
    </div>
  );
}

function NewJourneyWizard({ onClose, onCreate }: { onClose: () => void; onCreate: (journey: JourneyRecord) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("New Provider Quality Journey");
  const [type, setType] = useState<JourneyType>("Structured");
  const [domain, setDomain] = useState("Provider Mgmt");
  const [owner, setOwner] = useState("Priya Nair");
  const steps = ["Basics", "Source & Target", "Template", "Governance", "Review"];
  const create = () => {
    const id = `journey-${Date.now()}`;
    onCreate({
      id,
      drawerId: "jr-provider-ingestion",
      name,
      type,
      domain,
      owner,
      initials: owner.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
      status: "In Design",
      health: "Healthy",
      progress: 8,
      updated: "Just now",
      startDate: "Today",
      targetDate: "Jul 31, 2025",
      cloud: "Azure",
      favorite: true,
      executionTargets: [
        { label: "Execution Target", value: "Azure" },
        { label: "Compute", value: "Azure Databricks" },
        { label: "Orchestration", value: "Azure Data Factory" },
        { label: "Repository", value: "Azure DevOps - generated-journey" },
      ],
      approvals: [{ title: "Journey design review", status: "Pending", owner: "Governance", due: "Due in 2 days" }],
      stages: baseStages(0, 1),
      overview: {
        headline: `This journey is being drafted for ${domain}. The generated plan will connect selected sources, quality checks, approvals, and publishing tasks before engineering work begins.`,
        healthScore: 86,
        dataAssets: { input: 4, output: 1 },
        recordsProcessed: "Pending",
        qualityRules: 8,
        lastRun: "Not started",
        upcomingMilestones: [
          { title: "Journey Design Review", detail: "Stage 1 Gate", date: "Due in 2 days", note: "Pending" },
          { title: "Source Mapping", detail: "Stage 1 Setup", date: "This week", note: "Planned" },
          { title: "Target Go-Live", detail: "Journey Go-Live", date: "Jul 31, 2025", note: "Planned" },
        ],
        stakeholders: [
          { initials: owner.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), role: "Owner", name: owner },
          { initials: "GD", role: "Governance", name: "Governance Desk" },
          { initials: "PL", role: "Platform Lead", name: "Platform Team" },
        ],
        platforms: ["Azure", "Azure Databricks", "Azure Data Factory", "Azure DevOps"],
        recommendedActions: ["Complete source mapping", "Confirm quality rules", "Assign engineering lead", "Submit design review"],
        risks: ["Design approval is pending.", "Source contracts are not yet attached.", "Production schedule depends on governance review."],
        recentActivity: [
          { title: "Journey draft created", detail: `${owner} · Draft`, time: "Just now", level: "Info" },
          { title: "Design review requested", detail: "Governance · Pending", time: "Just now", level: "Warning" },
        ],
      },
    });
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/25 px-4" onClick={onClose}>
      <section onClick={(event) => event.stopPropagation()} className="w-full max-w-[720px] rounded-[16px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[11px] font-extrabold uppercase tracking-wide text-orange-600">New Journey</p><h2 className="mt-1 text-[22px] font-extrabold text-slate-950">Create data journey</h2><p className="mt-2 text-[13px] text-slate-600">Generate a governed delivery path with stages, owners, approvals, and execution settings.</p></div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-2">
          {steps.map((label, index) => <button key={label} onClick={() => setStep(index)} className={`h-9 rounded-lg border text-[11px] font-bold ${step === index ? "border-orange-500 bg-orange-50 text-orange-600" : "border-slate-200 text-slate-600"}`}>{index + 1}. {label}</button>)}
        </div>
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          {step === 0 ? <div className="grid gap-3 sm:grid-cols-2"><TextField label="Journey name" value={name} onChange={setName} /><SelectField label="Type" value={type} items={["Structured", "Unstructured", "Hybrid"]} onChange={(value) => setType(value as JourneyType)} /><TextField label="Domain" value={domain} onChange={setDomain} /><TextField label="Owner" value={owner} onChange={setOwner} /></div> : null}
          {step === 1 ? <Checklist items={["Snowflake provider directory source selected", "Azure Databricks target workspace selected", "Daily orchestration schedule configured", "Lineage capture enabled"]} /> : null}
          {step === 2 ? <Checklist items={["Structured ingestion accelerator", "Quality validation checkpoint", "Data product publishing template", "Semantic context starter"]} /> : null}
          {step === 3 ? <Checklist items={["Data contract required before publish", "PII policy scan enabled", "Data steward approval required", "SLA freshness target set to 4 hours"]} /> : null}
          {step === 4 ? <div className="space-y-2 text-[13px] text-slate-700"><b className="block text-slate-950">{name}</b><p>{type} journey in {domain}, owned by {owner}. The journey will start in design with one pending governance review.</p></div> : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700">Cancel</button>
          <button onClick={() => step === steps.length - 1 ? create() : setStep(step + 1)} className="h-9 rounded-lg border border-orange-500 bg-orange-600 px-4 text-[12px] font-bold text-white shadow-sm">{step === steps.length - 1 ? "Create journey" : "Continue"}</button>
        </div>
      </section>
    </div>
  );
}

function SidePanel({ panel, journey, stage, artifact, onClose, onFlow }: { panel: Panel; journey: JourneyRecord; stage: JourneyStage; artifact: JourneyStage["artifacts"][number] | null; onClose: () => void; onFlow: (flow: DemoFlow) => void }) {
  if (!panel) return null;
  const title = panel === "help" ? "Journey Help" : panel === "configuration" ? "Full Configuration" : panel === "logs" ? "Stage Logs" : panel === "approvals" ? "Approvals" : "Artifact Preview";
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/20" onClick={onClose}>
      <aside onClick={(event) => event.stopPropagation()} className="absolute right-0 top-0 h-full w-[480px] overflow-y-auto bg-white p-6 shadow-2xl scrollbar-soft">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wide text-orange-600">{journey.name}</p><h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2></div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        {panel === "help" ? <HelpContent onFlow={onFlow} /> : null}
        {panel === "configuration" ? <ConfigContent journey={journey} /> : null}
        {panel === "logs" ? <LogsContent stage={stage} /> : null}
        {panel === "approvals" ? <ApprovalsContent journey={journey} /> : null}
        {panel === "artifact" && artifact ? <ArtifactContent artifact={artifact} /> : null}
      </aside>
    </div>
  );
}

function HelpContent({ onFlow }: { onFlow: (flow: DemoFlow) => void }) {
  return <div className="mt-6 space-y-3">{["Source onboarding template", "Document processing template", "Data product publishing guardrails", "Quality and approval rules"].map((item) => <button key={item} onClick={() => onFlow(templateFlow(item))} className="w-full rounded-xl border border-slate-200 p-4 text-left hover:border-orange-200 hover:bg-orange-50/40"><b className="text-[13px] text-slate-900">{item}</b><span className="mt-1 block text-[12px] leading-5 text-slate-500">Open recommended tasks, controls, and owner checkpoints.</span></button>)}</div>;
}

function ConfigContent({ journey }: { journey: JourneyRecord }) {
  return <div className="mt-6 space-y-3">{journey.executionTargets.map((item) => <Info key={item.label} label={item.label} value={item.value} />)}<Info label="Secrets Policy" value="Workspace managed identity with scoped vault access" /><Info label="Deployment Policy" value="Approval required for production publish" /></div>;
}

function LogsContent({ stage }: { stage: JourneyStage }) {
  return <div className="mt-6 space-y-2">{stage.logs.map((log) => <div key={`${log.time}-${log.message}`} className="rounded-xl border border-slate-200 p-3 text-[12px]"><div className="flex items-center justify-between gap-3"><b className={log.level === "Warning" ? "text-orange-600" : log.level === "Error" ? "text-rose-600" : "text-slate-900"}>{log.level}</b><span className="font-semibold text-slate-500">{log.time}</span></div><p className="mt-2 text-slate-600">{log.message}</p></div>)}</div>;
}

function ApprovalsContent({ journey }: { journey: JourneyRecord }) {
  return <div className="mt-6 space-y-2">{journey.approvals.map((approval) => <div key={approval.title} className="rounded-xl border border-slate-200 p-3 text-[12px]"><div className="flex items-center justify-between"><b className="text-slate-900">{approval.title}</b><span className={approval.status === "Pending" ? "font-bold text-orange-600" : "font-bold text-emerald-600"}>{approval.status}</span></div><p className="mt-2 text-slate-500">{approval.owner} · {approval.due}</p></div>)}</div>;
}

function ArtifactContent({ artifact }: { artifact: JourneyStage["artifacts"][number] }) {
  return <div className="mt-6 space-y-4"><Info label="Name" value={artifact.name} /><Info label="Type" value={artifact.type} /><Info label="Version / Status" value={artifact.tag} /><Info label="Updated" value={artifact.updated} /><button className="flex h-10 items-center gap-2 rounded-lg border border-orange-500 bg-orange-600 px-4 text-[12px] font-bold text-white"><Download className="h-4 w-4" /> Download metadata</button></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 text-sm font-bold text-slate-900">{value}</div></div>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-[12px] font-bold text-slate-600">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" /></label>;
}

function SelectField({ label, value, items, onChange }: { label: string; value: string; items: string[]; onChange: (value: string) => void }) {
  return <label className="text-[12px] font-bold text-slate-600">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none">{items.map((item) => <option key={item}>{item}</option>)}</select></label>;
}

function Checklist({ items }: { items: string[] }) {
  return <div className="grid gap-2">{items.map((item) => <div key={item} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-3 text-[12px] font-semibold text-slate-700"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{item}</div>)}</div>;
}

function TypeBadge({ type }: { type: string }) {
  const classes = type === "Hybrid" ? "bg-purple-50 text-purple-700 border-purple-200" : type === "Structured" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return <span className={`w-fit max-w-full truncate rounded-md border px-1.5 py-0.5 text-[10px] font-bold leading-4 ${classes}`}>{type}</span>;
}

function Owner({ initials, name }: { initials: string; name: string }) {
  return <span className="flex min-w-0 items-center gap-1.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-600 text-[10px] font-bold text-white">{initials}</span><span className="truncate text-[12px] text-slate-700">{name}</span></span>;
}

function MiniProgress({ value }: { value: number }) {
  return <span className="flex min-w-[82px] items-center gap-1.5"><b className="w-7 text-[11px] text-slate-600">{value}%</b><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-orange-500" style={{ width: `${value}%` }} /></span></span>;
}

function StatusText({ status }: { status: JourneyStatus }) {
  const color = status === "Running" || status === "Complete" ? "text-emerald-600" : "text-orange-600";
  return <b className={`truncate text-[11px] ${color}`} title={status}>{status}</b>;
}

function Health({ health }: { health: JourneyHealth }) {
  const dot = health === "Healthy" ? "bg-emerald-500" : health === "Blocked" ? "bg-rose-500" : "bg-amber-500";
  const text = health === "Healthy" ? "text-emerald-600" : health === "Blocked" ? "text-rose-600" : "text-orange-600";
  return <span className={`flex items-center gap-1.5 truncate text-[11px] font-bold ${text}`} title={health}><span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />{health}</span>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>;
}

function PipelineStage({ index, title, state, selected, onClick, compact = false }: { index: number; title: string; state: StageState; selected: boolean; onClick: () => void; compact?: boolean }) {
  const complete = state === "Complete";
  const running = state === "Running";
  const pending = state === "Pending Review";
  return (
    <button onClick={onClick} className={`relative rounded-lg border bg-white p-2 text-left shadow-sm transition hover:-translate-y-0.5 ${compact ? "min-h-[86px]" : "min-h-[76px]"} ${selected || running ? "border-orange-300 ring-1 ring-orange-200" : "border-slate-200"}`}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${complete ? "bg-emerald-500 text-white" : running ? "bg-orange-500 text-white" : pending ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{complete ? <Check className="h-3 w-3" /> : index}</span>
        <b className="text-[11px] text-slate-950">{index}</b>
      </div>
      <h4 className="text-center text-[10px] font-bold leading-[13px] text-slate-950">{title}</h4>
      <p className={`mt-1.5 text-center text-[10px] font-bold ${complete ? "text-emerald-600" : running || pending ? "text-orange-600" : "text-slate-500"}`}>{state}</p>
    </button>
  );
}

function PipelineArrow() {
  return <div className="journey-pipeline-arrow hidden items-center justify-center xl:flex" aria-hidden="true"><ArrowRight className="h-5 w-5 text-slate-800" /></div>;
}

function DetailPanel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="border-b border-slate-200 p-3 last:border-b-0 min-[1500px]:border-b-0 min-[1500px]:border-r"><h3 className="mb-2.5 text-[12px] font-bold text-slate-950">{title}</h3>{children}</div>;
}

function StatusLine({ item, status }: { item: string; status: string }) {
  const done = status === "Complete";
  const active = status === "In Progress";
  return <div className="flex items-center justify-between gap-2 text-[11px]"><span className="flex min-w-0 items-center gap-2"><Check className={`h-3.5 w-3.5 ${done || active ? "text-emerald-600" : "text-slate-400"}`} /><span className="truncate text-slate-700">{item}</span></span><span className={`flex shrink-0 items-center gap-2 font-semibold ${done ? "text-emerald-600" : active ? "text-orange-600" : "text-slate-500"}`}>{status}<span className={`h-3 w-3 rounded-full border ${done ? "border-emerald-500 bg-emerald-500" : active ? "border-orange-500" : "border-slate-300"}`} /></span></div>;
}

function ArtifactRow({ artifact, onClick }: { artifact: JourneyStage["artifacts"][number]; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-full items-center justify-between gap-2 rounded-lg text-left text-[11px] hover:bg-orange-50/50"><span className="flex min-w-0 items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-500" /><b className="truncate text-slate-700">{artifact.name}</b></span><span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">{artifact.tag}</span></button>;
}

function StatusPill({ status }: { status: ArtifactRecord["status"] | ApprovalRecord["status"] }) {
  const classes = status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : status === "Draft" ? "bg-blue-50 text-blue-700 border-blue-100" : status === "Not Started" ? "bg-slate-50 text-slate-600 border-slate-200" : "bg-orange-50 text-orange-700 border-orange-100";
  return <span className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${classes}`}>{status}</span>;
}

function ApprovalCount({ label, value, tone }: { label: string; value: string; tone: "orange" | "green" }) {
  return <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px]"><span>{label}</span><b className={`text-lg ${tone === "orange" ? "text-orange-600" : "text-emerald-600"}`}>{value}</b></div>;
}

function Milestone({ title, detail, date }: { title: string; detail: string; date: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-[12px]">
      <span className="flex items-center gap-3">
        <CalendarDays className="h-4 w-4 text-slate-600" />
        <span><b className="block text-slate-900">{title}</b><span className="text-slate-500">{detail}</span></span>
      </span>
      <span className="text-right"><b className="block text-slate-900">{date}</b><span className="text-slate-500">Upcoming</span></span>
    </div>
  );
}

function PageButton({ children, active = false, disabled = false, onClick }: { children: ReactNode; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return <button disabled={disabled} onClick={onClick} className={`grid h-8 min-w-8 place-items-center rounded-md border text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${active ? "border-orange-600 bg-orange-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{children}</button>;
}

function formatInventoryDate(value: string) {
  return value.replace(", 2025", "").replace(" AM", "").replace(" PM", "");
}

function shortStageTitle(title: string) {
  const labels: Record<string, string> = {
    "Source Onboarding & Ingestion": "Source Onboarding",
    "Storage, Processing & Extraction": "Storage & Extraction",
    "Data Modeling & Transformation": "Modeling & Transformation",
    "Data Quality & Validation": "Quality & Validation",
    "Data Productization & Publishing": "Productization & Publishing",
    "Context & Semantic Enablement": "Semantic Enablement",
    "Consumption, Access & Reuse": "Consumption & Reuse",
  };
  return labels[title] ?? title;
}

function getSummaryValue(stage: JourneyStage, label: string) {
  return stage.summary.find(([item]) => item === label)?.[1] ?? "Pending";
}

function stageDescription(journey: JourneyRecord, stage: JourneyStage) {
  if (stage.title.includes("Modeling")) return `Curate trusted ${journey.domain.toLowerCase()} data models, apply transformation rules, and validate business logic before downstream review.`;
  if (stage.title.includes("Quality")) return `Validate ${journey.domain.toLowerCase()} outputs against data contracts, exception thresholds, and steward review criteria.`;
  if (stage.title.includes("Productization")) return `Package governed ${journey.domain.toLowerCase()} outputs with metadata, publication controls, and consumer readiness checks.`;
  if (stage.title.includes("Source")) return `Onboard source systems, confirm contracts, and establish controlled ingestion for the ${journey.domain.toLowerCase()} journey.`;
  return `Execute the ${stage.title.toLowerCase()} stage with governed controls, owner checkpoints, and operational telemetry.`;
}

function stageObjective(journey: JourneyRecord, stage: JourneyStage) {
  if (stage.title.includes("Modeling")) return `Curate & transform ${journey.domain.toLowerCase()} data with trusted business logic`;
  if (stage.title.includes("Quality")) return `Validate ${journey.domain.toLowerCase()} outputs against policy and data quality rules`;
  if (stage.title.includes("Productization")) return `Publish governed ${journey.domain.toLowerCase()} assets for certified reuse`;
  return `${shortStageTitle(stage.title)} for ${journey.domain.toLowerCase()} delivery`;
}

function stageDeliverables(stage: JourneyStage) {
  const prefix = shortStageTitle(stage.title);
  return [
    ...stage.artifacts,
    { name: `${prefix} checklist`, tag: stage.state === "Pending Review" ? "Pending Review" : "Draft", type: "Checklist", updated: "Today" },
    { name: `${prefix} mapping`, tag: stage.state === "Running" ? "Running" : "Draft", type: "Mapping", updated: "Today" },
  ].slice(0, 4);
}

function stageInputs(journey: JourneyRecord) {
  if (journey.domain === "Claims") return ["Claims raw tables", "Policy reference tables", "Provider master", "Semantic rules metadata"];
  if (journey.domain === "Customer 360") return ["Customer profiles", "Consent records", "Policy history", "Engagement events"];
  if (journey.domain === "Sales") return ["Opportunity snapshot", "Quota hierarchy", "Territory mapping", "Bookings feed"];
  if (journey.type === "Unstructured") return ["Contract documents", "Clause taxonomy", "Gold standard samples", "Review guidelines"];
  return ["Provider roster", "Credentialing feed", "Facility affiliations", "Taxonomy reference"];
}

function stageOutputs(journey: JourneyRecord) {
  if (journey.domain === "Claims") return ["Curated claims model", "Validation summary", "Data run notes", "Transformation mapping"];
  if (journey.domain === "Customer 360") return ["Certified customer product", "Privacy scan summary", "Consent policy map", "Semantic sync notes"];
  if (journey.domain === "Sales") return ["Sales performance mart", "Revenue exception report", "Finance review packet", "Power BI semantic feed"];
  if (journey.type === "Unstructured") return ["Clause extraction draft", "Vector index plan", "Review sample set", "Precision baseline"];
  return ["Provider golden record", "Schema drift report", "Affiliation output", "Quality exception list"];
}

function journeyArtifactRows(journey: JourneyRecord): ArtifactRecord[] {
  const currentStage = journey.stages.find((stage) => stage.state === "Running" || stage.state === "Pending Review") ?? journey.stages[0];
  const names = artifactNamesForJourney(journey);
  const owners = [
    { owner: journey.owner, initials: journey.initials },
    { owner: "Rahul Singh", initials: "RS" },
    { owner: "Anjali Mehta", initials: "AM" },
    { owner: "Sneha Iyer", initials: "SI" },
    { owner: "Rohan Mehta", initials: "RM" },
  ];
  const statuses: ArtifactRecord["status"][] = ["Draft", "In Review", "Pending Review", "Approved", "Draft", "Not Started", "In Review"];
  return names.map((item, index) => {
    const person = owners[index % owners.length];
    return {
      id: `${journey.id}-artifact-${index}`,
      name: item.name,
      type: item.type,
      stage: item.stage ?? currentStage.title,
      owner: person.owner,
      initials: person.initials,
      lastUpdated: index === 0 ? "Today 10:12 AM" : index === 1 ? "Today 09:40 AM" : index === 2 ? "Yesterday 04:20 PM" : index === 3 ? "Today 08:55 AM" : "Jun 05 03:15 PM",
      version: `v${index < 4 ? 2 - index * 0.2 : 1}.${index === 0 ? 3 : index}`,
      status: statuses[index % statuses.length],
      size: index === 1 ? "2.4 MB" : index === 0 ? "6.8 MB" : "1.2 MB",
      reviewers: [{ name: journey.owner, initials: journey.initials }, { name: "Anjali Mehta", initials: "AM" }],
    };
  });
}

function journeyApprovalRows(journey: JourneyRecord): ApprovalRecord[] {
  const currentStage = journey.stages.find((stage) => stage.state === "Running" || stage.state === "Pending Review") ?? journey.stages[0];
  const owners = [
    { owner: journey.owner, initials: journey.initials },
    { owner: "Rahul Singh", initials: "RS" },
    { owner: "Anjali Mehta", initials: "AM" },
    { owner: "Sneha Iyer", initials: "SI" },
    { owner: "Rohan Mehta", initials: "RM" },
  ];
  const reviewers = [
    [{ name: "Rahul Singh", initials: "RS" }, { name: "Anjali Mehta", initials: "AM" }],
    [{ name: journey.owner, initials: journey.initials }, { name: "Sneha Iyer", initials: "SI" }],
    [{ name: "Anjali Mehta", initials: "AM" }],
    [{ name: "Priya Nair", initials: "PN" }, { name: "Rohan Mehta", initials: "RM" }],
  ];
  const statuses: ApprovalRecord["status"][] = ["Pending", "In Review", "Pending Review", "Approved", "Not Started", "Approved"];
  const names = approvalNamesForJourney(journey, currentStage.title);
  return names.map((item, index) => {
    const person = owners[index % owners.length];
    return {
      id: `${journey.id}-approval-${index}`,
      name: item.name,
      type: item.type,
      stage: item.stage,
      owner: person.owner,
      initials: person.initials,
      submitted: index === 0 ? "Today 09:10 AM" : index === 1 ? "Today 08:45 AM" : index === 2 ? "Yesterday 04:20 PM" : index === 3 ? "Jun 05 03:15 PM" : index === 4 ? "Jun 04 11:00 AM" : "Today 10:15 AM",
      reviewers: reviewers[index % reviewers.length],
      dueDate: index < 2 ? "Jun 12, 2025" : index === 2 ? "Jun 16, 2025" : index === 3 ? "Jun 18, 2025" : "Jun 20, 2025",
      status: statuses[index % statuses.length],
      version: `v${index === 0 ? "1.0" : index === 1 ? "1.8" : index === 2 ? "1.2" : "1." + index}`,
    };
  });
}

function journeyRunRows(journey: JourneyRecord): RunRecord[] {
  const activeStage = journey.stages.find((stage) => stage.state === "Running" || stage.state === "Pending Review") ?? journey.stages[0];
  const stages = [activeStage.title, journey.stages[Math.max(0, journey.stages.indexOf(activeStage) + 1)]?.title ?? activeStage.title, journey.stages[1]?.title ?? activeStage.title];
  const triggers = [journey.owner, "Rahul Singh", "System", "Anjali Mehta", "Sneha Iyer", "System"];
  const statuses: RunRecord["status"][] = ["Successful", "Successful", "Failed", "Running", "Cancelled", "Queued"];
  const durations = journey.domain === "Claims" ? [24, 18, 31, 22, 16, 0] : journey.domain === "Customer 360" ? [19, 16, 27, 21, 14, 0] : journey.domain === "Sales" ? [33, 25, 42, 28, 18, 0] : [21, 17, 29, 20, 15, 0];
  return statuses.map((status, index) => ({
    id: `RUN-${1028 - index}`,
    runType: index % 2 === 0 ? "Manual" : "Scheduled",
    stage: stages[index % stages.length],
    triggeredBy: triggers[index],
    startTime: index === 0 ? "Today 10:25 AM" : index === 1 ? "Today 08:30 AM" : index === 2 ? "Yesterday 07:15 PM" : index === 3 ? "Yesterday 05:40 PM" : "Jun 18, 2025 11:05 AM",
    endTime: status === "Running" ? "In progress" : status === "Queued" ? "Queued" : index === 0 ? "Today 10:49 AM" : index === 1 ? "Today 08:48 AM" : index === 2 ? "Yesterday 07:46 PM" : "Jun 18, 2025 11:21 AM",
    duration: durations[index],
    status,
    recordsProcessed: index === 0 ? journey.overview.recordsProcessed : index === 2 ? "0.9M" : `${Math.max(2, 13 - index)}.${index}M`,
    outputDatasets: Math.max(1, journey.overview.dataAssets.output - Math.floor(index / 2)),
  }));
}

function runExecutionSteps(run: RunRecord) {
  const failed = run.status === "Failed";
  return [
    { label: "Environment initialized", time: "10:25 AM", duration: "1 min", level: "ok" },
    { label: "Input datasets loaded", time: "10:26 AM", duration: "3 min", level: "ok" },
    { label: failed ? "Quality threshold failed" : "Transformation rules executed", time: "10:29 AM", duration: failed ? "8 min" : "16 min", level: failed ? "warn" : "ok" },
    { label: failed ? "Run marked for investigation" : "Output validation completed", time: "10:45 AM", duration: "3 min", level: failed ? "warn" : "ok" },
    { label: failed ? "Failure notification sent" : "Results published", time: "10:49 AM", duration: "1 min", level: failed ? "warn" : "ok" },
  ];
}

function runLogEvents(run: RunRecord): Array<{ time: string; level: "INFO" | "WARN" | "SUCCESS"; message: string; icon: LucideIcon }> {
  const failed = run.status === "Failed";
  return [
    { time: "10:25:12", level: "INFO", message: `Run started by ${run.triggeredBy} (${run.runType.toLowerCase()} trigger)`, icon: CircleHelp },
    { time: "10:26:03", level: "INFO", message: "Input datasets loaded successfully", icon: CircleHelp },
    { time: "10:38:41", level: failed ? "WARN" : "WARN", message: failed ? "Quality rule failure exceeded stop threshold" : "High memory usage detected on worker node 3", icon: AlertTriangle },
    { time: "10:49:07", level: failed ? "WARN" : "SUCCESS", message: failed ? "Run failed and investigation task was opened" : `Run completed successfully in ${run.duration} min`, icon: CheckCircle2 },
  ];
}

function approvalNamesForJourney(journey: JourneyRecord, currentStage: string) {
  if (journey.domain === "Claims") {
    return [
      { name: "Stage 3 review package", type: "Package", stage: "Data Modeling & Transformation" },
      { name: "Transformation mapping approval", type: "Document", stage: "Data Modeling & Transformation" },
      { name: "Validation checklist sign-off", type: "Checklist", stage: "Data Quality & Validation" },
      { name: "Curated claims model spec", type: "Spec", stage: "Data Productization & Publishing" },
      { name: "Semantic handoff pack", type: "Package", stage: "Context & Semantic Enablement" },
      { name: "Data run notes approval", type: "Notes", stage: "Data Modeling & Transformation" },
    ];
  }
  if (journey.domain === "Customer 360") {
    return [
      { name: "Publication approval package", type: "Package", stage: "Data Productization & Publishing" },
      { name: "Consent policy sign-off", type: "Document", stage: "Data Quality & Validation" },
      { name: "Privacy scan evidence approval", type: "Checklist", stage: "Data Productization & Publishing" },
      { name: "Certified customer product spec", type: "Spec", stage: "Data Productization & Publishing" },
      { name: "Semantic sync approval", type: "Package", stage: "Context & Semantic Enablement" },
      { name: "Customer data run notes", type: "Notes", stage: "Data Productization & Publishing" },
    ];
  }
  if (journey.domain === "Sales") {
    return [
      { name: "Quality exception review", type: "Package", stage: "Data Quality & Validation" },
      { name: "Revenue attribution approval", type: "Document", stage: "Data Modeling & Transformation" },
      { name: "Finance reconciliation sign-off", type: "Checklist", stage: "Data Quality & Validation" },
      { name: "Sales mart publication spec", type: "Spec", stage: "Data Productization & Publishing" },
      { name: "Power BI semantic handoff", type: "Package", stage: "Context & Semantic Enablement" },
      { name: "Quota hierarchy approval", type: "Notes", stage: "Data Quality & Validation" },
    ];
  }
  if (journey.type === "Unstructured") {
    return [
      { name: "Design review package", type: "Package", stage: "Source Onboarding & Ingestion" },
      { name: "Clause taxonomy approval", type: "Document", stage: "Source Onboarding & Ingestion" },
      { name: "Gold standard sample sign-off", type: "Checklist", stage: "Storage, Processing & Extraction" },
      { name: "Extraction prompt review", type: "Notes", stage: "Storage, Processing & Extraction" },
      { name: "Vector index design approval", type: "Spec", stage: "Context & Semantic Enablement" },
      { name: "Human review threshold approval", type: "Package", stage: "Data Quality & Validation" },
    ];
  }
  return [
    { name: "Schema change approval", type: "Package", stage: currentStage },
    { name: "Source access review", type: "Document", stage: "Source Onboarding & Ingestion" },
    { name: "NPI taxonomy sign-off", type: "Checklist", stage: "Storage, Processing & Extraction" },
    { name: "Provider golden record spec", type: "Spec", stage: "Data Quality & Validation" },
    { name: "Directory semantic handoff", type: "Package", stage: "Context & Semantic Enablement" },
    { name: "Provider load notes approval", type: "Notes", stage: currentStage },
  ];
}

function artifactNamesForJourney(journey: JourneyRecord) {
  if (journey.domain === "Claims") {
    return [
      { name: "Data workbook", type: "Spreadsheet", stage: "Data Modeling & Transformation" },
      { name: "Transformation mapping", type: "Document", stage: "Data Modeling & Transformation" },
      { name: "Validation checklist", type: "Checklist", stage: "Data Quality & Validation" },
      { name: "Data run notes", type: "Notes", stage: "Data Modeling & Transformation" },
      { name: "Curated claims model spec", type: "Spec", stage: "Data Productization & Publishing" },
      { name: "Semantic handoff pack", type: "Package", stage: "Context & Semantic Enablement" },
      { name: "Stage 3 review package", type: "Package", stage: "Data Modeling & Transformation" },
    ];
  }
  if (journey.domain === "Customer 360") {
    return [
      { name: "Customer profile workbook", type: "Spreadsheet", stage: "Data Productization & Publishing" },
      { name: "Consent policy mapping", type: "Document", stage: "Data Quality & Validation" },
      { name: "Privacy scan evidence", type: "Checklist", stage: "Data Productization & Publishing" },
      { name: "Customer identity rules", type: "Ruleset", stage: "Data Modeling & Transformation" },
      { name: "Certified product spec", type: "Spec", stage: "Data Productization & Publishing" },
      { name: "Semantic sync package", type: "Package", stage: "Context & Semantic Enablement" },
      { name: "Publication approval bundle", type: "Package", stage: "Data Productization & Publishing" },
    ];
  }
  if (journey.domain === "Sales") {
    return [
      { name: "Sales mart workbook", type: "Spreadsheet", stage: "Data Quality & Validation" },
      { name: "Revenue attribution mapping", type: "Document", stage: "Data Modeling & Transformation" },
      { name: "Quota hierarchy validation", type: "Checklist", stage: "Data Quality & Validation" },
      { name: "Finance reconciliation notes", type: "Notes", stage: "Data Quality & Validation" },
      { name: "Sales performance mart spec", type: "Spec", stage: "Data Productization & Publishing" },
      { name: "Power BI semantic handoff", type: "Package", stage: "Context & Semantic Enablement" },
      { name: "Quality exception package", type: "Package", stage: "Data Quality & Validation" },
    ];
  }
  if (journey.type === "Unstructured") {
    return [
      { name: "Contract sample register", type: "Spreadsheet", stage: "Source Onboarding & Ingestion" },
      { name: "Clause taxonomy mapping", type: "Document", stage: "Source Onboarding & Ingestion" },
      { name: "Gold standard checklist", type: "Checklist", stage: "Storage, Processing & Extraction" },
      { name: "Extraction prompt notes", type: "Notes", stage: "Storage, Processing & Extraction" },
      { name: "Vector index design spec", type: "Spec", stage: "Context & Semantic Enablement" },
      { name: "Human review package", type: "Package", stage: "Data Quality & Validation" },
      { name: "Design review bundle", type: "Package", stage: "Source Onboarding & Ingestion" },
    ];
  }
  return [
    { name: "Provider roster workbook", type: "Spreadsheet", stage: "Storage, Processing & Extraction" },
    { name: "NPI taxonomy mapping", type: "Document", stage: "Storage, Processing & Extraction" },
    { name: "Schema drift checklist", type: "Checklist", stage: "Data Modeling & Transformation" },
    { name: "Provider load notes", type: "Notes", stage: "Storage, Processing & Extraction" },
    { name: "Provider golden record spec", type: "Spec", stage: "Data Quality & Validation" },
    { name: "Directory semantic handoff", type: "Package", stage: "Context & Semantic Enablement" },
    { name: "Stage 2 review package", type: "Package", stage: "Storage, Processing & Extraction" },
  ];
}

function toStageArtifact(artifact: ArtifactRecord): JourneyStage["artifacts"][number] {
  return { name: artifact.name, tag: artifact.status, type: artifact.type, updated: artifact.lastUpdated };
}

function journeyActionFlow(action: string, journeyName: string): DemoFlow {
  return {
    title: action,
    description: `${action} for ${journeyName}. The operation is captured with owner context and audit history.`,
    steps: ["Review selected journey and active stage.", "Validate permissions, dependencies, and required approvals.", "Apply the action and notify affected owners."],
    primaryAction: action,
  };
}

function healthFlow(journeys: JourneyRecord[]): DemoFlow {
  const atRisk = journeys.filter((journey) => journey.health !== "Healthy").length;
  return {
    title: "Journey Health",
    description: `${atRisk} journey${atRisk === 1 ? "" : "s"} currently require attention across quality, approval, or execution checkpoints.`,
    steps: ["Open at-risk and blocked journeys.", "Review delayed stages, overdue approvals, and failed runs.", "Assign remediation or update the target date."],
    primaryAction: "Open health detail",
  };
}

function portfolioMetricFlow(title: string, scope: string): DemoFlow {
  return {
    title,
    description: `Opens the portfolio summary for ${scope}. Inventory filters remain controlled from the Journey Inventory section.`,
    steps: ["Review trend, owners, domains, and recent movement.", "Open the relevant journey list from the detail view when needed.", "Export the portfolio slice or assign follow-up work."],
    primaryAction: "Open portfolio detail",
  };
}

function templateFlow(title: string): DemoFlow {
  return {
    title,
    description: "Applies a reusable journey pattern with stage tasks, governance controls, and recommended artifacts.",
    steps: ["Preview template stages and required inputs.", "Map template tasks to the selected workspace and domain.", "Apply the template to a new or existing journey."],
    primaryAction: "Use template",
  };
}
