"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Boxes, Plus, Rocket, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, DataTable, DetailDrawer, ErrorState, FilterBar, LoadingState, MetricCard, PageHeader, ScoreIndicator, StatusBadge, Tabs } from "@/src/components/ui";
import { useMockData } from "@/src/hooks/use-mock-data";
import type { KnowledgeProduct } from "@/src/models";
import { mockServices } from "@/src/services/mock-services";

export function ProductsPage() {
  const { data, error, loading, retry } = useMockData("products", mockServices.products.list);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<KnowledgeProduct | null>(null);
  const filtered = (data ?? []).filter((item) => !search || `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  const columns = useMemo<ColumnDef<KnowledgeProduct>[]>(
    () => [
      { accessorKey: "name", header: "Product Name", cell: ({ row }) => <div className="primary-cell primary-cell--icon"><span className="record-icon tone-bg--ai"><Boxes size={16} /></span><span><strong>{row.original.name}</strong><small>{row.original.description}</small></span></div> },
      { accessorKey: "domain", header: "Domain" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "releaseVersion", header: "Version" },
      { accessorKey: "qualityScore", header: "Quality Score", cell: ({ getValue }) => <ScoreIndicator score={Number(getValue())} /> },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      { accessorKey: "updatedAt", header: "Last Updated", cell: () => <span className="compact-date">May 20, 2025<br />10:30 AM</span> },
      { accessorKey: "owner.name", header: "Owner" },
      { accessorKey: "consumers", header: "Consumers" },
    ],
    [],
  );
  return (
    <div className="page page--with-drawer">
      <div className="page__primary">
        <PageHeader title="Knowledge Products" description="Discover, consume and manage published knowledge products for AI and analytics applications." actions={<><Button><Plus size={16} /> Publish New Product</Button><Button variant="outline">Import / Register</Button></>} />
        <div className="metrics-grid metrics-grid--five">
          <MetricCard label="Published" value="28" caption="Ready to use" icon={<Boxes />} tone="ai" />
          <MetricCard label="In Development" value="6" caption="Building & testing" icon={<Rocket />} tone="warning" />
          <MetricCard label="Under Review" value="8" caption="Pending approval" icon={<Sparkles />} tone="info" />
          <MetricCard label="Deprecated" value="3" caption="Will be retired" icon={<ShieldCheck />} tone="warning" />
          <MetricCard label="Avg. Quality Score" value="96%" caption="Across published" icon={<Search />} tone="info" />
        </div>
        <section className="table-card">
          <FilterBar search={search} onSearchChange={setSearch} placeholder="Search products…" />
          {loading ? <LoadingState /> : error ? <ErrorState message={error.message} onRetry={retry} /> : <DataTable data={filtered} columns={columns} onRowSelect={setSelected} selectedId={selected?.id} />}
        </section>
      </div>
      {selected ? (
        <DetailDrawer title={selected.name} subtitle={<><span>Version {selected.releaseVersion}</span> <StatusBadge status={selected.status} /></>} onClose={() => setSelected(null)}>
          <Tabs items={["Overview", "Schema", "APIs & Access", "Lineage", "Usage"]} active="Overview" onChange={() => undefined} />
          <div className="drawer-section"><h3>About this product</h3><p>{selected.description}.</p><dl className="detail-list"><div><dt>Product Type</dt><dd>{selected.type}</dd></div><div><dt>Domain</dt><dd>{selected.domain}</dd></div><div><dt>Quality Score</dt><dd>{selected.qualityScore}/100</dd></div><div><dt>Freshness SLA</dt><dd>{selected.freshnessSla}</dd></div><div><dt>Source Systems</dt><dd>{selected.sourceSystems}</dd></div><div><dt>Owner</dt><dd>{selected.owner.name}</dd></div></dl></div>
          <div className="drawer-section"><h3>Capabilities</h3><div className="capability-grid">{selected.capabilities.map((capability) => <span key={capability}><Sparkles size={17} />{capability}</span>)}</div></div>
          <div className="drawer-section"><h3>Top Consumers</h3>{["Supplier Risk Copilot", "Procurement Risk Dashboard", "Contract Review Agent"].map((item, index) => <div className="drawer-list-item" key={item}><span>{item}</span><strong>{84 - index * 12}%</strong></div>)}</div>
        </DetailDrawer>
      ) : null}
    </div>
  );
}
