import { CheckCircle2, Database, Filter, Layers3, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { projectAssets, sourceSystems } from "../../data/mock/customer360Fixtures";
import { Button, MiniBar, Status, TextAction, WorkspaceKpi, WorkspaceKpis, WorkspacePanel } from "../../components/workspace/WorkspaceUi";

export function AssetsPage() {
  const [query, setQuery] = useState("");
  const [synced, setSynced] = useState(false);
  const [recommendationApplied, setRecommendationApplied] = useState(false);
  const filtered = useMemo(() => projectAssets.filter((asset) => asset.join(" ").toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="workspace-screen">
      <WorkspaceKpis>
        <WorkspaceKpi icon={Layers3} label="Connected Source Systems" note="All systems healthy" tone="green" value={6} />
        <WorkspaceKpi icon={Database} label="Total Project Assets" note="Across 2 domains" tone="purple" value={recommendationApplied ? 80 : 71} />
        <WorkspaceKpi icon={RefreshCw} label="Synced in Last 24h" note="25% of total assets" tone="blue" value={synced ? 24 : 18} />
        <WorkspaceKpi icon={CheckCircle2} label="Ready for Assembly" note="73% of total assets" tone="green" value={52} />
        <WorkspaceKpi icon={ShieldCheck} label="Coverage Score" note="Good coverage" tone="orange" value={recommendationApplied ? "91%" : "84%"} />
      </WorkspaceKpis>
      <div className="assets-workspace-grid">
        <WorkspacePanel action={<TextAction onClick={() => setSynced(true)}>Refresh</TextAction>} className="source-system-panel" title="Connected Source Systems">
          {sourceSystems.map((source, index) => <button className="connected-source" key={source.name} type="button"><i className={`source-symbol source-symbol--${source.tone}`}>{index + 1}</i><span><strong>{source.name}</strong><Status>Connected · Healthy</Status><small>Last sync {synced ? "just now" : source.sync}</small></span><b>{source.assets}<small> assets</small></b><em>⋮</em></button>)}
          <Button className="add-source-button">+ Add Source System</Button>
        </WorkspacePanel>
        <WorkspacePanel className="asset-inventory-panel" title="Project Asset Inventory">
          <div className="workspace-filters">
            <label className="table-search"><Search size={14} /><input aria-label="Search project assets" onChange={(event) => setQuery(event.target.value)} placeholder="Search assets..." value={query} /></label>
            {["Asset Type", "Source System", "Domain", "Knowledge Role", "Status"].map((item) => <select aria-label={item} defaultValue="All" key={item}><option>All</option><option>Ready</option><option>Review</option></select>)}
            <Button><Filter size={14} />Filters</Button>
          </div>
          <div className="table-scroll">
            <table className="workspace-table asset-table"><thead><tr><th><input aria-label="Select all assets" type="checkbox" /></th><th>Asset Name</th><th>Asset Type</th><th>Source</th><th>Domain</th><th>Knowledge Role</th><th>Readiness</th><th>Status</th><th>Last Sync</th></tr></thead>
              <tbody>{filtered.map((asset) => <tr key={asset[0]}><td><input aria-label={`Select ${asset[0]}`} type="checkbox" /></td><td><strong>{asset[0]}</strong></td><td>{asset[1]}</td><td>{asset[2]}</td><td>{asset[3]}</td><td>{asset[4]}</td><td><span className="readiness-inline">{asset[5]}<MiniBar value={Number.parseInt(asset[5])} /></span></td><td><Status tone={asset[6] === "Ready" ? "green" : "amber"}>{asset[6]}</Status></td><td>{asset[7]}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="table-pagination"><span>Showing 1 to {filtered.length} of {recommendationApplied ? 80 : 71} assets</span><div><button className="is-current">1</button><button>2</button><button>3</button><button>4</button><button>…</button><button>10</button></div></div>
        </WorkspacePanel>
        <aside className="assets-aside">
          <WorkspacePanel title="Selection & Coverage"><dl className="metric-list"><div><dt>Selected assets</dt><dd>{recommendationApplied ? 80 : 71}</dd></div><div><dt>Source systems</dt><dd>6</dd></div><div><dt>Domains covered</dt><dd>2</dd></div><div><dt>Estimated concepts</dt><dd>~210</dd></div><div><dt>Estimated relationships</dt><dd>~620</dd></div></dl><h4>Knowledge Role Mix</h4><div className="role-mix"><div className="simple-donut" /><ul><li>Entity Source <b>32%</b></li><li>Semantic Authority <b>20%</b></li><li>Identity Anchor <b>15%</b></li><li>Provenance Source <b>13%</b></li><li>Retrieval Source <b>12%</b></li></ul></div></WorkspacePanel>
          <WorkspacePanel action={<TextAction>See all</TextAction>} title="AI Recommendation"><div className="recommendation-callout"><ShieldCheck size={23} /><strong>{recommendationApplied ? "Recommendations applied" : "Add 9 high-impact assets to improve coverage"}</strong><p>Including 4 policy documents and 3 data products.</p><Button disabled={recommendationApplied} onClick={() => setRecommendationApplied(true)}>{recommendationApplied ? "Applied" : "View Recommendations"}</Button></div></WorkspacePanel>
        </aside>
      </div>
    </div>
  );
}
