import { Box, Database, Network, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const globalRouteMeta = {
  "/assets": {
    title: "Enterprise Assets",
    description: "Discover, filter, and connect assets from enterprise systems.",
    icon: Database,
  },
  "/products": {
    title: "Knowledge Products",
    description: "Inspect governed knowledge products, releases, endpoints, and consumers.",
    icon: Box,
  },
  "/graph-explorer": {
    title: "Enterprise Graph Explorer",
    description: "Explore metadata, lineage, semantic, domain, governance, and operational layers.",
    icon: Network,
  },
  "/administration": {
    title: "Administration",
    description: "Manage environments, integrations, access, and deterministic demo data.",
    icon: Settings,
  },
} as const;

export function RouteFoundationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const meta =
    globalRouteMeta[location.pathname as keyof typeof globalRouteMeta] ??
    globalRouteMeta["/assets"];
  const Icon = meta.icon;

  return (
    <div className="page route-page">
      <div className="route-page__header">
        <div>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
        {location.pathname === "/graph-explorer" && (
          <Button onClick={() => navigate("/projects/customer-360/graph")}>
            Back to project
          </Button>
        )}
      </div>
      <Card className="foundation-callout foundation-callout--large">
        <span className="icon-tile icon-tile--orange">
          <Icon aria-hidden="true" size={26} />
        </span>
        <div>
          <h2>Foundation established</h2>
          <p>
            This required route is connected to the shared shell and ready for
            its screenshot-matched functional slice.
          </p>
        </div>
      </Card>
    </div>
  );
}
