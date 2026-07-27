"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Boxes, Database, FileText, Network, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, DetailDrawer, ErrorState, FilterBar, LoadingState, MetricCard, PageHeader, ScoreIndicator, StatusBadge, Tabs } from "@/src/components/ui";
import { useMockData } from "@/src/hooks/use-mock-data";
import type { EnterpriseAsset } from "@/src/models";
import { mockServices } from "@/src/services/mock-services";

export function AssetsPage() {
  const { data, error, loading, retry } = useMockData("assets", mockServices.assets.list);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [tab, setTab] = useState("All Assets");
  const [selected, setSelected] = useState<EnterpriseAsset | null>(null);
  const filtered = (data ?? []).filter((asset) => (!search || `${asset.name} ${asset.subtitle}`.toLowerCase().includes(search.toLowerCase())) && (!type || asset.type === type));
  const columns = useMemo<ColumnDef<EnterpriseAsset>[]>(
    () => [
      { accessorKey: "name", header: "Asset Name", cell: ({ row }) => <div className="primary-cell primary-cell--icon"><span className="record-icon tone-bg--info"><Database size={16} /></span><span><strong>{row.original.name}</strong><small>{row.original.subtitle}</small></span></div> },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "domain", header: "Domain" },
      { accessorKey: "connectionStatus", header: "Connection Status", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      { accessorKey: "qualityScore", header: "Quality Score", cell: ({ getValue }) => <ScoreIndicator score={Number(getValue())} /> },
      { accessorKey: "lastRefreshed", header: "Last Refreshed", cell: ({ getValue }) => <span className="compact-date">{String(getValue())}</span> },
      { accessorKey: "owner.name", header: "Owner" },
      { accessorKey: "projectUsage", header: "Usage in Projects" },
    ],
    [],
  );
  return (
    <div className="page page--with-drawer">
      <div className="page__primary">
        <PageHeader title="Enterprise Assets" description="Discover, connect and manage enterprise data, metadata and knowledge assets." />
        <div className="metrics-grid metrics-grid--six">
          <MetricCard label="Data Sources" value="142" caption="23 connected" icon={<Database />} tone="warning" />
          <MetricCard label="Data Catalogs" value="56" caption="8 connected" icon={<BookOpen />} tone="info" />
          <MetricCard label="Data Models" value="618" caption="124 published" icon={<Network />} tone="success" />
          <MetricCard label="Documents" value="1,842" caption="312 processed" icon={<FileText />} tone="ai" />
          <MetricCard label="Policies & Rules" value="236" caption="85 active" icon={<ShieldCheck />} tone="warning" />
          <MetricCard label="APIs & Services" value="98" caption="41 connected" icon={<Boxes />} tone="info" />
        </div>
        <Tabs items={["All Assets", "Data Sources", "Catalogs", "Models", "Documents", "Policies & Rules", "APIs & Services"]} active={tab} onChange={setTab} />
        <section className="table-card">
          <FilterBar search={search} onSearchChange={setSearch} placeholder="Search assets…" filters={[{ label: "Asset type", value: type, onChange: setType, options: [{ label: "Asset Type", value: "" }, ...Array.from(new Set((data ?? []).map((item) => item.type))).map((value) => ({ label: value, value }))] }]} />
          {loading ? <LoadingState /> : error ? <ErrorState message={error.message} onRetry={retry} /> : <DataTable data={filtered} columns={columns} onRowSelect={setSelected} selectedId={selected?.id} />}
        </section>
      </div>
      {selected ? (
        <DetailDrawer title={selected.name} subtitle={<StatusBadge status={selected.connectionStatus} />} onClose={() => setSelected(null)}>
          <Tabs items={["Overview", "Assets (124)", "Lineage", "Projects (6)"]} active="Overview" onChange={() => undefined} />
          <div className="drawer-section">
            <div className="drawer-section__title"><h3>About this asset</h3><StatusBadge status="High Quality" /></div>
            <p>{selected.description}</p>
            <dl className="detail-list">
              <div><dt>Source Type</dt><dd>{selected.sourceType ?? selected.type}</dd></div>
              <div><dt>Environment</dt><dd>Production</dd></div>
              <div><dt>Host</dt><dd>sapprd01.acme.com</dd></div>
              <div><dt>Last Refreshed</dt><dd>{selected.lastRefreshed}</dd></div>
              <div><dt>Owner</dt><dd>{selected.owner.name}</dd></div>
            </dl>
          </div>
          <div className="drawer-section">
            <h3>Quality Summary</h3>
            <div className="drawer-score"><ScoreIndicator score={selected.qualityScore} size="large" label="High" /><dl><div><dt>Completeness</dt><dd>94%</dd></div><div><dt>Validity</dt><dd>91%</dd></div><div><dt>Consistency</dt><dd>89%</dd></div><div><dt>Timeliness</dt><dd>92%</dd></div></dl></div>
          </div>
          <div className="drawer-section"><h3>Top Assets</h3>{["LFA1 · Vendor General Data", "LFB1 · Vendor Company Code", "LFM1 · Vendor Purchasing Data"].map((item, index) => <div className="drawer-list-item" key={item}><span>{item}</span><strong>{98 - index * 2}%</strong></div>)}</div>
        </DetailDrawer>
      ) : null}
    </div>
  );
}
