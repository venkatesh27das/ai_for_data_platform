import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { RouteFoundationPage } from "../pages/foundation/RouteFoundationPage";
import { HomePage } from "../pages/home/HomePage";
import { EnterpriseAssetsPage } from "../pages/assets/EnterpriseAssetsPage";
import { KnowledgeProductsPage } from "../pages/products/KnowledgeProductsPage";
import { NewProjectFoundationPage } from "../pages/project-wizard/NewProjectFoundationPage";
import { ActivityPage } from "../pages/project-workspace/ActivityPage";
import { AssetsPage } from "../pages/project-workspace/AssetsPage";
import { BuildPage } from "../pages/project-workspace/BuildPage";
import { GraphPage } from "../pages/project-workspace/GraphPage";
import { OverviewPage } from "../pages/project-workspace/OverviewPage";
import { PublishPage } from "../pages/project-workspace/PublishPage";
import { QualityPage } from "../pages/project-workspace/QualityPage";
import { SettingsPage } from "../pages/project-workspace/SettingsPage";
import { UsagePage } from "../pages/project-workspace/UsagePage";
import { ProjectWorkspaceShell } from "../pages/project-workspace/ProjectWorkspaceShell";
import { ProjectsPage } from "../pages/projects/ProjectsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/new" element={<NewProjectFoundationPage />} />
          <Route path="projects/:projectId" element={<ProjectWorkspaceShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="graph" element={<GraphPage />} />
            <Route path="build" element={<BuildPage />} />
            <Route path="quality" element={<QualityPage />} />
            <Route path="publish" element={<PublishPage />} />
            <Route path="usage" element={<UsagePage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="assets" element={<EnterpriseAssetsPage />} />
          <Route path="products" element={<KnowledgeProductsPage />} />
          <Route path="graph-explorer" element={<RouteFoundationPage />} />
          <Route path="administration" element={<RouteFoundationPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
