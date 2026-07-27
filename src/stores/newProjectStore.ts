import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  acceptanceCriteria,
  governancePolicies,
  initialAccessEntries,
  projectAssets,
  successMetrics,
} from "../data/mock/wizardFixtures";
import type {
  AcceptanceCriterion,
  AccessEntry,
  GovernancePolicy,
  ProjectAsset,
  SuccessMetric,
} from "../types/wizard";

interface NewProjectState {
  currentStep: number;
  created: boolean;
  projectName: string;
  businessObjective: string;
  domain: string;
  subdomains: string[];
  targetConsumers: string[];
  businessQuestions: string[];
  expectedProduct: string;
  sensitivity: string;
  residency: string;
  enableRecommendations: boolean;
  requireStewardApproval: boolean;
  assets: ProjectAsset[];
  successMetrics: SuccessMetric[];
  acceptanceCriteria: AcceptanceCriterion[];
  informationTypes: string[];
  policyTags: string[];
  accessEntries: AccessEntry[];
  policies: GovernancePolicy[];
  setCurrentStep: (step: number) => void;
  setCreated: (created: boolean) => void;
  setField: <K extends keyof NewProjectState>(
    field: K,
    value: NewProjectState[K],
  ) => void;
  toggleArrayValue: (
    field: "subdomains" | "targetConsumers" | "informationTypes" | "policyTags",
    value: string,
  ) => void;
  addQuestion: () => void;
  updateQuestion: (index: number, value: string) => void;
  removeQuestion: (index: number) => void;
  toggleAsset: (assetId: string) => void;
  selectRecommendedAssets: () => void;
  updateMetric: (
    metricId: string,
    field: "target" | "method" | "criticality",
    value: string,
  ) => void;
  addMetric: () => void;
  removeMetric: (metricId: string) => void;
  toggleCriterion: (criterionId: string) => void;
  togglePolicy: (policyId: string) => void;
  addAccessEntry: () => void;
  removeAccessEntry: (entryId: string) => void;
  resetProject: () => void;
}

const initialState = {
  currentStep: 0,
  created: false,
  projectName: "Customer 360 Knowledge Layer",
  businessObjective:
    "Create a unified and governed Customer 360 knowledge layer that connects customer identity, accounts, products, subscriptions, interactions, support cases, policies, consent, documents, operational events, and provenance to support AI agents, copilots, analytics, search, and workflow automation.",
  domain: "Customer Service",
  subdomains: [
    "Customer",
    "Account",
    "Product",
    "Subscription",
    "Interaction",
    "Support",
    "Consent",
    "Policy",
  ],
  targetConsumers: ["RAG Apps", "Copilots", "AI Agents", "Analytics"],
  businessQuestions: [
    "Who is the customer across all enterprise systems?",
    "What products and subscriptions does a customer own?",
    "What interactions and support cases are associated?",
    "Which policies or consent restrictions apply?",
  ],
  expectedProduct: "Knowledge Graph + Retrieval Package",
  sensitivity: "Confidential / PII",
  residency: "US East",
  enableRecommendations: true,
  requireStewardApproval: true,
  assets: projectAssets,
  successMetrics,
  acceptanceCriteria,
  informationTypes: [
    "Customer Data",
    "Contact Information",
    "Financial Data",
    "Contract Data",
  ],
  policyTags: ["PII", "Customer", "Internal Use", "Consent Controlled"],
  accessEntries: initialAccessEntries,
  policies: governancePolicies,
};

export const useNewProjectStore = create<NewProjectState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (currentStep) => set({ currentStep }),
      setCreated: (created) => set({ created }),
      setField: (field, value) =>
        set((state) => ({ ...state, [field]: value })),
      toggleArrayValue: (field, value) =>
        set((state) => ({
          [field]: state[field].includes(value)
            ? state[field].filter((item) => item !== value)
            : [...state[field], value],
        })),
      addQuestion: () =>
        set((state) => ({
          businessQuestions: [...state.businessQuestions, ""],
        })),
      updateQuestion: (index, value) =>
        set((state) => ({
          businessQuestions: state.businessQuestions.map((question, itemIndex) =>
            itemIndex === index ? value : question,
          ),
        })),
      removeQuestion: (index) =>
        set((state) => ({
          businessQuestions: state.businessQuestions.filter(
            (_, itemIndex) => itemIndex !== index,
          ),
        })),
      toggleAsset: (assetId) =>
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === assetId
              ? { ...asset, selected: !asset.selected }
              : asset,
          ),
        })),
      selectRecommendedAssets: () =>
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.recommended ? { ...asset, selected: true } : asset,
          ),
        })),
      updateMetric: (metricId, field, value) =>
        set((state) => ({
          successMetrics: state.successMetrics.map((metric) =>
            metric.id === metricId
              ? { ...metric, [field]: value }
              : metric,
          ) as SuccessMetric[],
        })),
      addMetric: () =>
        set((state) => ({
          successMetrics: [
            ...state.successMetrics,
            {
              id: `custom-${Date.now()}`,
              name: "Custom Knowledge Metric",
              description: "Define a project-specific quality outcome",
              target: "≥ 90%",
              method: "Manual Review",
              criticality: "Medium",
              tone: "slate",
            },
          ],
        })),
      removeMetric: (metricId) =>
        set((state) => ({
          successMetrics: state.successMetrics.filter(
            (metric) => metric.id !== metricId,
          ),
        })),
      toggleCriterion: (criterionId) =>
        set((state) => ({
          acceptanceCriteria: state.acceptanceCriteria.map((criterion) =>
            criterion.id === criterionId
              ? { ...criterion, selected: !criterion.selected }
              : criterion,
          ),
        })),
      togglePolicy: (policyId) =>
        set((state) => ({
          policies: state.policies.map((policy) =>
            policy.id === policyId
              ? { ...policy, selected: !policy.selected }
              : policy,
          ),
        })),
      addAccessEntry: () =>
        set((state) => {
          if (
            state.accessEntries.some(
              (entry) => entry.id === "customer-service-ai",
            )
          ) {
            return state;
          }
          return {
            accessEntries: [
              ...state.accessEntries,
              {
                id: "customer-service-ai",
                name: "Customer Service AI Apps",
                initials: "AI",
                type: "Group",
                access: "Consume",
                permissions: "Consume approved knowledge products and endpoints",
                tone: "purple",
              },
            ],
          };
        }),
      removeAccessEntry: (entryId) =>
        set((state) => ({
          accessEntries: state.accessEntries.filter(
            (entry) => entry.id !== entryId,
          ),
        })),
      resetProject: () => set(initialState),
    }),
    {
      name: "enterprise-knowledge-new-project",
      partialize: (state) => ({
        currentStep: state.currentStep,
        created: state.created,
        projectName: state.projectName,
        businessObjective: state.businessObjective,
        domain: state.domain,
        subdomains: state.subdomains,
        targetConsumers: state.targetConsumers,
        businessQuestions: state.businessQuestions,
        expectedProduct: state.expectedProduct,
        sensitivity: state.sensitivity,
        residency: state.residency,
        enableRecommendations: state.enableRecommendations,
        requireStewardApproval: state.requireStewardApproval,
        assets: state.assets,
        successMetrics: state.successMetrics,
        acceptanceCriteria: state.acceptanceCriteria,
        informationTypes: state.informationTypes,
        policyTags: state.policyTags,
        accessEntries: state.accessEntries,
        policies: state.policies,
      }),
    },
  ),
);
