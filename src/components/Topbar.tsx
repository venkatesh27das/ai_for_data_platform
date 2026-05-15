import { Bell, ChevronDown, CircleHelp, Menu, Search } from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 shrink-0">
        <div className="absolute left-1 top-1 h-8 w-3 rotate-[28deg] rounded-full bg-gradient-to-b from-orange-500 to-orange-700" />
        <div className="absolute right-1 top-1 h-8 w-3 -rotate-[28deg] rounded-full bg-gradient-to-b from-orange-500 to-orange-700" />
        <div className="absolute bottom-2 left-3 h-3 w-4 rounded-sm bg-orange-300 shadow-sm" />
      </div>
      <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-slate-950 2xl:text-xl">AI for Data Platform</span>
    </div>
  );
}

export function Topbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 grid h-16 grid-cols-[1fr_minmax(360px,640px)_1fr] items-center gap-5 border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center gap-5">
        <button className="rounded-lg p-1.5 text-slate-900 hover:bg-slate-100" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <Logo />
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-16 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Search capabilities, assets, datasets, documents..." />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-semibold text-slate-500">⌘ K</span>
      </div>
      <div className="flex items-center justify-end gap-4">
        <button className="relative rounded-lg p-2 text-slate-900 hover:bg-slate-100" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-orange-600 px-1.5 text-[10px] font-extrabold text-white shadow-sm">8</span>
        </button>
        <button className="rounded-lg p-2 text-slate-900 hover:bg-slate-100" aria-label="Help">
          <CircleHelp className="h-5 w-5" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-sm font-extrabold text-white shadow-sm shadow-orange-600/20">AS</div>
          <div className="min-w-0">
            <div className="whitespace-nowrap text-sm font-extrabold text-slate-950">Anika Sharma</div>
            <div className="whitespace-nowrap text-xs text-slate-500">Data Engineer</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
}
