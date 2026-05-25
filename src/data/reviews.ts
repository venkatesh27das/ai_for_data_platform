export type ReviewIconKey =
  | "inbox"
  | "alert"
  | "clock"
  | "shield"
  | "success"
  | "user"
  | "file"
  | "building"
  | "warning"
  | "relationship"
  | "publish"
  | "agent"
  | "route"
  | "evidence"
  | "policy"
  | "audit"
  | "notification"
  | "rules"
  | "spark";

export const reviewMetrics = [
  {
    icon: "inbox",
    tone: "orange",
    label: "Pending Reviews",
    value: "238",
    trend: "12%",
    trendTone: "up",
    helper: "vs yesterday",
  },
  {
    icon: "alert",
    tone: "red",
    label: "High Priority",
    value: "52",
    trend: "8%",
    trendTone: "down",
    helper: "vs yesterday",
  },
  {
    icon: "clock",
    tone: "purple",
    label: "SLA Breaches",
    value: "7",
    trend: "2",
    trendTone: "down",
    helper: "vs yesterday",
  },
  {
    icon: "shield",
    tone: "blue",
    label: "Avg Confidence",
    value: "74%",
    trend: "5%",
    trendTone: "up",
    helper: "vs last 7 days",
  },
  {
    icon: "success",
    tone: "green",
    label: "Auto-Resolved",
    value: "186",
    trend: "15%",
    trendTone: "up",
    helper: "vs last 7 days",
  },
  {
    icon: "user",
    tone: "orange",
    label: "Review Throughput",
    value: "132/day",
    trend: "10%",
    trendTone: "up",
    helper: "vs last 7 days",
  },
] as const;

export const reviewTabs = ["All Reviews", "Extraction", "Quality", "Linkage", "Sensitive Data", "Publishing", "Agent Decisions"] as const;

export const reviewQueue = [
  {
    icon: "file",
    tone: "purple",
    item: "Policy Clause Extraction",
    detail: "Page 14 - Section 3.2",
    asset: "Policy Knowledge Product",
    assetDetail: "Policy PDFs",
    type: "Extraction",
    typeTone: "purple",
    trigger: "Low confidence field",
    triggerDetail: "Effective Date",
    confidence: "62%",
    confidenceTone: "orange",
    priority: "High",
    priorityTone: "red",
    sla: "2h 15m",
    assignee: "Sarah Mitchell",
    initials: "SM",
    status: "Pending",
    statusTone: "orange",
  },
  {
    icon: "building",
    tone: "green",
    item: "Vendor Entity Match",
    detail: "Acme Medical Inc.",
    asset: "Invoice Processing & Vendor Linkage",
    assetDetail: "",
    type: "Linkage",
    typeTone: "green",
    trigger: "Low match confidence",
    triggerDetail: "Vendor Master",
    confidence: "48%",
    confidenceTone: "red",
    priority: "High",
    priorityTone: "red",
    sla: "1h 45m",
    assignee: "Rohit Jain",
    initials: "RJ",
    status: "Pending",
    statusTone: "orange",
  },
  {
    icon: "shield",
    tone: "blue",
    item: "PHI Detected",
    detail: "Clinical Note - Page 3",
    asset: "Clinical Notes to Patient Profile",
    assetDetail: "",
    type: "Sensitive Data",
    typeTone: "blue",
    trigger: "PHI detected",
    triggerDetail: "Patient Name",
    confidence: "-",
    confidenceTone: "neutral",
    priority: "High",
    priorityTone: "red",
    sla: "1h 10m",
    assignee: "Priya Nair",
    initials: "PN",
    status: "Pending",
    statusTone: "orange",
  },
  {
    icon: "warning",
    tone: "orange",
    item: "Validation Failure",
    detail: "Missing Policy ID",
    asset: "Policy Knowledge Product",
    assetDetail: "Policy PDFs",
    type: "Quality",
    typeTone: "orange",
    trigger: "Mandatory field missing",
    triggerDetail: "Policy ID",
    confidence: "-",
    confidenceTone: "neutral",
    priority: "Medium",
    priorityTone: "orange",
    sla: "4h 30m",
    assignee: "Arjun Mehta",
    initials: "AR",
    status: "In Review",
    statusTone: "blue",
  },
  {
    icon: "relationship",
    tone: "purple",
    item: "Relationship Review",
    detail: "Policy -> Product",
    asset: "Policy Knowledge Product",
    assetDetail: "Policy PDFs",
    type: "Linkage",
    typeTone: "green",
    trigger: "Ambiguous relationship",
    triggerDetail: "Multiple product matches",
    confidence: "41%",
    confidenceTone: "red",
    priority: "Medium",
    priorityTone: "orange",
    sla: "6h 20m",
    assignee: "Neha Kulkarni",
    initials: "NK",
    status: "Pending",
    statusTone: "orange",
  },
  {
    icon: "publish",
    tone: "orange",
    item: "Publish Approval",
    detail: "Search Index + MCP Tool",
    asset: "Provider Contract Intelligence",
    assetDetail: "",
    type: "Publishing",
    typeTone: "orange",
    trigger: "Publish approval required",
    triggerDetail: "Steward approval",
    confidence: "-",
    confidenceTone: "neutral",
    priority: "High",
    priorityTone: "red",
    sla: "3h 05m",
    assignee: "Vikram Singh",
    initials: "VS",
    status: "Pending",
    statusTone: "orange",
  },
  {
    icon: "agent",
    tone: "blue",
    item: "Agent Decision Review",
    detail: "Auto Schema Suggestion",
    asset: "Invoice Processing & Vendor Linkage",
    assetDetail: "",
    type: "Agent Decision",
    typeTone: "blue",
    trigger: "Schema change suggested",
    triggerDetail: "New field added",
    confidence: "68%",
    confidenceTone: "orange",
    priority: "Low",
    priorityTone: "neutral",
    sla: "1d 2h",
    assignee: "Sarah Mitchell",
    initials: "SM",
    status: "Pending",
    statusTone: "orange",
  },
] as const;

