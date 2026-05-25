import type { ReactNode } from "react";
import type { ScreenId } from "../../app/routes";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type AppShellProps = {
  activeScreen: ScreenId;
  children: ReactNode;
  onNavigate: (screen: ScreenId) => void;
};

export function AppShell({ activeScreen, children, onNavigate }: AppShellProps) {
  return (
    <div className="app-shell flex h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Sidebar activeScreen={activeScreen} onNavigate={onNavigate} />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 overflow-auto p-[clamp(0.75rem,1.1vw,1.35rem)] pt-3">
          <div className="min-h-full rounded-[1.05rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-shell">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
