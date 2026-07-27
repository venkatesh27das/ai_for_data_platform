import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ProjectWorkflow,
  type WorkflowStep,
} from "@/src/workflow/project-workflow";

const validSteps = new Set<WorkflowStep>([
  "use-case",
  "scope",
  "sources",
  "success",
  "governance",
  "review",
  "created",
]);

export const metadata: Metadata = { title: "New Knowledge Project" };

export default async function Page({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  if (!validSteps.has(step as WorkflowStep)) notFound();
  return <ProjectWorkflow step={step as WorkflowStep} />;
}

