"use client";

import {
  Bell,
  Boxes,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Database,
  FolderKanban,
  Home,
  Menu,
  Network,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { QuickActionsPanel } from "./ui";

const primaryNavigation = [
  { label: "Home", href: "/", icon: Home },
  { label: "Knowledge Projects", href: "/projects", icon: FolderKanban },
  { label: "Enterprise Assets", href: "/assets", icon: Database },
  { label: "Knowledge Products", href: "/products", icon: Boxes },
  { label: "Governance", href: "/governance", icon: ShieldCheck },
  { label: "Operations", href: "/operations", icon: SlidersHorizontal },
];

const ShellContext = createContext({ collapsed: false });

export function useShell() {
  return useContext(ShellContext);
}

export function GlobalHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <header className="global-header">
      <div className={cn("global-header__brand", collapsed && "global-header__brand--collapsed")}>
        <button className="icon-button" aria-label="Toggle navigation" onClick={onToggle}>
          <Menu size={20} />
        </button>
        <Link href="/" className="brand">
          <span className="brand__mark"><Network size={30} /></span>
          <span className="brand__copy">
            <strong>Knowledge Builder</strong>
            <small>Enterprise Knowledge Platform</small>
          </span>
        </Link>
      </div>
      <label className="global-search">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Global search</span>
        <input placeholder="Search projects, entities, assets, scenarios…" />
        <kbd>/</kbd>
      </label>
      <div className="global-header__actions">
        <button className="icon-button notification-button" aria-label="Notifications, 12 unread">
          <Bell size={19} />
          <span>12</span>
        </button>
        <button className="icon-button" aria-label="Help">
          <CircleHelp size={19} />
        </button>
        <div className="user-menu">
          <span className="avatar avatar--navy">AK</span>
          <span>
            <strong>Akhil Kumar</strong>
            <small>Knowledge Admin</small>
          </span>
          <ChevronDown size={15} />
        </div>
      </div>
    </header>
  );
}

export function SidebarNavigation({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside className={cn("sidebar", collapsed && "sidebar--collapsed")}>
      <nav aria-label="Primary navigation">
        {primaryNavigation.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              className={cn("nav-item", active && "nav-item--active")}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              key={item.href}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar__secondary">
        <a className="nav-item" href="#settings">
          <Settings size={20} />
          <span>Settings</span>
        </a>
        <a className="nav-item" href="#administration">
          <UserRoundCog size={20} />
          <span>Administration</span>
        </a>
      </div>
      {!collapsed ? <QuickActionsPanel /> : null}
      <button className="sidebar__collapse" onClick={onToggle}>
        <ChevronLeft size={18} />
        <span>{collapsed ? "Expand" : "Collapse"}</span>
      </button>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <ShellContext.Provider value={{ collapsed }}>
      <div className={cn("app-shell", collapsed && "app-shell--collapsed")}>
        <GlobalHeader collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <SidebarNavigation collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <main id="main-content" className="main-content">
          {children}
        </main>
      </div>
    </ShellContext.Provider>
  );
}

