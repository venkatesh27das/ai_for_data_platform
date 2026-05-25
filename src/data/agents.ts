export type AgentIconKey =
  | "planner"
  | "file"
  | "linkage"
  | "shield"
  | "remediate"
  | "users"
  | "success"
  | "health"
  | "pulse"
  | "box"
  | "cloud"
  | "briefcase"
  | "graph"
  | "policy"
  | "registry"
  | "evaluation"
  | "trace";

export const agentMetrics = [
  {
    icon: "planner",
    tone: "green",
    label: "Active Agents",
    value: "18",
    trend: "12%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "pulse",
    tone: "blue",
    label: "Running Workflows",
    value: "9",
    trend: "8%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "users",
    tone: "orange",
    label: "Human Escalations",
    value: "14",
    trend: "6%",
    trendTone: "down",
    helper: "vs last 30 days",
  },
  {
    icon: "success",
    tone: "green",
    label: "Success Rate",
    value: "93%",
    trend: "3%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "shield",
    tone: "purple",
    label: "Governed Agents",
    value: "16",
    trend: "2",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "health",
    tone: "blue",
    label: "Avg Confidence",
    value: "89%",
    trend: "4%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
] as const;

export const agentTabs = ["All Agents", "Active", "Pending Review", "Workflows", "Policies", "Templates"] as const;

export const agentRegistry = [
  {
    icon: "planner",
    tone: "green",
    agent: "Journey Planner Agent",
    purpose: "Creates AI blueprint from business goal",
    journeys: 12,
    success: "96%",
    confidence: "94%",
    escalations: 2,
    governance: "Human approval for publish plan",
    status: "Active",
    statusTone: "green",
  },
  {
    icon: "file",
    tone: "blue",
    agent: "Extraction Agent",
    purpose: "Extracts structure, fields, and metadata from complex files",
    journeys: 10,
    success: "92%",
    confidence: "90%",
    escalations: 5,
    governance: "PHI-sensitive review enabled",
    status: "Active",
    statusTone: "green",
  },
  {
    icon: "linkage",
    tone: "purple",
    agent: "Structured Linkage Agent",
    purpose: "Maps extracted entities to master data and data products",
    journeys: 6,
    success: "88%",
    confidence: "84%",
    escalations: 8,
    governance: "Review below 85% match",
    status: "Needs Review",
    statusTone: "orange",
  },
  {
    icon: "shield",
    tone: "orange",
    agent: "Validation Agent",
    purpose: "Runs quality, policy, and completeness checks",
    journeys: 14,
    success: "95%",
    confidence: "91%",
    escalations: 3,
    governance: "Auto-remediate low-risk failures",
    status: "Active",
    statusTone: "green",
  },
  {
    icon: "remediate",
    tone: "cyan",
    agent: "Remediation Agent",
    purpose: "Suggests fixes and retries failed validation or linkage steps",
    journeys: 7,
    success: "86%",
    confidence: "82%",
    escalations: 9,
    governance: "Human approval before rerun",
    status: "Draft",
    statusTone: "neutral",
  },
] as const;

export const recommendedAgentActions = [
  {
    icon: "success",
    tone: "green",
    title: "Approve Structured Linkage Agent threshold update",
    description: "12 low-confidence matches in Invoice Processing",
    badge: "81%",
    badgeTone: "green",
  },
  {
    icon: "shield",
    tone: "purple",
    title: "Review Extraction Agent PHI handling policy",
    description: "New clinical notes source detected",
    badge: "High Impact",
    badgeTone: "red",
  },
  {
    icon: "pulse",
    tone: "orange",
    title: "Promote Validation Agent ruleset to production",
    description: "All sandbox tests passed",
    badge: "Ready",
    badgeTone: "green",
  },
  {
    icon: "users",
    tone: "blue",
    title: "Add human checkpoint to Remediation Agent",
    description: "Auto-rerun cost exceeds threshold",
    badge: "Recommended",
    badgeTone: "blue",
  },
] as const;

export const agentOrchestration = [
  { icon: "planner", label: "Planner", value: "12", tone: "green" },
  { icon: "health", label: "Profiling", value: "9", tone: "blue" },
  { icon: "file", label: "Extraction", value: "10", tone: "blue" },
  { icon: "shield", label: "Validation", value: "14", tone: "orange" },
  { icon: "box", label: "Modeling", value: "8", tone: "purple" },
  { icon: "linkage", label: "Linkage", value: "6", tone: "purple" },
  { icon: "cloud", label: "Consumption", value: "7", tone: "blue" },
  { icon: "users", label: "Review", value: "14", tone: "orange" },
] as const;

export const agentTemplates = [
  {
    icon: "briefcase",
    tone: "green",
    title: "Policy Journey Copilot",
    description: "Build a multi-agent policy processing workflow",
  },
  {
    icon: "file",
    tone: "blue",
    title: "Invoice Extraction Reviewer",
    description: "Extract invoice entities with validation and review",
  },
  {
    icon: "health",
    tone: "purple",
    title: "Clinical Notes Guardrail Flow",
    description: "Route sensitive content through validation and human review",
  },
] as const;

export const pendingAgentApprovals = [
  {
    icon: "briefcase",
    tone: "green",
    title: "Publish agent workflow: Provider Contract Intelligence Copilot",
    owner: "Owner: Vikram Singh",
    sla: "SLA: 1h 10m",
  },
  {
    icon: "shield",
    tone: "purple",
    title: "Policy exception: Extraction Agent clinical PHI rule",
    owner: "Reviewer: Dr. Priya Nair",
    sla: "SLA: 2h 05m",
  },
  {
    icon: "linkage",
    tone: "purple",
    title: "Threshold update: Structured Linkage Agent",
    owner: "Reviewer: Neha Patel",
    sla: "SLA: 3h 00m",
  },
] as const;

export const agentActivity = [
  {
    time: "10:32 AM",
    agent: "Journey Planner Agent",
    type: "Blueprint Generated",
    details: "Created policy journey plan from user intent",
    status: "Completed",
    statusTone: "green",
    owner: "Priya Nair",
  },
  {
    time: "10:26 AM",
    agent: "Extraction Agent",
    type: "Extraction Updated",
    details: "Refined table extraction for provider contract PDFs",
    status: "Completed",
    statusTone: "green",
    owner: "Arjun Mehta",
  },
  {
    time: "10:19 AM",
    agent: "Structured Linkage Agent",
    type: "Match Review Required",
    details: "23 entity matches below confidence threshold",
    status: "Pending Review",
    statusTone: "orange",
    owner: "Neha Patel",
  },
  {
    time: "10:11 AM",
    agent: "Validation Agent",
    type: "Policy Check Failed",
    details: "PHI masking rule violated in clinical notes sample",
    status: "Failed",
    statusTone: "red",
    owner: "Dr. Priya Nair",
  },
  {
    time: "09:58 AM",
    agent: "Remediation Agent",
    type: "Retry Suggested",
    details: "Proposed rerun with updated mapping rules",
    status: "Completed",
    statusTone: "green",
    owner: "Vikram Singh",
  },
] as const;

export const connectedAgentServices = [
  {
    icon: "database",
    name: "Agent Runtime",
    region: "18 Deployments",
    status: "Healthy",
  },
  {
    icon: "box",
    name: "Prompt Registry",
    region: "42 Templates",
    status: "Healthy",
  },
  {
    icon: "evaluation",
    name: "Evaluation Store",
    region: "Eval 360",
    status: "Healthy",
  },
  {
    icon: "policy",
    name: "Policy Engine",
    region: "Guardrails Active",
    status: "Healthy",
  },
  {
    icon: "trace",
    name: "Trace Service",
    region: "OpenTelemetry",
    status: "Healthy",
  },
] as const;
