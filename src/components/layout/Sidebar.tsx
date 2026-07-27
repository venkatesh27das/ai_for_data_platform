import {
  Box,
  ChevronLeft,
  Database,
  FolderKanban,
  Home,
  Network,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUiStore } from "../../stores/uiStore";

interface SidebarLink {
  label: string;
  to: string;
  icon: typeof Home;
  end?: boolean;
}

const primaryLinks: SidebarLink[] = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "Knowledge Projects", to: "/projects", icon: FolderKanban },
  { label: "Enterprise Assets", to: "/assets", icon: Database },
  { label: "Knowledge Products", to: "/products", icon: Box },
];

export function Sidebar() {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      aria-label="Primary"
      className={`sidebar${sidebarCollapsed ? " sidebar--collapsed" : ""}`}
    >
      <NavLink aria-label="Enterprise Knowledge Assembly Studio" className="brand" to="/">
        <span className="brand__mark">
          <Network aria-hidden="true" size={35} strokeWidth={1.7} />
        </span>
        <span className="brand__copy">
          <strong>Enterprise Knowledge</strong>
          <em>Assembly Studio</em>
        </span>
      </NavLink>

      <nav className="sidebar__nav">
        {primaryLinks.map(({ end, icon: Icon, label, to }) => (
          <NavLink
            className={({ isActive }) =>
              `nav-link${isActive ? " nav-link--active" : ""}`
            }
            end={end}
            key={to}
            title={sidebarCollapsed ? label : undefined}
            to={to}
          >
            <Icon aria-hidden="true" size={19} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <NavLink
          className={({ isActive }) =>
            `nav-link${isActive ? " nav-link--active" : ""}`
          }
          title={sidebarCollapsed ? "Administration" : undefined}
          to="/administration"
        >
          <Settings aria-hidden="true" size={19} strokeWidth={1.75} />
          <span>Administration</span>
        </NavLink>
        <button
          aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
          className="nav-link nav-link--button"
          onClick={toggleSidebar}
          type="button"
        >
          <ChevronLeft
            aria-hidden="true"
            className={sidebarCollapsed ? "rotate-180" : ""}
            size={20}
          />
          <span>Collapse</span>
        </button>
      </div>
    </aside>
  );
}
