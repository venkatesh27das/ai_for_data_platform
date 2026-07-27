export type Tone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "critical"
  | "ai";

export type LifecycleStage =
  | "Design"
  | "Build"
  | "Validation"
  | "Testing"
  | "Published";

export interface AuditedEntity {
  id: string;
  version: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  team: string;
}

export interface KnowledgeProject extends AuditedEntity {
  name: string;
  description: string;
  domain: string;
  stage: LifecycleStage;
  health: number;
  testPerformance: number;
  owner: User;
  pendingAction: string;
  connectedSources: number;
}

export interface EnterpriseAsset extends AuditedEntity {
  name: string;
  subtitle: string;
  type: string;
  domain: string;
  connectionStatus: string;
  qualityScore: number;
  lastRefreshed: string;
  owner: User;
  projectUsage: number;
  description: string;
  sourceType?: string;
}

export type ProductCapability =
  | "Graph Query"
  | "Semantic Search"
  | "RAG Retrieval"
  | "Context API"
  | "Analytics"
  | "Agent Tool";

export interface KnowledgeProduct extends AuditedEntity {
  name: string;
  description: string;
  domain: string;
  type: string;
  releaseVersion: string;
  qualityScore: number;
  owner: User;
  consumers: number;
  freshnessSla: string;
  sourceSystems: number;
  capabilities: ProductCapability[];
}

export interface Policy extends AuditedEntity {
  name: string;
  subtitle: string;
  category: string;
  domain: string;
  coverage: number;
  owner: User;
  relatedAssets: number;
  classification: string;
  description: string;
}

export interface OperationalItem extends AuditedEntity {
  name: string;
  category: string;
  health: number;
  freshness: number;
  queryVolume: string;
  owner: User;
  alert: string;
  domain: string;
  latency: string;
}

export interface Connector {
  id: string;
  name: string;
  type: string;
  description: string;
  status: "Connected" | "Not Connected";
  recommended: boolean;
}

export interface EntityClass {
  id: string;
  name: string;
  description: string;
  sensitivity: string;
}

export interface RelationshipType {
  id: string;
  name: string;
  sourceEntity: string;
  targetEntity: string;
}

export interface KPI {
  id: string;
  name: string;
  definition: string;
  target: number;
  operator: ">=" | "<=";
  unit: "%" | "hrs" | "/5" | "ms";
  method: string;
  frequency: "Daily" | "Weekly" | "Monthly";
}

export interface Scenario {
  id: string;
  name: string;
  question: string;
  score: number;
  threshold: number;
  status: "Passed" | "Failed" | "Needs Review";
}

export interface RoleAssignment {
  id: string;
  role: string;
  type: "Built-in" | "Custom";
  principals: string;
  description: string;
  accessLevel: "Full Access" | "Manage" | "Contribute" | "Read";
}

export interface ProjectDraft {
  projectName: string;
  businessDomain: string;
  primaryUseCase: string;
  intendedConsumers: string[];
  businessProblem: string;
  expectedOutcomes: string;
  questions: string[];
  entities: string[];
  relationships: string[];
  primaryDomain: string;
  subDomains: string[];
  businessFunctions: string[];
  regions: string[];
  expectedSystems: string[];
  timeHorizon: string;
  updateFrequency: string;
  sensitivity: string;
  scopeBoundary: string;
  exclusions: string;
  selectedConnectorIds: string[];
  selectedAssetCount: number;
  kpis: KPI[];
  overallSuccessRule: string;
  owner: string;
  stewardGroup: string;
  roles: RoleAssignment[];
  publicAccess: boolean;
  apiAccess: boolean;
  allowedDomains: string;
  classification: string;
  policies: string[];
  auditMonitoring: boolean;
}

export interface ReadinessCheck {
  id: string;
  label: string;
  detail: string;
  status: "passed" | "warning" | "failed";
}

export interface ReadinessAssessment {
  score: number;
  ready: boolean;
  checks: ReadinessCheck[];
  warnings: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  tone: Tone;
}

