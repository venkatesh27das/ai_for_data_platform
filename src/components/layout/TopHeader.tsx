import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "../../stores/uiStore";

export function TopHeader() {
  const navigate = useNavigate();
  const environment = useUiStore((state) => state.environment);
  const notificationCount = useUiStore((state) => state.notificationCount);
  const setEnvironment = useUiStore((state) => state.setEnvironment);

  return (
    <header className="top-header">
      <form
        className="global-search"
        onSubmit={(event) => {
          event.preventDefault();
          navigate("/assets");
        }}
        role="search"
      >
        <Search aria-hidden="true" size={18} />
        <input
          aria-label="Search enterprise assets, projects, products, concepts, and policies"
          placeholder="Search assets, projects, products, concepts..."
          type="search"
        />
      </form>

      <div className="top-header__actions">
        <label className="environment-select">
          <Building2 aria-hidden="true" size={17} />
          <select
            aria-label="Environment"
            onChange={(event) => setEnvironment(event.target.value)}
            value={environment}
          >
            <option>Enterprise (Prod)</option>
            <option>Dev Environment</option>
          </select>
          <ChevronDown aria-hidden="true" size={15} />
        </label>
        <button aria-label={`${notificationCount} notifications`} className="header-icon" type="button">
          <Bell aria-hidden="true" size={20} />
          <span>{notificationCount}</span>
        </button>
        <button aria-label="Help" className="header-icon" type="button">
          <CircleHelp aria-hidden="true" size={20} />
        </button>
        <span className="header-divider" />
        <button aria-label="Open user profile" className="profile-button" type="button">
          <span className="avatar">AM</span>
          <span className="profile-button__copy">
            <strong>Arjun Mehta</strong>
            <small>Enterprise Architect</small>
          </span>
          <ChevronDown aria-hidden="true" size={15} />
        </button>
      </div>
    </header>
  );
}
