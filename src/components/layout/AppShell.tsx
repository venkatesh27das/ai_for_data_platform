import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-nexus-page">
      <Sidebar />
      <main className="ml-[128px] min-h-screen pr-5">
        <TopBar />
        <Outlet />
        <footer className="flex items-center justify-between py-6 text-xs text-slate-500">
          <span>Cloud Agnostic · Secure · Governed · AI-Powered</span><span>© 2025 DataNexus Inc.</span><span>Privacy · Terms · Documentation · Support</span>
        </footer>
      </main>
    </div>
  );
}
