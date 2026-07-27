import type {
  Connector,
  EnterpriseAsset,
  KnowledgeProduct,
  KnowledgeProject,
  KPI,
  OperationalItem,
  Policy,
  ProjectDraft,
  ReadinessAssessment,
  Recommendation,
} from "@/src/models";

export interface ProjectService {
  list(): Promise<KnowledgeProject[]>;
  get(id: string): Promise<KnowledgeProject | undefined>;
  create(draft: ProjectDraft): Promise<{ id: string; createdAt: string }>;
}

export interface AssetService {
  list(): Promise<EnterpriseAsset[]>;
  discover(connectorIds: string[]): Promise<EnterpriseAsset[]>;
}

export interface ProductService {
  list(): Promise<KnowledgeProduct[]>;
}

export interface GovernanceService {
  listPolicies(): Promise<Policy[]>;
}

export interface OperationsService {
  list(): Promise<OperationalItem[]>;
}

export interface RecommendationService {
  getProjectRecommendations(draft: ProjectDraft): Promise<Recommendation[]>;
  getKpiRecommendations(draft: ProjectDraft): Promise<KPI[]>;
  getGovernanceRecommendations(
    draft: ProjectDraft,
  ): Promise<Recommendation[]>;
}

export interface DiscoveryService {
  listConnectors(): Promise<Connector[]>;
  discoverAssets(connectorIds: string[]): Promise<EnterpriseAsset[]>;
}

export interface ReadinessService {
  assessKnowledgeReadiness(draft: ProjectDraft): Promise<ReadinessAssessment>;
  validateProjectReadiness(draft: ProjectDraft): Promise<ReadinessAssessment>;
}

export interface KnowledgeBuilderServices {
  projects: ProjectService;
  assets: AssetService;
  products: ProductService;
  governance: GovernanceService;
  operations: OperationsService;
  recommendations: RecommendationService;
  discovery: DiscoveryService;
  readiness: ReadinessService;
}

