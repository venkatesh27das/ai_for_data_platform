export type JourneyTone = "green" | "blue" | "purple" | "orange" | "red" | "cyan";
export type JourneyTrendTone = "up" | "down" | "neutral";

export type JourneyIconKey =
  | "rocket"
  | "file"
  | "pulse"
  | "users"
  | "box"
  | "health"
  | "shield"
  | "database"
  | "cloud"
  | "zap"
  | "share"
  | "play"
  | "layers"
  | "graph"
  | "gateway"
  | "link";

export const journeyMetrics = [
  {
    icon: "rocket",
    tone: "green",
    label: "Active Journeys",
    value: "36",
    trend: "20%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "file",
    tone: "blue",
    label: "Draft Journeys",
    value: "8",
    trend: "2",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "pulse",
    tone: "purple",
    label: "Running Journeys",
    value: "14",
    trend: "12%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "users",
    tone: "orange",
    label: "Pending Reviews",
    value: "11",
    trend: "3%",
    trendTone: "down",
    helper: "vs last 30 days",
  },
  {
    icon: "box",
    tone: "purple",
    label: "Published Journeys",
    value: "21",
    trend: "16%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "health",
    tone: "blue",
    label: "Avg Quality Score",
    value: "92%",
    trend: "4%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
] as const;

export const journeyTabs = ["All Journeys", "Draft", "Running", "Pending Review", "Published", "Templates"] as const;

export const journeyPortfolio = [
  {
    icon: "box",
    tone: "purple",
    journey: "Policy Knowledge Product",
    domain: "Payer Ops",
    stageIcon: "box",
    stageTone: "purple",
    currentStage: "Knowledge & Linkage",
    progress: 72,
    quality: 94,
    links: "Policy Master, Product Master",
    outputs: "Vector, Search, API",
    owner: "Priya Nair",
    status: "In Progress",
    statusTone: "blue",
  },
  {
    icon: "file",
    tone: "green",
    journey: "Invoice Processing & Vendor Linkage",
    domain: "Finance",
    stageIcon: "users",
    stageTone: "orange",
    currentStage: "Quality Review",
    progress: 61,
    quality: 89,
    links: "Vendor Master, PO Table, Payment Data",
    outputs: "Table, Entity, API",
    owner: "Arjun Mehta",
    status: "Pending Review",
    statusTone: "orange",
  },
  {
    icon: "health",
    tone: "blue",
    journey: "Clinical Notes to Patient Profile",
    domain: "Clinical",
    stageIcon: "pulse",
    stageTone: "blue",
    currentStage: "Processing",
    progress: 48,
    quality: 91,
    links: "Patient Profile, Claims Data Product",
    outputs: "Entity, Graph",
    owner: "Dr. Priya Nair",
    status: "Running",
    statusTone: "blue",
  },
  {
    icon: "shield",
    tone: "orange",
    journey: "Provider Contract Intelligence",
    domain: "Provider Mgmt",
    stageIcon: "shield",
    stageTone: "orange",
    currentStage: "Consumption",
    progress: 86,
    quality: 95,
    links: "Supplier Master, Risk Register",
    outputs: "Search, MCP, Table",
    owner: "Vikram Singh",
    status: "Ready to Publish",
    statusTone: "green",
  },
  {
    icon: "share",
    tone: "purple",
    journey: "Research Paper Knowledge Graph",
    domain: "R&D",
    stageIcon: "database",
    stageTone: "green",
    currentStage: "Ingestion",
    progress: 24,
    quality: 88,
    links: "Molecule, Indication, Trial Registry",
    outputs: "Graph, API",
    owner: "Neha Patel",
    status: "Draft",
    statusTone: "neutral",
  },
] as const;

export const aiRecommendations = [
  {
    icon: "zap",
    tone: "purple",
    title: "Generate quality rules for Policy Knowledge Product",
    description: "Auto-detected rule gaps in 12 fields",
    badge: "94%",
    badgeTone: "green",
  },
  {
    icon: "users",
    tone: "orange",
    title: "Review low-confidence entity matches in Invoice Processing",
    description: "23 entities below 85% confidence",
    badge: "81%",
    badgeTone: "orange",
  },
  {
    icon: "box",
    tone: "green",
    title: "Publish Provider Contract Intelligence to Search + MCP",
    description: "All quality gates passed",
    badge: "Ready",
    badgeTone: "green",
  },
  {
    icon: "shield",
    tone: "blue",
    title: "Add human review checkpoint for Clinical Notes PHI handling",
    description: "PHI detection confidence below threshold",
    badge: "Recommended",
    badgeTone: "blue",
  },
] as const;

export const lifecycleOverview = [
  { icon: "database", label: "Source", value: "36", tone: "purple" },
  { icon: "cloud", label: "Ingestion", value: "12", tone: "purple" },
  { icon: "pulse", label: "Processing", value: "14", tone: "purple" },
  { icon: "shield", label: "Quality", value: "11", tone: "purple" },
  { icon: "box", label: "Knowledge & Linkage", value: "9", tone: "purple" },
  { icon: "share", label: "Consumption", value: "8", tone: "purple" },
  { icon: "play", label: "Runs", value: "284", tone: "purple" },
  { icon: "shield", label: "Governance", value: "36", tone: "purple" },
] as const;

export const journeyTemplates = [
  {
    icon: "box",
    tone: "purple",
    title: "Policy Knowledge Product",
    description: "Build governed policy knowledge assets with search & APIs",
  },
  {
    icon: "file",
    tone: "green",
    title: "Invoice Entity Extraction",
    description: "Extract and structure invoice entities with validation",
  },
  {
    icon: "health",
    tone: "blue",
    title: "Clinical Notes Enrichment",
    description: "Enrich clinical notes into patient profiles",
  },
] as const;

export const pendingApprovals = [
  {
    icon: "users",
    tone: "orange",
    title: "Publish Approval: Provider Contract Intelligence",
    owner: "Owner: Vikram Singh",
    sla: "SLA: 1h 20m",
  },
  {
    icon: "shield",
    tone: "blue",
    title: "PHI Review: Clinical Notes to Patient Profile",
    owner: "Reviewer: Dr. Priya Nair",
    sla: "SLA: 2h 15m",
  },
  {
    icon: "link",
    tone: "orange",
    title: "Linkage Conflict: Invoice Processing & Vendor Linkage",
    owner: "Reviewer: Neha Patel",
    sla: "SLA: 3h 10m",
  },
] as const;

export const journeyActivity = [
  {
    time: "10:24 AM",
    journey: "Policy Knowledge Product",
    type: "Blueprint Generated",
    details: "AI blueprint generated from policy corpus",
    status: "Completed",
    statusTone: "green",
    actor: "Priya Nair",
  },
  {
    time: "10:18 AM",
    journey: "Invoice Processing & Vendor Linkage",
    type: "Extraction Plan Updated",
    details: "Updated field mappings for vendor invoices",
    status: "Completed",
    statusTone: "green",
    actor: "Arjun Mehta",
  },
  {
    time: "10:12 AM",
    journey: "Clinical Notes to Patient Profile",
    type: "Validation Failed",
    details: "PHI redaction rule violation detected",
    status: "Failed",
    statusTone: "red",
    actor: "Dr. Priya Nair",
  },
  {
    time: "10:05 AM",
    journey: "Provider Contract Intelligence",
    type: "Publish Request Submitted",
    details: "Requested publish to Search + MCP",
    status: "Pending",
    statusTone: "orange",
    actor: "Vikram Singh",
  },
  {
    time: "09:58 AM",
    journey: "Invoice Processing & Vendor Linkage",
    type: "Linkage Review Completed",
    details: "Resolved 5 linkage conflicts",
    status: "Completed",
    statusTone: "green",
    actor: "Neha Patel",
  },
] as const;

export const connectedJourneyServices = [
  {
    icon: "database",
    name: "Source Connectors",
    region: "45 Connectors",
    status: "Healthy",
  },
  {
    icon: "share",
    name: "Processing Pipelines",
    region: "23 Pipelines",
    status: "Healthy",
  },
  {
    icon: "layers",
    name: "Vector Store",
    region: "Pinecone",
    status: "Healthy",
  },
  {
    icon: "graph",
    name: "Knowledge Graph",
    region: "Neo4j Cluster",
    status: "Healthy",
  },
  {
    icon: "gateway",
    name: "API Publishing",
    region: "Kong Enterprise",
    status: "Healthy",
  },
] as const;
