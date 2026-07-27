"use client";

import {
  Activity,
  AlertTriangle,
  BookOpen,
  Database,
  FolderKanban,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { KnowledgeProject } from "@/src/models";
import { mockServices } from "@/src/services/mock-services";
import { useMockData } from "@/src/hooks/use-mock-data";
import {
  Card,
  DataTable,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHeader,
  ProgressBar,
  ScoreIndicator,
  StatusBadge,
} from "@/src/components/ui";

const activity = [
  { title: "Product hierarchy source refreshed", detail: "Databricks · 1.2M records", time: "10m ago", tone: "success" },
  { title: "2,340 entities reconciled", detail: "Across 4 sources", time: "25m ago", tone: "warning" },
  { title: "Ontology version 1.4 approved", detail: "Supplier domain", time: "1h ago", tone: "ai" },
  { title: "Scenario regression dropped from 91% to 84%", detail: "Supplier Risk project", time: "2h ago", tone: "info" },
  { title: "Collibra glossary sync failed", detail: "Glossary source is unreachable", time: "3h ago", tone: "critical" },
];

const domains = [
  ["Supplier", 92],
  ["Contract", 88],
  ["Product", 84],
  ["Customer", 78],
  ["Logistics", 72],
] as const;

export function DashboardPage() {
  const { data, error, loading, retry } = useMockData("dashboard-projects", mockServices.projects.list);
  const columns = useMemo<ColumnDef<KnowledgeProject>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        cell: ({ row }) => (
          <div className="primary-cell">
            <strong>{row.original.name}</strong>
            <small>{row.original.domain}</small>
          </div>
        ),
      },
      { accessorKey: "stage", header: "Stage", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      {
        accessorKey: "health",
        header: "Health",
        cell: ({ getValue }) => {
          const value = Number(getValue());
          return <strong className={value >= 85 ? "tone-text--success" : value < 70 ? "tone-text--critical" : "tone-text--warning"}>{value}%</strong>;
        },
      },
      {
        accessorKey: "testPerformance",
        header: "Test Performance",
        cell: ({ getValue }) => {
          const value = Number(getValue());
          return <div className="progress-cell"><ProgressBar value={value} /><span>{value}%</span></div>;
        },
      },
      { accessorKey: "pendingAction", header: "Pending Action" },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => <span className="avatar">{row.original.owner.initials}</span>,
      },
    ],
    [],
  );

  return (
    <div className="page page--dashboard">
      <PageHeader
        title="Welcome back, Akhil! 👋"
        description="Build, validate and publish trusted knowledge products that power AI with enterprise context."
      />
      <div className="metrics-grid metrics-grid--six">
        <MetricCard label="Total Projects" value="22" caption="12 active" icon={<FolderKanban />} tone="warning" />
        <MetricCard label="In Validation" value="6" caption="Needs attention" icon={<Activity />} tone="warning" />
        <MetricCard label="Published" value="11" caption="Ready to use" icon={<Rocket />} tone="success" />
        <MetricCard label="Pending Decisions" value="18" caption="Stewardship queue" icon={<Users />} tone="warning" />
        <MetricCard label="Degraded Products" value="3" caption="Action required" icon={<AlertTriangle />} tone="critical" />
        <MetricCard label="Connected Sources" value="96" caption="Across 18 systems" icon={<Database />} tone="info" />
      </div>

      <div className="dashboard-grid dashboard-grid--top">
        <Card
          title="Projects Requiring Attention"
          action={<Link className="text-link" href="/projects">View all projects</Link>}
          className="dashboard-grid__wide"
        >
          {loading ? <LoadingState rows={5} /> : error ? <ErrorState message={error.message} onRetry={retry} /> : (
            <DataTable data={(data ?? []).slice(0, 5)} columns={columns} />
          )}
        </Card>
        <Card title="System Activity" action={<button className="text-link">View all</button>}>
          <div className="activity-list">
            {activity.map((item, index) => (
              <article key={item.title}>
                <span className={`activity-list__icon tone-bg--${item.tone}`}>
                  {index === 0 ? <Database /> : index === 1 ? <Network /> : index === 2 ? <BookOpen /> : index === 3 ? <Activity /> : <AlertTriangle />}
                </span>
                <div><strong>{item.title}</strong><small>{item.detail}</small></div>
                <time>{item.time}</time>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <div className="dashboard-grid dashboard-grid--three">
        <Card title="Knowledge Coverage Overview">
          <div className="coverage-card">
            <ScoreIndicator score={78} size="large" label="Coverage" />
            <dl>
              <div><dt>Domains</dt><dd>8</dd></div>
              <div><dt>Entity Classes</dt><dd>349</dd></div>
              <div><dt>Relationships</dt><dd>1,257</dd></div>
              <div><dt>Evidence Assets</dt><dd>24.6K</dd></div>
              <div><dt>Published Interfaces</dt><dd>13</dd></div>
            </dl>
          </div>
          <button className="text-link card__footer-link">View full coverage report</button>
        </Card>
        <Card title="Scenario Performance (All Projects)" action={<button className="text-link">View all</button>}>
          <div className="scenario-card">
            <ScoreIndicator score={81} size="large" label="Average Pass Rate" />
            <dl>
              <div><dt>Entity Accuracy</dt><dd>86%</dd></div>
              <div><dt>Relationship Coverage</dt><dd>78%</dd></div>
              <div><dt>Evidence Completeness</dt><dd>73%</dd></div>
              <div><dt>Policy Compliance</dt><dd>94%</dd></div>
              <div><dt>Latency (P95)</dt><dd>3.8s</dd></div>
            </dl>
          </div>
          <p className="positive-caption">↑ 6% vs last 7 days</p>
        </Card>
        <Card title="Top Knowledge Domains" action={<button className="text-link">View all</button>}>
          <div className="domain-list">
            {domains.map(([domain, value]) => (
              <div key={domain}>
                <span>{domain}</span>
                <ProgressBar value={value} label={`${domain} performance`} />
                <strong>{value}%</strong>
              </div>
            ))}
          </div>
          <small>Ranked by test performance</small>
        </Card>
      </div>

      <section className="feedback-banner">
        <span><Sparkles size={22} /></span>
        <strong>Build better knowledge together</strong>
        <p>The more feedback we receive, the smarter the platform becomes.</p>
        <button className="button button--outline button--default">Share Feedback</button>
        <ShieldCheck size={28} />
      </section>
    </div>
  );
}
