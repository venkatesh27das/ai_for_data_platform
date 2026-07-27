import { Box, CheckCircle2, Clock3, Copy, Eye, FlaskConical, Network, PackagePlus, Plus, Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, MiniBar, Ring, Status, TextAction, WorkspaceKpi, WorkspaceKpis, WorkspacePanel } from "../../components/workspace/WorkspaceUi";
import { knowledgeProducts } from "../../data/mock/enterpriseFixtures";

type KnowledgeProduct = (typeof knowledgeProducts)[number];

export function KnowledgeProductsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [selected, setSelected] = useState<KnowledgeProduct>(knowledgeProducts[0]);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState("Overview");
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState("");
  const products = useMemo(
    () =>
      knowledgeProducts.filter(
        (product) =>
          `${product.name} ${product.description} ${product.domain} ${product.owner}`.toLowerCase().includes(query.toLowerCase()) &&
          (status === "All" || product.status === status) &&
          (type === "All" || product.type === type),
      ),
    [query, status, type],
  );

  return (
    <div className="page global-feature-page">
      <div className="global-feature-header">
        <div><h1>Knowledge Products</h1><p>Browse, manage and publish governed knowledge products for AI and analytics consumption.</p></div>
        <div><Button onClick={()=>setCreated(true)}><Plus size={15}/>New Knowledge Product</Button><Button onClick={()=>navigate("/projects/customer-360/publish")} variant="primary"><PackagePlus size={15}/>Publish from Project</Button></div>
      </div>
      {created&&<div className="global-action-notice"><CheckCircle2 size={14}/>New knowledge product draft created. Complete its metadata to begin assembly.</div>}
      <WorkspaceKpis>
        <WorkspaceKpi icon={Box} label="Published Products" note="Ready for consumption" tone="orange" value={4}/>
        <WorkspaceKpi icon={FlaskConical} label="In Progress" note="Being assembled" tone="orange" value={created?4:3}/>
        <WorkspaceKpi icon={CheckCircle2} label="Approved" note="Awaiting publication" tone="green" value={5}/>
        <WorkspaceKpi icon={Network} label="Total Consumers" note="Across all products" tone="blue" value={17}/>
        <WorkspaceKpi icon={Clock3} label="Avg. Freshness" note="Data currency" tone="purple" value="18h"/>
      </WorkspaceKpis>
      <div className={`products-portfolio${inspectorOpen?" products-portfolio--inspector":""}`}>
        <main className="products-main">
          <div className="enterprise-filter-bar products-filter-bar">
            <label className="table-search enterprise-search"><Search size={14}/><input aria-label="Search knowledge products" onChange={(event)=>setQuery(event.target.value)} placeholder="Search knowledge products..." value={query}/></label>
            <label>Status<select aria-label="Product Status" onChange={(event)=>setStatus(event.target.value)} value={status}><option>All</option><option>Published</option><option>Approved</option><option>In Progress</option><option>Draft</option></select></label>
            <label>Domain<select aria-label="Product Domain"><option>All</option><option>Customer</option><option>Governance</option></select></label>
            <label>Product Type<select aria-label="Product Type" onChange={(event)=>setType(event.target.value)} value={type}><option>All</option>{["Knowledge Graph","Vector Index","Graph + Vector","Semantic Model","Document Index"].map((value)=><option key={value}>{value}</option>)}</select></label>
            <label>Consumption Type<select aria-label="Consumption Type"><option>All</option><option>RAG</option><option>Agent</option></select></label>
            <label>Owner<select aria-label="Product Owner"><option>All</option><option>Data Team</option></select></label>
            <Button>Filters</Button><TextAction onClick={()=>{setQuery("");setStatus("All");setType("All")}}>Clear All</TextAction>
          </div>
          <section className="knowledge-products-table-panel">
            <div className="table-scroll"><table className="workspace-table knowledge-products-table"><thead><tr><th>Product Name</th><th>Domain</th><th>Product Type</th><th>Status</th><th>Knowledge Readiness</th><th>Version</th><th>Last Updated</th><th>Consumers</th><th>Owner</th><th>Actions</th></tr></thead><tbody>{products.map((product,index)=><tr className={selected.name===product.name?"is-selected":""} key={product.name} onClick={()=>{setSelected(product);setInspectorOpen(true)}}><td><span className="product-name-cell"><i className={`icon-tile icon-tile--${product.tone}`}><Box size={17}/></i><span><strong>{product.name}</strong><small>{product.description}</small></span></span></td><td>{product.domain}</td><td>{product.type}</td><td><Status tone={product.status==="Published"?"green":product.status==="Approved"?"blue":product.status==="Draft"?"purple":"amber"}>{product.status}</Status></td><td><span className="product-readiness"><b>{product.readiness}%</b><MiniBar value={product.readiness}/></span></td><td>{product.version}</td><td>{product.updated}</td><td>{product.consumers}</td><td>{product.owner}</td><td><div className="product-actions"><button aria-label={`Inspect ${product.name}`} onClick={(event)=>{event.stopPropagation();setSelected(product);setInspectorOpen(true)}}><Eye size={13}/></button><button aria-label={`Open ${product.name}`} onClick={(event)=>{event.stopPropagation();if(index===0)navigate("/projects/customer-360/publish")}}><Box size={13}/></button><button aria-label={`More actions for ${product.name}`}>•••</button></div></td></tr>)}</tbody></table></div>
            {products.length===0&&<div className="enterprise-empty">No knowledge products match the current filters.</div>}
          </section>
        </main>
        {inspectorOpen&&<aside className="product-inspector">
          <header><div><strong>{selected.name}</strong><Status tone={selected.status==="Published"?"green":"blue"}>{selected.status}</Status></div><button aria-label="Close product inspector" onClick={()=>setInspectorOpen(false)}><X size={16}/></button></header>
          <div className="inspector-version"><Status tone={selected.status==="Published"?"green":"blue"}>{selected.status}</Status><span>Version {selected.version}</span></div>
          <nav aria-label="Product details">{["Overview","Consumers","Artifacts","Governance"].map((tab)=><button className={inspectorTab===tab?"is-active":""} key={tab} onClick={()=>setInspectorTab(tab)}>{tab}</button>)}</nav>
          <div className="product-inspector__content">
            {inspectorTab==="Overview"&&<><h3>Description</h3><p>Comprehensive knowledge layer for {selected.domain.toLowerCase()} integrating structured data, interactions, policies and master data to enable AI-driven service and analytics.</p><h3>Key Artifacts</h3><dl className="inspector-list"><div><dt>Graph Schema</dt><dd>1</dd></div><div><dt>Nodes</dt><dd>342</dd></div><div><dt>Relationships</dt><dd>1,842</dd></div><div><dt>Policies</dt><dd>12</dd></div><div><dt>Data Sources</dt><dd>28</dd></div><div><dt>Embeddings</dt><dd>4.3M</dd></div></dl><h3>Top Consumers</h3><ul className="consumer-list">{["Service Copilot","Customer Retention Agent","360° Customer Analytics"].map((consumer)=><li key={consumer}><Box size={13}/><span>{consumer}</span><Status>Active</Status></li>)}</ul><TextAction>View all consumers ({selected.consumers})</TextAction></>}
            {inspectorTab==="Consumers"&&<ul className="consumer-list inspector-detail-list">{["Service Copilot","Customer Retention Agent","360° Customer Analytics","Enterprise Search","Support Assistant"].map((consumer,index)=><li key={consumer}><Users size={14}/><span><strong>{consumer}</strong><small>{128-index*17} active users</small></span><Status>Active</Status></li>)}</ul>}
            {inspectorTab==="Artifacts"&&<ul className="consumer-list inspector-detail-list">{["Graph API","Retrieval Package","Semantic Model","Policy Binding Set","Vector Index"].map((artifact)=><li key={artifact}><Box size={14}/><span><strong>{artifact}</strong><small>Version {selected.version}</small></span><Status>Ready</Status></li>)}</ul>}
            {inspectorTab==="Governance"&&<dl className="inspector-list"><div><dt>Policy Coverage</dt><dd>100%</dd></div><div><dt>Provenance</dt><dd>91%</dd></div><div><dt>Approval</dt><dd>Complete</dd></div><div><dt>Sensitivity</dt><dd>Confidential / PII</dd></div><div><dt>Audit Logging</dt><dd>Enabled</dd></div></dl>}
          </div>
          <Button onClick={()=>navigate("/projects/customer-360/publish")}>Open Product</Button>
        </aside>}
      </div>
      <div className="products-summary-grid">
        <WorkspacePanel title="Consumption Endpoints"><ul className="endpoint-summary">{[["Graph API (Neo4j)","https://graph.company.com/customer360"],["REST API","https://api.company.com/knowledge/customer360"],["Vector Search","https://vec.company.com/index/customer360"]].map(([name,url])=><li key={name}><Network size={14}/><span><strong>{name}</strong><a href={url}>{url}</a></span><button aria-label={`Copy ${name}`} onClick={()=>{navigator.clipboard?.writeText(url);setCopied(name)}}><Copy size={13}/></button></li>)}</ul>{copied&&<p className="inline-success">{copied} copied</p>}<TextAction>View all endpoints</TextAction></WorkspacePanel>
        <WorkspacePanel title="Supported Consumption Types"><ul className="supported-types">{["RAG Applications","AI Agents / Agentic Workflows","Analytics & BI Tools","Search & Discovery","MCP Tools & Connectors"].map((item)=><li key={item}><CheckCircle2 size={13}/>{item}</li>)}</ul></WorkspacePanel>
        <WorkspacePanel title="Quality & Trust Summary"><div className="quality-trust"><Ring label="Overall Score" value={92}/><ul>{[["Semantic Quality","94%"],["Provenance","91%"],["Policy Coverage","100%"],["Freshness","87%"],["Retrieval Quality","90%"]].map((row)=><li key={row[0]}><Status>{row[0]} <b>{row[1]}</b></Status></li>)}</ul></div><TextAction>View quality details</TextAction></WorkspacePanel>
        <WorkspacePanel title="Recent Activity"><ul className="workspace-list">{[["Graph schema version 1.3.0 published","12 min ago"],["Policy mappings updated","1 hr ago"],["Customer interactions data synced","2 hrs ago"],["Entity resolution improvements applied","5 hrs ago"]].map((row)=><li key={row[0]}><Status>{row[0]}</Status><time>{row[1]}</time></li>)}</ul><TextAction>View all activity</TextAction></WorkspacePanel>
      </div>
    </div>
  );
}
