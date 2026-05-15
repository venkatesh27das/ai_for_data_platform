import { BookOpen, CloudUpload, Code2, Network, ShieldCheck, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Status } from "./capabilities";

export type Studio = {
  name: string;
  description: string;
  status: Status;
  owner: string;
  category: string;
  cta: string;
  icon: LucideIcon;
};

export const studios: Studio[] = [
  { name: "Assisted Data Modelling", description: "Design logical and physical models with AI assistance.", status: "Available", owner: "Arjun Rao", category: "Build Studios", cta: "Open Studio", icon: Network },
  { name: "Automated Ingestion Pipeline Builder", description: "Generate ingestion pipelines and source mappings.", status: "Available", owner: "Neha Singh", category: "Build Studios", cta: "Open Studio", icon: CloudUpload },
  { name: "Automated Data Quality", description: "Create DQ rules, validations, and readiness checks.", status: "Available", owner: "Ravi Kumar", category: "Quality", cta: "Open Studio", icon: ShieldCheck },
  { name: "Code Conversion Studio", description: "Convert legacy SQL, ETL, and scripts to modern patterns.", status: "Available", owner: "Sneha Iyer", category: "Modernization", cta: "Open Studio", icon: Code2 },
  { name: "Migration Workspace", description: "Run modernization assessments and migration tasks.", status: "Expand", owner: "Vikram Patel", category: "Modernization", cta: "Explore", icon: Workflow },
  { name: "Semantic / Context Studio", description: "Create glossary, business rules, and context assets.", status: "In Development", owner: "Ananya Joshi", category: "Foundation", cta: "View Roadmap", icon: BookOpen }
];

export const studioSessions = [
  { name: "Customer 360 Data Model", opened: "Last opened 2h ago", progress: 75 },
  { name: "Claims Ingestion Pipeline Draft", opened: "Last opened yesterday", progress: 60 },
  { name: "Legacy SQL Conversion Batch", opened: "Last opened 2 days ago", progress: 40 }
];

export const studioTemplates = ["Data Modelling Blueprint", "DQ Rule Starter Kit", "Ingestion Connector Template", "Code Conversion Playbook"];
