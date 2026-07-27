import type { LucideIcon } from "lucide-react";

export type Tone =
  | "orange"
  | "blue"
  | "purple"
  | "green"
  | "amber"
  | "red"
  | "teal"
  | "slate";

export type ProjectStage =
  | "Discovery"
  | "Mapping"
  | "Assembly"
  | "Validation"
  | "Approval"
  | "Published";

export interface Project {
  id: string;
  name: string;
  shortName: string;
  description: string;
  domain: string;
  stage: ProjectStage;
  readiness: number;
  owner: string;
  updated: string;
  assetCount: number;
  relationshipCount?: number;
  attentionCount?: number;
  attentionLabel?: string;
  lastActivity: string;
  tone: Tone;
  iconName: "users" | "shield" | "file" | "network" | "flask" | "building";
}

export interface AttentionItem {
  id: string;
  issue: string;
  project: string;
  priority: "High" | "Medium";
  action: string;
}

export interface ActivityItem {
  id: string;
  description: string;
  actor: string;
  project?: string;
  time: string;
  type: "success" | "sync" | "policy" | "publish" | "edit" | "review";
}

export interface AssetCoverage {
  category: string;
  connected: number;
  recentlyUpdated: number;
}

export interface ProjectActivity {
  id: string;
  description: string;
  project: string;
  actor: string;
  time: string;
  type: "edit" | "review" | "approval" | "mapping" | "ingest";
}

export interface PipelineStage {
  name: ProjectStage;
  count: number;
  tone: Tone;
}

export interface KpiDefinition {
  label: string;
  value: string | number;
  note: string;
  tone: Tone;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export interface HomeData {
  continueWorking: Project[];
  attentionItems: AttentionItem[];
  recentActivity: ActivityItem[];
  assetCoverage: AssetCoverage[];
  portfolio: {
    activeProjects: number;
    connectedAssets: number;
    publishedProducts: number;
    openReviews: number;
  };
}

export interface ProjectsData {
  projects: Project[];
  recentActivity: ProjectActivity[];
  needsAttention: AttentionItem[];
  pipeline: PipelineStage[];
  totals: {
    active: number;
    assembly: number;
    review: number;
    published: number;
  };
}
