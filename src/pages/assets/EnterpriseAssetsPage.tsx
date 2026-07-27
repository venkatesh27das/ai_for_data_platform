import { CheckCircle2, Clock3, Database, Filter, Grid2X2, List, Network, RefreshCw, Search, ShieldQuestion, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SourceSystemLogo } from "../../components/assets/SourceSystemLogo";
import { Button, MiniBar, Status, TextAction, WorkspaceKpi, WorkspaceKpis } from "../../components/workspace/WorkspaceUi";
import { enterpriseAssets, enterpriseSourceSystems } from "../../data/mock/enterpriseFixtures";

export function EnterpriseAssetsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [refreshed, setRefreshed] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const filteredAssets = useMemo(
    () =>
      enterpriseAssets.filter((asset) => {
        const activeSource = selectedSource === "All" ? source : selectedSource;
        return (
          asset.join(" ").toLowerCase().includes(query.toLowerCase()) &&
          (activeSource === "All" || asset[3] === activeSource || activeSource.includes(asset[3]) || asset[3].includes(activeSource)) &&
          (type === "All" || asset[2] === type) &&
          (status === "All" || asset[7] === status)
        );
      }),
    [query, selectedSource, source, status, type],
  );

  const clearFilters = () => {
    setQuery("");
    setSource("All");
    setType("All");
    setStatus("All");
    setSelectedSource("All");
  };

  return (
    <div className="page global-feature-page">
      <div className="global-feature-header">
        <div><h1>Enterprise Assets</h1><p>Explore governed data, semantic, policy, lineage, document, graph, and API assets available for knowledge assembly.</p></div>
        <div><Button onClick={() => setRefreshed(true)}><RefreshCw size={15}/>{refreshed ? "Assets Refreshed" : "Refresh Assets"}</Button><Button onClick={() => navigate("/projects/customer-360/assets")} variant="primary"><Database size={16}/>Open Project Assets</Button></div>
      </div>
      {(refreshed || selectedAssets.length > 0) && <div className="global-action-notice"><CheckCircle2 size={14}/>{refreshed ? "Enterprise asset inventory refreshed just now." : `${selectedAssets.length} asset${selectedAssets.length === 1 ? "" : "s"} selected.`}</div>}
      <WorkspaceKpis>
        <WorkspaceKpi icon={Database} label="Scoped Assets" note="Across 6 source systems" tone="orange" value={71}/>
        <WorkspaceKpi icon={Clock3} label="Recently Updated" note="In last 24 hours" tone="orange" value={refreshed ? 24 : 18}/>
        <WorkspaceKpi icon={ShieldCheck} label="High Quality Assets" note="77% of scoped assets" tone="green" value={55}/>
        <WorkspaceKpi icon={Network} label="Ready for Assembly" note="73% of scoped assets" tone="green" value={52}/>
        <WorkspaceKpi icon={ShieldQuestion} label="Require Review" note="Human validation needed" tone="slate" value={3}/>
      </WorkspaceKpis>
      <div className="enterprise-filter-bar">
        <label className="table-search enterprise-search"><Search size={14}/><input aria-label="Search enterprise assets" onChange={(event)=>setQuery(event.target.value)} placeholder="Search assets by name, description, domain, owner..." value={query}/></label>
        <label>Asset Type<select aria-label="Asset Type" onChange={(event)=>setType(event.target.value)} value={type}><option>All</option>{["Data Product","Semantic Model","MDM Entity","Lineage","Policy","Graph","API"].map((value)=><option key={value}>{value}</option>)}</select></label>
        <label>Source System<select aria-label="Source System" onChange={(event)=>setSource(event.target.value)} value={source}><option>All</option>{enterpriseSourceSystems.map((item)=><option key={item[0]}>{item[0]}</option>)}</select></label>
        <label>Domain<select aria-label="Domain"><option>All</option><option>Customer</option><option>Compliance</option></select></label>
        <label>Knowledge Role<select aria-label="Knowledge Role"><option>All</option><option>Entity Source</option><option>Policy Authority</option></select></label>
        <label>Status<select aria-label="Status" onChange={(event)=>setStatus(event.target.value)} value={status}><option>All</option><option>Ready</option><option>New</option><option>Review</option></select></label>
        <label>Quality<select aria-label="Quality"><option>All</option><option>90%+</option></select></label>
        <Button><Filter size={14}/>Filters</Button><TextAction onClick={clearFilters}>Clear All</TextAction><div className="view-buttons"><button aria-label="Grid view"><Grid2X2 size={13}/></button><button aria-label="Table view"><List size={13}/></button></div>
      </div>
      <div className="enterprise-assets-layout">
        <aside className="enterprise-source-list">
          <h2>Source Systems</h2>
          {enterpriseSourceSystems.map((item)=><button className={selectedSource===item[0]?"is-selected":""} key={item[0]} onClick={()=>setSelectedSource(selectedSource===item[0]?"All":item[0])} type="button"><SourceSystemLogo name={item[0]}/><span><strong>{item[0]}</strong><small>{item[1]}</small></span><b>{item[2]}</b><em>›</em></button>)}
          <TextAction onClick={()=>setSelectedSource("All")}>Clear source filter</TextAction>
        </aside>
        <section className="enterprise-asset-table-panel">
          <header><span>Showing 1–{filteredAssets.length} of 71 scoped assets</span><div>Sort by: <select aria-label="Sort assets"><option>Last Updated</option><option>Quality</option></select><button>‹</button><button className="is-current">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button>…</button><button>10</button><button>›</button></div></header>
          <div className="table-scroll"><table className="workspace-table enterprise-assets-table"><thead><tr><th><input aria-label="Select all visible assets" onChange={(event)=>setSelectedAssets(event.target.checked?filteredAssets.map((asset)=>asset[0]):[])} type="checkbox"/></th><th>Asset Name</th><th>Asset Type</th><th>Source System</th><th>Domain</th><th>Knowledge Role</th><th>Quality</th><th>Status</th><th>Last Updated</th><th>Owner</th></tr></thead><tbody>{filteredAssets.map((asset,index)=><tr key={asset[0]}><td><input aria-label={`Select ${asset[0]}`} checked={selectedAssets.includes(asset[0])} onChange={()=>setSelectedAssets((current)=>current.includes(asset[0])?current.filter((name)=>name!==asset[0]):[...current,asset[0]])} type="checkbox"/></td><td><span className="asset-name-cell"><i className={`source-symbol source-symbol--${["purple","orange","green","teal"][index%4]}`}>{index+1}</i><span><strong>{asset[0]}</strong><small>{asset[1]}</small></span></span></td><td>{asset[2]}</td><td>{asset[3]}</td><td>{asset[4]}</td><td>{asset[5]}</td><td><span className="quality-cell"><b>{asset[6]}%</b><MiniBar value={asset[6]}/></span></td><td><Status tone={asset[7]==="Ready"?"green":asset[7]==="New"?"blue":"amber"}>{asset[7]}</Status></td><td>{asset[8]}</td><td>{asset[9]}</td></tr>)}</tbody></table></div>
          {filteredAssets.length===0&&<div className="enterprise-empty">No assets match the current filters.</div>}
        </section>
      </div>
    </div>
  );
}
