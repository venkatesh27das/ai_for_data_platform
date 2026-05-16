import { Box, Cuboid, GitFork, Grid2X2, Home, Network, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const nav = [
  { label: "Home", to: "/", icon: Home },
  { label: "Data Journey", to: "/data-journey", icon: GitFork },
  { label: "Studios", to: "/studios", icon: Grid2X2 },
  { label: "Data Products", to: "/data-products", icon: Cuboid },
  { label: "Semantic Hub", to: "/semantic-hub", icon: Network },
  { label: "Admin", to: "/admin", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-5 top-1/2 z-30 flex w-[88px] -translate-y-1/2 flex-col items-center rounded-[24px] border border-slate-200 bg-white px-4 py-6 shadow-panel">
      <div className="border-b border-slate-100 pb-6">
        <div className="grid h-12 w-12 place-items-center rounded-xl orange-gradient text-white shadow-sm" title="DataNexus">
          <Box className="h-7 w-7" />
        </div>
      </div>
      <nav className="my-7 space-y-2">
        {nav.map(({ label, to, icon: Icon }) => (
          <NavLink key={label} to={to} end={to === "/"} aria-label={label} className={({ isActive }) => `group relative grid h-12 w-12 place-items-center rounded-2xl transition ${isActive ? "bg-orange-50 text-orange-600 shadow-sm" : "text-slate-700 hover:bg-orange-50/60 hover:text-orange-600"}`}>
            <Icon className="h-5 w-5" />
            <span className="pointer-events-none absolute left-[62px] top-1/2 z-40 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 opacity-0 shadow-card transition group-hover:translate-x-1 group-hover:opacity-100">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
