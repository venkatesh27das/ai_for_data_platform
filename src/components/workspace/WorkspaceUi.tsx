import type { LucideIcon } from "lucide-react";
import { CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";
import { Button } from "../ui/Button";
import type { Tone } from "../../types/knowledge";

export function WorkspacePageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="workspace-page-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions && <div className="workspace-page-actions">{actions}</div>}
    </div>
  );
}

export function WorkspaceKpis({ children }: PropsWithChildren) {
  return <div className="workspace-kpis">{children}</div>;
}

export function WorkspaceKpi({
  icon: Icon,
  label,
  value,
  note,
  tone = "blue",
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  note: string;
  tone?: Tone;
  trend?: "up" | "down";
}) {
  return (
    <article className="workspace-kpi">
      <span className={`workspace-kpi__icon icon-tile--${tone}`}>
        <Icon aria-hidden="true" size={22} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span className={trend ? `trend--${trend}` : ""}>
          {trend === "up" && <TrendingUp aria-hidden="true" size={10} />}
          {trend === "down" && <TrendingDown aria-hidden="true" size={10} />}
          {note}
        </span>
      </div>
    </article>
  );
}

export function WorkspacePanel({
  title,
  action,
  children,
  className = "",
}: PropsWithChildren<{ title: string; action?: ReactNode; className?: string }>) {
  return (
    <section className={`workspace-panel ${className}`}>
      <header>
        <h3>{title}</h3>
        {action}
      </header>
      <div className="workspace-panel__body">{children}</div>
    </section>
  );
}

export function Status({
  children,
  tone = "green",
}: PropsWithChildren<{ tone?: "green" | "amber" | "red" | "blue" | "purple" }>) {
  return <span className={`workspace-status workspace-status--${tone}`}><i />{children}</span>;
}

export function MiniBar({ value, tone = "green" }: { value: number; tone?: "green" | "purple" | "blue" | "orange" | "red" }) {
  return <span className="mini-bar"><i className={`mini-bar--${tone}`} style={{ width: `${value}%` }} /></span>;
}

export function Ring({ value, label, tone = "green" }: { value: number; label: string; tone?: "green" | "blue" | "orange" }) {
  return (
    <div className={`metric-ring metric-ring--${tone}`} style={{ "--ring-value": `${value * 3.6}deg` } as React.CSSProperties}>
      <div><strong>{value}%</strong><span>{label}</span></div>
    </div>
  );
}

export function TextAction({ children, onClick }: PropsWithChildren<{ onClick?: () => void }>) {
  return <button className="text-action" onClick={onClick} type="button">{children}</button>;
}

export function EmptyNotice({ text }: { text: string }) {
  return <div className="workspace-empty"><CheckCircle2 size={16} />{text}</div>;
}

export { Button };
