import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Building2,
  CircleCheck,
  CloudUpload,
  Database,
  Edit3,
  FlaskConical,
  Folder,
  FolderKanban,
  Hourglass,
  Network,
  Plus,
  Shield,
  TestTube2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { KpiCard } from "../../components/ui/KpiCard";
import { LoadingState } from "../../components/ui/LoadingState";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { getProjectsData } from "../../services/api/mockKnowledgeApi";
import { useNewProjectStore } from "../../stores/newProjectStore";
import type { Project, ProjectStage, Tone } from "../../types/knowledge";

const projectIcons = {
  users: Users,
  shield: Shield,
  file: Folder,
  network: Network,
  flask: FlaskConical,
  building: Building2,
};

const projectActivityIcons = {
  edit: Edit3,
  review: CircleCheck,
  approval: Users,
  mapping: Network,
  ingest: CloudUpload,
};

const stageTone: Record<ProjectStage, Tone> = {
  Discovery: "teal",
  Mapping: "orange",
  Assembly: "blue",
  Validation: "purple",
  Approval: "amber",
  Published: "green",
};

function ProjectRow({ project }: { project: Project }) {
  const navigate = useNavigate();
  const Icon = projectIcons[project.iconName];

  return (
    <tr>
      <td>
        <button
          className="project-name"
          onClick={() => navigate(`/projects/${project.id}`)}
          type="button"
        >
          <Icon
            aria-hidden="true"
            className={`tone-${project.tone}`}
            size={18}
          />
          <span>{project.name}</span>
        </button>
      </td>
      <td>{project.domain}</td>
      <td>
        <Badge tone={stageTone[project.stage]}>{project.stage}</Badge>
      </td>
      <td>
        <div className="readiness-cell">
          <span>{project.readiness}%</span>
          <ProgressBar compact tone={project.tone} value={project.readiness} />
        </div>
      </td>
      <td>{project.owner}</td>
      <td>{project.updated}</td>
      <td>
        <button
          className="text-action"
          onClick={() => navigate(`/projects/${project.id}`)}
          type="button"
        >
          {project.stage === "Approval"
            ? "Approve"
            : project.stage === "Validation"
              ? "Review"
              : project.stage === "Published"
                ? "View"
                : "Open"}
        </button>
      </td>
    </tr>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const resetProject = useNewProjectStore((state) => state.resetProject);
  const [query, setQuery] = useState("");
  const { data, isPending } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjectsData,
  });

  const filteredProjects = useMemo(() => {
    if (!data) return [];
    return data.projects.filter((project) => {
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        `${project.name} ${project.domain} ${project.owner}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesQuery;
    });
  }, [data, query]);

  if (isPending || !data) {
    return <LoadingState label="Loading knowledge projects" />;
  }

  return (
    <div className="page page--projects">
      <PageHeader
        actions={
          <>
            <Button
              onClick={() => {
                resetProject();
                navigate("/projects/new");
              }}
              variant="primary"
            >
              <Plus aria-hidden="true" size={17} />
              New Knowledge Project
            </Button>
            <Button onClick={() => navigate("/assets")}>
              <Database aria-hidden="true" size={17} />
              Browse Assets
            </Button>
          </>
        }
        description="Manage enterprise knowledge assembly initiatives from source selection through publishing and consumption."
        title="Knowledge Projects"
      />

      <div className="project-kpis">
        <KpiCard
          icon={FolderKanban}
          label="Active Project"
          note="Customer 360"
          tone="blue"
          trend="up"
          value={data.totals.active}
        />
        <KpiCard
          icon={Box}
          label="Assembly Stage"
          note="68% complete"
          tone="purple"
          trend="up"
          value={data.totals.assembly}
        />
        <KpiCard
          icon={Hourglass}
          label="Open Reviews"
          note="Human decisions required"
          tone="amber"
          trend="down"
          value={data.totals.review}
        />
        <KpiCard
          icon={CircleCheck}
          label="Published Product"
          note="Version 1.3.0"
          tone="green"
          trend="up"
          value={data.totals.published}
        />
      </div>

      <div className="projects-layout">
        <div className="projects-layout__main">
          <Card className="portfolio-card">
            <SectionHeader
              action={
                <label className="table-search">
                  <span className="sr-only">Search project portfolio</span>
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search portfolio"
                    type="search"
                    value={query}
                  />
                </label>
              }
              title="Customer 360 Knowledge Layer"
            />
            <div className="table-scroll">
              <table className="data-table project-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Domain</th>
                    <th>Stage</th>
                    <th>Readiness</th>
                    <th>Owner</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <ProjectRow key={project.id} project={project} />
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProjects.length === 0 ? (
              <div className="empty-table-state">
                <FolderKanban aria-hidden="true" size={24} />
                <strong>No matching projects</strong>
                <span>Try another domain or project name.</span>
              </div>
            ) : (
              <button className="card-link" onClick={() => navigate("/projects/customer-360")} type="button">
                Open Project <ArrowRight aria-hidden="true" size={15} />
              </button>
            )}
          </Card>

          <Card>
            <SectionHeader title="Recent Project Activity" />
            <div className="project-activity">
              <div className="project-activity__header">
                <span>Activity</span>
                <span>Project</span>
                <span>Actor</span>
                <span>Time</span>
              </div>
              {data.recentActivity.map((activity) => {
                const Icon = projectActivityIcons[activity.type];
                return (
                  <div className="project-activity__row" key={activity.id}>
                    <span>
                      <Icon aria-hidden="true" size={16} />
                      {activity.description}
                    </span>
                    <span>{activity.project}</span>
                    <span>{activity.actor}</span>
                    <span>{activity.time}</span>
                  </div>
                );
              })}
            </div>
            <button className="card-link" onClick={() => navigate("/projects/customer-360/activity")} type="button">
              View all activity <ArrowRight aria-hidden="true" size={15} />
            </button>
          </Card>
        </div>

        <aside className="projects-layout__aside">
          <Card>
            <SectionHeader title="Project Pipeline" />
            <div className="pipeline-list">
              {data.pipeline.map((stage) => (
                <div key={stage.name}>
                  <span>
                    <TestTube2 aria-hidden="true" size={15} />
                    {stage.name}
                  </span>
                  <ProgressBar
                    compact
                    tone={stage.tone}
                    value={stage.count > 0 ? 100 : 0}
                  />
                  <strong>{stage.count}</strong>
                </div>
              ))}
              <div className="pipeline-list__total">
                <span>Total Projects</span>
                <strong>1</strong>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Needs Attention" />
            <ul className="needs-attention">
              {data.needsAttention.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate("/projects/customer-360/build")}
                    type="button"
                  >
                    <AlertTriangle aria-hidden="true" size={17} />
                    <span>{item.issue}</span>
                    <small>{item.project}</small>
                    <ArrowRight aria-hidden="true" size={15} />
                  </button>
                </li>
              ))}
            </ul>
            <button className="card-link" onClick={() => navigate("/projects/customer-360/build")} type="button">
              View all issues <ArrowRight aria-hidden="true" size={15} />
            </button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
