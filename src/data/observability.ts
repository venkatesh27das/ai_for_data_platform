export type ObservabilityIconKey =
  | "runs"
  | "success"
  | "alert"
  | "shield"
  | "lineage"
  | "health"
  | "warning"
  | "info"
  | "link"
  | "policy"
  | "audit"
  | "metric"
  | "log"
  | "trace"
  | "monitor"
  | "store"
  | "usage"
  | "quality";

export const observabilityMetrics = [
  {
    icon: "runs",
    tone: "blue",
    label: "Total Runs Today",
    value: "284",
    trend: "18%",
    trendTone: "up",
    helper: "vs yesterday",
  },
  {
    icon: "success",
    tone: "green",
    label: "Success Rate",
    value: "94%",
    trend: "3%",
    trendTone: "up",
    helper: "vs yesterday",
  },
  {
    icon: "alert",
    tone: "orange",
    label: "Active Alerts",
    value: "7",
    trend: "2",
    trendTone: "down",
    helper: "vs yesterday",
  },
  {
    icon: "shield",
    tone: "purple",
    label: "Policy Violations",
    value: "11",
    trend: "18%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "lineage",
    tone: "blue",
    label: "Lineage Coverage",
    value: "93%",
    trend: "4%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "health",
    tone: "blue",
    label: "Platform Health",
    value: "99%",
    trend: "Healthy",
    trendTone: "neutral",
    helper: "All systems operational",
  },
] as const;

export const observabilityTabs = [
  "Core Dashboard",
  "Runs",
  "Agent Activity",
  "Lineage",
  "Governance",
  "Audit & Compliance",
  "Cost & Usage",
] as const;

export const operationalSeries = {
  labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
  success: [184, 196, 222, 205, 214, 218],
  failed: [26, 32, 38, 24, 23, 31],
  partial: [6, 7, 8, 6, 9, 7],
};

export const riskCoverage = [
  { label: "Compliant", value: "128 (59.8%)", color: "#12a66a" },
  { label: "Review Needed", value: "38 (17.8%)", color: "#f59e0b" },
  { label: "Pending", value: "24 (11.2%)", color: "#2563eb" },
  { label: "Exception", value: "24 (11.2%)", color: "#ef4444" },
] as const;

export const activeAlerts = [
  {
    icon: "warning",
    tone: "red",
    title: "Failed pipeline run",
    detail: "Invoice Intelligence / Processing",
    time: "10 min ago",
  },
  {
    icon: "warning",
    tone: "orange",
    title: "Low data quality score",
    detail: "Clinical Notes / Quality Validation",
    time: "15 min ago",
  },
  {
    icon: "shield",
    tone: "purple",
    title: "Policy violation detected",
    detail: "PHI in unclassified data",
    time: "22 min ago",
  },
  {
    icon: "warning",
    tone: "orange",
    title: "Human review SLA breach",
    detail: "12 items waiting > 24h",
    time: "1 hr ago",
  },
  {
    icon: "info",
    tone: "blue",
    title: "Lineage gap detected",
    detail: "3 assets missing upstream source",
    time: "2 hr ago",
  },
] as const;

export const platformActivity = [
  {
    time: "10:24 AM",
    activity: "Failed validation in extraction",
    asset: "Invoice Processing Journey",
    type: "Validation",
    status: "Failed",
    statusTone: "red",
    owner: "Arjun Mehta",
  },
  {
    time: "10:18 AM",
    activity: "Lineage updated",
    asset: "Policy Knowledge Product",
    type: "Lineage",
    status: "Completed",
    statusTone: "green",
    owner: "Neha Patel",
  },
  {
    time: "10:12 AM",
    activity: "Policy published",
    asset: "PHI Handling v2.3",
    type: "Governance",
    status: "Completed",
    statusTone: "green",
    owner: "Priya Nair",
  },
  {
    time: "10:05 AM",
    activity: "Human review SLA breach",
    asset: "Clinical Notes to Patient Profile",
    type: "Human Review",
    status: "Pending Review",
    statusTone: "orange",
    owner: "Dr. Priya Nair",
  },
  {
    time: "09:58 AM",
    activity: "API publishing completed",
    asset: "Policy Search Index v1.2",
    type: "Publication",
    status: "Completed",
    statusTone: "green",
    owner: "Vikram Singh",
  },
] as const;

export const platformHealth = [
  { name: "Ingestion Services", status: "Healthy" },
  { name: "Extraction Services", status: "Healthy" },
  { name: "Vector Stores", status: "Healthy" },
  { name: "Metadata Store", status: "Healthy" },
  { name: "API Publishing", status: "Healthy" },
] as const;

export const qualityTrend = {
  labels: ["May 12", "May 13", "May 14", "May 15", "May 16", "May 17", "May 18"],
  values: [78, 85, 86, 72, 75, 82, 77],
};

export const policyViolations = [
  { name: "Unclassified Sensitive Data", count: 7 },
  { name: "PII Detected in Unmasked Form", count: 5 },
  { name: "Access Without Approval", count: 3 },
  { name: "Retention Policy Violation", count: 2 },
  { name: "Data Shared Externally", count: 1 },
] as const;

export const governanceActivity = [
  { icon: "link", tone: "blue", title: "Steward assigned: Provider Onboarding Docs", time: "1h ago" },
  { icon: "warning", tone: "red", title: "Exception approved: Research Paper KG", time: "2h ago" },
  { icon: "lineage", tone: "green", title: "Lineage updated: Policy Knowledge Product", time: "3h ago" },
  { icon: "policy", tone: "blue", title: "Policy published: PHI Handling v2.3", time: "4h ago" },
  { icon: "shield", tone: "green", title: "Policy violation resolved: Clinical Notes Profile", time: "5h ago" },
] as const;

export const observabilityActions = [
  { icon: "link", tone: "green", title: "Reprocess failed validation runs", badge: "High Impact", badgeTone: "red" },
  { icon: "link", tone: "green", title: "Update lineage for partial coverage assets", badge: "Recommended", badgeTone: "green" },
  { icon: "link", tone: "green", title: "Resolve 6 access exceptions", badge: "High Impact", badgeTone: "red" },
  { icon: "policy", tone: "green", title: "Review pending approvals", badge: "Cost Saving", badgeTone: "green" },
] as const;

export const observabilityServices = [
  { icon: "metric", name: "Metrics Service", region: "Prometheus", status: "Healthy" },
  { icon: "log", name: "Log Store", region: "Databricks Delta", status: "Healthy" },
  { icon: "trace", name: "Trace Service", region: "OpenTelemetry", status: "Healthy" },
  { icon: "monitor", name: "Policy Monitor", region: "Policy Engine", status: "Healthy" },
  { icon: "store", name: "Audit Store", region: "Immutable Store", status: "Healthy" },
  { icon: "usage", name: "Usage Metering", region: "Cost & Usage", status: "Healthy" },
] as const;
