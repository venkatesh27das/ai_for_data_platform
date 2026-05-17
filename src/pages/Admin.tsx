import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Bell,
  Box,
  ChevronDown,
  Database,
  FileCheck,
  FileText,
  Folder,
  FolderPlus,
  Gauge,
  GitBranch,
  HardDrive,
  Link,
  Network,
  Shield,
  ShieldPlus,
  Sparkles,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import DonutChart from "../components/charts/DonutChart";
import EntityDrawer from "../components/common/EntityDrawer";
import { adminEvents, approvals, healthServices } from "../data/mockData";
import type { Approval, DrawerEntity } from "../types";

type AdminTone = "orange" | "green" | "slate" | "red";
type Priority = "High" | "Medium" | "Low";

const toneMap: Record<AdminTone, string> = {
  orange: "border-orange-100 bg-orange-50 text-orange-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  slate: "border-slate-200 bg-slate-50 text-slate-500",
  red: "border-rose-100 bg-rose-50 text-rose-600",
};

const stats = [
  { title: "Users", value: "642", delta: "12 this month", icon: Users },
  { title: "Workspaces", value: "16", delta: "2 this month", icon: Folder },
  { title: "Environments", value: "48", delta: "No change", icon: Network, neutral: true },
  { title: "Data Sources", value: "186", delta: "9 this month", icon: Database },
  { title: "Active Connections", value: "128", delta: "7 this month", icon: Link },
] as const;

const resourceUsage = [
  { title: "Compute Hours", value: "18,520 / 50,000", percent: 37, icon: Gauge },
  { title: "Storage", value: "28.4 TB / 100 TB", percent: 28, icon: Database },
  { title: "Data Transfer", value: "5.6 TB / 20 TB", percent: 28, icon: GitBranch },
  { title: "AI Tokens Used", value: "320M / 1B", percent: 32, icon: Sparkles },
] as const;

const costItems = [
  { label: "Compute", value: "$18,520 (38%)", color: "bg-orange-500" },
  { label: "Storage", value: "$12,430 (26%)", color: "bg-orange-300" },
  { label: "AI Services", value: "$8,345 (19%)", color: "bg-stone-400" },
  { label: "Data Transfer", value: "$5,230 (11%)", color: "bg-stone-300" },
  { label: "Other", value: "$1,125 (6%)", color: "bg-stone-200" },
] as const;

const auditRows = [
  { id: "ev-user-role", title: "User role updated", description: "admin@company.com updated role for user john.doe@company.com", time: "2 mins ago", icon: UserCog, eventId: "ev-customer-access" },
  { id: "ev-source-created", title: "Data source connection created", description: "Snowflake_Prod connection created in Commercial Operations", time: "15 mins ago", icon: Database, eventId: "ev-provider-schema" },
  { id: "ev-policy", title: "Policy updated", description: "Data Masking Policy v2.1 updated by admin@company.com", time: "1 hour ago", icon: Shield, eventId: "ev-policy-updated" },
  { id: "ev-login", title: "User login", description: "sarah.j@company.com logged in", time: "1 hour ago", icon: FileCheck, eventId: "ev-customer-access" },
  { id: "ev-published", title: "Data product published", description: "Customer_360_v2 published to Production", time: "2 hours ago", icon: Box, eventId: "ev-claims-published" },
] as const;

const quickActions = [
  { label: "Add User", icon: UserPlus },
  { label: "Create Workspace", icon: FolderPlus },
  { label: "Add Data Source", icon: Database },
  { label: "Manage Roles", icon: Shield },
  { label: "Create Policy", icon: FileText },
  { label: "View Audit Logs", icon: FileCheck },
  { label: "Platform Settings", icon: Gauge },
  { label: "Manage Connectors", icon: Link },
  { label: "System Health", icon: Sparkles },
] as const;

