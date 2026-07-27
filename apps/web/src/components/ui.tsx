"use client";

import {
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Filter,
  LoaderCircle,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { cn, toneForStatus } from "@/src/lib/utils";
import type { ReadinessCheck, Recommendation, Tone } from "@/src/models";

export function Button({
  children,
  variant = "primary",
  size = "default",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "compact" | "icon";
}) {
  return (
    <button
      className={cn("button", `button--${variant}`, `button--${size}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function Card({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("card", className)}>
      {title ? (
        <div className="card__header">
          <h2>{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  caption,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: ReactNode;
  tone?: Tone;
}) {
  return (
    <article className="metric-card">
      <span className={cn("metric-card__icon", `tone-bg--${tone}`)}>{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small className={`tone-text--${tone}`}>{caption}</small>
      </div>
    </article>
  );
}

export function StatusBadge({
  status,
  tone,
}: {
  status: string;
  tone?: Tone;
}) {
  const resolvedTone = tone ?? toneForStatus(status);
  return (
    <span className={cn("status-badge", `status-badge--${resolvedTone}`)}>
      <span className="status-badge__dot" aria-hidden="true" />
      {status}
    </span>
  );
}

export function ScoreIndicator({
  score,
  label,
  size = "small",
}: {
  score: number;
  label?: string;
  size?: "small" | "large";
}) {
  const tone = score >= 88 ? "success" : score >= 75 ? "warning" : "critical";
  return (
    <div
      className={cn("score", `score--${size}`, `score--${tone}`)}
      aria-label={`${label ?? "Score"}: ${score} out of 100`}
      style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}
    >
      <span>
        <strong>{score}</strong>
        {size === "large" ? <small>{label ?? "Score"}</small> : null}
      </span>
    </div>
  );
}

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const tone = value >= 88 ? "success" : value >= 70 ? "warning" : "critical";
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label ?? "Progress"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <span
        className={`progress__value progress__value--${tone}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export interface FilterOption {
  label: string;
  value: string;
}

export function FilterBar({
  search,
  onSearchChange,
  placeholder,
  filters = [],
  trailing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  filters?: { label: string; value: string; options: FilterOption[]; onChange: (value: string) => void }[];
  trailing?: ReactNode;
}) {
  return (
    <div className="filter-bar" role="search">
      <label className="search-control">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">{placeholder}</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
        />
      </label>
      {filters.map((filter) => (
        <label className="select-control" key={filter.label}>
          <span className="sr-only">{filter.label}</span>
          <select
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
          >
            {filter.options.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      ))}
      <Button variant="secondary" size="compact">
        <Filter size={15} aria-hidden="true" /> More Filters
      </Button>
      <div className="filter-bar__spacer" />
      {trailing}
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowSelect,
  selectedId,
  emptyTitle = "No matching records",
}: {
  data: T[];
  columns: ColumnDef<T>[];
  onRowSelect?: (item: T) => void;
  selectedId?: string;
  emptyTitle?: string;
}) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description="Adjust your search or filters to see relevant enterprise records."
      />
    );
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} scope="col">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
              <th scope="col" aria-label="Row actions" />
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                onRowSelect && "data-table__selectable",
                selectedId === row.original.id && "data-table__selected",
              )}
              onClick={() => onRowSelect?.(row.original)}
              tabIndex={onRowSelect ? 0 : undefined}
              onKeyDown={(event) => {
                if (onRowSelect && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onRowSelect(row.original);
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              <td>
                <button
                  className="icon-button icon-button--compact"
                  aria-label={`More actions for ${String(row.original.id)}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-pagination">
        <span>Showing 1 to {data.length} of {data.length} items</span>
        <div>
          <Button variant="secondary" size="compact" aria-label="Previous page">‹</Button>
          <Button variant="outline" size="compact">1</Button>
          <Button variant="secondary" size="compact">2</Button>
          <Button variant="secondary" size="compact" aria-label="Next page">›</Button>
        </div>
        <span>Rows per page: <strong>10</strong></span>
      </div>
    </div>
  );
}

export function Tabs({
  items,
  active,
  onChange,
  label = "Sections",
}: {
  items: string[];
  active: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          role="tab"
          aria-selected={active === item}
          className={cn("tabs__tab", active === item && "tabs__tab--active")}
          onClick={() => onChange(item)}
          key={item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function DetailDrawer({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <aside className="detail-drawer" aria-label={`${title} details`}>
      <div className="detail-drawer__header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <div>{subtitle}</div> : null}
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close details">
          <X size={18} />
        </button>
      </div>
      {children}
    </aside>
  );
}

export function AssistantPanel({
  title = "AI Assistant",
  recommendations,
  actionLabel,
}: {
  title?: string;
  recommendations: Recommendation[];
  actionLabel?: string;
}) {
  return (
    <aside className="assistant-panel" aria-label={title}>
      <div className="assistant-panel__header">
        <span className="assistant-panel__icon"><Sparkles size={17} /></span>
        <h2>{title}</h2>
        <span className="beta-badge">Beta</span>
        <ChevronDown size={16} />
      </div>
      <div className="assistant-panel__content">
        <h3>Recommendations</h3>
        <p>Based on your project context, consider these structured actions.</p>
        <div className="recommendation-list">
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
        <Button variant="outline" className="full-width">
          <Sparkles size={15} /> {actionLabel ?? "Apply recommendations"}
        </Button>
      </div>
    </aside>
  );
}

export function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <article className="recommendation-card">
      <span className={`tone-bg--${recommendation.tone}`}>
        <Bot size={15} aria-hidden="true" />
      </span>
      <div>
        <strong>{recommendation.title}</strong>
        <p>{recommendation.detail}</p>
      </div>
    </article>
  );
}

export function QuickActionsPanel() {
  const items = ["New Knowledge Project", "Connect Source", "Upload Assets", "Run System Assessment"];
  return (
    <section className="quick-actions">
      <div className="quick-actions__header">
        <strong>Quick Actions</strong>
        <ChevronDown size={14} />
      </div>
      {items.map((item, index) => (
        <a href={index === 0 ? "/projects/new/use-case" : "#"} key={item}>
          <span className={index === 0 ? "quick-actions__primary" : ""}>
            {index === 0 ? <Plus size={17} /> : <ArrowRight size={14} />}
          </span>
          {item}
        </a>
      ))}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-panel">
      <Search size={24} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div className="loading-state" role="status" aria-label="Loading data">
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} className="skeleton-row" />
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <AlertCircle size={24} />
      <h3>We could not load this view</h3>
      <p>{message}</p>
      <small>Correlation ID: KB-UI-2048</small>
      <Button variant="secondary" onClick={onRetry}>
        <RefreshCw size={15} /> Retry
      </Button>
    </div>
  );
}

export function Stepper({
  items,
  current,
}: {
  items: readonly { title: string; subtitle: string }[];
  current: number;
}) {
  return (
    <ol className="stepper" aria-label="Project creation progress">
      {items.map((item, index) => {
        const step = index + 1;
        const state = step < current ? "complete" : step === current ? "current" : "future";
        return (
          <li className={`stepper__item stepper__item--${state}`} key={item.title}>
            <span className="stepper__number" aria-hidden="true">
              {state === "complete" ? <Check size={15} /> : step}
            </span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("form-section", className)}>
      <div className="form-section__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  required,
  error,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("field", error && "field--error")}>
      <span className="field__label">
        {label} {required ? <b aria-hidden="true">*</b> : null}
      </span>
      {children}
      {error ? <span className="field__error">{error}</span> : null}
      {!error && help ? <span className="field__help">{help}</span> : null}
    </label>
  );
}

export function TagInput({
  label,
  values,
  onChange,
  placeholder = "Add a value",
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="tag-input">
      <span className="field__label">{label}</span>
      <div className="tag-input__box">
        {values.map((value) => (
          <span className="tag" key={value}>
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              aria-label={`Remove ${value}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          aria-label={placeholder}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              const next = event.currentTarget.value.trim().replace(/,$/, "");
              if (next && !values.includes(next)) onChange([...values, next]);
              event.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}

export function MultiSelect({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <fieldset className="multi-select">
      <legend className="field__label">{label}</legend>
      <div>
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              type="button"
              aria-pressed={selected}
              className={cn("choice-chip", selected && "choice-chip--selected")}
              onClick={() =>
                onChange(
                  selected
                    ? values.filter((value) => value !== option)
                    : [...values, option],
                )
              }
              key={option}
            >
              {selected ? <Check size={13} /> : null}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ReviewChecklist({ checks }: { checks: ReadinessCheck[] }) {
  return (
    <div className="review-checklist">
      {checks.map((check) => (
        <article key={check.id}>
          {check.status === "passed" ? (
            <CheckCircle2 className="tone-text--success" size={19} />
          ) : check.status === "warning" ? (
            <CircleAlert className="tone-text--warning" size={19} />
          ) : (
            <AlertCircle className="tone-text--critical" size={19} />
          )}
          <div>
            <strong>{check.label}</strong>
            <p>{check.detail}</p>
          </div>
          <StatusBadge
            status={check.status === "passed" ? "Passed" : check.status === "warning" ? "Warning" : "Required"}
          />
        </article>
      ))}
    </div>
  );
}

export function ConfirmationPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="confirmation-panel">
      <span><Check size={36} /></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  );
}

export function LoadingButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? <LoaderCircle className="spin" size={16} /> : null}
      {children}
    </Button>
  );
}
