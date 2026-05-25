export type Tone = "green" | "blue" | "purple" | "orange" | "red" | "cyan";
export type TrendTone = "up" | "down" | "neutral";

export type IconKey =
  | "rocket"
  | "file"
  | "box"
  | "users"
  | "health"
  | "database"
  | "network"
  | "search"
  | "table"
  | "graph"
  | "cloud"
  | "layers"
  | "brain"
  | "gateway";

export const lifecycleItems = [
  {
    icon: "database",
    tone: "green",
    title: "Ingest",
    description: "Connect and ingest content from any source",
  },
  {
    icon: "file",
    tone: "blue",
    title: "Process",
    description: "Extract, classify, and structure content",
  },
  {
    icon: "network",
    tone: "green",
    title: "Link",
    description: "Connect entities to master data and systems",
  },
  {
    icon: "search",
    tone: "blue",
    title: "Publish",
    description: "Publish trusted assets for search and agents",
  },
] as const;

export const platformMetrics = [
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
    label: "Documents Processed",
    value: "128.7K",
    trend: "18%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "box",
    tone: "purple",
    label: "Published Assets",
    value: "214",
    trend: "16%",
    trendTone: "up",
    helper: "vs last 30 days",
  },
  {
    icon: "users",
    tone: "orange",
    label: "Pending Reviews",
    value: "47",
    trend: "12%",
    trendTone: "down",
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

export const businessGoals = [
  {
    icon: "database",
    tone: "green",
    title: "Onboard New Source",
    description: "Connect and ingest data from any source",
  },
  {
    icon: "file",
    tone: "blue",
    title: "Process Policy PDFs",
    description: "Extract, classify, and structure policy content",
  },
  {
    icon: "box",
    tone: "purple",
    title: "Build Knowledge Product",
    description: "Create reusable, governed knowledge assets",
  },
  {
    icon: "network",
    tone: "green",
    title: "Link to Structured Data",
    description: "Connect entities to master data and systems",
  },
  {
    icon: "search",
    tone: "blue",
    title: "Publish Search Experience",
    description: "Deliver search and retrieval for users and agents",
  },
] as const;

export const workItems = [
  {
    icon: "box",
    tone: "purple",
    title: "Policy Knowledge Product",
    category: "Knowledge Product",
    progress: 72,
    meta: "Due in 4 days",
  },
  {
    icon: "file",
    tone: "green",
    title: "Invoice Processing",
    category: "Document Processing",
    status: "Pending Review",
    statusTone: "orange",
  },
  {
    icon: "network",
    tone: "cyan",
    title: "Clinical Notes Linkage",
    category: "Linkage & Enrichment",
    status: "Needs Attention",
    statusTone: "orange",
  },
  {
    icon: "file",
    tone: "orange",
    title: "Contract Metadata Extraction",
    category: "Metadata Extraction",
    status: "In Progress",
    statusTone: "blue",
  },
] as const;

export const recentAssets = [
  {
    icon: "search",
    tone: "purple",
    title: "Policy Search Index",
    description: "Vector index for policy documents",
    quality: "92",
    tags: ["Vector", "Search", "API"],
  },
  {
    icon: "table",
    tone: "green",
    title: "Invoice Entity Table",
    description: "Structured entities from invoice documents",
    quality: "91",
    tags: ["Table", "API", "Entity"],
  },
  {
    icon: "graph",
    tone: "blue",
    title: "Clinical Relationship Graph",
    description: "Graph of clinical concepts and relationships",
    quality: "92",
    tags: ["Graph", "API", "Entity"],
  },
] as const;

export const serviceHealth = [
  {
    icon: "database",
    name: "ADLS Gen2",
    region: "us-east-1",
    status: "Healthy",
  },
  {
    icon: "layers",
    name: "Databricks",
    region: "Prod Workspace",
    status: "Healthy",
  },
  {
    icon: "brain",
    name: "Azure AI Services",
    region: "East US",
    status: "Healthy",
  },
  {
    icon: "cloud",
    name: "Vector Store",
    region: "Pinecone",
    status: "Healthy",
  },
  {
    icon: "gateway",
    name: "API Gateway",
    region: "Kong Enterprise",
    status: "Healthy",
  },
] as const;
