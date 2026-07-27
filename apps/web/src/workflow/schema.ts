import { z } from "zod";

export const useCaseSchema = z.object({
  projectName: z.string().trim().min(3, "Enter a project name."),
  businessDomain: z.string().trim().min(1, "Select a business domain."),
  primaryUseCase: z
    .string()
    .trim()
    .min(20, "Describe the primary use case in at least 20 characters."),
  intendedConsumers: z
    .array(z.string())
    .min(1, "Select at least one intended consumer."),
  businessProblem: z
    .string()
    .trim()
    .min(20, "Describe the business problem or opportunity."),
  expectedOutcomes: z.string().trim().min(10, "Add at least one expected outcome."),
  questions: z.array(z.string()).min(1, "Add at least one example question."),
  entities: z.array(z.string()).min(1, "Add at least one critical entity."),
  relationships: z.array(z.string()).min(1, "Add at least one relationship."),
});

export const scopeSchema = z.object({
  primaryDomain: z.string().trim().min(1, "Select a primary domain."),
  subDomains: z.array(z.string()).min(1, "Add at least one sub-domain."),
  businessFunctions: z
    .array(z.string())
    .min(1, "Select at least one business function."),
  regions: z.array(z.string()).min(1, "Select at least one region."),
  expectedSystems: z
    .array(z.string())
    .min(1, "Select at least one expected system."),
  timeHorizon: z.string().min(1, "Select a time horizon."),
  updateFrequency: z.string().min(1, "Select an update frequency."),
  sensitivity: z.string().min(1, "Select a sensitivity level."),
  scopeBoundary: z.string().trim().min(20, "Define the included scope."),
  exclusions: z.string().trim().min(10, "Define what is out of scope."),
});

export type UseCaseValues = z.infer<typeof useCaseSchema>;
export type ScopeValues = z.infer<typeof scopeSchema>;

