export type DemoScenario = {
  name: string;
  description: string;
  persona: string;
  readiness: string;
  domain: string;
  useCase: string;
  duration: string;
  category: string;
};

export const demoScenarios: DemoScenario[] = [
  { name: "Claims Data Processing Journey", description: "End-to-end journey from ingestion to curated claims analytics.", persona: "Data Engineer", readiness: "Demo Ready", domain: "Healthcare", useCase: "Claims Analytics", duration: "20 min", category: "Data Engineering" },
  { name: "Customer 360 Data Product Demo", description: "Showcase creation and consumption of a Customer 360 data product.", persona: "Product Manager", readiness: "Demo Ready", domain: "Retail", useCase: "Customer 360", duration: "25 min", category: "Data Product" },
  { name: "Legacy SQL to Modern Lakehouse Modernization", description: "Migrate workloads and modernize to a secure lakehouse architecture.", persona: "Platform Lead", readiness: "In Review", domain: "Finance", useCase: "Modernization", duration: "30 min", category: "Modernization" },
  { name: "Automated Ingestion + DQ Demo", description: "Automated ingestion with built-in data quality and observability.", persona: "Data Engineer", readiness: "Demo Ready", domain: "Manufacturing", useCase: "Data Quality", duration: "18 min", category: "Data Engineering" },
  { name: "Semantic Context Layer Showcase", description: "Discover semantic models, business terms, and governed metrics.", persona: "Data Analyst", readiness: "Demo Ready", domain: "Cross-Industry", useCase: "Governance", duration: "22 min", category: "Industry Use Cases" },
  { name: "Executive Platform Walkthrough", description: "High-level platform overview and business value deep dive.", persona: "Client Executive", readiness: "Demo Ready", domain: "Cross-Industry", useCase: "Executive View", duration: "15 min", category: "Executive" }
];
