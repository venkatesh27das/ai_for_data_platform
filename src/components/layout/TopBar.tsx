import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Database,
  FileText,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type TopPanel = "workspace" | "environment" | "notifications" | "profile" | null;

const searchItems = [
  { title: "Claims Gold Dataset", detail: "Certified data product · Claims", route: "/data-products", icon: Database, tone: "text-purple-600 bg-purple-50" },
  { title: "Provider 360 Ingestion", detail: "Running journey · Due in 5 days", route: "/data-journey", icon: Sparkles, tone: "text-emerald-600 bg-emerald-50" },
  { title: "Customer 360 Semantic Model", detail: "Semantic Studio · 89% coverage", route: "/studios/semantic", icon: ShieldCheck, tone: "text-blue-600 bg-blue-50" },
  { title: "Approve contract schema changes", detail: "Pending approval · Governance", route: "/admin", icon: FileText, tone: "text-orange-600 bg-orange-50" },
] as const;

const notifications = [
  { title: "Contract schema change needs approval", detail: "Provider Contract Index · Governance", time: "5m", severity: "High", route: "/admin" },
  { title: "Catalog sync delayed for Snowflake", detail: "1 connector warning in Production", time: "18m", severity: "Warning", route: "/admin" },
  { title: "Claims Gold Dataset certified", detail: "v2.6 published by Priya Nair", time: "1h", severity: "Info", route: "/data-products" },
] as const;

const workspaces = [
  { name: "HealthCorp", role: "Owner", health: "Healthy", active: true },
  { name: "Claims Operations", role: "Contributor", health: "Healthy", active: false },
  { name: "Provider Management", role: "Steward", health: "1 warning", active: false },
] as const;

const environments = [
  { name: "Production", detail: "Live governed assets", active: true, locked: true },
  { name: "UAT", detail: "Release validation", active: false, locked: false },
  { name: "Development", detail: "Build and test workspace", active: false, locked: false },
  { name: "Sandbox", detail: "Exploration only", active: false, locked: false },
] as const;

