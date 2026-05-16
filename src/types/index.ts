export type Status =
  | "Certified"
  | "Draft"
  | "Running"
  | "Review"
  | "Queued"
  | "Healthy"
  | "Warning"
  | "Critical"
  | "Pending"
  | "Active"
  | "Recommended"
  | "Cost Saving";

export type RelatedEntityType = "product" | "semantic" | "studio" | "journey" | "workspace" | "user" | "service";

export interface DataProduct {
  id: string;
  name: string;
  domain: string;
  owner: string;
  type: string;
  status: Status;
  qualityScore: number;
  certificationStatus: Status;
  consumptionMethods: string[];
  linkedSemanticAssets: string[];
  linkedStudioSessions: string[];
  linkedJourneys: string[];
  lastUpdated: string;
  description: string;
  tags: string[];
  accessRequests: number;
  contractStatus: string;
  slaStatus: string;
  version: string;
}

export interface SemanticAsset {
  id: string;
  name: string;
  domain: string;
  type: string;
  status: Status;
  owner: string;
  coverage: number;
  linkedDataProducts: string[];
  businessTerms: string[];
  metrics: string[];
  relationshipNodes: string[];
  lastUpdated: string;
  description: string;
}

export interface StudioSession {
  id: string;
  name: string;
  studioType: string;
  linkedDataProduct: string;
  domain: string;
  owner: string;
  status: Status;
  progress: number;
  lastUpdated: string;
  recommendations: string[];
  templateUsed: string;
}

export interface ActiveJourney {
  id: string;
  name: string;
  domain: string;
  linkedDataProducts: string[];
  linkedSemanticAssets: string[];
  linkedStudioSessions: string[];
  stage: string;
  status: Status;
  progress: number;
  dueDate: string;
  owner: string;
}

export interface AdminEvent {
  id: string;
  eventType: string;
  title: string;
  description: string;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
  severity: Status;
  timestamp: string;
  actor: string;
}

export interface Approval {
  id: string;
  type: string;
  title: string;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
  priority: "High" | "Medium" | "Low";
  requestedBy: string;
  timestamp: string;
  status: Status;
}

export interface HealthService {
  service: string;
  status: Status;
  lastChecked: string;
  details: string;
  relatedWorkspace: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
  impact: Status | "High Impact";
  actionLabel: string;
  category: string;
}

export type DrawerEntity =
  | { type: "product"; id: string }
  | { type: "semantic"; id: string }
  | { type: "studio"; id: string }
  | { type: "journey"; id: string }
  | { type: "event"; id: string }
  | { type: "approval"; id: string };
