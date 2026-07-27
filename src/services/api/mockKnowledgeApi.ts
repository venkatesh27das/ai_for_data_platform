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
    continueWorking: projects,
    attentionItems,
    recentActivity,
    assetCoverage,
    portfolio: {
      activeProjects: 1,
      connectedAssets: 71,
      publishedProducts: 1,
      openReviews: 3,
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
      active: 1,
      assembly: 1,
      review: 3,
      published: 1,
    },
  };
}
