import { Brain, Database, Download, Network, PackageCheck, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type JourneyStage = {
  id: number;
  shortName: string;
  name: string;
  description: string;
  enables: string[];
  capabilities: string[];
  priority: "High" | "Medium" | "Low";
  maturity: string;
  coverage: string;
  icon: LucideIcon;
};

export const journeyStages: JourneyStage[] = [
  {
    id: 1,
    shortName: "Ingestion",
    name: "Source Onboarding & Ingestion",
    description: "Connect source systems, infer mappings, create ingestion patterns, and onboard datasets reliably.",
    enables: ["Connector discovery", "Source profiling", "Reusable pipeline scaffolds"],
    capabilities: ["Automated Ingestion Pipeline Builder", "Search, APIs & Accelerators"],
    priority: "High",
    maturity: "Available",
    coverage: "2 / 2",
    icon: Download
  },
  {
    id: 2,
    shortName: "Processing",
    name: "Storage, Processing & Extraction",
    description: "Standardize landing, extraction, orchestration, and processing patterns across the lakehouse.",
    enables: ["Pattern reuse", "Extraction templates", "Processing guardrails"],
    capabilities: ["Multimodal Lakehouse", "Automated Ingestion Pipeline Builder", "Search, APIs & Accelerators"],
    priority: "Medium",
    maturity: "Emerging",
    coverage: "3 / 4",
    icon: Database
  },
  {
    id: 3,
    shortName: "Modelling",
    name: "Data Modelling & Transformation",
    description: "Build trusted canonical models, transformations, and dimensional structures with AI assistance.",
    enables: ["Model recommendations", "Transformation drafts", "Business alignment"],
    capabilities: ["Assisted Data Modelling", "Context & Intelligence Layer"],
    priority: "High",
    maturity: "Available",
    coverage: "3 / 3",
    icon: Network
  },
  {
    id: 4,
    shortName: "Quality",
    name: "Data Quality & Validation",
    description: "Ensure data is accurate, consistent, and trusted through automated checks, validation rules, and continuous monitoring.",
    enables: ["Automate quality checks across datasets and pipelines", "Detect anomalies and enforce validation rules", "Provide observability for data health and lineage"],
    capabilities: ["Automated Data Quality", "Data Observability & RuleOps"],
    priority: "High",
    maturity: "In Progress",
    coverage: "2 / 2",
    icon: ShieldCheck
  },
  {
    id: 5,
    shortName: "Productization",
    name: "Data Productization & Publishing",
    description: "Package governed datasets into products with contracts, catalog metadata, and publishing workflows.",
    enables: ["Blueprint creation", "Contract checks", "Catalog publishing"],
    capabilities: ["Data Product Factory", "Automated Data Quality"],
    priority: "High",
    maturity: "Available",
    coverage: "2 / 2",
    icon: PackageCheck
  },
  {
    id: 6,
    shortName: "Context",
    name: "Context & Semantic Enablement",
    description: "Build business context, glossary, policies, semantic mappings, and explainability around data assets.",
    enables: ["Semantic context", "Glossary management", "AI-ready knowledge packs"],
    capabilities: ["Context & Intelligence Layer", "Search, APIs & Accelerators"],
    priority: "High",
    maturity: "In Development",
    coverage: "2 / 3",
    icon: Brain
  },
  {
    id: 7,
    shortName: "Consumption",
    name: "Consumption, Access & Reuse",
    description: "Enable governed access through APIs, demo assets, catalog search, and reusable accelerators.",
    enables: ["Reusable APIs", "Persona-based access", "Demo-ready products"],
    capabilities: ["Search, APIs & Accelerators", "Data Product Factory"],
    priority: "Medium",
    maturity: "Expand",
    coverage: "2 / 3",
    icon: Users
  }
];