export default function TopBar() {
  const [activePanel, setActivePanel] = useState<TopPanel>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return searchItems;
    const normalized = query.toLowerCase();
    return searchItems.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalized));
  }, [query]);

  const openRoute = (route: string) => {
    setActivePanel(null);
    setSearchOpen(false);
    navigate(route);
  };

  return (
    <header className="sticky top-0 z-20 mb-3 flex h-[76px] items-center gap-4 bg-nexus-page/90 py-3 backdrop-blur">
      <label className="relative ml-auto max-w-[560px] flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActivePanel(null);
            setSearchOpen(true);
          }}
          onFocus={() => {
            setActivePanel(null);
            setSearchOpen(true);
          }}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
              event.preventDefault();
              setSearchOpen(true);
            }
            if (event.key === "Enter") openRoute(results[0]?.route ?? "/data-products");
          }}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          placeholder="Search data assets, products, journeys, users..."
        />
        <button type="button" onClick={() => setSearchOpen(true)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">⌘K</button>
        {searchOpen ? (
          <div className="absolute left-0 top-[52px] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <b className="text-[12px] text-slate-900">Search results</b>
              <button type="button" onClick={() => { setQuery(""); setSearchOpen(false); }} className="text-slate-400 hover:text-slate-700" aria-label="Close search"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.length ? results.map((item) => <SearchResult key={item.title} {...item} onClick={() => openRoute(item.route)} />) : (
                <div className="px-3 py-6 text-center text-[12px] font-semibold text-slate-500">No matching assets found</div>
              )}
            </div>
          </div>
        ) : null}
      </label>

      <TopBarPopover
        open={activePanel === "workspace"}
        trigger={(
          <button onClick={() => { setSearchOpen(false); setActivePanel(activePanel === "workspace" ? null : "workspace"); }} className="flex h-11 min-w-[176px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm">
            <span><span className="block text-[11px] font-semibold text-slate-500">Workspace</span><span className="block text-sm font-bold text-slate-900">HealthCorp</span></span><ChevronDown className="h-4 w-4" />
          </button>
        )}
      >
        <PopoverTitle title="Switch Workspace" detail="Choose the tenant context for dashboards, access, and asset inventory." />
        <div className="mt-3 space-y-2">
          {workspaces.map((workspace) => (
            <button key={workspace.name} onClick={() => setActivePanel(null)} className={`w-full rounded-lg border p-3 text-left ${workspace.active ? "border-orange-200 bg-orange-50/60" : "border-slate-100 hover:border-orange-200"}`}>
              <span className="flex items-center justify-between gap-3">
                <b className="text-[13px] text-slate-900">{workspace.name}</b>
                {workspace.active ? <CheckCircle2 className="h-4 w-4 text-orange-600" /> : null}
              </span>
              <span className="mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-500"><span>{workspace.role}</span><span className="text-emerald-600">{workspace.health}</span></span>
            </button>
          ))}
        </div>
      </TopBarPopover>

      <TopBarPopover
        open={activePanel === "environment"}
        trigger={(
          <button onClick={() => { setSearchOpen(false); setActivePanel(activePanel === "environment" ? null : "environment"); }} className="flex h-11 min-w-[176px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm">
            <span><span className="block text-[11px] font-semibold text-slate-500">Environment</span><span className="block text-sm font-bold text-slate-900">Production</span></span><ChevronDown className="h-4 w-4" />
          </button>
        )}
      >
        <PopoverTitle title="Environment" detail="Controls which assets, approvals, telemetry, and policies are shown." />
        <div className="mt-3 space-y-2">
          {environments.map((environment) => (
            <button key={environment.name} onClick={() => setActivePanel(null)} className={`w-full rounded-lg border p-3 text-left ${environment.active ? "border-orange-200 bg-orange-50/60" : "border-slate-100 hover:border-orange-200"}`}>
              <span className="flex items-center justify-between gap-3">
                <b className="text-[13px] text-slate-900">{environment.name}</b>
                <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${environment.active ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}>{environment.active ? "Active" : environment.locked ? "Locked" : "Available"}</span>
              </span>
              <span className="mt-1 block text-[11px] font-medium text-slate-500">{environment.detail}</span>
            </button>
          ))}
        </div>
      </TopBarPopover>

      <TopBarPopover
        align="right"
        open={activePanel === "notifications"}
        trigger={(
          <button onClick={() => { setSearchOpen(false); setActivePanel(activePanel === "notifications" ? null : "notifications"); }} className="relative grid h-11 w-11 place-items-center rounded-xl bg-transparent hover:bg-white" aria-label="Open notifications">
            <Bell className="h-5 w-5" /><span className="absolute right-1 top-0 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">3</span>
          </button>
        )}
      >
        <PopoverTitle title="Notifications" detail="Open alerts, approvals, and platform updates requiring attention." />
        <div className="mt-3 divide-y divide-slate-100">
          {notifications.map((notification) => (
            <button key={notification.title} onClick={() => openRoute(notification.route)} className="grid w-full grid-cols-[28px_1fr_auto] gap-3 py-3 text-left hover:bg-orange-50/40">
              <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-orange-50 text-orange-600"><Bell className="h-3.5 w-3.5" /></span>
              <span className="min-w-0">
                <b className="block truncate text-[12px] text-slate-900">{notification.title}</b>
                <span className="mt-1 block truncate text-[11px] text-slate-500">{notification.detail}</span>
              </span>
              <span className="text-right text-[10px] font-bold text-slate-500">{notification.time}</span>
            </button>
          ))}
        </div>
        <button onClick={() => openRoute("/admin")} className="mt-3 h-9 w-full rounded-lg border border-orange-500 bg-orange-600 text-[12px] font-bold text-white">Open notification center</button>
      </TopBarPopover>

      <TopBarPopover
        align="right"
        open={activePanel === "profile"}
        trigger={(
          <button onClick={() => { setSearchOpen(false); setActivePanel(activePanel === "profile" ? null : "profile"); }} className="flex h-11 items-center gap-2 rounded-xl px-2 hover:bg-white" aria-label="Open user menu">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-orange-200 bg-orange-50 text-sm font-extrabold text-orange-700 shadow-sm">PN</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-50 text-sm font-extrabold text-orange-700">PN</span>
          <span>
            <b className="block text-[13px] text-slate-900">Priya Nair</b>
            <span className="text-[11px] font-semibold text-slate-500">Data Product Owner</span>
          </span>
        </div>
        <div className="mt-2 space-y-1">
          <ProfileAction icon={User} label="Profile & role" onClick={() => setActivePanel(null)} />
          <ProfileAction icon={Settings} label="Preferences" onClick={() => setActivePanel(null)} />
          <ProfileAction icon={ShieldCheck} label="Security & sessions" onClick={() => setActivePanel(null)} />
          <ProfileAction icon={LogOut} label="Sign out" danger onClick={() => setActivePanel(null)} />
        </div>
      </TopBarPopover>
    </header>
  );
}

function SearchResult({ title, detail, icon: Icon, tone, onClick }: { title: string; detail: string; icon: LucideIcon; tone: string; route: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="grid w-full grid-cols-[34px_1fr] items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-orange-50/50">
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0">
        <b className="block truncate text-[13px] text-slate-900">{title}</b>
        <span className="block truncate text-[11px] font-medium text-slate-500">{detail}</span>
      </span>
    </button>
  );
}

function TopBarPopover({ trigger, open, children, align = "left" }: { trigger: ReactNode; open: boolean; children: ReactNode; align?: "left" | "right" }) {
  return (
    <div className="relative">
      {trigger}
      {open ? (
        <div className={`absolute top-[52px] z-50 w-[320px] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl ${align === "right" ? "right-0" : "left-0"}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function PopoverTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <b className="block text-[14px] text-slate-950">{title}</b>
      <span className="mt-1 block text-[11px] leading-4 text-slate-500">{detail}</span>
    </div>
  );
}

function ProfileAction({ icon: Icon, label, danger = false, onClick }: { icon: LucideIcon; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex h-9 w-full items-center gap-3 rounded-lg px-2 text-left text-[12px] font-bold ${danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-orange-50"}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
