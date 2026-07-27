import { Box, Clock3, Database, Network, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KnowledgeGraphPreview } from "../../components/graph/KnowledgeGraphPreview";
import { graphEntityTypes, graphRelationships } from "../../data/mock/customer360Fixtures";
import { Button, Status, TextAction, WorkspaceKpi, WorkspaceKpis, WorkspacePageHeader, WorkspacePanel } from "../../components/workspace/WorkspaceUi";

export function GraphPage() {
  const navigate = useNavigate();
  return (
    <div className="workspace-screen">
      <WorkspacePageHeader actions={<><Button onClick={() => document.querySelector(".graph-preview-panel")?.scrollIntoView({ behavior: "smooth" })} variant="primary">Graph View</Button><Button onClick={() => document.querySelector(".model-cards")?.scrollIntoView({ behavior: "smooth" })}>Model View</Button><select className="workspace-select" aria-label="Graph domain"><option>Domain: All</option><option>Customer</option><option>Product</option><option>Service</option><option>Governance</option></select></>} description="Explore governed business entities, source provenance, semantic mappings, policies, and downstream consumers." title="Knowledge Graph & Data Model" />
      <WorkspaceKpis>
        <WorkspaceKpi icon={Database} label="Entities (Node Types)" note="+8 this week" tone="purple" trend="up" value={156} />
        <WorkspaceKpi icon={Network} label="Relationships (Edge Types)" note="+11 this week" tone="green" trend="up" value={214} />
        <WorkspaceKpi icon={Box} label="Data Models" note="+2 this week" tone="blue" trend="up" value={24} />
        <WorkspaceKpi icon={ShieldCheck} label="Graph Coverage" note="Good" tone="orange" value="87%" />
        <WorkspaceKpi icon={Clock3} label="Last Graph Build" note="May 26, 2024 10:15 AM" tone="purple" value="2h ago" />
      </WorkspaceKpis>
      <div className="graph-workspace-grid">
        <WorkspacePanel action={<Status tone="blue">Interactive preview</Status>} className="graph-preview-panel" title="Enterprise Knowledge Graph">
          <KnowledgeGraphPreview />
          <div className="graph-preview-footer"><span>Nodes <b>156</b></span><span>Relationships <b>214</b></span><span>Domains <b>12</b></span><span>Sources <b>6</b></span><TextAction onClick={() => navigate("/projects/customer-360/build")}>Continue to Build & Govern →</TextAction></div>
        </WorkspacePanel>
        <div className="graph-table-stack">
          <WorkspacePanel action={<TextAction>View all</TextAction>} title="Top Entity Types"><table className="workspace-table compact-table"><thead><tr><th>Entity Type</th><th>Description</th><th>Instances</th><th>Change (7D)</th></tr></thead><tbody>{graphEntityTypes.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 ? <strong>{cell}</strong> : index === 3 ? <span className="trend--up">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></WorkspacePanel>
          <WorkspacePanel action={<TextAction>View all</TextAction>} title="Top Relationship Types"><table className="workspace-table compact-table"><thead><tr><th>Relationship</th><th>Description</th><th>Instances</th><th>Change (7D)</th></tr></thead><tbody>{graphRelationships.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 ? <strong>{cell}</strong> : index === 3 ? <span className="trend--up">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></WorkspacePanel>
        </div>
        <WorkspacePanel action={<TextAction>View all models →</TextAction>} title="Data Model Summary"><div className="model-cards">{[["Customer 360 Core Model",23,31],["Policy & Coverage Model",17,24],["Interaction & Engagement Model",14,19]].map(([name,entities,relationships]) => <article key={name}><Network size={21}/><strong>{name}</strong><p>Core entities and account relationships</p><div><span>{entities}<small> Entities</small></span><span>{relationships}<small> Relationships</small></span></div><Status>Active</Status></article>)}</div></WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all</TextAction>} title="Graph Build History"><table className="workspace-table compact-table"><thead><tr><th>Build ID</th><th>Status</th><th>Started On</th><th>Duration</th><th>Entities</th><th>Relationships</th></tr></thead><tbody>{[["GB-2024-0526-001","May 26, 2024 10:15 AM","18m 42s","156","214"],["GB-2024-0525-001","May 25, 2024 10:12 AM","19m 10s","148","203"],["GB-2024-0524-001","May 24, 2024 10:08 AM","17m 55s","142","195"]].map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td><Status>Success</Status></td>{row.slice(1).map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></WorkspacePanel>
      </div>
    </div>
  );
}
