import {
  Activity,
  BarChart3,
  Box,
  CheckCircle2,
  Database,
  Network,
  Settings,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { KpiCard } from "../../components/ui/KpiCard";

const routeMeta = {
  assets: {
    title: "Assets & Sources",
    description: "Review connected systems, selected assets, readiness, and coverage.",
    icon: Database,
  },
  graph: {
    title: "Graph & Model",
    description: "Explore assembled concepts, relationships, graph layers, and data models.",
    icon: Network,
  },
  build: {
    title: "Build & Govern",
    description: "Run governed assembly and review auditable recommendations.",
    icon: ShieldCheck,
  },
  quality: {
    title: "Quality & Monitoring",
    description: "Monitor semantic, provenance, governance, freshness, and retrieval quality.",
    icon: CheckCircle2,
  },
  publish: {
    title: "Publish & Serve",
    description: "Release governed packages through APIs, graph, vector, and MCP endpoints.",
    icon: UploadCloud,
  },
  usage: {
    title: "Usage & Insights",
    description: "Understand adoption, endpoint usage, consumers, and search outcomes.",
    icon: BarChart3,
  },
  activity: {
    title: "Activity",
    description: "Review user actions, agent runs, pipeline events, and approvals.",
    icon: Activity,
  },
  settings: {
    title: "Settings",
    description: "Manage synchronization, governance, lifecycle, and project configuration.",
    icon: Settings,
  },
} as const;

export function ProjectRouteFoundation() {
  const location = useLocation();
  const navigate = useNavigate();
  const key = location.pathname.split("/").at(-1);
  const isOverview = key === "customer-360";
  const meta =
    key && key in routeMeta
      ? routeMeta[key as keyof typeof routeMeta]
      : {
          title: "Project Overview",
          description:
            "Track assembly progress, trusted assets, relationships, quality, and the next governed action.",
          icon: Box,
        };
  const Icon = meta.icon;

  return (
    <div className="route-foundation">
      <div className="route-foundation__heading">
        <div>
          <h2>{meta.title}</h2>
          <p>{meta.description}</p>
        </div>
        {key === "graph" && (
          <Button onClick={() => navigate("/graph-explorer")} variant="primary">
            <Network aria-hidden="true" size={16} />
            Open Graph Explorer
          </Button>
        )}
      </div>
      {isOverview && (
        <div className="overview-kpis">
          <KpiCard icon={Database} label="Assets Ingested" note="Across 6 systems" tone="purple" value={71} />
          <KpiCard icon={Box} label="Entities" note="+142 this week" tone="green" trend="up" value="1,842" />
          <KpiCard icon={Network} label="Relationships" note="+256 this week" tone="blue" trend="up" value="3,974" />
          <KpiCard icon={ShieldCheck} label="Quality Score" note="Good" tone="orange" value="86%" />
        </div>
      )}
      <Card className="foundation-callout">
        <span className="icon-tile icon-tile--orange">
          <Icon aria-hidden="true" size={24} />
        </span>
        <div>
          <h3>{isOverview ? "Customer 360 assembly is in progress" : `${meta.title} route is ready`}</h3>
          <p>
            {isOverview
              ? "71 selected assets are being aligned into a governed knowledge layer with auditable provenance and policy coverage."
              : "The application shell, project context, tab state, and seeded contracts are in place for the next implementation slice."}
          </p>
        </div>
      </Card>
    </div>
  );
}
