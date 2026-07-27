export const sourceSystems = [
  { name: "Databricks Unity Catalog", assets: 24, sync: "2h ago", tone: "purple" },
  { name: "MDM Platform", assets: 8, sync: "2h ago", tone: "green" },
  { name: "SharePoint", assets: 12, sync: "3h ago", tone: "teal" },
  { name: "Atlan Data Catalog", assets: 9, sync: "4h ago", tone: "blue" },
  { name: "dbt Cloud", assets: 8, sync: "1h ago", tone: "orange" },
  { name: "Neo4j Aura", assets: 10, sync: "1h ago", tone: "green" },
] as const;

export const projectAssets = [
  ["Customer 360 Data Product", "Data Product", "Databricks Unity Catalog", "Customer", "Entity Source", "95%", "Ready", "2h ago"],
  ["Customer Semantic Model", "Semantic Model", "dbt Cloud", "Customer", "Semantic Authority", "92%", "Ready", "3h ago"],
  ["Golden Customer Record", "MDM Entity", "MDM Platform", "Customer", "Identity Anchor", "97%", "Ready", "1h ago"],
  ["Customer Lineage Graph", "Lineage Asset", "Atlan Data Catalog", "Customer", "Provenance Source", "89%", "Ready", "4h ago"],
  ["Consent Policy v2.1", "Policy Document", "SharePoint", "Compliance", "Policy Authority", "98%", "Ready", "5h ago"],
  ["Interaction Transcripts", "Document Collection", "SharePoint", "Customer", "Retrieval Source", "85%", "Review", "6h ago"],
  ["Existing Customer Graph", "Graph", "Neo4j Aura", "Customer", "Relationship Source", "91%", "Ready", "1d ago"],
] as const;

export const recommendations = [
  ["CRM.Customer → Golden Party Record", "Entity Alignment", 96, "Data Steward"],
  ["Active Customer definition conflict", "Semantic Rule", 72, "Domain Owner"],
  ["Consent_Status → Consent Policy v2.1", "Policy Mapping", 91, "Compliance"],
  ["Interaction Event → Support Case relation", "Relationship", 79, "Architect"],
  ["Email Address → Contact Point alignment", "Entity Alignment", 94, "Data Steward"],
  ["Customer Segment derivation rule update", "Semantic Rule", 68, "Domain Owner"],
] as const;

export const qualityDimensions = [
  ["Completeness", 92],
  ["Accuracy", 88],
  ["Consistency", 84],
  ["Uniqueness", 82],
  ["Timeliness", 80],
  ["Validity", 78],
] as const;

export const qualityIssues = [
  ["Missing business description", "Completeness", "Critical", 18],
  ["Low confidence entity extraction", "Accuracy", "Warning", 11],
  ["Duplicate values in key attributes", "Consistency", "Warning", 9],
  ["Stale source data", "Timeliness", "Warning", 6],
  ["Invalid data type in attributes", "Validity", "Warning", 4],
] as const;

export const pipelineRuns = [
  ["Ingestion Pipeline", "Success", "5 min ago", "12m 32s", "99.3%"],
  ["Entity Extraction", "Success", "15 min ago", "8m 11s", "98.7%"],
  ["Relationship Builder", "Success", "18 min ago", "9m 45s", "97.8%"],
  ["Enrichment Pipeline", "Warning", "25 min ago", "14m 02s", "94.2%"],
  ["Knowledge Graph Build", "Success", "30 min ago", "16m 18s", "98.1%"],
  ["Quality Validation", "Failed", "32 min ago", "6m 40s", "85.6%"],
] as const;

export const usageSeries = [
  { day: "May 21", consumption: 5800, api: 3700, search: 1800 },
  { day: "May 22", consumption: 5600, api: 3900, search: 1700 },
  { day: "May 23", consumption: 6400, api: 4500, search: 2400 },
  { day: "May 24", consumption: 5200, api: 3300, search: 1400 },
  { day: "May 25", consumption: 6300, api: 4300, search: 1900 },
  { day: "May 26", consumption: 5900, api: 4000, search: 2000 },
  { day: "May 27", consumption: 6100, api: 3800, search: 1900 },
];

export const qualitySeries = Array.from({ length: 14 }, (_, index) => ({
  day: `May ${index + 14}`,
  overall: [82, 84, 81, 86, 83, 85, 84, 87, 85, 88, 86, 89, 87, 86][index],
  data: [78, 82, 81, 83, 80, 84, 82, 85, 83, 86, 84, 87, 85, 84][index],
  knowledge: [65, 68, 63, 71, 62, 69, 66, 70, 67, 72, 70, 74, 71, 68][index],
}));

export const activities = [
  ["2 minutes ago", "Quality check completed", "Quality Check", "128 checks passed, 2 failed, 1 warning", "Sarah Chen", "Success", "1m 24s", "Data Quality Agent"],
  ["8 minutes ago", "Ingestion pipeline run", "Pipeline Run", "Synchronized 71 scoped assets from 6 governed sources", "System", "Success", "12m 45s", "Ingestion Pipeline"],
  ["25 minutes ago", "Entity extraction completed", "System Event", "Extracted 842 entities", "System", "Success", "4m 12s", "Entity Extraction Job"],
  ["1 hour ago", "User updated access policy", "User Action", "Updated Financial Data access policy", "Rahul Mehta", "Success", "—", "Governance Console"],
  ["2 hours ago", "Knowledge graph build", "Pipeline Run", "Added 156 nodes, 214 relationships", "System", "Success", "18m 32s", "Graph Builder Pipeline"],
  ["3 hours ago", "Data validation failed", "Quality Check", "3 validation rules failed", "System", "Failed", "2m 11s", "Data Quality Agent"],
  ["5 hours ago", "New source connected", "User Action", "Connected and profiled new source", "Ananya Sharma", "Success", "—", "Source Connector"],
  ["Yesterday", "API endpoint deployed", "System Event", "Version 1.2.0 deployed to Prod", "System", "Success", "3m 45s", "Deployment Service"],
] as const;

export const graphEntityTypes = [
  ["Customer", "Individuals or organizations who purchase products", "42,318", "+3.2%"],
  ["Account", "Customer accounts and account hierarchies", "68,742", "+2.1%"],
  ["Policy", "Insurance or service policies", "91,203", "+1.8%"],
  ["Product", "Products and services", "24,156", "+2.6%"],
  ["Support Case", "Customer cases and service requests", "33,891", "+4.3%"],
] as const;

export const graphRelationships = [
  ["OWNS", "Customer owns Account / Policy", "91,231", "+3.4%"],
  ["HAS_ACCOUNT", "Customer has account", "68,742", "+2.1%"],
  ["HOLDS", "Customer holds Policy", "91,203", "+1.7%"],
  ["MAKES", "Customer makes Interaction", "142,891", "+4.2%"],
  ["FILES", "Customer files Support Case", "33,891", "+2.9%"],
] as const;
