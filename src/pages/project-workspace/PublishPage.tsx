import { Box, CheckCircle2, Clock3, Copy, ExternalLink, Globe2, HeartPulse, Network, Rocket, Users } from "lucide-react";
import { useState } from "react";
import { Button, Ring, Status, TextAction, WorkspaceKpi, WorkspaceKpis, WorkspacePageHeader, WorkspacePanel } from "../../components/workspace/WorkspaceUi";

const endpoints = [
  ["REST API", "https://api.c360.example.com/v1"],
  ["GraphQL API", "https://graphql.c360.example.com/v1"],
  ["Graph Endpoint (Bolt)", "bolt+s://graph.c360.example.com:7687"],
  ["Vector Search Endpoint", "https://vecsearch.c360.example.com/v1"],
  ["MCP Server", "https://mcp.c360.example.com"],
] as const;

export function PublishPage() {
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState("");
  return (
    <div className="workspace-screen">
      <WorkspacePageHeader actions={<><Button><Users size={15}/>View Consumers</Button><Button onClick={() => setPublished(true)} variant="primary"><Rocket size={15}/>{published ? "Release Published" : "Publish Release"}</Button></>} description="Publish governed knowledge products to downstream applications, agents and services." title="Publish & Serve" />
      <WorkspaceKpis>
        <WorkspaceKpi icon={Box} label="Published Version" note="Current release" tone="purple" value={published ? "v1.4.0" : "v1.3.0"} />
        <WorkspaceKpi icon={Globe2} label="Serving Endpoints" note="Across APIs and tools" tone="blue" value={5} />
        <WorkspaceKpi icon={Users} label="Active Consumers" note="+3 this week" tone="green" trend="up" value={17} />
        <WorkspaceKpi icon={CheckCircle2} label="Readiness Score" note="Approved for release" tone="green" value="94%" />
        <WorkspaceKpi icon={Clock3} label="Last Published" note={published ? "Just now" : "May 27, 2024 10:15 AM"} tone="purple" value={published ? "now" : "2h ago"} />
        <WorkspaceKpi icon={HeartPulse} label="SLA Health" note="Healthy" tone="green" value="99.7%" />
      </WorkspaceKpis>
      <div className="publish-workspace-grid">
        <WorkspacePanel title="A  Release Pipeline"><div className="assembly-pipeline release-pipeline">{["Draft Build","Validation Approved","Security Review","Publish Package","Endpoint Deployment","Consumer Activation"].map((stage,index) => <div className={index<3?"is-complete":index===3?"is-current":""} key={stage}><i>{index<3?"✓":index+1}</i><span>{stage}</span></div>)}</div><ul className="pipeline-feed">{["Knowledge graph package validated","MCP tool manifest generated","REST endpoint contract approved","Vector index synchronized","Steward sign-off recorded"].map((item,index) => <li key={item}><Status tone={index===4?"blue":"green"}>{item}</Status><span>{index===4?"Pending":"Success"}</span><small>{20+index*10} min ago</small></li>)}</ul><TextAction>View full pipeline activity →</TextAction></WorkspacePanel>
        <WorkspacePanel className="published-artifacts-panel" title="B  Published Artifacts"><div className="build-outputs">{[["Graph API","v1.3.0",Network],["Retrieval Package","v1.3.0",Box],["Semantic Model v1.2","v1.2.0",Box],["Policy Binding Set","v1.3.0",CheckCircle2],["MCP Tool Bundle","v1.3.0",Network],["Vector Index","v1.3.0",Box]].map(([name,version,Icon]) => {const ItemIcon=Icon as typeof Box; return <article key={String(name)}><span className="icon-tile icon-tile--green"><ItemIcon size={20}/></span><div><strong>{String(name)}</strong><small>{String(version)}</small><Status>{String(name).includes("Package")?"Ready":"Published"}</Status></div></article>})}</div><TextAction>View all artifacts →</TextAction></WorkspacePanel>
        <WorkspacePanel title="C  Release Readiness"><div className="readiness-panel"><Ring label="Readiness Score" value={94}/><ul>{["Quality thresholds met","Governance approvals complete","Policy bindings attached","Provenance coverage verified","Consumer access configured","Release notes finalized"].map((item,index) => <li key={item}><Status tone={index===5?"amber":"green"}>{item}</Status></li>)}</ul></div><TextAction>View readiness details →</TextAction></WorkspacePanel>
        <WorkspacePanel className="serving-endpoints-panel" title="D  Serving Endpoints"><table className="workspace-table compact-table endpoint-table"><tbody>{endpoints.map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td title={row[1]}>{row[1]}</td><td><Status>Healthy</Status></td><td><button aria-label={`Copy ${row[0]}`} onClick={() => {navigator.clipboard?.writeText(row[1]); setCopied(row[0]);}}><Copy size={13}/></button><button aria-label={`Open ${row[0]}`}><ExternalLink size={13}/></button></td></tr>)}</tbody></table>{copied && <p className="inline-success">{copied} copied</p>}<TextAction>View all endpoints →</TextAction></WorkspacePanel>
        <WorkspacePanel title="E  Consumption Channels"><table className="workspace-table compact-table"><thead><tr><th>Channel</th><th>Type</th><th>Active Users</th><th>Status</th></tr></thead><tbody>{[["Service Copilot","Copilot","128"],["Customer Retention Agent","AI Agent","86"],["360 Customer Analytics","Analytics","54"],["Enterprise Search","Search","342"],["Support Assistant","Workflow","67"]].map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td><td><Status>Active</Status></td></tr>)}</tbody></table><TextAction>View all consumers →</TextAction></WorkspacePanel>
        <WorkspacePanel title="F  Access & Policies"><div className="access-release"><dl className="metric-list"><div><dt>Default access</dt><dd>Controlled</dd></div><div><dt>Sensitive attributes</dt><dd>Masked</dd></div><div><dt>Audit logging</dt><dd>Enabled</dd></div><div><dt>Rate limits</dt><dd>Configured</dd></div><div><dt>Approved access groups</dt><dd>5</dd></div></dl><article><strong>Release Notes</strong><ul><li>Added churn prediction features</li><li>Enhanced PII policy bindings</li><li>Improved retrieval relevance</li></ul></article></div></WorkspacePanel>
        <WorkspacePanel className="deployment-log" title="G  Version History & Deployment Log"><table className="workspace-table compact-table"><thead><tr><th>Version</th><th>Published On</th><th>Publisher</th><th>Targets</th><th>Status</th><th>Rollback</th></tr></thead><tbody>{[["v1.3.0","May 27, 2024 10:15 AM","Sarah Chen","5 Endpoints, 17 Consumers","Active"],["v1.2.1","May 20, 2024 03:42 PM","Sarah Chen","5 Endpoints, 14 Consumers","Superseded"],["v1.2.0","May 13, 2024 11:18 AM","Alex Rivera","4 Endpoints, 12 Consumers","Superseded"]].map((row)=><tr key={row[0]}>{row.map((cell,index)=><td key={cell}>{index===0?<strong>{cell}</strong>:index===4?<Status tone={cell==="Active"?"green":"blue"}>{cell}</Status>:cell}</td>)}</tr>)}</tbody></table></WorkspacePanel>
      </div>
    </div>
  );
}
