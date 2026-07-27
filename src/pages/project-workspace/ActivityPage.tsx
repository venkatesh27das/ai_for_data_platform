import { Activity, CalendarDays, Clock3, Filter, Search, Settings2, TriangleAlert, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { activities } from "../../data/mock/customer360Fixtures";
import { Button, Ring, Status, TextAction, WorkspaceKpi, WorkspaceKpis, WorkspacePageHeader, WorkspacePanel } from "../../components/workspace/WorkspaceUi";

export function ActivityPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All Activity Types");
  const filtered = useMemo(() => activities.filter((row) => (type === "All Activity Types" || row[2] === type) && row.join(" ").toLowerCase().includes(query.toLowerCase())), [query,type]);
  return (
    <div className="workspace-screen">
      <WorkspacePageHeader actions={<Button variant="primary">+ New Activity</Button>} description="Track all project activities, system events, and user actions." title="Activity Overview" />
      <WorkspaceKpis>
        <WorkspaceKpi icon={Activity} label="Total Activities" note="↑ 18.4% vs last 7 days" tone="purple" trend="up" value="1,248" />
        <WorkspaceKpi icon={Users} label="User Actions" note="↑ 14.7% vs last 7 days" tone="blue" trend="up" value={823} />
        <WorkspaceKpi icon={Settings2} label="System Events" note="↑ 22.1% vs last 7 days" tone="green" trend="up" value={312} />
        <WorkspaceKpi icon={CalendarDays} label="Pipeline Runs" note="↑ 9.3% vs last 7 days" tone="orange" trend="up" value={78} />
        <WorkspaceKpi icon={Clock3} label="Avg. Activity Time" note="↓ 5.6% vs last 7 days" tone="purple" trend="down" value="2 min 18 sec" />
        <WorkspaceKpi icon={TriangleAlert} label="Failed Activities" note="↓ 25.0% vs last 7 days" tone="orange" trend="down" value={12} />
      </WorkspaceKpis>
      <div className="activity-workspace-grid">
        <div className="activity-main">
          <div className="workspace-filters activity-filters"><label className="table-search"><Search size={14}/><input aria-label="Search activities" onChange={(event)=>setQuery(event.target.value)} placeholder="Search activities..." value={query}/></label><select aria-label="Activity type" onChange={(event)=>setType(event.target.value)} value={type}><option>All Activity Types</option><option>User Action</option><option>System Event</option><option>Pipeline Run</option><option>Quality Check</option></select><select aria-label="Activity user"><option>All Users</option></select><select aria-label="Activity status"><option>All Status</option></select><Button><Filter size={14}/>May 21 – May 27, 2024</Button><TextAction onClick={()=>{setQuery("");setType("All Activity Types")}}>Clear Filters</TextAction></div>
          <WorkspacePanel title="Activity Feed"><div className="table-scroll"><table className="workspace-table activity-table"><thead><tr><th>Time ↓</th><th>Activity</th><th>Type</th><th>Details</th><th>User / System</th><th>Status</th><th>Duration</th><th>Source</th></tr></thead><tbody>{filtered.map((row)=><tr key={`${row[0]}-${row[1]}`}><td><strong>{row[0]}</strong><small>May 27, 2024</small></td><td><strong>{row[1]}</strong></td><td><Status tone={row[2]==="Quality Check"?"purple":row[2]==="Pipeline Run"?"amber":row[2]==="User Action"?"blue":"green"}>{row[2]}</Status></td><td>{row[3]}</td><td>{row[4]}</td><td><Status tone={row[5]==="Failed"?"red":"green"}>{row[5]}</Status></td><td>{row[6]}</td><td>{row[7]}</td></tr>)}</tbody></table></div><div className="table-pagination"><span>Showing 1 to {filtered.length} of 1,248 activities</span><div><button className="is-current">1</button><button>2</button><button>3</button><button>…</button><button>156</button></div></div></WorkspacePanel>
        </div>
        <aside className="activity-aside">
          <WorkspacePanel action={<TextAction>View all</TextAction>} title="Activity by Type"><div className="health-layout"><Ring displayValue="1,248" label="Total" tone="blue" value={66}/><div className="health-legend"><Status tone="blue">User Action <b>823 (66%)</b></Status><Status>System Event <b>312 (25%)</b></Status><Status tone="amber">Pipeline Run <b>78 (6%)</b></Status><Status tone="purple">Quality Check <b>35 (3%)</b></Status></div></div></WorkspacePanel>
          <WorkspacePanel action={<TextAction>View all</TextAction>} title="Top Users"><ul className="ranked-list">{[["Sarah Chen","Data Owner","234","18.8%"],["Rahul Mehta","Data Engineer","186","14.9%"],["Ananya Sharma","Data Steward","142","11.4%"],["Vikram Kumar","Data Engineer","98","7.9%"],["Data System","System","—","47.0%"]].map((row)=><li key={row[0]}><i>{row[0].split(" ").map((word)=>word[0]).join("")}</i><span><strong>{row[0]}</strong><small>{row[1]}</small></span><b>{row[2]}</b><em>{row[3]}</em></li>)}</ul></WorkspacePanel>
          <WorkspacePanel action={<TextAction>View all</TextAction>} title="Recent Alerts"><ul className="alert-list">{[["Data quality check failed","Invoice Documents","3 hours ago"],["Pipeline run delayed","Enrichment Pipeline","5 hours ago"],["High error rate detected","Entity Extraction Job","Yesterday"],["New source connection","Azure Blob Storage","Yesterday"]].map((row,index)=><li key={row[0]}><TriangleAlert className={index===0?"red":"amber"} size={14}/><span><strong>{row[0]}</strong><small>{row[1]}</small></span><time>{row[2]}</time></li>)}</ul></WorkspacePanel>
        </aside>
      </div>
    </div>
  );
}