export default function Admin() {
  const [drawer, setDrawer] = useState<DrawerEntity | null>(null);

  const openApproval = (approval: Approval) => setDrawer({ type: "approval", id: approval.id });

  return (
    <>
      <div className="space-y-3">
        <section className="px-1">
          <h1 className="text-[26px] font-extrabold leading-none text-slate-950">Admin Home</h1>
          <p className="mt-2 text-[13px] text-slate-700">Manage platform settings, security, users, and system configuration.</p>
        </section>

        <section className="admin-stat-grid">
          {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
          <SystemHealthCard />
        </section>

        <section className="admin-mid-grid">
          <Panel title="Platform Health" action="View All">
            <PlatformHealthTable />
            <PanelLink label="View System Health" />
          </Panel>

          <Panel title="Resource Usage" control="This Month">
            <div className="space-y-7 px-2 py-4">
              {resourceUsage.map((item) => <ResourceRow key={item.title} {...item} />)}
            </div>
            <PanelLink label="View Usage & Cost" />
          </Panel>

          <Panel title="Cost Overview" control="This Month">
            <div className="px-5 py-5">
              <div className="flex flex-wrap items-end gap-8">
                <p className="text-[28px] font-extrabold leading-none text-slate-950">$48,250.75 <span className="text-[12px] font-bold">USD</span></p>
                <p className="flex items-center gap-1 text-[13px] font-bold text-emerald-600"><ArrowUp className="h-4 w-4" />14% <span className="text-slate-600">vs last month</span></p>
              </div>
              <div className="mt-7 grid grid-cols-[200px_1fr] items-center gap-8 max-[1180px]:grid-cols-1">
                <DonutChart data={[{ name: "Compute", value: 38 }, { name: "Storage", value: 26 }, { name: "AI Services", value: 19 }, { name: "Data Transfer", value: 11 }, { name: "Other", value: 6 }]} />
                <div className="space-y-4">
                  {costItems.map((item) => <CostLegendRow key={item.label} {...item} />)}
                </div>
              </div>
            </div>
            <PanelLink label="View Detailed Cost" />
          </Panel>
        </section>

        <section className="admin-bottom-grid">
          <Panel title="Recent Audit Logs" action="View All">
            <div className="divide-y divide-slate-100">
              {auditRows.map((event) => <AuditRow key={event.id} {...event} onClick={() => setDrawer({ type: "event", id: event.eventId })} />)}
            </div>
          </Panel>

          <Panel title="Pending Approvals" action="View All">
            <div className="divide-y divide-slate-100">
              {approvals.map((approval) => <ApprovalRow key={approval.id} approval={approval} onClick={() => openApproval(approval)} />)}
            </div>
          </Panel>

          <Panel title="Quick Actions">
            <div className="grid grid-cols-3 gap-3 p-3">
              {quickActions.map((action) => <QuickAction key={action.label} {...action} />)}
            </div>
          </Panel>
        </section>
      </div>
      <EntityDrawer entity={drawer} onClose={() => setDrawer(null)} onNavigate={setDrawer} />
    </>
  );
}

function StatCard({ title, value, delta, icon: Icon, neutral = false }: { title: string; value: string; delta: string; icon: LucideIcon; neutral?: boolean }) {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] border border-orange-100 bg-orange-50 text-orange-600"><Icon className="h-7 w-7" /></span>
        <span className="min-w-0">
          <b className="block text-[14px] text-slate-950">{title}</b>
          <span className="mt-4 block text-[30px] font-extrabold leading-none text-slate-950">{value}</span>
          <span className={`mt-4 flex items-center gap-1 text-[12px] font-bold ${neutral ? "text-slate-500" : "text-emerald-600"}`}>
            {neutral ? <span className="text-[16px] leading-none">-</span> : <ArrowUp className="h-4 w-4" />}
            {delta}
          </span>
        </span>
      </div>
    </div>
  );
}

function SystemHealthCard() {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] border border-orange-100 bg-orange-50 text-orange-600"><ShieldPlus className="h-7 w-7" /></span>
        <span>
          <b className="block text-[14px] text-slate-950">System Health</b>
          <span className="mt-4 block text-[30px] font-extrabold leading-none text-emerald-600">Healthy</span>
          <span className="mt-5 block text-[12px] font-medium text-slate-500">All systems operational</span>
        </span>
      </div>
    </div>
  );
}

