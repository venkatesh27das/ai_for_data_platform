import { Box, CloudUpload, FlaskConical, Home, Settings, SquareCode } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

const navItems = [
  { label: "Home", to: "/home", icon: Home },
  { label: "Studios", to: "/studios", icon: SquareCode },
  { label: "Data Products", to: "/data-products", icon: Box },
  { label: "Migrate to Modernize", to: "/migrate-modernize", icon: CloudUpload },
  { label: "Demo Workbench", to: "/demo-workbench", icon: FlaskConical },
  { label: "Admin", to: "/admin", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="fixed left-4 top-20 z-40 inline-flex w-auto flex-col items-center rounded-[1.75rem] border border-slate-200/80 bg-white/95 px-3 py-5 shadow-[0_18px_55px_rgba(15,23,42,0.14)] backdrop-blur">
      <div className="text-base font-extrabold tracking-wide text-slate-400">APPS</div>
      <nav className="mt-7 flex flex-col items-center gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const separated = item.to === "/migrate-modernize" || item.to === "/admin";
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  "group relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-white shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600 hover:shadow-[0_14px_34px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-orange-200",
                  separated && "mt-4 before:absolute before:-top-6 before:left-2 before:right-2 before:h-px before:bg-slate-100",
                  isActive ? "border-orange-200 bg-orange-50 text-orange-600" : "border-slate-100 text-slate-700"
                )
              }
            >
              <Icon className="h-6 w-6 shrink-0" strokeWidth={1.9} />
              <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-slate-900 opacity-0 shadow-xl shadow-slate-900/10 transition group-hover:translate-x-1 group-hover:opacity-100 group-focus:translate-x-1 group-focus:opacity-100">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
