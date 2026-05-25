export type AdminIconKey =
  | "connectors"
  | "models"
  | "policies"
  | "users"
  | "environments"
  | "health"
  | "review"
  | "agents"
  | "integrations"
  | "identity"
  | "secret"
  | "gateway"
  | "metadata"
  | "audit"
  | "warning"
  | "info";

export const adminMetrics = [
  {
    icon: "connectors",
    tone: "green",
    label: "Active Connectors",
    value: "45",
    trend: "8%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "models",
    tone: "purple",
    label: "Registered Models",
    value: "18",
    trend: "2%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "policies",
    tone: "orange",
    label: "Active Policies",
    value: "126",
    trend: "6%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "users",
    tone: "orange",
    label: "Users & Groups",
    value: "842",
    trend: "5%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "environments",
    tone: "blue",
    label: "Environments",
    value: "3",
    trend: "-",
    trendTone: "neutral",
    helper: "Stable",
  },
  {
    icon: "health",
    tone: "blue",
    label: "Platform Services",
    value: "99%",
    trend: "Healthy",
    trendTone: "neutral",
    helper: "All systems operational",
  },
] as const;

export const adminTabs = [
  "Overview",
  "Connectors",
  "Models & Services",
  "Access Control",
  "Policies",
  "Review Workflows",
  "Agent Controls",
  "Environments",
  "Integrations",
] as const;

export const adminAreas = [
  {
    icon: "connectors",
    tone: "green",
    title: "Connectors",
    description: "Manage source systems, authentication, scan schedules, connector health.",
    primary: "45 connectors",
    secondary: "42 healthy",
  },
  {
    icon: "models",
    tone: "purple",
    title: "Models & AI Services",
    description: "Register LLMs, embedding models, OCR/document intelligence, parsers, routing rules.",
    primary: "18 models",
    secondary: "17 active",
  },
  {
    icon: "users",
    tone: "orange",
    title: "Access Control",
    description: "Users, groups, roles, workspace access, sensitive data permissions.",
    primary: "842 users",
    secondary: "132 groups",
  },
  {
    icon: "policies",
    tone: "orange",
    title: "Governance Policies",
    description: "PHI/PII handling, quality thresholds, lineage requirements, publish approvals.",
    primary: "126 policies",
    secondary: "98 active",
  },
  {
    icon: "review",
    tone: "orange",
    title: "Review Workflows",
    description: "Review queues, SLA rules, escalation logic, reviewer groups.",
    primary: "24 workflows",
    secondary: "11 active",
  },
  {
    icon: "agents",
    tone: "purple",
    title: "Agent Controls",
    description: "Autonomous action limits, confidence thresholds, tool access, approval policies.",
    primary: "14 agents",
    secondary: "12 active",
  },
  {
    icon: "environments",
    tone: "blue",
    title: "Environments",
    description: "Dev, UAT, Production, feature flags, promotions.",
    primary: "3 environments",
    secondary: "Prod",
  },
  {
    icon: "integrations",
    tone: "green",
    title: "Integrations",
    description: "API gateway, MCP registry, BI integrations, notifications, observability hooks.",
    primary: "23 integrations",
    secondary: "21 active",
  },
] as const;

export const adminRecommendations = [
  {
    icon: "warning",
    tone: "orange",
    title: "Rotate expiring connector credentials",
    detail: "7 connectors have credentials expiring in 30 days",
    badge: "Medium",
    badgeTone: "orange",
  },
  {
    icon: "policies",
    tone: "purple",
    title: "Enable PHI review policy for new sources",
    detail: "3 new sources not covered by PHI review policy",
    badge: "High",
    badgeTone: "red",
  },
  {
    icon: "connectors",
    tone: "blue",
    title: "Promote approved rules to Production",
    detail: "18 rules approved in UAT pending promotion",
    badge: "Info",
    badgeTone: "blue",
  },
  {
    icon: "models",
    tone: "purple",
    title: "Review model cost limits",
    detail: "2 models exceed monthly cost thresholds",
    badge: "Medium",
    badgeTone: "orange",
  },
] as const;

