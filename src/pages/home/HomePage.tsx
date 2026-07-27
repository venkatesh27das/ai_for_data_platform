import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle2,
  Database,
  FolderKanban,
  Link2,
  MessageCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Tag,
  UploadCloud,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Customer360StoryBar } from "../../components/customer360/Customer360StoryBar";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { KpiCard } from "../../components/ui/KpiCard";
import { LoadingState } from "../../components/ui/LoadingState";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { getHomeData } from "../../services/api/mockKnowledgeApi";
import { useNewProjectStore } from "../../stores/newProjectStore";

const activityIcons = {
  success: CheckCircle2,
  sync: RefreshCw,
  policy: Tag,
  publish: UploadCloud,
  edit: CheckCircle2,
  review: ShieldCheck,
};

export function HomePage() {
  const navigate = useNavigate();
  const resetProject = useNewProjectStore((state) => state.resetProject);
  const { data, isError, isPending, refetch } = useQuery({
    queryKey: ["home"],
    queryFn: getHomeData,
  });

  if (isPending) {
    return <LoadingState label="Loading enterprise knowledge workspace" />;
  }

  if (isError || !data) {
    return (
      <Card className="state-card">
        <AlertTriangle aria-hidden="true" />
        <h1>Workspace data could not be loaded</h1>
        <p>The deterministic demo service did not respond as expected.</p>
        <Button onClick={() => void refetch()} variant="primary">
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="page page--home">
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
              <Link2 aria-hidden="true" size={17} />
              Browse Assets
            </Button>
          </>
        }
        description="Assemble governed enterprise assets into trusted knowledge products for AI, analytics, and operational applications."
        title="Enterprise Knowledge Workspace"
      />

      <section className="home-section">
        <SectionHeader title="Active Knowledge Project" />
        <div className="continue-grid">
          {data.continueWorking.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <Customer360StoryBar />
      </section>

      <div className="home-dashboard-grid">
        <Card>
          <SectionHeader title="Requires Your Attention" />
          <div className="attention-table" role="table">
            <div className="attention-table__header" role="row">
              <span>Issue</span>
              <span>Project</span>
              <span>Priority</span>
              <span>Action</span>
            </div>
            {data.attentionItems.map((item) => (
              <button
                className="attention-row"
                key={item.id}
                onClick={() => navigate("/projects/customer-360/build")}
                role="row"
                type="button"
              >
                <span>
                  <AlertTriangle aria-hidden="true" size={15} />
                  {item.issue}
                </span>
                <span>{item.project}</span>
                <span>
                  <em className={`priority priority--${item.priority.toLowerCase()}`}>
                    {item.priority}
                  </em>
                </span>
                <span className="text-action">{item.action}</span>
              </button>
            ))}
          </div>
          <button className="card-link" onClick={() => navigate("/projects/customer-360/build")} type="button">
            Review all 3 items <ArrowRight aria-hidden="true" size={15} />
          </button>
        </Card>

        <Card>
          <SectionHeader title="Customer 360 Summary" />
          <div className="portfolio-grid">
            <KpiCard
              icon={FolderKanban}
              label="Active Project"
              note="Customer 360"
              tone="orange"
              trend="up"
              value={data.portfolio.activeProjects}
            />
            <KpiCard
              icon={Database}
              label="Connected Assets"
              note="Across 6 governed sources"
              tone="orange"
              trend="up"
              value={data.portfolio.connectedAssets}
            />
            <KpiCard
              icon={Box}
              label="Published Product"
              note="Version 1.3.0"
              tone="orange"
              trend="up"
              value={data.portfolio.publishedProducts}
            />
            <KpiCard
              icon={MessageCircle}
              label="Open Reviews"
              note="Human decisions required"
              tone="orange"
              trend="down"
              value={data.portfolio.openReviews}
            />
          </div>
        </Card>

        <Card>
          <SectionHeader title="Recent Activity" />
          <ul className="activity-list">
            {data.recentActivity.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <li key={activity.id}>
                  <Icon aria-hidden="true" size={18} />
                  <span>{activity.description}</span>
                  <small>{activity.actor}</small>
                  <time>{activity.time}</time>
                </li>
              );
            })}
          </ul>
          <button className="card-link" onClick={() => navigate("/projects/customer-360/activity")} type="button">
            View all activity <ArrowRight aria-hidden="true" size={15} />
          </button>
        </Card>

        <Card>
          <SectionHeader title="Customer 360 Asset Coverage" />
          <table className="data-table data-table--compact">
            <thead>
              <tr>
                <th>Asset Category</th>
                <th>Connected</th>
                <th>Recently Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.assetCoverage.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  <td>{row.connected}</td>
                  <td>{row.recentlyUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="card-link" onClick={() => navigate("/assets")} type="button">
            View all assets <ArrowRight aria-hidden="true" size={15} />
          </button>
        </Card>
      </div>
    </div>
  );
}
