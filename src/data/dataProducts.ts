import type { Status } from "./capabilities";

export type DataProduct = {
  name: string;
  description: string;
  domain: string;
  owner: string;
  status: Status;
  readiness: number;
  consumers: number;
  dq: boolean;
  contract: boolean;
  catalog: boolean;
};

export const dataProducts: DataProduct[] = [
  { name: "Customer 360 Product", description: "Unified customer profile with transactions, interactions, and preferences.", domain: "Customer", owner: "Priya Mehta", status: "In Review", readiness: 78, consumers: 12, dq: true, contract: true, catalog: false },
  { name: "Sales Performance Mart", description: "Sales KPIs and performance metrics by region, product, and channel.", domain: "Sales", owner: "Arjun Nair", status: "Draft", readiness: 55, consumers: 8, dq: false, contract: false, catalog: false },
  { name: "Claims Quality Product", description: "Claims quality metrics, leakage indicators, and audit outcomes.", domain: "Claims", owner: "Neha Kapoor", status: "In Review", readiness: 72, consumers: 9, dq: true, contract: false, catalog: false },
  { name: "Finance Reporting Product", description: "Standardized financial reporting dataset for regulatory and management use.", domain: "Finance", owner: "Rohit Sharma", status: "Published", readiness: 92, consumers: 15, dq: true, contract: true, catalog: true },
  { name: "Provider Master Product", description: "Master data for providers with affiliations, specialties, and locations.", domain: "Provider", owner: "Kavya Iyer", status: "Draft", readiness: 60, consumers: 6, dq: false, contract: false, catalog: false },
  { name: "Marketing Campaign Product", description: "Campaign performance, audience engagement, and conversion metrics.", domain: "Marketing", owner: "Vikram Singh", status: "Published", readiness: 85, consumers: 10, dq: true, contract: true, catalog: true }
];
