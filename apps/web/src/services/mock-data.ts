import type {
  Connector,
  EnterpriseAsset,
  KnowledgeProduct,
  KnowledgeProject,
  KPI,
  OperationalItem,
  Policy,
  RoleAssignment,
  User,
} from "@/src/models";

const timestamp = "2025-05-20T10:30:00.000Z";

export const users: User[] = [
  { id: "usr-rm", name: "Rohit Mehta", email: "rohit.mehta@acme.com", initials: "RM", role: "Data Architect", team: "Procurement" },
  { id: "usr-ps", name: "Priya Sharma", email: "priya.sharma@acme.com", initials: "PS", role: "Data Product Owner", team: "Customer Data" },
  { id: "usr-lp", name: "Leena Patel", email: "leena.patel@acme.com", initials: "LP", role: "Knowledge Engineer", team: "Legal Ops" },
  { id: "usr-ss", name: "Sanjay Singh", email: "sanjay.singh@acme.com", initials: "SS", role: "Platform Operator", team: "Operations" },
  { id: "usr-dr", name: "Divya Rao", email: "divya.rao@acme.com", initials: "DR", role: "Domain Lead", team: "Healthcare Analytics" },
  { id: "usr-ng", name: "Nitin Gupta", email: "nitin.gupta@acme.com", initials: "NG", role: "Governance Steward", team: "Data Governance" },
  { id: "usr-av", name: "Anjali Verma", email: "anjali.verma@acme.com", initials: "AV", role: "Risk Steward", team: "Risk & Compliance" },
  { id: "usr-kb", name: "Karan Bhatia", email: "karan.bhatia@acme.com", initials: "KB", role: "Analytics Lead", team: "Sales Analytics" },
];

const audited = (id: string, status: string) => ({
  id,
  version: 1,
  status,
  createdBy: "Akhil Kumar",
  createdAt: timestamp,
  updatedBy: "Akhil Kumar",
  updatedAt: timestamp,
});

export const projects: KnowledgeProject[] = [
  { ...audited("KPJ-2025-0007", "Needs Attention"), name: "Supplier Risk", description: "Supplier risk & compliance intelligence", domain: "Procurement", stage: "Testing", health: 72, testPerformance: 72, owner: users[0], pendingAction: "Confirm canonical supplier key", connectedSources: 6 },
  { ...audited("KPJ-2025-0006", "On Track"), name: "Customer 360", description: "Unified customer intelligence", domain: "Customer", stage: "Build", health: 88, testPerformance: 88, owner: users[1], pendingAction: "Review 5 entity merges", connectedSources: 9 },
  { ...audited("KPJ-2025-0005", "Published"), name: "Contract Intelligence", description: "Contract analysis & obligations", domain: "Legal", stage: "Published", health: 91, testPerformance: 91, owner: users[2], pendingAction: "Evidence freshness warning", connectedSources: 4 },
  { ...audited("KPJ-2025-0004", "Needs Attention"), name: "Product Incident Hub", description: "Product incidents & root cause", domain: "Operations", stage: "Validation", health: 65, testPerformance: 65, owner: users[3], pendingAction: "Add product hierarchy source", connectedSources: 3 },
  { ...audited("KPJ-2025-0003", "In Progress"), name: "Patient Journey Graph", description: "Patient journey & outcomes", domain: "Healthcare", stage: "Design", health: 78, testPerformance: 78, owner: users[4], pendingAction: "Approve ontology changes", connectedSources: 5 },
  { ...audited("KPJ-2025-0002", "On Track"), name: "Asset Lineage Graph", description: "Enterprise data & process lineage", domain: "Data Governance", stage: "Build", health: 85, testPerformance: 85, owner: users[5], pendingAction: "Map lineage exceptions", connectedSources: 12 },
  { ...audited("KPJ-2025-0001", "Needs Attention"), name: "Policy & Compliance KG", description: "Policies, controls & compliance", domain: "Risk & Compliance", stage: "Testing", health: 70, testPerformance: 70, owner: users[6], pendingAction: "Resolve control mappings", connectedSources: 7 },
  { ...audited("KPJ-2025-0008", "Published"), name: "Sales Performance Graph", description: "Sales metrics & performance", domain: "Sales", stage: "Published", health: 93, testPerformance: 93, owner: users[7], pendingAction: "None", connectedSources: 8 },
];