function Panel({ title, action, control, children }: { title: string; action?: string; control?: string; children: React.ReactNode }) {
  return (
    <section className="flex min-h-0 flex-col rounded-[14px] border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-extrabold text-slate-950">{title}</h2>
        {action ? <button className="text-[12px] font-extrabold text-orange-600 hover:text-orange-700">{action}</button> : null}
        {control ? (
          <button className="flex h-9 items-center gap-5 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 shadow-sm">
            {control}<ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

function PlatformHealthTable() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-100">
      <div className="admin-health-row grid bg-slate-50 px-3 py-3 text-[11px] font-bold text-slate-500">
        <span>Service</span><span>Status</span><span>Last Checked</span><span>Details</span>
      </div>
      <div className="divide-y divide-slate-100">
        {healthServices.map((service) => (
          <div key={service.service} className="admin-health-row grid items-center px-3 py-2.5">
            <b className="truncate text-[12px] text-slate-800">{service.service}</b>
            <span className={`flex items-center gap-2 text-[12px] font-bold ${service.status === "Warning" ? "text-orange-600" : "text-emerald-600"}`}>
              <span className={`h-2 w-2 rounded-full ${service.status === "Warning" ? "bg-orange-500" : "bg-emerald-500"}`} />{service.status}
            </span>
            <span className="text-[12px] font-medium text-slate-600">{service.lastChecked}</span>
            <span className="text-[12px] font-bold text-slate-400">{service.status === "Warning" ? "1 issue" : "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceRow({ title, value, percent, icon: Icon }: { title: string; value: string; percent: number; icon: LucideIcon }) {
  return (
    <div className="grid grid-cols-[38px_1fr_92px_44px] items-center gap-4">
      <Icon className="h-6 w-6 text-slate-500" />
      <span>
        <span className="mb-3 flex items-center justify-between gap-3">
          <b className="text-[12px] text-slate-800">{title}</b>
          <span className="text-[12px] font-semibold text-slate-800">{value}</span>
        </span>
        <span className="block h-2.5 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-orange-500" style={{ width: `${percent}%` }} />
        </span>
      </span>
      <span className="text-right text-[12px] font-semibold text-slate-700">{percent}%</span>
    </div>
  );
}

function CostLegendRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="grid grid-cols-[18px_1fr_auto] items-center gap-3">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <b className="text-[13px] text-slate-800">{label}</b>
      <span className="text-[13px] font-bold text-slate-800">{value}</span>
    </div>
  );
}

function PanelLink({ label }: { label: string }) {
  return (
    <div className="mt-auto flex justify-end pt-4">
      <button className="flex items-center gap-3 text-[13px] font-extrabold text-orange-600 hover:text-orange-700">
        {label}<ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function AuditRow({ title, description, time, icon: Icon, onClick }: { title: string; description: string; time: string; icon: LucideIcon; eventId: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[34px_1fr_74px] items-start gap-3 px-1 py-3 text-left hover:bg-orange-50/40">
      <Icon className="mt-1 h-5 w-5 text-slate-500" />
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-800">{title}</b>
        <span className="mt-1 block truncate text-[11px] font-medium text-slate-500">{description}</span>
      </span>
      <span className="text-right text-[11px] font-bold text-slate-500">{time}</span>
    </button>
  );
}

function ApprovalRow({ approval, onClick }: { approval: Approval; onClick: () => void }) {
  const Icon = approval.type === "Access Request" ? Users : approval.type === "Data Product Certification" ? BadgeCheck : approval.type === "Schema Change" ? Box : approval.type === "Policy Exception" ? Shield : UserCog;
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[34px_1fr_70px_74px] items-center gap-3 px-1 py-3 text-left hover:bg-orange-50/40">
      <Icon className="h-5 w-5 text-slate-500" />
      <span className="min-w-0">
        <b className="block truncate text-[12px] text-slate-800">{approval.type}</b>
        <span className="mt-1 block truncate text-[11px] font-medium text-slate-500">{approval.title.replace(" access", " requests access").replace("certification", "awaiting certification")}</span>
      </span>
      <PriorityBadge priority={approval.priority as Priority} />
      <span className="text-right text-[11px] font-bold text-slate-500">{approval.timestamp}</span>
    </button>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const className = priority === "High"
    ? "border-rose-100 bg-rose-50 text-rose-600"
    : priority === "Medium"
      ? "border-orange-100 bg-orange-50 text-orange-600"
      : "border-emerald-100 bg-emerald-50 text-emerald-700";
  return <span className={`rounded-md border px-2 py-1 text-center text-[11px] font-extrabold ${className}`}>{priority}</span>;
}

function QuickAction({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <button className="min-h-[86px] rounded-[10px] border border-slate-200 bg-white p-3 text-center text-[12px] font-extrabold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600">
      <Icon className="mx-auto mb-3 h-7 w-7 text-orange-600" />
      {label}
    </button>
  );
}
