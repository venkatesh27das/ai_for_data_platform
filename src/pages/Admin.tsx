import { Activity, Bot, Cog, Plug, Settings, ShieldCheck, Users, Wallet, Workflow } from "lucide-react";
import { useState } from "react";
import { ActionCard } from "../components/ActionCard";
import { DonutChart } from "../components/DonutChart";
import { MetricCard } from "../components/MetricCard";
import { MiniTrendChart } from "../components/MiniTrendChart";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { adminMetrics, platformHealth, workspaces } from "../data/adminMetrics";
import { cn } from "../lib/utils";

const tabs = ["Overview", "Users & Access", "Roles & Permissions", "Workspaces", "Integrations", "AI & Models", "Platform Settings", "Audit Logs", "Usage & Billing"];

export function Admin() {
  const [tab, setTab] = useState("Overview");
  return (
    <div className="space-y-5">
      <PageHeader title="Admin" subtitle="Manage users, access, platform settings, integrations, and governance for the AI for Data Platform." />
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("rounded-lg px-4 py-2 text-sm font-semibold", tab === item ? "border border-orange-300 bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-100")}>{item}</button>)}</div>
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Users" value={adminMetrics.users} trend="+12 this month" icon={Users} />
        <MetricCard label="Active Workspaces" value={adminMetrics.workspaces} trend="+3 this month" icon={Workflow} />
        <MetricCard label="Integrations" value={adminMetrics.integrations} trend="+5 this month" icon={Plug} />
        <MetricCard label="AI Models" value={adminMetrics.aiModels} icon={Bot} />
        <MetricCard label="System Health" value={adminMetrics.health} icon={ShieldCheck} tone="green" />
      </div>
      <div className="grid grid-cols-[1.1fr_1.1fr_1fr] gap-5">
        <section className="card p-4">
          <h2 className="section-title mb-4">Recent Activity</h2>
          {["New user Arjun Patel added to workspace Customer Analytics", "Role Data Engineer updated", "New integration Snowflake connection added", "Model GPT-4o updated to version 2024-05-12", "Permissions updated for role Data Steward"].map((item, index) => <div key={item} className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0"><span>{item}</span><span className="text-xs text-slate-500">{["10m ago", "35m ago", "1h ago", "2h ago", "3h ago"][index]}</span></div>)}
        </section>
        <section className="card p-4">
          <h2 className="section-title mb-4">Platform Health</h2>
          <table className="w-full text-sm">
            <tbody>{platformHealth.map(([service, status, uptime]) => <tr key={service} className="border-b border-slate-100 last:border-0"><td className="py-3 font-semibold">{service}</td><td><StatusBadge status={status === "Operational" ? "Healthy" : status} /></td><td className="text-right text-slate-600">{uptime}</td></tr>)}</tbody>
          </table>
        </section>
        <section className="card p-4">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <ActionCard title="Add New User" subtitle="Create and invite a new user" icon={Users} />
            <ActionCard title="Create Role" subtitle="Define role and permissions" icon={ShieldCheck} />
            <ActionCard title="Add Integration" subtitle="Connect a data or app integration" icon={Plug} />
            <ActionCard title="Configure AI Model" subtitle="Add or update AI models" icon={Bot} />
            <ActionCard title="Platform Settings" subtitle="Modify global platform settings" icon={Settings} />
          </div>
        </section>
      </div>
      <div className="grid grid-cols-4 gap-5">
        <section className="card p-4"><h2 className="section-title mb-4">Users by Role</h2><DonutChart centerLabel="Users" data={[{ name: "Data Engineer", value: 48, color: "#ff5a1f" }, { name: "Data Analyst", value: 42, color: "#fb923c" }, { name: "Data Steward", value: 28, color: "#fdba74" }, { name: "Admin", value: 18, color: "#f97316" }, { name: "Business User", value: 52, color: "#fed7aa" }, { name: "Other", value: 26, color: "#ffedd5" }]} /></section>
        <section className="card p-4"><h2 className="section-title mb-4">Workspaces</h2>{workspaces.map(([name, users]) => <div key={name} className="flex justify-between border-b border-slate-100 py-3 text-sm last:border-0"><span className="font-semibold">{name}</span><span className="text-slate-500">{users}</span></div>)}</section>
        <section className="card p-4"><h2 className="section-title mb-4">Integrations by Type</h2><DonutChart centerLabel="Integrations" data={[{ name: "Data Sources", value: 10, color: "#ff5a1f" }, { name: "Storage", value: 6, color: "#f97316" }, { name: "Processing", value: 5, color: "#86efac" }, { name: "Analytics / BI", value: 4, color: "#f59e0b" }, { name: "Other", value: 2, color: "#fed7aa" }]} /></section>
        <section className="card p-4"><h2 className="section-title mb-4">System Usage This Month</h2>{[["API Calls", "1.2M", "+18%"], ["Data Processed", "45.6 TB", "+22%"], ["AI Requests", "320K", "+15%"]].map(([label, value, trend]) => <div key={label} className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0"><div><div className="text-sm text-slate-500">{label}</div><div className="text-2xl font-bold">{value}</div><div className="text-xs font-semibold text-green-600">{trend}</div></div><MiniTrendChart /></div>)}</section>
      </div>
    </div>
  );
}