export const assets: EnterpriseAsset[] = [
  { ...audited("ast-sap", "Connected"), name: "SAP S/4HANA - Vendor Master", subtitle: "System", type: "ERP", domain: "Procurement", connectionStatus: "Connected", qualityScore: 92, lastRefreshed: "May 20, 2025 · 10:30 AM", owner: users[0], projectUsage: 6, sourceType: "ERP Database", description: "Primary vendor master system of record for supplier information, classification and financial data." },
  { ...audited("ast-dbx", "Connected"), name: "Databricks Unity Catalog", subtitle: "Data Catalog", type: "Catalog", domain: "Enterprise", connectionStatus: "Connected", qualityScore: 88, lastRefreshed: "May 20, 2025 · 09:15 AM", owner: users[5], projectUsage: 12, description: "Governed inventory of lakehouse tables, views, models and lineage." },
  { ...audited("ast-model", "Published"), name: "Supplier Domain Model", subtitle: "Semantic Model", type: "Semantic Model", domain: "Procurement", connectionStatus: "Published", qualityScore: 91, lastRefreshed: "May 19, 2025 · 11:45 AM", owner: users[2], projectUsage: 4, description: "Canonical supplier entities, relationships and business definitions." },
  { ...audited("ast-contract", "Connected"), name: "Contracts Repository (SharePoint)", subtitle: "Document Source", type: "Document", domain: "Legal", connectionStatus: "Connected", qualityScore: 76, lastRefreshed: "May 18, 2025 · 08:20 PM", owner: users[4], projectUsage: 3, description: "Supplier agreements, amendments, obligations and evidence." },
  { ...audited("ast-dbt", "Connected"), name: "dbt Git Repository", subtitle: "Transformation Code", type: "Code Repo", domain: "Data Engineering", connectionStatus: "Connected", qualityScore: 85, lastRefreshed: "May 18, 2025 · 07:10 PM", owner: users[1], projectUsage: 8, description: "Transformation models, tests and source definitions." },
  { ...audited("ast-collibra", "Connected"), name: "Collibra Data Catalog", subtitle: "Business Metadata", type: "Catalog", domain: "Enterprise", connectionStatus: "Connected", qualityScore: 89, lastRefreshed: "May 17, 2025 · 03:30 PM", owner: users[6], projectUsage: 9, description: "Business glossary, stewardship ownership and policy classifications." },
  { ...audited("ast-product", "Connected"), name: "Product Hierarchy", subtitle: "Reference Data", type: "Reference Data", domain: "Product", connectionStatus: "Connected", qualityScore: 90, lastRefreshed: "May 17, 2025 · 01:15 PM", owner: users[7], projectUsage: 5, description: "Critical product, material and component hierarchy." },
  { ...audited("ast-dq", "Active"), name: "Data Quality Rules - Supplier", subtitle: "DQ Rules", type: "DQ Rules", domain: "Procurement", connectionStatus: "Active", qualityScore: 94, lastRefreshed: "May 16, 2025 · 11:00 AM", owner: users[3], projectUsage: 6, description: "Approved supplier completeness, validity and uniqueness checks." },
];

