import { Bell, Database, FileCheck, FolderPlus, HardDrive, Link, Settings, Shield, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import DonutChart from "../components/charts/DonutChart";
import EntityDrawer from "../components/common/EntityDrawer";
import HealthIndicator from "../components/common/HealthIndicator";
import MetricCard from "../components/common/MetricCard";
import ProgressBar from "../components/common/ProgressBar";
import StatusBadge from "../components/common/StatusBadge";
import Table, { type Column } from "../components/common/Table";
import { adminEvents, approvals, healthServices } from "../data/mockData";
import type { Approval, DrawerEntity, HealthService } from "../types";

const subnav = ["Admin Home","Tenants & Workspaces","Users & Groups","Roles & Permissions","Environments","Connections & Adapters","Data Sources","Security & Access","Policies & Governance","Audit Logs","Platform Settings","AI & Model Management","Notifications","Integrations","System Health","Usage & Cost","Backup & Recovery"];

export default function Admin() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);
  const healthCols: Column<HealthService>[] = [{ header:"Service", render:(s)=><b>{s.service}</b> }, { header:"Status", render:(s)=><HealthIndicator status={s.status} /> }, { header:"Last Checked", render:(s)=>s.lastChecked }, { header:"Details", render:(s)=>s.details }];
  const approvalCols: Column<Approval>[] = [{ header:"Type", render:(a)=><b>{a.type}</b> }, { header:"Title", render:(a)=>a.title }, { header:"Priority", render:(a)=><StatusBadge status={a.priority === "High" ? "High Impact" : a.priority} /> }, { header:"Requested", render:(a)=>a.timestamp }];
  return (
    <>
      <div className="grid grid-cols-[250px_1fr] gap-5">
        <aside className="panel h-fit p-3">{subnav.map((item, i) => <button key={item} className={`mb-1 flex h-10 w-full items-center rounded-xl px-3 text-left text-sm font-semibold ${i === 0 ? "bg-orange-50 text-orange-600" : "text-slate-700 hover:bg-slate-50"}`}>{item}</button>)}</aside>
        <section className="space-y-5">
          <div><h1 className="text-3xl font-bold">Admin Home</h1><p className="mt-1 text-sm text-slate-600">Manage platform settings, security, users, and system configuration.</p></div>
          <div className="grid grid-cols-6 gap-4"><MetricCard title="Users" value="642" delta="↑ 12 this month" icon={Users} /><MetricCard title="Workspaces" value="16" delta="↑ 2 this month" icon={FolderPlus} /><MetricCard title="Environments" value="48" delta="No change" icon={Settings} /><MetricCard title="Data Sources" value="186" delta="↑ 9 this month" icon={Database} /><MetricCard title="Active Connections" value="128" delta="↑ 7 this month" icon={Link} /><MetricCard title="System Health" value="Healthy" delta="All systems operational" icon={Shield} color="green" trend={false} /></div>
          <div className="grid grid-cols-[1.2fr_.8fr_.9fr] gap-4">
            <Panel title="Platform Health"><Table columns={healthCols} rows={healthServices} /></Panel>
            <Panel title="Resource Usage">{[["Compute Hours",18520],["Storage",28400],["Data Transfer",5600],["AI Tokens Used",32000]].map(([label, val]) => <div key={label} className="mb-5"><div className="mb-2 flex justify-between text-sm"><b>{label}</b><span>{label === "Compute Hours" ? "18,520 / 50,000" : label === "Storage" ? "28.4 TB / 100 TB" : label === "Data Transfer" ? "5.6 TB / 20 TB" : "320M / 1B"}</span></div><ProgressBar value={Math.round(Number(val) / (label === "Compute Hours" ? 500 : label === "AI Tokens Used" ? 1000 : 1000))} /></div>)}</Panel>
            <Panel title="Cost Overview"><div className="flex items-center gap-5"><DonutChart data={[{name:"Compute",value:38},{name:"Storage",value:26},{name:"AI Services",value:19},{name:"Data Transfer",value:11},{name:"Other",value:6}]} /><div><p className="text-3xl font-bold">$48,250.75 <span className="text-sm">USD</span></p>{["Compute $18,520", "Storage $12,430", "AI Services $8,945", "Data Transfer $5,230", "Other $1,125"].map((x) => <p key={x} className="mt-3 text-xs font-semibold text-slate-600">{x}</p>)}</div></div></Panel>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Panel title="Recent Audit Logs">{adminEvents.map((e) => <button key={e.id} onClick={() => setDrawer({ type: "event", id: e.id })} className="w-full border-b border-slate-100 py-3 text-left text-xs"><b>{e.title}</b><span className="block text-slate-500">{e.description}</span><span className="float-right text-slate-500">{e.timestamp}</span></button>)}</Panel>
            <Panel title="Pending Approvals"><Table columns={approvalCols} rows={approvals} onRowClick={(a) => setDrawer({ type: "approval", id: a.id })} /></Panel>
            <Panel title="Quick Actions"><div className="grid grid-cols-3 gap-3">{[["Add User",UserPlus],["Create Workspace",FolderPlus],["Add Data Source",Database],["Manage Roles",Shield],["Create Policy",FileCheck],["View Audit Logs",Bell],["Platform Settings",Settings],["Manage Connectors",Link],["System Health",HardDrive]].map(([label, Icon]) => { const I = Icon as typeof UserPlus; return <button key={label as string} className="rounded-xl border border-slate-200 p-4 text-center text-xs font-bold hover:border-orange-200 hover:text-orange-600"><I className="mx-auto mb-2 h-6 w-6 text-orange-600" />{label as string}</button>; })}</div></Panel>
          </div>
        </section>
      </div>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="panel p-5"><h2 className="mb-4 font-bold">{title}</h2>{children}</div>; }
