export const enterpriseSourceSystems = [
  ["Databricks Unity Catalog", "Customer Data Platform", 24, "purple"],
  ["MDM Platform", "Master Data", 8, "green"],
  ["SharePoint", "Customer Documents & Policies", 12, "teal"],
  ["Atlan Data Catalog", "Metadata & Lineage", 9, "blue"],
  ["dbt Cloud", "Customer Semantic Models", 8, "orange"],
  ["Neo4j Aura", "Existing Customer Graph", 10, "green"],
] as const;

export const enterpriseAssets = [
  ["Customer 360 Data Product", "Delta Table", "Data Product", "Databricks Unity Catalog", "Customer", "Entity Source", 92, "Ready", "12 min ago", "Data Team"],
  ["Customer Semantic Model", "Semantic Model", "Semantic Model", "dbt Cloud", "Customer", "Semantic Authority", 95, "Ready", "1 hr ago", "Analytics Team"],
  ["Golden Party Record", "MDM Entity", "MDM Entity", "MDM Platform", "Customer", "Identity Anchor", 97, "Ready", "2 hr ago", "MDM Team"],
  ["Customer Lineage Graph", "Lineage Asset", "Lineage", "Atlan Data Catalog", "Customer", "Provenance Source", 90, "Ready", "3 hr ago", "Data Governance"],
  ["Consent Policy v2.1", "Policy Document", "Policy", "SharePoint", "Compliance", "Policy Authority", 98, "Ready", "5 hr ago", "Legal Team"],
  ["Interaction Transcripts", "Document Collection", "Unstructured Data", "SharePoint", "Customer", "Retrieval Source", 85, "Ready", "6 hr ago", "CX Team"],
  ["Existing Customer Graph", "Graph", "Graph", "Neo4j Aura", "Customer", "Relationship Source", 88, "Ready", "1 day ago", "Graph Team"],
  ["Customer API", "REST API", "API", "Neo4j Aura", "Customer", "Operational Source", 91, "Ready", "1 day ago", "Platform Team"],
  ["Customer DQ Rules", "Data Quality Rules", "DQ Rules", "Atlan Data Catalog", "Customer", "Quality Authority", 93, "Ready", "2 days ago", "Data Quality"],
  ["Support Tickets Events", "Event Stream", "Event Data", "Databricks Unity Catalog", "Customer", "Operational Signal", 80, "New", "2 days ago", "Data Team"],
  ["Product Catalog Model", "Semantic Model", "Semantic Model", "dbt Cloud", "Product", "Semantic Authority", 89, "Ready", "2 days ago", "Product Team"],
  ["Retention Policy", "Policy Document", "Policy", "SharePoint", "Compliance", "Policy Authority", 87, "Review", "3 days ago", "Legal Team"],
] as const;

export const knowledgeProducts = [
  {
    name: "Customer 360 Knowledge Layer",
    description: "Unified customer entity & relationships",
    domain: "Customer",
    type: "Knowledge Graph",
    status: "Published",
    readiness: 92,
    version: "1.3.0",
    updated: "12 min ago",
    consumers: 17,
    owner: "Sarah Chen",
    tone: "orange",
  },
] as const;
