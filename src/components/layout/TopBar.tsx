import { Bell, ChevronDown, DatabaseZap, Search } from "lucide-react";

function Selector({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="flex h-11 min-w-[9.25rem] items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[#fbfcfe] px-3 text-left transition hover:border-[rgba(255,90,31,0.32)] hover:bg-white"
    >
      <span className="min-w-0">
        <span className="block text-[0.66rem] font-semibold leading-none text-[var(--text-muted)]">
          {label}
        </span>
        <span className="block truncate pt-1 text-[0.78rem] font-bold leading-none text-[var(--text-primary)]">
          {value}
        </span>
      </span>
      <ChevronDown aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
    </button>
  );
}

export function TopBar() {
  return (
    <header className="shrink-0 bg-[var(--bg-app)] px-[clamp(0.8rem,1.1vw,1.3rem)] pb-2.5 pt-4">
      <div className="flex h-[4.65rem] w-full items-center gap-4 rounded-[1.45rem] border border-[var(--border-subtle)] bg-white px-[clamp(1rem,1.35vw,1.55rem)] shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <div className="flex min-w-0 shrink-0 items-center gap-4">
          <button
            type="button"
            className="group flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 transition hover:bg-[var(--orange-soft)]"
            aria-label="TrueData home"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--orange-soft)] text-[var(--orange)] ring-1 ring-[rgba(255,90,31,0.18)] transition group-hover:bg-white">
              <DatabaseZap aria-hidden="true" className="h-6 w-6" strokeWidth={2.15} />
            </span>
            <span className="hidden text-[1.1rem] font-extrabold tracking-normal text-[var(--text-primary)] sm:block">
              TrueData
            </span>
          </button>

          <span className="hidden h-9 w-px bg-[var(--border-subtle)] md:block" />

          <div className="hidden min-w-[14rem] md:block">
            <div className="text-[1.02rem] font-extrabold leading-tight tracking-normal text-[var(--text-primary)]">
              Unstructured Data Platform
            </div>
            <div className="mt-0.5 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Governed knowledge operations
            </div>
          </div>
        </div>

        <label className="relative mx-auto hidden h-11 min-w-[16rem] max-w-[34rem] flex-1 items-center md:flex">
          <span className="sr-only">Global search</span>
          <Search aria-hidden="true" className="absolute left-5 h-[1.2rem] w-[1.2rem] text-[var(--text-secondary)]" />
          <input
            type="search"
            placeholder="Search journeys, assets, docs, agents, users..."
            className="h-full w-full rounded-full border border-transparent bg-[#f1f3f6] pl-12 pr-12 text-[0.86rem] font-semibold text-[var(--text-primary)] outline-none ring-0 transition placeholder:text-[#8b93a2] focus:border-[rgba(255,90,31,0.28)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,90,31,0.1)]"
          />
          <kbd className="absolute right-3 flex h-6 min-w-7 items-center justify-center rounded-full bg-white px-1.5 text-[0.68rem] font-bold text-[#737d90] shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            K
          </kbd>
        </label>

        <div className="hidden items-center gap-3 xl:flex">
          <Selector label="Workspace" value="HealthCorp" />
          <Selector label="Environment" value="Production" />
        </div>

        <button
          type="button"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[var(--text-primary)] transition hover:bg-[var(--orange-soft)] hover:text-[var(--orange)]"
          aria-label="Notifications"
        >
          <Bell aria-hidden="true" className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[var(--orange)] px-1 text-[0.6rem] font-bold leading-none text-white ring-2 ring-white">
            3
          </span>
        </button>

        <button type="button" className="flex shrink-0 items-center gap-2 rounded-2xl px-1.5 py-1 transition hover:bg-[var(--orange-soft)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,90,31,0.18)] bg-[#fff5ef] text-[0.78rem] font-extrabold text-[#b63a0e]">
            PN
          </span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 text-[var(--text-primary)]" />
        </button>
      </div>
    </header>
  );
}
