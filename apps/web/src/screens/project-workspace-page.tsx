"use client";

import { Activity, ArrowLeft, Boxes, Database, Network, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, Card, MetricCard, PageHeader, ProgressBar, StatusBadge, Tabs } from "@/src/components/ui";

export function ProjectWorkspacePage({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState("Overview");
  return (
    <div className="page">
      <Link className="back-link" href="/projects"><ArrowLeft size={14} /> Back to Projects</Link>
      <PageHeader title="Supplier Risk Knowledge Graph" description={`Project ${projectId} · Procurement knowledge workspace`} actions={<><StatusBadge status="Active" /><Button><Activity size={16} /> Run Assessment</Button></>} />
      <Tabs items={["Overview", "Sources", "Knowledge Design", "Build & Review", "Test & Improve", "Publish & Serve", "Operations"]} active={tab} onChange={setTab} label="Project workspace sections" />
      <div className="metrics-grid metrics-grid--five workspace-metrics">
        <MetricCard label="Project Readiness" value="92%" caption="Ready to build" icon={<Sparkles />} tone="success" />
        <MetricCard label="Connected Sources" value="6" caption="All healthy" icon={<Database />} tone="info" />
        <MetricCard label="Selected Assets" value="24" caption="2 need classification" icon={<Boxes />} tone="warning" />
        <MetricCard label="Scenario Pass Rate" value="84%" caption="4 tests configured" icon={<Activity />} tone="warning" />
        <MetricCard label="Policy Coverage" value="94%" caption="5 policies applied" icon={<ShieldCheck />} tone="success" />
      </div>
      <div className="workspace-grid">
        <Card title="Recommended Next Actions">
          {[
            ["Complete asset classification", "2 supplier finance assets need stewardship review.", "warning"],
            ["Generate knowledge blueprint", "Create the first ontology and source mapping proposal.", "ai"],
            ["Run baseline scenarios", "Validate risk, contract and evidence questions.", "success"],
          ].map(([title, detail, tone]) => <article className="workspace-action" key={title}><span className={`tone-bg--${tone}`}><Sparkles size={17} /></span><div><strong>{title}</strong><p>{detail}</p></div><Button variant="secondary" size="compact">Open</Button></article>)}
        </Card>
        <Card title="Architecture Snapshot">
          <div className="architecture-flow"><span><Database />6 Sources</span><b>→</b><span><Network />Domain Graph</span><b>→</b><span><Boxes />Context APIs</span></div>
          <div className="architecture-stat"><span>Ontology coverage</span><ProgressBar value={88} /><strong>88%</strong></div>
          <div className="architecture-stat"><span>Evidence completeness</span><ProgressBar value={73} /><strong>73%</strong></div>
        </Card>
        <Card title="Risks & Blockers">
          <div className="risk-list"><p><StatusBadge status="Warning" /> Two assets need classification review</p><p><StatusBadge status="Needs Attention" /> Financial risk thresholds not yet defined</p><p><StatusBadge status="On Track" /> Source authority confirmed for supplier identity</p></div>
        </Card>
      </div>
    </div>
  );
}
