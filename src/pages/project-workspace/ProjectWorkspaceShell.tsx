import { CalendarDays, ChevronLeft, ExternalLink, FolderKanban, Settings, UserRound } from "lucide-react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

const tabs = [
  { label: "Overview", suffix: "" },
  { label: "Assets & Sources", suffix: "/assets" },
  { label: "Graph & Model", suffix: "/graph" },
  { label: "Build & Govern", suffix: "/build" },
  { label: "Quality & Monitoring", suffix: "/quality" },
  { label: "Publish & Serve", suffix: "/publish" },
  { label: "Usage & Insights", suffix: "/usage" },
  { label: "Activity", suffix: "/activity" },
  { label: "Settings", suffix: "/settings" },
];

export function ProjectWorkspaceShell() {
  const { projectId = "customer-360" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const base = `/projects/${projectId}`;
  const currentRoute = location.pathname.split("/").at(-1);

  if (projectId !== "customer-360") {
    return <Navigate replace to="/projects/customer-360" />;
  }

  return (
    <div className="page project-workspace">
      <NavLink className="back-link" to="/projects">
        <ChevronLeft aria-hidden="true" size={15} />
        Back to Knowledge Projects
      </NavLink>
      <div className="project-workspace__title">
        <div>
          <div className="project-title-line">
            <h1>Customer 360 Knowledge Layer</h1>
            <Badge tone="green">Active</Badge>
          </div>
          <div className="project-meta">
            <span>
              <FolderKanban aria-hidden="true" size={14} />
              Project ID: KP-2024-0007
            </span>
            <span>
              <FolderKanban aria-hidden="true" size={14} />
              Customer Domain
            </span>
            <span>
              <CalendarDays aria-hidden="true" size={14} />
              Created on: May 24, 2024
            </span>
            <span>
              <UserRound aria-hidden="true" size={14} />
              Owner: Sarah Chen
            </span>
          </div>
        </div>
        <div className="project-header-actions">
          {currentRoute !== "settings" && <Button onClick={() => navigate(`${base}/settings`)}><Settings size={15} />Project Settings</Button>}
          {currentRoute === projectId && <Button onClick={() => navigate(`${base}/build`)} variant="primary"><ExternalLink size={15}/>Open Project Workspace</Button>}
          {currentRoute === "graph" && <Button onClick={() => navigate(`${base}/build`)} variant="primary"><ExternalLink size={15}/>Continue to Build & Govern</Button>}
        </div>
      </div>
      <nav aria-label="Project workspace" className="project-tabs">
        {tabs.map((tab) => (
          <NavLink
            className={({ isActive }) =>
              `project-tab${isActive ? " project-tab--active" : ""}`
            }
            end={!tab.suffix}
            key={tab.label}
            to={`${base}${tab.suffix}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
