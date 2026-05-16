import { Bell, ChevronDown, Search } from "lucide-react";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 mb-3 flex h-[76px] items-center gap-4 bg-nexus-page/90 py-3 backdrop-blur">
      <label className="relative ml-auto max-w-[560px] flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-14 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search data assets, products, journeys, users..." />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">⌘K</span>
      </label>
      <button className="flex h-11 min-w-[176px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm">
        <span><span className="block text-[11px] font-semibold text-slate-500">Workspace</span><span className="block text-sm font-bold text-slate-900">HealthCorp</span></span><ChevronDown className="h-4 w-4" />
      </button>
      <button className="flex h-11 min-w-[176px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm">
        <span><span className="block text-[11px] font-semibold text-slate-500">Environment</span><span className="block text-sm font-bold text-slate-900">Production</span></span><ChevronDown className="h-4 w-4" />
      </button>
      <button className="relative grid h-11 w-11 place-items-center rounded-xl bg-transparent"><Bell className="h-5 w-5" /><span className="absolute right-1 top-0 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">3</span></button>
      <button className="flex h-11 items-center gap-2 rounded-xl px-2 hover:bg-white" aria-label="Open user menu">
        <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-b from-orange-100 to-slate-100">
          <span className="absolute top-2 h-4 w-4 rounded-full bg-[#f2b49b]" />
          <span className="absolute top-1 h-4 w-6 rounded-t-full bg-slate-800" />
          <span className="absolute bottom-1 h-5 w-7 rounded-t-full bg-slate-900" />
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </header>
  );
}
