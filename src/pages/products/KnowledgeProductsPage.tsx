import { Box, CheckCircle2, Clock3, Copy, Eye, Network, Rocket, Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, MiniBar, Ring, Status, TextAction, WorkspaceKpi, WorkspaceKpis, WorkspacePanel } from "../../components/workspace/WorkspaceUi";
import { knowledgeProducts } from "../../data/mock/enterpriseFixtures";

type KnowledgeProduct = (typeof knowledgeProducts)[number];

export function KnowledgeProductsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<KnowledgeProduct>(knowledgeProducts[0]);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState("Overview");
  const [copied, setCopied] = useState("");
  const products = useMemo(
    () =>
      knowledgeProducts.filter(
        (product) =>
          `${product.name} ${product.description} ${product.domain} ${product.owner}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="page global-feature-page">
      <div className="global-feature-header">
        <div><h1>Knowledge Products</h1><p>Inspect governed knowledge products, releases, serving endpoints, downstream consumers, and operational status.</p></div>
        <div><Button onClick={()=>navigate("/projects/customer-360")}><Box size={15}/>View Product</Button><Button onClick={()=>navigate("/projects/customer-360/publish")} variant="primary"><Rocket size={15}/>Publish & Serve</Button></div>
      </div>
      <WorkspaceKpis>
        <WorkspaceKpi icon={Box} label="Published Version" note="Current governed release" tone="orange" value="v1.3.0"/>
        <WorkspaceKpi icon={Users} label="Active Consumers" note="Copilots, agents and apps" tone="blue" value={17}/>
        <WorkspaceKpi icon={Network} label="Serving Endpoints" note="Graph, REST, vector and MCP" tone="green" value={5}/>
        <WorkspaceKpi icon={CheckCircle2} label="Quality & Trust" note="Approved for consumption" tone="green" value="92%"/>
        <WorkspaceKpi icon={Clock3} label="Data Freshness" note="Last synchronized" tone="purple" value="2h"/>
      </WorkspaceKpis>
      <div className={`products-portfolio${inspectorOpen?" products-portfolio--inspector":""}`}>
        <main className="products-main">
          <div className="enterprise-filter-bar products-filter-bar">
            <label className="table-search enterprise-search"><Search size={14}/><input aria-label="Search knowledge products" onChange={(event)=>setQuery(event.target.value)} placeholder="Search knowledge products..." value={query}/></label>
            <label>Status<select aria-label="Product Status" disabled><option>Published</option></select></label>
            <label>Domain<select aria-label="Product Domain" disabled><option>Customer</option></select></label>
            <label>Product Type<select aria-label="Product Type" disabled><option>Knowledge Graph</option></select></label>
            <TextAction onClick={()=>setQuery("")}>Clear Search</TextAction>
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
