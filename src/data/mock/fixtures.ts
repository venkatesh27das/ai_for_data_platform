import type {
  ActivityItem,
  AssetCoverage,
  AttentionItem,
  PipelineStage,
  Project,
  ProjectActivity,
} from "../../types/knowledge";

export const projects: Project[] = [
  {
    id: "customer-360",
    name: "Customer 360 Knowledge Layer",
    shortName: "Customer 360",
    description: "Unified customer identity, relationships, policy, and provenance.",
    domain: "Customer",
    stage: "Assembly",
    readiness: 68,
    owner: "Sarah Chen",
    updated: "12 min ago",
    assetCount: 71,
    relationshipCount: 3974,
    attentionCount: 3,
    attentionLabel: "Issues requiring review",
    lastActivity: "12 min ago",
    tone: "blue",
    iconName: "users",
  },
];

export const attentionItems: AttentionItem[] = [
  {
    id: "active-customer-definition",
    issue: "Conflicting definitions of Active Customer",
    project: "Customer 360",
    priority: "High",
    action: "Resolve",
  },
  {
    id: "entity-mappings",
    issue: "3 entity mappings below confidence threshold",
    project: "Customer 360",
    priority: "Medium",
    action: "Review",
  },
  {
    id: "consent-policy",
    issue: "Consent policy mapping requires steward confirmation",
    project: "Customer 360",
    priority: "Medium",
    action: "Approve",
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "a1",
    description: "Customer entity aligned to Golden Party Record",
    actor: "Arjun Mehta",
    time: "12 min ago",
    type: "success",
  },
  {
    id: "a2",
    description: "12 lineage relationships synchronized from Atlan",
    actor: "System",
    time: "35 min ago",
    type: "sync",
  },
  {
    id: "a3",
    description: "Consent policy mapped to Customer concept",
    actor: "Priya Nair",
    time: "2 hr ago",
    type: "policy",
  },
  {
    id: "a4",
    description: "Customer graph build v1.3 completed",
    actor: "System",
    time: "5 hr ago",
    type: "success",
  },
  {
    id: "a5",
    description: "Service Copilot endpoint published",
    actor: "System",
    time: "1 day ago",
    type: "publish",
  },
];

export const assetCoverage: AssetCoverage[] = [
  { category: "Data products & tables", connected: 24, recentlyUpdated: 6 },
  { category: "Semantic & MDM models", connected: 14, recentlyUpdated: 3 },
  { category: "Glossary & policies", connected: 11, recentlyUpdated: 2 },
  { category: "Lineage assets", connected: 9, recentlyUpdated: 4 },
  { category: "Documents", connected: 8, recentlyUpdated: 2 },
  { category: "Existing graphs & APIs", connected: 5, recentlyUpdated: 1 },
];

export const projectActivity: ProjectActivity[] = [
  {
    id: "pa1",
    description: "Data model updated: Customer entity schema v1.4",
    project: "Customer 360 Knowledge Layer",
    actor: "Priya Nair",
    time: "12 min ago",
    type: "edit",
  },
  {
    id: "pa2",
    description: "Validation completed with 2 governance warnings",
    project: "Customer 360 Knowledge Layer",
    actor: "Ananya Sharma",
    time: "35 min ago",
    type: "review",
  },
  {
    id: "pa3",
    description: "Consent policy approval requested from Data Steward",
    project: "Customer 360 Knowledge Layer",
    actor: "Sarah Chen",
    time: "1 hr ago",
    type: "approval",
  },
  {
    id: "pa4",
    description: "New relationship mapped: Customer ↔ Support Case",
    project: "Customer 360 Knowledge Layer",
    actor: "Arjun Mehta",
    time: "2 hr ago",
    type: "mapping",
  },
  {
    id: "pa5",
    description: "Source asset ingested: Customer_Interaction_Event",
    project: "Customer 360 Knowledge Layer",
    actor: "System",
    time: "4 hr ago",
    type: "ingest",
  },
];

export const pipeline: PipelineStage[] = [
  { name: "Discovery", count: 0, tone: "teal" },
  { name: "Mapping", count: 0, tone: "orange" },
  { name: "Assembly", count: 1, tone: "blue" },
  { name: "Validation", count: 0, tone: "purple" },
  { name: "Approval", count: 0, tone: "amber" },
  { name: "Published", count: 0, tone: "green" },
];