export const pendingAdminApprovals = [
  {
    icon: "connectors",
    tone: "green",
    title: "New Connector Request: Veeva Vault RIM",
    requester: "Requested by: Arjun Mehta",
    sla: "SLA: 2h 45m",
  },
  {
    icon: "models",
    tone: "purple",
    title: "Model Access Request: Clinical LLM",
    requester: "Requested by: Priya Nair",
    sla: "SLA: 1h 20m",
  },
  {
    icon: "integrations",
    tone: "green",
    title: "API Gateway Access Request",
    requester: "Requested by: Neha Patel",
    sla: "SLA: 3h 10m",
  },
  {
    icon: "environments",
    tone: "blue",
    title: "Production Promotion Request",
    requester: "Requested by: Vikram Singh",
    sla: "SLA: 2h 55m",
  },
] as const;

export const riskSignals = [
  {
    icon: "warning",
    tone: "orange",
    title: "Policies missing owner",
    count: 12,
    badge: "High",
    badgeTone: "red",
  },
  {
    icon: "info",
    tone: "blue",
    title: "Connectors without recent health check",
    count: 4,
    badge: "Medium",
    badgeTone: "orange",
  },
  {
    icon: "users",
    tone: "green",
    title: "Users with elevated access",
    count: 27,
    badge: "High",
    badgeTone: "red",
  },
  {
    icon: "models",
    tone: "purple",
    title: "Services missing cost limits",
    count: 3,
    badge: "Medium",
    badgeTone: "orange",
  },
] as const;

export const adminActivity = [
  {
    time: "10:24 AM",
    activity: "Connector rotated",
    areaIcon: "connectors",
    area: "Connectors",
    details: "Rotated credentials for ADLS Gen2 connector",
    status: "Completed",
    statusTone: "green",
    owner: "Arjun Mehta",
  },
  {
    time: "10:18 AM",
    activity: "Policy updated",
    areaIcon: "policies",
    area: "Governance Policies",
    details: "Updated PHI handling policy v3.2",
    status: "Completed",
    statusTone: "green",
    owner: "Dr. Priya Nair",
  },
  {
    time: "10:12 AM",
    activity: "Model registered",
    areaIcon: "models",
    area: "Models & AI Services",
    details: "Registered embedding model: HealthEmbed v1.3",
    status: "Completed",
    statusTone: "green",
    owner: "Neha Patel",
  },
  {
    time: "10:05 AM",
    activity: "Access request approved",
    areaIcon: "users",
    area: "Access Control",
    details: "Approved access for user: Dr. Sarah Chen",
    status: "Completed",
    statusTone: "green",
    owner: "Vikram Singh",
  },
  {
    time: "09:58 AM",
    activity: "Production promotion",
    areaIcon: "environments",
    area: "Environments",
    details: "Promoted 18 rules from UAT to Production",
    status: "Completed",
    statusTone: "green",
    owner: "Arjun Mehta",
  },
] as const;

export const adminServices = [
  {
    icon: "identity",
    name: "Identity Provider",
    region: "Okta",
    status: "Healthy",
  },
  {
    icon: "secret",
    name: "Secret Store",
    region: "Azure Key Vault",
    status: "Healthy",
  },
  {
    icon: "policies",
    name: "Policy Engine",
    region: "OPA Policy Service",
    status: "Healthy",
  },
  {
    icon: "gateway",
    name: "Model Gateway",
    region: "Managed Endpoints",
    status: "Healthy",
  },
  {
    icon: "metadata",
    name: "Metadata Store",
    region: "Azure Cosmos DB",
    status: "Healthy",
  },
  {
    icon: "audit",
    name: "Audit Store",
    region: "Immutable Store",
    status: "Healthy",
  },
] as const;
