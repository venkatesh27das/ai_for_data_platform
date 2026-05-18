import { Bell, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DemoFlowModal, { type DemoFlow } from "../common/DemoFlowModal";

export default function TopBar() {
  const [flow, setFlow] = useState<DemoFlow | null>(null);
  const navigate = useNavigate();

  return (
    <>
    <header className="sticky top-0 z-20 mb-3 flex h-[76px] items-center gap-4 bg-nexus-page/90 py-3 backdrop-blur">
      <label className="relative ml-auto max-w-[560px] flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input onKeyDown={(event) => { if (event.key === "Enter") navigate("/data-products"); }} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search data assets, products, journeys, users..." />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">⌘K</span>
      </label>
      <button onClick={() => setFlow(workspaceFlow)} className="flex h-11 min-w-[176px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm">
        <span><span className="block text-[11px] font-semibold text-slate-500">Workspace</span><span className="block text-sm font-bold text-slate-900">HealthCorp</span></span><ChevronDown className="h-4 w-4" />
      </button>
      <button onClick={() => setFlow(environmentFlow)} className="flex h-11 min-w-[176px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm">
        <span><span className="block text-[11px] font-semibold text-slate-500">Environment</span><span className="block text-sm font-bold text-slate-900">Production</span></span><ChevronDown className="h-4 w-4" />
      </button>
      <button onClick={() => setFlow(notificationFlow)} className="relative grid h-11 w-11 place-items-center rounded-xl bg-transparent"><Bell className="h-5 w-5" /><span className="absolute right-1 top-0 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">3</span></button>
      <button onClick={() => setFlow(profileFlow)} className="flex h-11 items-center gap-2 rounded-xl px-2 hover:bg-white" aria-label="Open user menu">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-orange-200 bg-orange-50 text-sm font-extrabold text-orange-700 shadow-sm">
          PN
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </header>
    <DemoFlowModal flow={flow} onClose={() => setFlow(null)} />
    </>
  );
}

const workspaceFlow: DemoFlow = {
  title: "Switch Workspace",
  description: "Changes the active workspace and reloads dashboards, permissions, and examples for that tenant.",
  steps: ["List available workspaces for the signed-in user.", "Preview workspace health, environment, and access level.", "Switch context and keep the current route in place."],
  primaryAction: "Switch workspace",
};

const environmentFlow: DemoFlow = {
  title: "Switch Environment",
  description: "Changes the active environment for demo data, controls, and operational telemetry.",
  steps: ["Select Production, UAT, Development, or Sandbox.", "Check environment-specific permissions.", "Refresh products, journeys, and admin signals."],
  primaryAction: "Switch environment",
};

const notificationFlow: DemoFlow = {
  title: "Notifications",
  description: "Shows alerts, pending approvals, failed jobs, and governance reminders.",
  steps: ["Review unread notifications and severity.", "Open the related product, journey, approval, or service.", "Resolve, snooze, or assign follow-up."],
  primaryAction: "Open notification center",
};

const profileFlow: DemoFlow = {
  title: "User Menu",
  description: "Provides profile, preferences, API keys, and sign-out controls for the signed-in user.",
  steps: ["View profile and active role.", "Manage preferences and connected accounts.", "Review security settings and sessions."],
  primaryAction: "Open profile",
};
