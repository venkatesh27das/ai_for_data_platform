import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    const handler = (event: Event) => {
      setToast((event as CustomEvent<string>).detail);
      window.setTimeout(() => setToast(""), 1800);
    };
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  return (
    <div className="min-h-screen">
      <Topbar />
      <Sidebar />
      <main className="pl-[8rem] pt-16">
        <div className="px-4 py-4 2xl:py-4">
          <Outlet />
        </div>
      </main>
      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </div>
  );
}