export const products: KnowledgeProduct[] = [
  { ...audited("prd-supplier", "Published"), name: "Supplier Risk Knowledge Graph", description: "360° view of suppliers, risk, contracts, incidents and performance", domain: "Procurement", type: "Knowledge Graph", releaseVersion: "1.3.2", qualityScore: 92, owner: users[0], consumers: 6, freshnessSla: "Daily", sourceSystems: 12, capabilities: ["Graph Query", "Semantic Search", "RAG Retrieval", "Context API", "Analytics", "Agent Tool"] },
  { ...audited("prd-customer", "Published"), name: "Customer 360 Knowledge Graph", description: "Unified customer profile, interactions, journeys and value", domain: "Customer", type: "Knowledge Graph", releaseVersion: "2.1.0", qualityScore: 94, owner: users[1], consumers: 9, freshnessSla: "Hourly", sourceSystems: 15, capabilities: ["Graph Query", "Semantic Search", "Context API", "Analytics"] },
  { ...audited("prd-contract", "Published"), name: "Contract Intelligence Graph", description: "Contracts, obligations, clauses, renewals and compliance", domain: "Legal", type: "Knowledge Graph", releaseVersion: "1.2.1", qualityScore: 91, owner: users[2], consumers: 4, freshnessSla: "Daily", sourceSystems: 8, capabilities: ["Graph Query", "RAG Retrieval", "Context API"] },
  { ...audited("prd-incident", "In Review"), name: "Product Incident Knowledge", description: "Products, incidents, root cause, actions and affected entities", domain: "Operations", type: "Knowledge Graph", releaseVersion: "1.0.3", qualityScore: 84, owner: users[3], consumers: 3, freshnessSla: "Real-time", sourceSystems: 7, capabilities: ["Graph Query", "Semantic Search", "Agent Tool"] },
  { ...audited("prd-policy", "Published"), name: "Policy & Compliance Knowledge", description: "Policies, controls, rules and regulatory mapping", domain: "Risk & Compliance", type: "Semantic Model", releaseVersion: "3.0.0", qualityScore: 93, owner: users[6], consumers: 7, freshnessSla: "Daily", sourceSystems: 10, capabilities: ["Semantic Search", "RAG Retrieval", "Context API"] },
  { ...audited("prd-patient", "In Development"), name: "Patient Journey Knowledge", description: "Patient journeys, events, care paths and outcomes", domain: "Healthcare", type: "Knowledge Graph", releaseVersion: "1.1.0", qualityScore: 88, owner: users[4], consumers: 2, freshnessSla: "Daily", sourceSystems: 9, capabilities: ["Graph Query", "Analytics"] },
];

export const policies: Policy[] = [
  { ...audited("pol-supplier", "Approved"), name: "Supplier Data Usage Policy", subtitle: "Data Usage Policy", category: "Policy", domain: "Procurement", coverage: 94, owner: users[0], relatedAssets: 26, classification: "Confidential", description: "Defines access, masking, retention and approved usage conditions for supplier master, contract and risk data." },
  { ...audited("pol-customer", "In Review"), name: "Customer PII Classification Standard", subtitle: "Classification Standard", category: "Standard", domain: "Customer", coverage: 92, owner: users[1], relatedAssets: 31, classification: "Restricted", description: "Classification and handling requirements for customer personal data." },
  { ...audited("pol-contract", "Active"), name: "Contract Retention Policy", subtitle: "Retention Policy", category: "Policy", domain: "Legal", coverage: 90, owner: users[2], relatedAssets: 18, classification: "Internal", description: "Retention periods and legal-hold requirements for contract evidence." },
  { ...audited("pol-glossary", "Active"), name: "Procurement Glossary Terms", subtitle: "Business Glossary", category: "Glossary", domain: "Procurement", coverage: 88, owner: users[5], relatedAssets: 42, classification: "Internal", description: "Approved procurement terms, definitions and synonyms." },
  { ...audited("pol-steward", "In Review"), name: "Vendor Master Stewardship Rule Set", subtitle: "Stewardship Rules", category: "Rule Set", domain: "Procurement", coverage: 87, owner: users[0], relatedAssets: 24, classification: "Confidential", description: "Ownership and review routing for supplier master changes." },
  { ...audited("pol-risk", "Needs Update"), name: "Supplier Risk Access Policy", subtitle: "Access Policy", category: "Policy", domain: "Risk", coverage: 84, owner: users[3], relatedAssets: 16, classification: "Confidential", description: "Authorizes supplier risk signals by persona and region." },
];

