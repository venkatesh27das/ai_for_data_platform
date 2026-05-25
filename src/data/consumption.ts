export type ConsumptionIconKey =
  | "box"
  | "shield"
  | "users"
  | "code"
  | "search"
  | "health"
  | "table"
  | "graph"
  | "mcp"
  | "api"
  | "file"
  | "lineage"
  | "lock"
  | "gateway"
  | "registry"
  | "vector"
  | "access"
  | "quality";

export const consumptionMetrics = [
  {
    icon: "box",
    tone: "purple",
    label: "Published Assets",
    value: "1,284",
    trend: "18%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "shield",
    tone: "green",
    label: "Certified Assets",
    value: "612",
    trend: "14%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "users",
    tone: "orange",
    label: "Active Consumers",
    value: "842",
    trend: "16%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "code",
    tone: "blue",
    label: "API / MCP Calls",
    value: "156.7K",
    trend: "23%",
    trendTone: "up",
    helper: "vs last 7 days",
  },
  {
    icon: "search",
    tone: "blue",
    label: "Search Queries",
    value: "89.4K",
    trend: "12%",
    trendTone: "up",
    helper: "vs last 7 days",
  },
  {
    icon: "health",
    tone: "blue",
    label: "Avg Quality Score",
    value: "92%",
    trend: "3%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
] as const;

export const consumptionTabs = ["All Assets", "Search", "APIs & MCP", "Tables", "Vector Stores", "Graphs", "Data Products"] as const;

export const governedAssets = [
  {
    icon: "box",
    tone: "purple",
    asset: "Policy Search Index",
    detail: "Vector search index",
    type: "Search",
    typeTone: "orange",
    domain: "Policy",
    quality: "92",
    interfaces: ["Search", "Vector"],
    linkedProducts: "Policy Master",
    owner: "Vikram Singh",
    access: "All Users",
    usage: "12.4K / 7d",
    status: "Certified",
    statusTone: "green",
  },
  {
    icon: "file",
    tone: "green",
    asset: "Invoice Entity Table",
    detail: "Structured entities table",
    type: "Table",
    typeTone: "green",
    domain: "Finance",
    quality: "91",
    interfaces: ["Table", "API"],
    linkedProducts: "Vendor Master",
    owner: "Neha Patel",
    access: "Domain Users",
    usage: "8.7K / 7d",
    status: "Published",
    statusTone: "green",
  },
  {
    icon: "graph",
    tone: "blue",
    asset: "Clinical Relationship Graph",
    detail: "Patient & entity relationships",
    type: "Graph",
    typeTone: "blue",
    domain: "Clinical",
    quality: "92",
    interfaces: ["Graph", "API"],
    linkedProducts: "Patient Profile",
    owner: "Dr. Priya Nair",
    access: "Domain Users",
    usage: "6.1K / 7d",
    status: "Certified",
    statusTone: "green",
  },
  {
    icon: "mcp",
    tone: "orange",
    asset: "Provider Contract MCP Tool",
    detail: "MCP tool for contract data",
    type: "MCP",
    typeTone: "orange",
    domain: "Legal",
    quality: "90",
    interfaces: ["MCP", "API"],
    linkedProducts: "Contract Master, Risk Register",
    owner: "Arjun Mehta",
    access: "Restricted",
    usage: "3.2K / 7d",
    status: "Active",
    statusTone: "green",
  },
  {
    icon: "box",
    tone: "purple",
    asset: "Contract Metadata Store",
    detail: "Contract metadata & clauses",
    type: "Vector",
    typeTone: "purple",
    domain: "Legal",
    quality: "89",
    interfaces: ["Vector", "API"],
    linkedProducts: "Contract Master",
    owner: "Rohit Jain",
    access: "Domain Users",
    usage: "5.4K / 7d",
    status: "Published",
    statusTone: "green",
  },
  {
    icon: "api",
    tone: "purple",
    asset: "Claims Document Enrichment API",
    detail: "Extract & enrich claim docs",
    type: "API",
    typeTone: "blue",
    domain: "Claims",
    quality: "90",
    interfaces: ["API", "MCP"],
    linkedProducts: "Claims Data Product",
    owner: "Aisha Rahman",
    access: "All Users",
    usage: "14.8K / 7d",
    status: "Active",
    statusTone: "green",
  },
] as const;

export const recommendedAssets = [
  {
    icon: "box",
    tone: "purple",
    title: "Policy Knowledge Product",
    description: "High relevance for compliance searches",
    score: "94%",
  },
  {
    icon: "mcp",
    tone: "orange",
    title: "Provider Contract MCP Tool",
    description: "Accelerate contract review workflows",
    score: "90%",
  },
  {
    icon: "graph",
    tone: "blue",
    title: "Clinical Notes Graph",
    description: "Enhance patient journey analytics",
    score: "92%",
  },
  {
    icon: "quality",
    tone: "blue",
    title: "Claims Enrichment API",
    description: "Improve claims processing accuracy",
    score: "91%",
  },
] as const;

export const consumptionMethods = [
  { icon: "search", label: "Search", value: "89.4K", tone: "blue" },
  { icon: "code", label: "API", value: "56.7K", tone: "blue" },
  { icon: "mcp", label: "MCP", value: "21.3K", tone: "orange" },
  { icon: "table", label: "Tables", value: "18.6K", tone: "green" },
  { icon: "box", label: "Vector", value: "12.7K", tone: "purple" },
  { icon: "graph", label: "Graph", value: "8.2K", tone: "blue" },
] as const;

export const accessRequests = [
  {
    initials: "AR",
    name: "Aisha Rahman",
    asset: "Claims Enrichment API",
    owner: "Owner: Vikram Singh",
    sla: "SLA: 8h 24m",
  },
  {
    initials: "RD",
    name: "Rahul Desai",
    asset: "Provider Contract MCP Tool",
    owner: "Owner: Arjun Mehta",
    sla: "SLA: 12h 10m",
  },
  {
    initials: "MI",
    name: "Meera Iyer",
    asset: "Clinical Relationship Graph",
    owner: "Owner: Dr. Priya Nair",
    sla: "SLA: 10h 05m",
  },
] as const;

export const recentlyPublished = [
  {
    icon: "file",
    tone: "purple",
    title: "Vendor Risk Signals API",
    detail: "Published 2 hours ago",
    status: "Active",
  },
  {
    icon: "table",
    tone: "green",
    title: "Medication Knowledge Graph",
    detail: "Published 5 hours ago",
    status: "Certified",
  },
  {
    icon: "quality",
    tone: "blue",
    title: "Policy Change Alerts Table",
    detail: "Published 1 day ago",
    status: "Published",
  },
] as const;

export const governanceSignals = [
  { icon: "lineage", label: "Lineage Tracked", tone: "blue" },
  { icon: "file", label: "Policy Bound", tone: "purple" },
  { icon: "lock", label: "Access Restricted", tone: "orange" },
  { icon: "shield", label: "Steward Certified", tone: "green" },
  { icon: "quality", label: "DQ Monitored", tone: "blue" },
] as const;

export const consumptionActivity = [
  {
    time: "10:24 AM",
    asset: "Policy Search Index",
    type: "Access Approved",
    details: "Access granted to Policy Search Index for user Sarah Mitchell",
    status: "Completed",
    statusTone: "green",
    consumer: "Sarah Mitchell",
  },
  {
    time: "10:18 AM",
    asset: "Claims Document Enrichment API",
    type: "API Queried",
    details: "API /v1/enrich/claims called by Claims Portal",
    status: "Completed",
    statusTone: "green",
    consumer: "Claims Portal",
  },
  {
    time: "10:12 AM",
    asset: "Provider Contract MCP Tool",
    type: "MCP Tool Connected",
    details: "MCP connected via Claude Desktop",
    status: "Completed",
    statusTone: "green",
    consumer: "Dr. Priya Nair",
  },
  {
    time: "10:05 AM",
    asset: "Invoice Entity Table",
    type: "Table Accessed",
    details: "SELECT on invoice_entities by Finance Analytics",
    status: "Completed",
    statusTone: "green",
    consumer: "Finance Analytics",
  },
  {
    time: "09:58 AM",
    asset: "Clinical Relationship Graph",
    type: "Graph Endpoint Used",
    details: "GET /graph/relationships by Care Insights App",
    status: "Success",
    statusTone: "blue",
    consumer: "Care Insights App",
  },
  {
    time: "09:50 AM",
    asset: "Contract Metadata Store",
    type: "Vector Search",
    details: "Semantic search executed by Legal Copilot",
    status: "Completed",
    statusTone: "green",
    consumer: "Legal Copilot",
  },
] as const;

export const consumptionServices = [
  {
    icon: "gateway",
    name: "API Gateway",
    region: "Kong Enterprise",
    status: "Healthy",
  },
  {
    icon: "registry",
    name: "MCP Registry",
    region: "Managed MCP Tools",
    status: "Healthy",
  },
  {
    icon: "vector",
    name: "Vector Store",
    region: "Pinecone",
    status: "Healthy",
  },
  {
    icon: "graph",
    name: "Graph Store",
    region: "Neo4j Cluster",
    status: "Healthy",
  },
  {
    icon: "search",
    name: "Search Service",
    region: "Elasticsearch",
    status: "Healthy",
  },
  {
    icon: "access",
    name: "Access Control",
    region: "Okta",
    status: "Healthy",
  },
] as const;
