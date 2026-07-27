import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__workspace">
        <TopHeader />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
