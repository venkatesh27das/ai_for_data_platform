import { Bell, ChevronDown, Cloud, Search, Building2 } from "lucide-react";
import { initials } from "../../utils/formatters";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 mb-4 flex h-18 items-center gap-4 bg-nexus-page/90 py-4 backdrop-blur">
      <label className="relative ml-auto max-w-[560px] flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" placeholder="Search data assets, products, journeys, users..." />
      </label>
      <button className="flex h-12 min-w-[210px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm">
        <span className="flex items-center gap-3"><Building2 className="h-4 w-4 text-slate-600" /><span><span className="block text-[11px] font-semibold text-slate-500">Workspace</span><span className="block text-sm font-bold text-slate-900">Global Insurance Co.</span></span></span><ChevronDown className="h-4 w-4" />
      </button>
      <button className="flex h-12 min-w-[170px] items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm">
        <span className="flex items-center gap-3"><Cloud className="h-4 w-4 text-slate-600" /><span><span className="block text-[11px] font-semibold text-slate-500">Environment</span><span className="block text-sm font-bold text-slate-900">Prod (AWS)</span></span></span><ChevronDown className="h-4 w-4" />
      </button>
      <button className="relative grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white"><Bell className="h-5 w-5" /><span className="absolute right-2 top-1 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">3</span></button>
      <button className="flex h-12 items-center gap-3 rounded-xl px-2 hover:bg-white">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-800 text-sm font-bold text-white">{initials("Arjun Menon")}</span>
        <span className="text-left"><span className="block text-sm font-bold text-slate-900">Arjun Menon</span><span className="block text-xs text-slate-500">Data Architect</span></span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </header>
  );
}
