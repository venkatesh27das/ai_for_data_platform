export type WizardStepId =
  | "scope"
  | "sources"
  | "success"
  | "governance"
  | "review";

export interface WizardStep {
  id: WizardStepId;
  label: string;
  title: string;
  description: string;
}

export interface SourceSystem {
  id: string;
  name: string;
  category: string;
  assetCount: number;
  status: "Connected" | "Warning";
  tone: string;
}

export interface ProjectAsset {
  id: string;
  name: string;
  subtype: string;
  type: string;
  source: string;
  domain: string;
  role: string;
  relevance: number;
  selected: boolean;
  recommended: boolean;
  assetCount: number;
  tone: string;
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  target: string;
  method: string;
  criticality: "Critical" | "High" | "Medium";
  tone: string;
}

export interface AcceptanceCriterion {
  id: string;
  label: string;
  selected: boolean;
}

export interface AccessEntry {
  id: string;
  name: string;
  initials: string;
  type: "Group" | "User";
  access: "Read" | "Contribute" | "Admin" | "Consume";
  permissions: string;
  tone: string;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  detail: string;
  selected: boolean;
}

export interface WizardOwner {
  role: string;
  name: string;
  title: string;
  initials: string;
  tone: string;
}
