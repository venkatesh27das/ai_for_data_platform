"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProjectDraft } from "@/src/models";
import { defaultKpis, defaultRoles } from "@/src/services/mock-data";

export const initialProjectDraft: ProjectDraft = {
  projectName: "Supplier Risk Knowledge Graph",
  businessDomain: "Procurement",
  primaryUseCase:
    "Enable AI agents and analytics to identify supplier risks, contract compliance issues, performance gaps and financial exposure.",
  intendedConsumers: ["AI Agent / Copilot", "Analytics Application", "RAG Application"],
  businessProblem:
    "Procurement teams need a unified, real-time view of supplier risks across contracts, shipments, incidents, performance metrics and financials to make faster, data-driven decisions.",
  expectedOutcomes:
    "360° view of suppliers and risk factors\nEarly identification of high-risk suppliers\nContract compliance and obligation tracking\nImproved decision speed for sourcing and negotiations",
  questions: [
    "Which suppliers are high risk based on financial stability and performance history?",
    "Show active contracts expiring in the next 90 days.",
    "Which suppliers have open incidents impacting critical products?",
    "What is the spend exposure for tier-1 suppliers?",
  ],
  entities: [
    "Supplier",
    "Contract",
    "Product",
    "Material",
    "Incident",
    "Shipment",
    "Purchase Order",
    "Invoice",
    "Facility",
    "Risk Factor",
  ],
  relationships: [
    "Supplier supplies Material",
    "Supplier has Contract",
    "Contract covers Product",
    "Supplier has Incident",
    "Shipment relates to PO",
  ],
  primaryDomain: "Procurement",
  subDomains: [
    "Supplier Management",
    "Contract Management",
    "Risk & Compliance",
    "Procurement Operations",
    "Product Supply Impact",
  ],
  businessFunctions: ["Procurement", "Legal", "Finance", "Operations", "Risk"],
  regions: ["North America", "Europe", "APAC"],
  expectedSystems: ["SAP Vendor Master", "CLM / Contracts Repository", "Product Hierarchy", "Incident Management"],
  timeHorizon: "24 months",
  updateFrequency: "Daily",
  sensitivity: "Confidential",
  scopeBoundary:
    "Included: Supplier master, contracts, product hierarchy, shipments, incidents, invoices, purchase orders, facilities and related risks.",
  exclusions:
    "HR systems, employee data, marketing, sales, revenue recognition, tax calculations and customer support ticketing.",
  selectedConnectorIds: ["sap", "databricks", "sharepoint", "collibra"],
  selectedAssetCount: 24,
  kpis: defaultKpis,
  overallSuccessRule: "All KPIs must meet or exceed their targets",
  owner: "Akhil Kumar",
  stewardGroup: "data-stewards@acme.com",
  roles: defaultRoles,
  publicAccess: false,
  apiAccess: true,
  allowedDomains: "acme.com, *.acme.com",
  classification: "Confidential",
  policies: [
    "Supplier Data Usage Policy",
    "Contract Retention Policy",
    "Procurement Access Standard",
  ],
  auditMonitoring: true,
};

interface ProjectDraftState {
  draft: ProjectDraft;
  lastSavedAt?: string;
  createdProjectId?: string;
  updateDraft: (patch: Partial<ProjectDraft>) => void;
  saveDraft: () => void;
  markCreated: (id: string) => void;
  resetDraft: () => void;
}

export const useProjectDraftStore = create<ProjectDraftState>()(
  persist(
    (set) => ({
      draft: initialProjectDraft,
      updateDraft: (patch) =>
        set((state) => ({ draft: { ...state.draft, ...patch } })),
      saveDraft: () => set({ lastSavedAt: new Date().toISOString() }),
      markCreated: (id) => set({ createdProjectId: id }),
      resetDraft: () =>
        set({
          draft: initialProjectDraft,
          lastSavedAt: undefined,
          createdProjectId: undefined,
        }),
    }),
    {
      name: "knowledge-builder-project-draft-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

