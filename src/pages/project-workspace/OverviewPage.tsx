import {
  Activity,
  ArrowRight,
  Clock3,
  Database,
  Link2,
  Network,
  ShieldCheck,
  UploadCloud,
  Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SourceSystemLogo } from "../../components/assets/SourceSystemLogo";
import { sourceSystems } from "../../data/mock/customer360Fixtures";
import {
  Button,
  MiniBar,
  Ring,
  Status,
  TextAction,
  WorkspaceKpi,
  WorkspaceKpis,
  WorkspacePanel,
} from "../../components/workspace/WorkspaceUi";

export function OverviewPage() {
  const navigate = useNavigate();
  return (
    <div className="workspace-screen">
      <WorkspaceKpis>
        <article className="workspace-kpi workspace-kpi--assembly">
          <div className="assembly-progress">
            <div className="assembly-progress__header">
              <span className="assembly-progress__icon">
                <Workflow aria-hidden="true" size={15} />
              </span>
              <small>Current Assembly</small>
            </div>
            <div className="assembly-progress__value">
              <strong>68%</strong>
              <em>In Progress</em>
            </div>
            <div
              aria-label="Assembly is 68% complete"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={68}
              className="assembly-progress__bar"
              role="progressbar"
            >
              <i />
            </div>
            <div className="assembly-progress__baseline">
              <span>Version 1.4</span>
              <b>Baseline v1.3</b>
            </div>
          </div>
        </article>
        <WorkspaceKpi icon={Database} label="Assets Ingested" note="Across 6 governed sources" tone="purple" value={71} />
        <WorkspaceKpi icon={Network} label="Entities" note="+142 this week" tone="green" trend="up" value="1,842" />
        <WorkspaceKpi icon={Link2} label="Relationships" note="+256 this week" tone="blue" trend="up" value="3,974" />
        <WorkspaceKpi icon={ShieldCheck} label="Quality Score" note="Good" tone="orange" value="86%" />
        <WorkspaceKpi icon={Clock3} label="Data Freshness" note="Last sync" tone="purple" value="2h ago" />
      </WorkspaceKpis>

      <div className="overview-workspace-grid">
        <WorkspacePanel action={<TextAction>Edit</TextAction>} title="Project Description">
          <p className="workspace-copy">Unified and governed knowledge layer for Customer 360 providing trusted entities, interactions, policies and relationships for AI, analytics and operational applications.</p>
          <h4>Primary Domains</h4>
          <div className="chip-row">{["Customer", "Product", "Sales", "Service", "Finance"].map((item) => <span key={item}>{item}</span>)}</div>
          <h4>Business Owners</h4>
          <div className="owner-row">{["Sarah Chen", "Rahul Mehta", "Ananya Sharma", "+1"].map((item, index) => <span key={item}><i>{index === 3 ? "+1" : item.split(" ").map((part) => part[0]).join("")}</i>{item}</span>)}</div>
        </WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all</TextAction>} title="Recent Activity">
          <ul className="workspace-list">
            {[
              ["Assets synced from Databricks Unity Catalog", "2 hours ago"],
              ["21 new entities extracted from Customer Semantic Model", "5 hours ago"],
              ["Quality check completed for Policy Documents", "Yesterday"],
              ["Lineage updated for 12 assets", "Yesterday"],
              ["Knowledge graph build job completed", "May 25, 2024"],
            ].map(([item, time]) => <li key={item}><Status>{item}</Status><time>{time}</time></li>)}
          </ul>
        </WorkspacePanel>
        <WorkspacePanel action={<TextAction>View details</TextAction>} title="Project Health">
          <div className="health-layout"><Ring label="Good" value={86} /><div className="health-legend"><Status>On Track <b>7</b></Status><Status tone="amber">Attention <b>2</b></Status><Status tone="red">At Risk <b>1</b></Status></div></div>
          <p className="workspace-copy">Overall the project is healthy. Some items need your attention.</p>
        </WorkspacePanel>
        <WorkspacePanel action={<TextAction>View roadmap</TextAction>} title="Project Timeline">
          <ol className="timeline-list">
            {["Assets Connected", "Graph Model Assembled", "Build & Govern", "Quality Validation", "Publish v1.4", "Measure Consumption"].map((item, index) => <li className={index < 3 ? "is-active" : ""} key={item}><i>{index < 2 ? "✓" : index + 1}</i><span><strong>{item}</strong><small>{index === 0 ? "71 assets from 6 governed sources" : index === 1 ? "1,842 entities and 3,974 relationships" : index === 2 ? "Policy binding and steward review in progress" : "Next in the demo journey"}</small></span>{index === 2 && <em>In Progress</em>}</li>)}
          </ol>
        </WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all</TextAction>} title="Top Source Systems">
          <div className="source-bars">
            {sourceSystems.slice(0, 5).map((source, index) => <div key={source.name}><span><SourceSystemLogo name={source.name} size="compact"/><b>{source.name}</b><small>{source.assets} assets</small></span><MiniBar value={[88, 63, 42, 30, 24][index]} /><strong>{[34, 25, 17, 12, 11][index]}%</strong></div>)}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Next Governed Actions">
          <ol className="next-steps">
            {[
              ["Review 3 low-confidence mappings", "Resolve semantic and relationship ambiguity", "build"],
              ["Run the next quality scan", "Validate the assembled graph and retrieval package", "quality"],
              ["Publish Customer 360 v1.4", "Promote the approved package to five endpoints", "publish"],
            ].map((item, index) => <li key={item[0]}><i>{index + 1}</i><span><strong>{item[0]}</strong><small>{item[1]}</small></span><Button onClick={() => navigate(item[2])}>{index === 0 ? "Review" : index === 1 ? "Validate" : "Publish"}</Button></li>)}
          </ol>
        </WorkspacePanel>
      </div>

      <div className="quick-links">
        <strong>Quick Links</strong>
        <Button onClick={() => navigate("assets")}><UploadCloud size={15} />Review Assets</Button>
        <Button onClick={() => navigate("quality")}><ShieldCheck size={15} />Run Quality Check</Button>
        <Button onClick={() => navigate("graph")}><Network size={15} />View Knowledge Graph</Button>
        <Button onClick={() => navigate("settings")}><Activity size={15} />Manage Access</Button>
        <Button onClick={() => navigate("build")}><ArrowRight size={15} />Configure Policies</Button>
      </div>
    </div>
  );
}