export const operationalItems: OperationalItem[] = [
  { ...audited("op-supplier", "Degraded"), name: "Supplier Risk Knowledge Graph", category: "Knowledge Product", health: 72, freshness: 86, queryVolume: "12.4M", owner: users[0], alert: "Scenario regression detected", domain: "Procurement", latency: "4.6s" },
  { ...audited("op-customer", "Healthy"), name: "Customer 360 Graph Sync", category: "Pipeline", health: 94, freshness: 98, queryVolume: "24.1M", owner: users[1], alert: "None", domain: "Customer", latency: "2.1s" },
  { ...audited("op-contract", "Healthy"), name: "Contract Intelligence Graph", category: "Knowledge Product", health: 91, freshness: 95, queryVolume: "8.9M", owner: users[2], alert: "None", domain: "Legal", latency: "2.8s" },
  { ...audited("op-incident", "Failed"), name: "Product Incident KG Build", category: "Pipeline", health: 58, freshness: 73, queryVolume: "2.1M", owner: users[3], alert: "Build failure", domain: "Operations", latency: "6.8s" },
  { ...audited("op-policy", "Warning"), name: "Policy & Compliance Knowledge", category: "Knowledge Product", health: 84, freshness: 89, queryVolume: "6.2M", owner: users[6], alert: "Freshness drift", domain: "Risk", latency: "3.9s" },
  { ...audited("op-patient", "Warning"), name: "Patient Journey Knowledge", category: "Knowledge Product", health: 79, freshness: 82, queryVolume: "3.8M", owner: users[4], alert: "Low evidence coverage", domain: "Healthcare", latency: "4.1s" },
  { ...audited("op-lineage", "Healthy"), name: "Asset Lineage Refresh", category: "Pipeline", health: 92, freshness: 97, queryVolume: "5.6M", owner: users[5], alert: "None", domain: "Data Governance", latency: "1.9s" },
];

export const connectors: Connector[] = [
  { id: "sap", name: "SAP S/4HANA", type: "ERP", description: "ERP system for master and transactional data", status: "Connected", recommended: true },
  { id: "databricks", name: "Databricks Unity Catalog", type: "Data Platform", description: "Access data tables, views and models", status: "Connected", recommended: true },
  { id: "snowflake", name: "Snowflake", type: "Data Platform", description: "Cloud data warehouse", status: "Not Connected", recommended: false },
  { id: "sharepoint", name: "SharePoint Online", type: "Documents", description: "Enterprise documents and libraries", status: "Connected", recommended: true },
  { id: "azure-sql", name: "Azure SQL Database", type: "Database", description: "Relational operational database", status: "Connected", recommended: false },
  { id: "s3", name: "AWS S3", type: "Data Lake / Storage", description: "Object storage for files and datasets", status: "Not Connected", recommended: false },
  { id: "salesforce", name: "Salesforce", type: "Application", description: "CRM and customer data", status: "Not Connected", recommended: false },
  { id: "collibra", name: "Collibra", type: "Governance Catalog", description: "Business glossary and metadata catalog", status: "Connected", recommended: true },
];

export const defaultKpis: KPI[] = [
  { id: "kpi-coverage", name: "Coverage", definition: "% of relevant entities and relationships covered", target: 95, operator: ">=", unit: "%", method: "Automated", frequency: "Daily" },
  { id: "kpi-precision", name: "Precision", definition: "Accuracy of extracted entities and relationships", target: 90, operator: ">=", unit: "%", method: "Human Validation", frequency: "Daily" },
  { id: "kpi-recall", name: "Recall", definition: "% of relevant entities successfully retrieved", target: 90, operator: ">=", unit: "%", method: "Benchmark Set", frequency: "Daily" },
  { id: "kpi-freshness", name: "Freshness", definition: "Data latency from source to knowledge product", target: 24, operator: "<=", unit: "hrs", method: "System Metrics", frequency: "Daily" },
  { id: "kpi-completeness", name: "Completeness", definition: "% of mandatory attributes populated", target: 95, operator: ">=", unit: "%", method: "Automated", frequency: "Daily" },
  { id: "kpi-query", name: "Query Success Rate", definition: "% of scenario queries answered successfully", target: 95, operator: ">=", unit: "%", method: "System Logs", frequency: "Daily" },
];

export const defaultRoles: RoleAssignment[] = [
  { id: "role-owner", role: "Project Owner", type: "Built-in", principals: "Akhil Kumar", description: "Overall owner with full control of the project", accessLevel: "Full Access" },
  { id: "role-steward", role: "Data Steward", type: "Built-in", principals: "data-stewards@acme.com", description: "Manages assets, quality and metadata", accessLevel: "Manage" },
  { id: "role-curator", role: "Content Curator", type: "Custom", principals: "content-curators@acme.com", description: "Curates content and maintains knowledge assets", accessLevel: "Contribute" },
  { id: "role-consumer", role: "Data Consumer", type: "Built-in", principals: "analytics-users@acme.com", description: "Can view and consume published assets", accessLevel: "Read" },
  { id: "role-auditor", role: "Auditor", type: "Built-in", principals: "audit-team@acme.com", description: "Read-only access for audit and compliance", accessLevel: "Read" },
];

