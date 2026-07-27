"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download, FolderKanban, Import, Plus, Rocket, Users, Activity, AlertTriangle, Database } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  DataTable,
  ErrorState,
  FilterBar,
  LoadingState,
  MetricCard,
  PageHeader,
  ProgressBar,
  StatusBadge,
} from "@/src/components/ui";
import { useMockData } from "@/src/hooks/use-mock-data";
import type { KnowledgeProject } from "@/src/models";
import { mockServices } from "@/src/services/mock-services";

export function ProjectsPage() {
  const router = useRouter();
  const { data, error, loading, retry } = useMockData("projects", mockServices.projects.list);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [stage, setStage] = useState("");
  const filtered = (data ?? []).filter(
    (project) =>
      (!search || `${project.name} ${project.description}`.toLowerCase().includes(search.toLowerCase())) &&
      (!domain || project.domain === domain) &&
      (!stage || project.stage === stage),
  );
  const columns = useMemo<ColumnDef<KnowledgeProject>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        cell: ({ row }) => <div className="primary-cell"><strong>{row.original.name}</strong><small>{row.original.description}</small></div>,
      },
      { accessorKey: "domain", header: "Domain" },
      { accessorKey: "stage", header: "Stage", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      {
        accessorKey: "health",
        header: "Health",
        cell: ({ getValue }) => <strong className={Number(getValue()) >= 85 ? "tone-text--success" : "tone-text--warning"}>{String(getValue())}%</strong>,
      },
      {
        accessorKey: "testPerformance",
        header: "Test Performance",
        cell: ({ getValue }) => <div className="progress-cell"><span>{String(getValue())}%</span><ProgressBar value={Number(getValue())} /></div>,
      },
      { accessorKey: "updatedAt", header: "Last Updated", cell: () => <span className="compact-date">May 20, 2025<br />10:30 AM</span> },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => <div className="person-cell"><span className="avatar">{row.original.owner.initials}</span><span><strong>{row.original.owner.name}</strong><small>{row.original.owner.team}</small></span></div>,
      },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
    ],
    [],
  );
  return (
    <div className="page">
      <PageHeader
        title="Knowledge Projects"
        description="Design, build, validate and publish knowledge products for AI applications."
        actions={<><Button onClick={() => router.push("/projects/new/use-case")}><Plus size={16} /> New Knowledge Project</Button><Button variant="outline"><Import size={16} /> Import Project</Button></>}
      />
      <div className="metrics-grid metrics-grid--six">
        <MetricCard label="Total Projects" value="22" caption="Across all domains" icon={<FolderKanban />} tone="warning" />
        <MetricCard label="In Validation" value="6" caption="Needs attention" icon={<Activity />} tone="warning" />
        <MetricCard label="Published" value="11" caption="Ready to use" icon={<Rocket />} tone="success" />
        <MetricCard label="Pending Decisions" value="18" caption="In stewardship queue" icon={<Users />} tone="warning" />
        <MetricCard label="Degraded" value="3" caption="Action required" icon={<AlertTriangle />} tone="critical" />
        <MetricCard label="Connected Sources" value="96" caption="Across 18 systems" icon={<Database />} tone="info" />
      </div>
      <section className="table-card">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search projects…"
          filters={[
            { label: "Domain", value: domain, onChange: setDomain, options: [{ label: "All Domains", value: "" }, ...Array.from(new Set((data ?? []).map((item) => item.domain))).map((value) => ({ label: value, value }))] },
            { label: "Stage", value: stage, onChange: setStage, options: [{ label: "All Stages", value: "" }, ...Array.from(new Set((data ?? []).map((item) => item.stage))).map((value) => ({ label: value, value }))] },
          ]}
          trailing={<Button variant="secondary" size="icon" aria-label="Export projects"><Download size={16} /></Button>}
        />
        {loading ? <LoadingState /> : error ? <ErrorState message={error.message} onRetry={retry} /> : <DataTable data={filtered} columns={columns} onRowSelect={(project) => router.push(`/projects/${project.id}`)} />}
      </section>
    </div>
  );
}
