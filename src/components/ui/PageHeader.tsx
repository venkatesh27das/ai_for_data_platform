import type { ReactNode } from "react";

type PageHeaderProps = {
  actions?: ReactNode;
  subtitle: string;
  title: string;
};

export function PageHeader({ actions, subtitle, title }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-[var(--font-2xl)] font-extrabold leading-tight tracking-normal text-[var(--text-primary)]">
        {title}
      </h1>
      <p className="mt-2 max-w-[43rem] text-[0.87rem] font-medium leading-6 text-[var(--text-secondary)]">
        {subtitle}
      </p>
      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
