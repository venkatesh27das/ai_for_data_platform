import { Activity, Box, Clock3, ListChecks, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { pipelineRuns, qualityDimensions, qualityIssues, qualitySeries, sourceSystems } from "../../data/mock/customer360Fixtures";
import { Button, MiniBar, Ring, Status, TextAction, WorkspaceKpi, WorkspaceKpis, WorkspacePageHeader, WorkspacePanel } from "../../components/workspace/WorkspaceUi";

export function QualityPage() {
  const [scanning, setScanning] = useState(false);
  return (
    <div className="workspace-screen">
      <WorkspacePageHeader actions={<Button onClick={() => setScanning(true)} variant="primary"><Activity size={15}/>{scanning ? "Quality Scan Running" : "Run Quality Scan"}</Button>} description="Monitor data and knowledge quality, track pipeline health, and ensure governance compliance." title="Quality & Monitoring" />
      <WorkspaceKpis>
        <WorkspaceKpi icon={ShieldCheck} label="Overall Quality Score" note="↑ 4% vs last scan" tone="orange" value={scanning ? "88%" : "86%"} />
        <WorkspaceKpi icon={ListChecks} label="Quality Checks" note="112 Passed · 12 Failed · 4 Warned" tone="blue" value={128} />
        <WorkspaceKpi icon={Box} label="Assets Monitored" note="Across 6 source systems" tone="blue" value={71} />
        <WorkspaceKpi icon={Clock3} label="Data Freshness" note="Last successful sync" tone="purple" value="2h ago" />
        <WorkspaceKpi icon={Activity} label="Pipeline Health" note="All pipelines operational" tone="green" value="Healthy" />
        <WorkspaceKpi icon={TriangleAlert} label="Incidents" note="1 Critical · 1 Warning" tone="orange" value={2} />
      </WorkspaceKpis>
      <div className="quality-workspace-grid">
        <WorkspacePanel action={<select className="workspace-select" aria-label="Quality trend range"><option>Last 30 Days</option></select>} title="Quality Score Trend">
          <div className="workspace-chart"><ResponsiveContainer height="100%" width="100%"><LineChart data={qualitySeries}><CartesianGrid stroke="#eef0f2" vertical={false}/><XAxis dataKey="day" tick={{fontSize:9}}/><YAxis domain={[50,100]} tick={{fontSize:9}}/><Tooltip/><Legend wrapperStyle={{fontSize:9}}/><Line dataKey="overall" dot={false} isAnimationActive={false} stroke="#16a34a" strokeWidth={2}/><Line dataKey="data" dot={false} isAnimationActive={false} stroke="#2563eb"/><Line dataKey="knowledge" dot={false} isAnimationActive={false} stroke="#7c3aed"/></LineChart></ResponsiveContainer></div>
        </WorkspacePanel>
        <WorkspacePanel action={<TextAction>View details</TextAction>} title="Quality by Dimension"><div className="dimension-bars">{qualityDimensions.map(([name,value]) => <div key={name}><span>{name}</span><MiniBar value={value}/><strong>{value}%</strong></div>)}</div></WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all checks</TextAction>} title="Quality Check Summary"><div className="health-layout"><Ring label="Total Checks" value={88}/><div className="health-legend"><Status>Passed <b>112 (88%)</b></Status><Status tone="red">Failed <b>12 (9%)</b></Status><Status tone="amber">Warning <b>4 (3%)</b></Status></div></div></WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all issues</TextAction>} title="Top Quality Issues"><table className="workspace-table compact-table"><thead><tr><th>Issue</th><th>Dimension</th><th>Severity</th><th>Affected Assets</th><th>Trend</th></tr></thead><tbody>{qualityIssues.map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td><Status tone={row[2] === "Critical" ? "red" : "amber"}>{row[2]}</Status></td><td>{row[3]}</td><td><span className="sparkline-text">⌁⌁⌁</span></td></tr>)}</tbody></table><TextAction>+ View all issues and recommendations</TextAction></WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all pipelines</TextAction>} title="Pipeline Monitoring"><table className="workspace-table compact-table"><thead><tr><th>Pipeline</th><th>Status</th><th>Last Run</th><th>Duration</th><th>Success Rate</th></tr></thead><tbody>{pipelineRuns.map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td><Status tone={row[1] === "Success" ? "green" : row[1] === "Warning" ? "amber" : "red"}>{row[1]}</Status></td>{row.slice(2,4).map((cell) => <td key={cell}>{cell}</td>)}<td><span className="readiness-inline">{row[4]}<MiniBar tone={row[1]==="Failed"?"red":"green"} value={Number.parseInt(row[4])}/></span></td></tr>)}</tbody></table></WorkspacePanel>
        <WorkspacePanel action={<TextAction>View all sources</TextAction>} title="Data Freshness by Source"><table className="workspace-table compact-table"><thead><tr><th>Source System</th><th>Freshness</th><th>Last Sync</th><th>Status</th></tr></thead><tbody>{sourceSystems.map((source,index) => <tr key={source.name}><td><strong>{source.name}</strong></td><td>{["15 min","32 min","2h 05m","1h 12m","1d 4h","2d 3h"][index]}</td><td>{source.sync}</td><td><Status tone={index<2?"green":index<4?"amber":"red"}>{index<2?"Fresh":index<4?"Delayed":"Stale"}</Status></td></tr>)}</tbody></table></WorkspacePanel>
        <WorkspacePanel className="quality-alerts" title="Alerts & Notifications"><div className="workspace-tabs-inline">{["All (3)","Critical (1)","Warning (2)","Info (0)"].map((tab,index) => <button className={index===0?"is-active":""} key={tab}>{tab}</button>)}</div><table className="workspace-table compact-table"><thead><tr><th>Alert</th><th>Source</th><th>Severity</th><th>Detected On</th><th>Description</th><th>Status</th></tr></thead><tbody>{[["Quality check failed: Entity Extraction Confidence < 80%","Entity Extraction Pipeline","Critical","May 27, 2024 10:15 AM","Customer account entities have low confidence score.","Open"],["Stale data detected in Atlan Data Catalog","Atlan Data Catalog","Warning","May 27, 2024 09:20 AM","Metadata not synced for more than 1 hour.","Open"],["Duplicate relationships found","Relationship Builder","Warning","May 27, 2024 08:55 AM","Potential duplicate Customer–Account mappings.","Open"]].map((row) => <tr key={row[0]}>{row.map((cell,index) => <td key={cell}>{index===0?<strong>{cell}</strong>:index===2?<Status tone={cell==="Critical"?"red":"amber"}>{cell}</Status>:index===5?<Status tone="amber">{cell}</Status>:cell}</td>)}</tr>)}</tbody></table></WorkspacePanel>
      </div>
    </div>
  );
}