export const reviewRecommendations = [
  {
    icon: "spark",
    tone: "purple",
    title: "Auto-approve 18 low-risk items",
    description: "High confidence (>90%) and no policy violations",
    action: "Review Items",
  },
  {
    icon: "rules",
    tone: "green",
    title: "Create rule for 7 similar corrections",
    description: "Save time on recurring effective date formats",
    action: "Create Rule",
  },
  {
    icon: "user",
    tone: "purple",
    title: "Assign 23 unassigned items",
    description: "High priority items waiting for assignment",
    action: "Assign Now",
  },
] as const;

export const reviewBreakdown = [
  { label: "Extraction", value: "62 (26%)", color: "#f97316" },
  { label: "Linkage", value: "58 (24%)", color: "#16a34a" },
  { label: "Quality", value: "44 (18%)", color: "#2563eb" },
  { label: "Sensitive Data", value: "34 (14%)", color: "#3b82f6" },
  { label: "Publishing", value: "24 (10%)", color: "#ef4444" },
  { label: "Agent Decisions", value: "16 (7%)", color: "#8a3ffc" },
] as const;

export const reviewerWorkload = [
  { name: "Sarah Mitchell", count: 35, width: 100 },
  { name: "Priya Nair", count: 28, width: 80 },
  { name: "Rohit Jain", count: 24, width: 68 },
  { name: "Arjun Mehta", count: 21, width: 60 },
  { name: "Neha Kulkarni", count: 18, width: 52 },
] as const;

export const reviewServices = [
  {
    icon: "route",
    name: "Task Routing",
    region: "Optimal",
    status: "Healthy",
  },
  {
    icon: "evidence",
    name: "Evidence Store",
    region: "ADLS Gen2",
    status: "Healthy",
  },
  {
    icon: "policy",
    name: "Policy Engine",
    region: "Version 2.4.1",
    status: "Healthy",
  },
  {
    icon: "audit",
    name: "Audit Trail",
    region: "Last updated: 2m ago",
    status: "Healthy",
  },
  {
    icon: "notification",
    name: "Notification Service",
    region: "Connected",
    status: "Healthy",
  },
  {
    icon: "rules",
    name: "Rules Repository",
    region: "1,284 rules",
    status: "Healthy",
  },
] as const;
