"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, BookOpen, Clock, Plus, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, DataTable, DetailDrawer, ErrorState, FilterBar, LoadingState, MetricCard, PageHeader, ScoreIndicator, StatusBadge, Tabs } from "@/src/components/ui";
import { useMockData } from "@/src/hooks/use-mock-data";
import type { Policy } from "@/src/models";
import { mockServices } from "@/src/services/mock-services";

export function GovernancePage() {
  const { data, error, loading, retry } = useMockData("policies", mockServices.governance.listPolicies);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Policies & Rules");
  const [selected, setSelected] = useState<Policy | null>(null);
  const filtered = (data ?? []).filter((item) => !search || `${item.name} ${item.subtitle}`.toLowerCase().includes(search.toLowerCase()));
  const columns = useMemo<ColumnDef<Policy>[]>(
    () => [
      { accessorKey: "name", header: "Name", cell: ({ row }) => <div className="primary-cell"><strong>{row.original.name}</strong><small>{row.original.subtitle}</small></div> },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "domain", header: "Domain" },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      { accessorKey: "coverage", header: "Coverage", cell: ({ getValue }) => <ScoreIndicator score={Number(getValue())} /> },
      { accessorKey: "updatedAt", header: "Last Updated", cell: () => <span className="compact-date">May 20, 2025<br />10:30 AM</span> },
      { accessorKey: "owner.name", header: "Owner" },
      { accessorKey: "relatedAssets", header: "Related Assets" },
    ],
    [],
  );
  return (
    <div className="page page--with-drawer">
      <div className="page__primary">
        <PageHeader title="Governance" description="Define policies, manage stewardship, control classifications and monitor compliance across enterprise knowledge assets." actions={<><Button><Plus size={16} /> Create Policy</Button><Button variant="outline">Launch Review</Button></>} />
        <div className="metrics-grid metrics-grid--six">
          <MetricCard label="Active Policies" value="324" caption="Across 12 domains" icon={<ShieldCheck />} tone="warning" />
          <MetricCard label="Pending Approvals" value="48" caption="Requires stewardship action" icon={<Clock />} tone="ai" />
          <MetricCard label="Business Terms" value="217" caption="Glossary maintained" icon={<BookOpen />} tone="success" />
          <MetricCard label="Open Stewardship Tasks" value="89" caption="Queued for review" icon={<Users />} tone="info" />
          <MetricCard label="Compliance Coverage" value="96%" caption="Across governed assets" icon={<ShieldCheck />} tone="info" />
          <MetricCard label="Sensitive Asset Alerts" value="34" caption="Needs remediation" icon={<AlertTriangle />} tone="critical" />
        </div>
        <Tabs items={["Overview", "Policies & Rules", "Glossary & Semantics", "Classifications", "Stewardship Queue", "Audit Trail"]} active={activeTab} onChange={setActiveTab} />
        <section className="table-card">
          <FilterBar search={search} onSearchChange={setSearch} placeholder="Search policies, rules…" />
          {loading ? <LoadingState /> : error ? <ErrorState message={error.message} onRetry={retry} /> : <DataTable data={filtered} columns={columns} onRowSelect={setSelected} selectedId={selected?.id} />}
        </section>
      </div>
      {selected ? (
        <DetailDrawer title={selected.name} subtitle={<StatusBadge status={selected.status} />} onClose={() => setSelected(null)}>
          <Tabs items={["Overview", "Scope", "Audit", "Related Assets", "Exceptions"]} active="Overview" onChange={() => undefined} />
          <div className="drawer-section"><p>{selected.description}</p><dl className="detail-list"><div><dt>Policy Type</dt><dd>{selected.subtitle}</dd></div><div><dt>Domain</dt><dd>{selected.domain}</dd></div><div><dt>Classification</dt><dd><StatusBadge status={selected.classification} tone="ai" /></dd></div><div><dt>Coverage Score</dt><dd>{selected.coverage}/100</dd></div><div><dt>Linked Assets</dt><dd>{selected.relatedAssets}</dd></div><div><dt>Review Cycle</dt><dd>Quarterly</dd></div><div><dt>Owner</dt><dd>{selected.owner.name}</dd></div></dl></div>
          <div className="drawer-section"><h3>Compliance Summary</h3><div className="drawer-score"><ScoreIndicator score={selected.coverage} size="large" label="Compliant" /><dl><div><dt>Access Control</dt><dd>98%</dd></div><div><dt>Classification Mapping</dt><dd>92%</dd></div><div><dt>Retention Rules</dt><dd>95%</dd></div><div><dt>Masking Coverage</dt><dd>90%</dd></div></dl></div></div>
          <div className="drawer-section"><h3>Open Exceptions</h3>{["Supplier API missing masking policy", "2 glossary terms awaiting approval", "Risk dataset review due in 5 days"].map((item) => <div className="drawer-list-item drawer-list-item--warning" key={item}><AlertTriangle size={15} /><span>{item}</span></div>)}</div>
        </DetailDrawer>
      ) : null}
    </div>
  );
}
