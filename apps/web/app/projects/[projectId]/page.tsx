import type { Metadata } from "next";
import { ProjectWorkspacePage } from "@/src/screens/project-workspace-page";

export const metadata: Metadata = { title: "Project Workspace" };

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectWorkspacePage projectId={projectId} />;
}
