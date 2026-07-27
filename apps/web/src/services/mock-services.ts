import type { ProjectDraft, ReadinessAssessment } from "@/src/models";
import type { KnowledgeBuilderServices } from "./contracts";
import {
  assets,
  connectors,
  defaultKpis,
  operationalItems,
  policies,
  products,
  projects,
} from "./mock-data";

const wait = async <T>(value: T, delay = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), delay));

const assess = (draft: ProjectDraft): ReadinessAssessment => {
  const checks: ReadinessAssessment["checks"] = [
    { id: "use-case", label: "Use case completeness", detail: "Objectives, consumers and expected questions defined", status: draft.projectName && draft.primaryUseCase ? "passed" : "failed" },
    { id: "scope", label: "Scope definition", detail: "Domains, entities and boundaries defined", status: draft.primaryDomain && draft.entities.length > 0 ? "passed" : "failed" },
    { id: "sources", label: "Source connectivity", detail: "Relevant enterprise sources selected", status: draft.selectedConnectorIds.length >= 2 ? "passed" : "warning" },
    { id: "assets", label: "Asset selection", detail: "Relevant assets selected and mapped", status: draft.selectedAssetCount > 0 ? "passed" : "warning" },
    { id: "kpis", label: "KPI definition", detail: "KPIs and measurable targets are defined", status: draft.kpis.length >= 3 ? "passed" : "failed" },
    { id: "access", label: "Access control setup", detail: "Roles, permissions and policies configured", status: draft.roles.length >= 2 ? "passed" : "warning" },
    { id: "classification", label: "Data classification", detail: "Sensitivity and classification review", status: draft.classification ? "passed" : "warning" },
    { id: "policy", label: "Policy compliance", detail: "Governance controls aligned", status: draft.policies.length > 0 ? "passed" : "warning" },
  ];
  const passed = checks.filter((check) => check.status === "passed").length;
  const failed = checks.filter((check) => check.status === "failed").length;
  const score = Math.round((passed / checks.length) * 88 + (failed === 0 ? 8 : 0));
  return {
    score,
    ready: failed === 0 && score >= 75,
    checks,
    warnings: checks
      .filter((check) => check.status === "warning")
      .map((check) => check.detail),
  };
};

/**
 * Explicitly mocked phase-one services. Each object satisfies a replaceable
 * domain contract and can later be swapped for an `/api/v1` implementation.
 */
export const mockServices: KnowledgeBuilderServices = {
  projects: {
    list: () => wait(projects),
    get: (id) => wait(projects.find((project) => project.id === id) ?? projects[0]),
    create: () =>
      wait({ id: "KPJ-2025-0007", createdAt: new Date().toISOString() }, 220),
  },
  assets: {
    list: () => wait(assets),
    discover: () => wait(assets),
  },
  products: { list: () => wait(products) },
  governance: { listPolicies: () => wait(policies) },
  operations: { list: () => wait(operationalItems) },
  discovery: {
    listConnectors: () => wait(connectors),
    discoverAssets: () => wait(assets),
  },
  recommendations: {
    getProjectRecommendations: () =>
      wait([
        { id: "rec-source", title: "Connect supplier master data", detail: "Use SAP Vendor Master, supplier portal or MDM as the authoritative identity source.", tone: "success" },
        { id: "rec-contracts", title: "Include contract evidence", detail: "Connect SharePoint or CLM content for obligations and renewal dates.", tone: "warning" },
        { id: "rec-events", title: "Capture operational signals", detail: "Add incident, shipment and performance events for near-real-time risk.", tone: "ai" },
      ]),
    getKpiRecommendations: () => wait(defaultKpis),
    getGovernanceRecommendations: () =>
      wait([
        { id: "gov-rls", title: "Enable row-level security", detail: "Limit sensitive supplier records by region and assigned domain.", tone: "success" },
        { id: "gov-api", title: "Restrict external API access", detail: "Allow only approved consumers and trusted domains.", tone: "ai" },
        { id: "gov-audit", title: "Add an auditor role", detail: "Track changes and approvals without write access.", tone: "warning" },
      ]),
  },
  readiness: {
    assessKnowledgeReadiness: (draft) => wait(assess(draft)),
    validateProjectReadiness: (draft) => wait(assess(draft)),
  },
};

