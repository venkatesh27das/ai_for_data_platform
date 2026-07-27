import {
  assetCoverage,
  attentionItems,
  pipeline,
  projectActivity,
  projects,
  recentActivity,
} from "../../data/mock/fixtures";
import type { HomeData, ProjectsData } from "../../types/knowledge";

const MOCK_LATENCY_MS = 220;

const wait = (duration: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, duration));

export async function getHomeData(): Promise<HomeData> {
  await wait(MOCK_LATENCY_MS);
  return {
    continueWorking: projects.slice(0, 3),
    attentionItems,
    recentActivity,
    assetCoverage,
    portfolio: {
      activeProjects: 6,
      connectedAssets: 184,
      publishedProducts: 4,
      openReviews: 8,
    },
  };
}

export async function getProjectsData(): Promise<ProjectsData> {
  await wait(MOCK_LATENCY_MS);
  return {
    projects,
    recentActivity: projectActivity,
    needsAttention: attentionItems,
    pipeline,
    totals: {
      active: 6,
      assembly: 3,
      review: 2,
      published: 4,
    },
  };
}
