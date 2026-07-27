import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  initializationAgents,
  initializationEvents,
  initializationNextSteps,
  projectAssets,
} from "../../data/mock/wizardFixtures";
import { useNewProjectStore } from "../../stores/newProjectStore";

const stages = [
  "Project Created",
  "Asset Discovery",
  "Semantic Mapping",
  "Graph Construction",
  "Validation",
  "Publish Draft",
];

export function InitializationSuccessScreen() {
  const navigate = useNavigate();
  const {
    assets,
    domain,
    projectName,
    resetProject,
    sensitivity,
    targetConsumers,
  } = useNewProjectStore();
  const [completedEvents, setCompletedEvents] = useState(3);
  const [activeStage, setActiveStage] = useState(1);
  const selectedAssetCount = assets
    .filter((asset) => asset.selected)
    .reduce((total, asset) => total + asset.assetCount, 0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCompletedEvents((count) => {
        const next = Math.min(initializationEvents.length, count + 1);
        if (next >= initializationEvents.length) {
          setActiveStage(2);
          window.clearInterval(timer);
        }
        return next;
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="page initialization-page">
      <div className="breadcrumbs">
        <button onClick={() => navigate("/projects")} type="button">
          Knowledge Projects
        </button>
        <span>/</span>
        <span>{projectName}</span>
      </div>
      <div className="success-title-row">
        <div>
          <span className="success-icon"><Check size={22} /></span>
          <div>
            <h1>Project Created Successfully</h1>
            <p>
              {projectName} has been initialized. Enterprise assets are now being
              discovered, aligned and assembled into a governed knowledge layer.
            </p>
          </div>
        </div>
        <div>
          <Button
            onClick={() => navigate("/projects/customer-360")}
            variant="primary"
          >
            Open Project Workspace
          </Button>
          <Button onClick={() => navigate("/projects/customer-360/activity")}>
            View Agent Runs
          </Button>
        </div>
      </div>

      <div className="success-banner">
        <CheckCircle2 size={20} />
        <span>
          Your project is now being initialized. We’ll keep you updated as
          governed agents discover and assemble enterprise knowledge.
        </span>
      </div>

      <div className="initialization-grid">
        <Card className="initialization-status-card">
          <h2>1. Project Initialization Status</h2>
          <div className="initialization-stages">
            {stages.map((stage, index) => (
              <div
                className={
                  index < activeStage
                    ? "complete"
                    : index === activeStage
                      ? "active"
                      : ""
                }
                key={stage}
              >
                <span>{index < activeStage ? <Check size={13} /> : index + 1}</span>
                <strong>{stage}</strong>
                <small>
                  {index < activeStage
                    ? "Complete"
                    : index === activeStage
                      ? "In Progress"
                      : "Queued"}
                </small>
              </div>
            ))}
          </div>
          <ul className="initialization-events">
            {initializationEvents.map((event, index) => (
              <li className={index < completedEvents ? "complete" : ""} key={event}>
                <time>{index < 2 ? "10:24 AM" : "10:25 AM"}</time>
                {index < completedEvents ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <span className="event-pending" />
                )}
                <span>{event}</span>
              </li>
            ))}
          </ul>
          <p className="last-updated">Last updated: just now</p>
        </Card>

        <Card className="initialization-overview-card">
          <h2>2. Project Overview</h2>
          <dl>
            <div><dt>Project Name</dt><dd>{projectName}</dd></div>
            <div><dt>Domain</dt><dd>{domain}</dd></div>
            <div><dt>Target Consumers</dt><dd>{targetConsumers.join(", ")}</dd></div>
            <div><dt>Source Systems</dt><dd>6</dd></div>
            <div><dt>Selected Assets</dt><dd>{selectedAssetCount}</dd></div>
            <div><dt>Estimated Concepts</dt><dd>~210</dd></div>
            <div><dt>Estimated Relationships</dt><dd>~620</dd></div>
            <div><dt>Planned Graph Layers</dt><dd>Metadata, Lineage, Semantic, Domain, Operational</dd></div>
            <div><dt>Sensitivity</dt><dd className="text-orange">{sensitivity}</dd></div>
            <div><dt>Owners</dt><dd>Sarah Chen, Rahul Mehta, Ananya Sharma, Vikram Kumar</dd></div>
          </dl>
        </Card>

        <Card className="initialization-next-card">
          <h2>3. What Happens Next</h2>
          <ol>
            {initializationNextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.label}>
                  <span>{index + 1}</span>
                  <Icon size={17} />
                  <strong>{step.label}</strong>
                </li>
              );
            })}
          </ol>
          <div className="assembly-estimate">
            <Clock3 size={18} />
            <span>
              <strong>Estimated initial assembly time: 18–25 min</strong>
              You will be notified when human review is required.
            </span>
          </div>
          <div className="success-links">
            <button onClick={() => navigate("/projects/customer-360")} type="button">
              <FolderKanban size={16} /> Open Workspace <ArrowRight size={14} />
            </button>
            <button onClick={() => navigate("/projects/customer-360/settings")} type="button">
              <Settings size={16} /> Edit Settings <ArrowRight size={14} />
            </button>
            <button
              onClick={() => {
                resetProject();
                navigate("/projects");
              }}
              type="button"
            >
              <FolderKanban size={16} /> Back to Projects <ArrowRight size={14} />
            </button>
          </div>
        </Card>

        <Card className="activated-agents-card">
          <h2>4. Activated Agents</h2>
          <div>
            {initializationAgents.map((agent, index) => {
              const Icon = agent.icon;
              const isRunning = index < activeStage + 1;
              return (
                <article key={agent.name}>
                  <span className={`icon-tile icon-tile--${agent.tone}`}>
                    <Icon size={18} />
                  </span>
                  <strong>{agent.name}</strong>
                  <Badge tone={isRunning ? "green" : "purple"}>
                    {isRunning ? "Running" : "Queued"}
                  </Badge>
                </article>
              );
            })}
          </div>
        </Card>

        <Card className="initial-asset-card">
          <h2>5. Initial Asset Snapshot</h2>
          <table className="data-table">
            <thead>
              <tr><th>Asset</th><th>Type</th><th>Source</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {projectAssets
                .filter((asset) => asset.selected)
                .slice(0, 6)
                .map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.name}</td>
                    <td>{asset.type}</td>
                    <td>{asset.source}</td>
                    <td>{asset.role}</td>
                    <td><Badge tone="purple">Queued</Badge></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
