import { Box, CloudUpload, Database, FlaskConical, Home, LayoutDashboard, Route, Settings, SquareCode } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

const navItems = [
  { label: "Home", to: "/home", icon: Home },
  { label: "Capability Hub", to: "/capability-hub", icon: LayoutDashboard },
  { label: "Data Journey", to: "/data-journey", icon: Route },
  { label: "Studios", to: "/studios", icon: SquareCode },
  { label: "Data Products", to: "/data-products", icon: Box },
  { label: "Migrate to Modernize", to: "/migrate-modernize", icon: CloudUpload },
  { label: "Demo Workbench", to: "/demo-workbench", icon: FlaskConical },
  { label: "Admin", to: "/admin", icon: Settings }
];

function Logo() {
  return (
    <div className="flex items-center gap-3 px-5">
      <div className="relative h-10 w-10">
        <div className="absolute left-1 top-1 h-8 w-3 rotate-[28deg] rounded-full bg-orange-500" />
        <div className="absolute right-1 top-1 h-8 w-3 -rotate-[28deg] rounded-full bg-orange-600" />
        <div className="absolute bottom-2 left-3 h-3 w-4 rounded-sm bg-orange-300" />
      </div>
      <span className="text-xl font-bold text-slate-950">AI for Data Platform</span>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center">
        <Logo />
      </div>
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition", isActive ? "bg-orange-50 text-orange-600 shadow-[inset_4px_0_0_#ff5a1f]" : "text-slate-700 hover:bg-slate-50 hover:text-orange-600")}>
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <Database className="h-5 w-5" />
          Collapse
        </button>
      </div>
    </aside>
  );
}
