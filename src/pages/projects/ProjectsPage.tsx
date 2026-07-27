import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Building2,
  CheckCircle2,
  CircleCheck,
  CloudUpload,
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
  const [domain, setDomain] = useState("All Domains");
  const [query, setQuery] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const { data, isPending } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjectsData,
  });

  const filteredProjects = useMemo(() => {
    if (!data) return [];
    return data.projects.filter((project) => {
      const matchesDomain =
        domain === "All Domains" || project.domain === domain;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        `${project.name} ${project.domain} ${project.owner}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesDomain && matchesQuery;
    });
  }, [data, domain, query]);

  if (isPending || !data) {
    return <LoadingState label="Loading knowledge projects" />;
  }

  const domains = Array.from(
    new Set(data.projects.map((project) => project.domain)),
  );

  return (
    <div className="page page--projects">
      <PageHeader
        actions={
          <>
            <Button onClick={() => navigate("/projects/new")} variant="primary">
              <Plus aria-hidden="true" size={17} />
              New Knowledge Project
            </Button>
            <Button
              onClick={() => {
                setImportMessage("Project package validated and ready to import.");
                window.setTimeout(() => setImportMessage(""), 3200);
              }}
            >
              <CloudUpload aria-hidden="true" size={17} />
              Import Project
            </Button>
            <label className="select-control">
              <span className="sr-only">Filter by domain</span>
              <select onChange={(event) => setDomain(event.target.value)} value={domain}>
                <option>All Domains</option>
                {domains.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </>
        }
        description="Create, monitor and manage enterprise knowledge-layer initiatives across domains and use cases."
        title="Knowledge Projects"
      />

      {importMessage && (
        <div aria-live="polite" className="inline-notice" role="status">
          <CheckCircle2 aria-hidden="true" size={17} />
          {importMessage}
        </div>
      )}

      <div className="project-kpis">
        <KpiCard
          icon={FolderKanban}
          label="Active Projects"
          note="2 vs last 30 days"
          tone="blue"
          trend="up"
          value={data.totals.active}
        />
        <KpiCard
          icon={Box}
          label="In Assembly"
          note="1 vs last 30 days"
          tone="purple"
          trend="up"
          value={data.totals.assembly}
        />
        <KpiCard
          icon={Hourglass}
          label="Awaiting Review"
          note="1 vs last 30 days"
          tone="amber"
          trend="down"
          value={data.totals.review}
        />
        <KpiCard
          icon={CircleCheck}
          label="Published"
          note="1 vs last 30 days"
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
              title="Project Portfolio"
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
              <button className="card-link" type="button">
                View all projects <ArrowRight aria-hidden="true" size={15} />
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
                    value={(stage.count / 4) * 100}
                  />
                  <strong>{stage.count}</strong>
                </div>
              ))}
              <div className="pipeline-list__total">
                <span>Total Projects</span>
                <strong>13</strong>
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
            <button className="card-link" type="button">
              View all issues <ArrowRight aria-hidden="true" size={15} />
            </button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
