import { Bell, ChevronDown, CircleHelp, Menu, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-6">
        <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <div className="relative w-[560px]">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-16 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Search capabilities, assets, datasets, documents..." />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-500">⌘ K</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-orange-600 px-1.5 text-[10px] font-bold text-white">8</span>
        </button>
        <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="Help">
          <CircleHelp className="h-5 w-5" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">AS</div>
          <div>
            <div className="text-sm font-bold text-slate-950">Anika Sharma</div>
            <div className="text-xs text-slate-500">Data Engineer</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
}
