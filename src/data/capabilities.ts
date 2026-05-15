import {
  Brain,
  CloudUpload,
  Cuboid,
  Database,
  Link,
  Network,
  ShieldCheck,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Status = "Available" | "Existing / Expand" | "Expand" | "Emerging" | "In Development" | "In Review" | "Published" | "Draft" | "Completed" | "In Progress" | "Assessment" | "Validation" | "Healthy";

export type Capability = {
  name: string;
  description: string;
  status: Status;
  stage: string;
  owner: string;
  category: string;
  domain: string;
  icon: LucideIcon;
};

export const capabilities: Capability[] = [
  {
    name: "Automated Ingestion Pipeline Builder",
    description: "Ingest from any source with reusable connectors and smart mappings.",
    status: "Available",
    stage: "Ingestion",
    owner: "Data Eng",
    category: "Build Studios",
    domain: "Engineering",
    icon: CloudUpload
  },
  {
    name: "Assisted Data Modelling",
    description: "AI-assisted logical and physical models with business semantics.",
    status: "Available",
    stage: "Modelling",
    owner: "Data Eng",
    category: "Build Studios",
    domain: "Architecture",
    icon: Network
  },
  {
    name: "Automated Data Quality",
    description: "Profiling, rule generation, validation, anomaly detection, and scoring.",
    status: "Available",
    stage: "Quality",
    owner: "Data Eng",
    category: "Foundation",
    domain: "Governance",
    icon: ShieldCheck
  },
  {
    name: "Data Product Factory",
    description: "Detect, validate, contract, publish, and manage trusted data products.",
    status: "Available",
    stage: "Productization",
    owner: "Data PM",
    category: "Data Products",
    domain: "Product",
    icon: Cuboid
  },
  {
    name: "Migrate to Modernize",
    description: "Assess, plan, convert, migrate, reconcile, and modernize legacy assets.",
    status: "Existing / Expand",
    stage: "Cross-journey",
    owner: "Platform",
    category: "Modernization",
    domain: "Modernization",
    icon: CloudUpload
  },
  {
    name: "Context & Intelligence Layer",
    description: "Unify business context, glossary, semantics, policies, and AI readiness.",
    status: "In Development",
    stage: "Context",
    owner: "Data Arch",
    category: "Context",
    domain: "Knowledge",
    icon: Brain
  },
  {
    name: "Multimodal Lakehouse",
    description: "Store and query structured, semi-structured, unstructured, and AI data.",
    status: "Emerging",
    stage: "Foundation",
    owner: "Platform",
    category: "Foundation",
    domain: "Lakehouse",
    icon: Database
  },
  {
    name: "Search, APIs & Accelerators",
    description: "Reusable APIs, search experiences, SDKs, templates, and accelerators.",
    status: "Expand",
    stage: "Consumption",
    owner: "Data Eng",
    category: "Consumption",
    domain: "Consumption",
    icon: Link
  },
  {
    name: "Data Observability & RuleOps",
    description: "Continuous monitoring, lineage-aware alerts, and operational controls.",
    status: "Emerging",
    stage: "Quality",
    owner: "Data Ops",
    category: "Foundation",
    domain: "Operations",
    icon: WandSparkles
  }
];
