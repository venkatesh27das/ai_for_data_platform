import type { ScreenId } from "../../app/routes";
import { navItems } from "../../app/routes";

type SidebarProps = {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
};

export function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-[6.75rem] shrink-0 items-center justify-center bg-[#f2f3f6] px-4 py-5">
      <div className="flex w-[4.6rem] items-center justify-center rounded-[2.15rem] border border-[rgba(255,255,255,0.9)] bg-white px-3 py-4 shadow-[0_20px_48px_rgba(15,23,42,0.08)]">
        <nav className="flex flex-col items-center justify-center gap-4" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeScreen;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={[
                  "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,90,31,0.16)]",
                  isActive
                    ? "bg-[var(--orange-soft)] text-[var(--orange)]"
                    : "text-[#9aa3b4] hover:bg-[#f7f8fb] hover:text-[var(--text-secondary)]",
                ].join(" ")}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
              >
                {isActive ? (
                  <span className="absolute -left-[1.03rem] top-1/2 h-14 w-2 -translate-y-1/2 rounded-r-full bg-[var(--orange)] shadow-[0_0_18px_rgba(255,90,31,0.38)]" />
                ) : null}
                <Icon aria-hidden="true" className="h-[1.35rem] w-[1.35rem] shrink-0" strokeWidth={2.05} />
                <Tooltip>{item.label}</Tooltip>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function Tooltip({ children }: { children: string }) {
  return (
    <span className="pointer-events-none absolute left-[calc(100%+0.7rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[var(--text-primary)] px-2.5 py-1.5 text-[0.68rem] font-bold text-white opacity-0 shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition group-hover:opacity-100">
      {children}
    </span>
  );
}
