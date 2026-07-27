"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Activity, AlertTriangle, CircleX, Clock, Database, Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Card, DataTable, DetailDrawer, ErrorState, FilterBar, LoadingState, MetricCard, PageHeader, ProgressBar, ScoreIndicator, StatusBadge, Tabs } from "@/src/components/ui";
import { useMockData } from "@/src/hooks/use-mock-data";
import type { OperationalItem } from "@/src/models";
import { mockServices } from "@/src/services/mock-services";

export function OperationsPage() {
  const { data, error, loading, retry } = useMockData("operations", mockServices.operations.list);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [selected, setSelected] = useState<OperationalItem | null>(null);
  const filtered = (data ?? []).filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()));
  const columns = useMemo<ColumnDef<OperationalItem>[]>(
    () => [
      { accessorKey: "name", header: "Product / Pipeline", cell: ({ row }) => <div className="primary-cell"><strong>{row.original.name}</strong><small>{row.original.domain}</small></div> },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      { accessorKey: "health", header: "Health", cell: ({ getValue }) => <ScoreIndicator score={Number(getValue())} /> },
      { accessorKey: "freshness", header: "Freshness", cell: ({ getValue }) => <div className="progress-cell"><ProgressBar value={Number(getValue())} /><span>{String(getValue())}%</span></div> },
      { accessorKey: "queryVolume", header: "Query Volume" },
      { accessorKey: "updatedAt", header: "Last Updated", cell: () => <span className="compact-date">May 20, 2025<br />10:30 AM</span> },
      { accessorKey: "owner.name", header: "Owner" },
      { accessorKey: "alert", header: "Alert", cell: ({ getValue }) => <span className={String(getValue()) === "None" ? "" : "tone-text--warning"}>{String(getValue())}</span> },
    ],
    [],
  );
  return (
    <div className="page page--with-drawer">
      <div className="page__primary">
        <PageHeader title="Operations" description="Monitor platform health, refresh cycles, graph pipelines, usage, drift and operational issues across enterprise knowledge products." actions={<><Button><Activity size={16} /> Run Health Check</Button><Button variant="outline"><Plus size={16} /> Create Incident</Button></>} />
        <div className="metrics-grid metrics-grid--six">
          <MetricCard label="Active Pipelines" value="42" caption="6 require attention" icon={<Activity />} tone="ai" />
          <MetricCard label="Failed Runs" value="18" caption="Action required" icon={<CircleX />} tone="critical" />
          <MetricCard label="Freshness SLA" value="91%" caption="Across published products" icon={<ShieldCheck />} tone="success" />
          <MetricCard label="Query Volume" value="126M" caption="Last 30 days" icon={<Database />} tone="info" />
          <MetricCard label="Avg Latency (P95)" value="3.8s" caption="Across APIs and agents" icon={<Clock />} tone="warning" />
          <MetricCard label="Open Incidents" value="14" caption="Needs remediation" icon={<AlertTriangle />} tone="critical" />
        </div>
        <Tabs items={["Overview", "Pipeline Runs", "Incidents", "Usage & Performance", "Drift & Freshness", "Audit Logs"]} active={activeTab} onChange={setActiveTab} />
        <h2 className="section-heading">Operational Watchlist</h2>
        <section className="table-card">
          <FilterBar search={search} onSearchChange={setSearch} placeholder="Search products or pipelines…" />
          {loading ? <LoadingState /> : error ? <ErrorState message={error.message} onRetry={retry} /> : <DataTable data={filtered} columns={columns} onRowSelect={setSelected} selectedId={selected?.id} />}
        </section>
        <div className="dashboard-grid dashboard-grid--two">
          <Card title="Platform Performance Summary"><div className="performance-summary">{[["Query Success Rate", 96], ["Retrieval Quality", 89], ["Agent Tool Success", 92], ["Cost Efficiency", 84]].map(([label, value]) => <div key={String(label)}><ScoreIndicator score={Number(value)} /><strong>{value}%</strong><span>{label}</span><small>↑ 2% vs last 7 days</small></div>)}</div></Card>
          <Card title="Recent Operational Events"><div className="event-list">{["Asset Lineage Refresh completed successfully", "Product Incident KG Build failed and recovered", "Policy & Compliance Knowledge sync completed", "Latency spike detected for Customer 360 Graph Sync", "Vendor Master Connector permissions restored"].map((item, index) => <p key={item}><span className={`tone-bg--${index === 1 ? "critical" : index === 3 ? "warning" : "success"}`}>{index === 1 ? "×" : "✓"}</span>{item}<time>May {20 - index}, 2025</time></p>)}</div></Card>
        </div>
      </div>
      {selected ? (
        <DetailDrawer title={selected.name} subtitle={<StatusBadge status={selected.status} />} onClose={() => setSelected(null)}>
          <Tabs items={["Overview", "Pipelines", "Usage", "Incidents", "Lineage"]} active="Overview" onChange={() => undefined} />
          <div className="drawer-section"><h3>About this item</h3><p>Comprehensive operational record for freshness, build health, retrieval quality and consumer usage.</p><h3>Key Metrics</h3><dl className="detail-list"><div><dt>Health Score</dt><dd>{selected.health}/100</dd></div><div><dt>Freshness SLA</dt><dd>{selected.freshness}%</dd></div><div><dt>Query Volume (30d)</dt><dd>{selected.queryVolume}</dd></div><div><dt>Avg Latency (P95)</dt><dd>{selected.latency}</dd></div><div><dt>Owner</dt><dd>{selected.owner.name}</dd></div></dl></div>
          <div className="drawer-section"><h3>Active Issues</h3>{["Scenario regression detected after ontology update", "Freshness lag in contract source system", "Policy validation warning for risk classifications"].map((item) => <div className="drawer-list-item drawer-list-item--warning" key={item}><AlertTriangle size={15} /><span>{item}</span></div>)}</div>
          <div className="drawer-section"><h3>Incident Timeline</h3><div className="timeline"><p><b>May 20, 2025 10:30 AM</b><span>Scenario regression detected in risk scoring</span></p><p><b>May 19, 2025 08:45 AM</b><span>Freshness lag detected in contract dataset</span></p><p><b>May 18, 2025 11:20 AM</b><span>Ontology version 3.2 deployed successfully</span></p></div></div>
        </DetailDrawer>
      ) : null}
    </div>
  );
}
