import type { LucideIcon } from "lucide-react";

type Service = {
  icon: LucideIcon;
  name: string;
  region: string;
  status: string;
};

type ServiceHealthStripProps = {
  columns?: 5 | 6;
  services: Service[];
};

export function ServiceHealthStrip({ columns = 5, services }: ServiceHealthStripProps) {
  const gridColumns = columns === 6 ? "lg:grid-cols-6" : "lg:grid-cols-5";

  return (
    <div className={["grid overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white shadow-card md:grid-cols-3", gridColumns].join(" ")}>
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <div
            key={service.name}
            className={[
              "flex min-w-0 items-center gap-3 px-5 py-3.5",
              index > 0 ? "border-t border-[var(--border-subtle)] md:border-l md:border-t-0" : "",
              index === 3 ? "md:border-l-0 lg:border-l" : "",
            ].join(" ")}
          >
            <Icon aria-hidden="true" className="h-8 w-8 shrink-0 text-[var(--blue)]" strokeWidth={2.05} />
            <div className="min-w-0">
              <p className="truncate text-[0.79rem] font-bold text-[var(--text-primary)]">{service.name}</p>
              <p className="mt-1 truncate text-[0.72rem] font-medium text-[var(--text-secondary)]">{service.region}</p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-[0.72rem] font-bold text-[var(--green)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                {service.status}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
