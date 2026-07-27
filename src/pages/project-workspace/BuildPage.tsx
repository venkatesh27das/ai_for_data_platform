import { Box, CheckCircle2, Network, Play, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { recommendations } from "../../data/mock/customer360Fixtures";
import { Button, Ring, Status, TextAction, WorkspaceKpi, WorkspaceKpis, WorkspacePageHeader, WorkspacePanel } from "../../components/workspace/WorkspaceUi";

export function BuildPage() {
  const [running, setRunning] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  return (
    <div className="workspace-screen">
      <WorkspacePageHeader actions={<><Button onClick={() => setRunning(true)} variant="primary"><Play size={15} />{running ? "Assembly Running" : "Run Assembly"}</Button><Button><Sparkles size={15} />Review Recommendations</Button><Button>View Agent Runs</Button></>} description="Assemble semantic assets, attach governance controls, and prepare the knowledge layer for validation." title="Build & Govern" />
      <WorkspaceKpis>
        <article className="workspace-kpi workspace-kpi--progress"><Ring label="Assembly" tone="blue" value={running ? 74 : 68} /><div><small>Assembly Progress</small><strong>{running ? "74%" : "68%"}</strong><span className="trend--up">In Progress</span></div></article>
        <WorkspaceKpi icon={Network} label="Semantic Mappings" note="+18 this week" tone="green" trend="up" value="214 mapped" />
        <WorkspaceKpi icon={ShieldCheck} label="Policies Attached" note="+6 this week" tone="orange" trend="up" value={56} />
        <WorkspaceKpi icon={CheckCircle2} label="Validation Rules" note="Active" tone="blue" value={32} />
        <WorkspaceKpi icon={Users} label="Steward Reviews" note="Pending" tone="blue" value={7} />
      </WorkspaceKpis>
      <div className="build-workspace-grid">
        <WorkspacePanel title="Knowledge Assembly Pipeline">
          <div className="assembly-pipeline">{["Concept Extraction","Entity Alignment","Semantic Mapping","Relationship Inference","Policy Attachment","Provenance Assembly","Draft Build"].map((stage,index) => <div className={index < (running ? 6 : 5) ? "is-complete" : index === (running ? 6 : 5) ? "is-current" : ""} key={stage}><i>{index < (running ? 6 : 5) ? "✓" : index + 1}</i><span>{stage}</span></div>)}</div>
          <ul className="pipeline-feed">{["Customer entity aligned to Golden Party Record","Consent policy linked to customer concept","14 relationship mappings accepted","3 ambiguous mappings awaiting review","Provenance graph generated for 42 assets"].map((item,index) => <li key={item}><Status tone={index === 3 ? "amber" : "green"}>{item}</Status><span>{index === 3 ? "Review" : "Info"}</span><small>{10 + index * 8} min ago</small></li>)}</ul>
          <TextAction>View full pipeline activity →</TextAction>
        </WorkspacePanel>
        <WorkspacePanel title="Governance Controls"><div className="governance-control-layout"><Ring label="Governance Readiness" value={88}/><dl className="metric-list"><div><dt>Sensitivity</dt><dd>Confidential / PII</dd></div><div><dt>Policy Coverage</dt><dd>92%</dd></div><div><dt>Approval Workflow</dt><dd>Enabled</dd></div><div><dt>Steward Owner</dt><dd>Ananya Sharma</dd></div><div><dt>Access Groups</dt><dd>5</dd></div></dl><ul className="governance-checks">{["PII handling compliance","Data lineage tracking","Policy mapping completeness","Retention rules applied","Access control coverage","Approval workflow configured"].map((item,index) => <li key={item}><Status tone={index === 2 ? "amber" : "green"}>{item}</Status><b>{index === 2 ? "Warning" : "Pass"}</b></li>)}</ul></div></WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all →</TextAction>} title="Recommendations & Mapping Review">
          <table className="workspace-table compact-table"><thead><tr><th>#</th><th>Recommendation</th><th>Type</th><th>Confidence</th><th>Owner</th><th>Action</th></tr></thead><tbody>{recommendations.map((item,index) => <tr key={item[0]}><td>{index+1}</td><td><strong>{item[0]}</strong></td><td>{item[1]}</td><td><Status tone={item[2] > 85 ? "green" : "amber"}>{item[2]}%</Status></td><td>{item[3]}</td><td><Button onClick={() => setDecisions((current) => ({...current,[item[0]]: current[item[0]] === "Accepted" ? "Rejected" : "Accepted"}))}>{decisions[item[0]] ?? (item[2] > 85 ? "Accept" : "Review")}</Button></td></tr>)}</tbody></table>
        </WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all outputs →</TextAction>} title="Build Outputs"><div className="build-outputs">{[["Draft Domain Graph","v0.9.1",Network],["Semantic Model v1.2","v1.2.0",Box],["Policy Binding Set","v2.1.0",ShieldCheck],["Provenance Layer","v0.8.4",Network],["Retrieval Package","v0.3.1",Box],["Validation Rule Pack","v1.0.0",CheckCircle2]].map(([name,version,Icon],index) => { const OutputIcon=Icon as typeof Box; return <article key={String(name)}><span className={`icon-tile icon-tile--${index%2?"purple":"green"}`}><OutputIcon size={21}/></span><div><strong>{String(name)}</strong><small>{String(version)}</small><Status tone={index>3?"blue":"green"}>{index>3?"In Progress":"Ready"}</Status></div></article>})}</div></WorkspacePanel>
      </div>
    </div>
  );
}
