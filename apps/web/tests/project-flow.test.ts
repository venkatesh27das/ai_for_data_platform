import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockServices } from "@/src/services/mock-services";
import {
  initialProjectDraft,
  useProjectDraftStore,
} from "@/src/stores/project-draft-store";
import { scopeSchema, useCaseSchema } from "@/src/workflow/schema";

describe("new project creation state flow", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => useProjectDraftStore.getState().resetDraft());
  });

  it("validates mandatory use-case and scope values", () => {
    expect(
      useCaseSchema.safeParse({
        ...initialProjectDraft,
        projectName: "",
      }).success,
    ).toBe(false);
    expect(scopeSchema.safeParse(initialProjectDraft).success).toBe(true);
  });

  it("preserves entered values and produces a review-ready assessment", async () => {
    act(() => {
      useProjectDraftStore.getState().updateDraft({
        projectName: "Resilient Supplier Intelligence",
        regions: ["APAC", "Europe"],
      });
      useProjectDraftStore.getState().saveDraft();
    });

    const state = useProjectDraftStore.getState();
    expect(state.draft.projectName).toBe("Resilient Supplier Intelligence");
    expect(state.draft.regions).toEqual(["APAC", "Europe"]);
    expect(state.lastSavedAt).toBeTruthy();

    const persisted = localStorage.getItem(
      "knowledge-builder-project-draft-v1",
    );
    expect(persisted).toContain("Resilient Supplier Intelligence");

    const assessment =
      await mockServices.readiness.validateProjectReadiness(state.draft);
    expect(assessment.ready).toBe(true);
    expect(assessment.score).toBeGreaterThanOrEqual(75);
    expect(assessment.checks).toHaveLength(8);
  });
});

