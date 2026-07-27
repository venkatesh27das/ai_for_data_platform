import {
  CheckCircle2,
  Focus,
  Maximize2,
  Minus,
  Plus,
  Search,
  Tags,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  enterpriseGraphEdges,
  enterpriseGraphNodes,
  type EnterpriseGraphEdge,
  type EnterpriseGraphNode,
  type EnterpriseGraphNodeType,
} from "../../data/mock/graphPreviewFixtures";

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 440;

const nodeTypeClass: Record<EnterpriseGraphNodeType, string> = {
  Application: "application",
  "Business Entity": "entity",
  "Data Asset": "data",
  "Knowledge Product": "product",
  Policy: "policy",
  "Semantic Model": "semantic",
  "Source System": "source",
};

const nodeRadius: Record<EnterpriseGraphNodeType, number> = {
  Application: 21,
  "Business Entity": 19,
  "Data Asset": 22,
  "Knowledge Product": 28,
  Policy: 20,
  "Semantic Model": 21,
  "Source System": 20,
};

const shortNodeLabels: Record<string, string> = {
  account: "Account",
  address: "Address",
  "business-term": "Active Cust.",
  channel: "Channel",
  contract: "Contract",
  crm: "CRM",
  customer: "Customer",
  "customer-api": "Profile API",
  "customer-data-product": "C360 Data",
  databricks: "Lakehouse",
  "golden-party": "Golden Party",
  household: "Household",
  interaction: "Interaction",
  invoice: "Invoice",
  "knowledge-product": "C360 KP",
  mdm: "MDM",
  organization: "Org",
  payment: "Payment",
  "policy-document": "PII Standard",
  product: "Product",
  "retrieval-agent": "Eval Agent",
  "sales-copilot": "Sales AI",
  "semantic-model": "Semantic",
  "service-copilot": "Service AI",
  sharepoint: "Documents",
  subscription: "Subscription",
  "support-case": "Case",
  "consent-policy": "Consent",
};

const layerColor = {
  Domain: "#64748b",
  Governance: "#f97316",
  Lineage: "#3b82f6",
  Operational: "#0d9488",
  Semantic: "#8b5cf6",
};

function graphPath(edge: EnterpriseGraphEdge) {
  const source = enterpriseGraphNodes.find((node) => node.id === edge.source);
  const target = enterpriseGraphNodes.find((node) => node.id === edge.target);
  if (!source || !target) return "";
  const deltaX = target.position.x - source.position.x;
  const deltaY = target.position.y - source.position.y;
  const distance = Math.max(1, Math.hypot(deltaX, deltaY));
  const unitX = deltaX / distance;
  const unitY = deltaY / distance;
  const sourceOffset =
    (source.id === "customer" ? 30 : nodeRadius[source.type]) + 2;
  const targetOffset =
    (target.id === "customer" ? 30 : nodeRadius[target.type]) + 7;
  const sourceX = source.position.x + unitX * sourceOffset;
  const sourceY = source.position.y + unitY * sourceOffset;
  const targetX = target.position.x - unitX * targetOffset;
  const targetY = target.position.y - unitY * targetOffset;
  return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
}

function edgeLabelPosition(edge: EnterpriseGraphEdge) {
  const source = enterpriseGraphNodes.find((node) => node.id === edge.source);
  const target = enterpriseGraphNodes.find((node) => node.id === edge.target);
  return {
    x: ((source?.position.x ?? 0) + (target?.position.x ?? 0)) / 2,
    y: ((source?.position.y ?? 0) + (target?.position.y ?? 0)) / 2 - 7,
  };
}

const labeledEdgeIds = new Set([
  "e5",
  "e6",
  "e8",
  "e9",
  "e11",
  "e12",
  "e13",
  "e16",
  "e19",
  "e20",
  "e21",
  "e33",
]);

export function KnowledgeGraphPreview() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("customer");
  const [zoom, setZoom] = useState(1);
  const [focusSelected, setFocusSelected] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  const selectedNode = useMemo(
    () =>
      enterpriseGraphNodes.find((node) => node.id === selectedId) ??
      enterpriseGraphNodes[0],
    [selectedId],
  );
  const selectedConnections = useMemo(
    () =>
      enterpriseGraphEdges.filter(
        (edge) => edge.source === selectedId || edge.target === selectedId,
      ).length,
    [selectedId],
  );

  const transform = useMemo(() => {
    const center = focusSelected
      ? selectedNode.position
      : { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };
    const translateX = VIEWBOX_WIDTH / 2 - center.x * zoom;
    const translateY = VIEWBOX_HEIGHT / 2 - center.y * zoom;
    return `translate(${translateX} ${translateY}) scale(${zoom})`;
  }, [focusSelected, selectedNode.position, zoom]);

  const selectNode = (node: EnterpriseGraphNode) => {
    setSelectedId(node.id);
  };

  const handleSearch = () => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return;
    const match = enterpriseGraphNodes.find((node) =>
      `${node.label} ${node.type} ${node.domain} ${node.source}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
    if (!match) return;
    setSelectedId(match.id);
    setZoom(1.25);
    setFocusSelected(true);
  };

  const adjustZoom = (nextZoom: number) => {
    setZoom(Math.min(1.55, Math.max(0.85, nextZoom)));
  };

  return (
    <div className="enterprise-graph">
      <div className="enterprise-graph__toolbar">
        <label className="graph-search">
          <Search aria-hidden="true" size={14} />
          <input
            aria-label="Search graph"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
            placeholder="Search entity, asset, policy, or application"
            value={query}
          />
        </label>
        <div className="graph-toolbar-actions">
          <button
            aria-label="Zoom out"
            onClick={() => adjustZoom(zoom - 0.12)}
            type="button"
          >
            <Minus aria-hidden="true" size={15} />
          </button>
          <button
            aria-label="Zoom in"
            onClick={() => adjustZoom(zoom + 0.12)}
            type="button"
          >
            <Plus aria-hidden="true" size={15} />
          </button>
          <button
            aria-label="Fit graph to screen"
            onClick={() => {
              setFocusSelected(false);
              setZoom(1);
            }}
            type="button"
          >
            <Maximize2 aria-hidden="true" size={14} />
            Fit
          </button>
          <button
            aria-label="Focus selected node"
            onClick={() => {
              setFocusSelected(true);
              setZoom(1.25);
            }}
            type="button"
          >
            <Focus aria-hidden="true" size={14} />
            Focus
          </button>
          <button
            aria-label={showEdgeLabels ? "Hide relationship labels" : "Show relationship labels"}
            aria-pressed={showEdgeLabels}
            className={showEdgeLabels ? "is-active" : ""}
            onClick={() => setShowEdgeLabels((visible) => !visible)}
            type="button"
          >
            <Tags aria-hidden="true" size={14} />
            Labels
          </button>
        </div>
      </div>

      <div className="enterprise-graph__body">
        <div className="enterprise-graph__canvas-shell">
          <svg
            aria-label="Interactive Customer 360 enterprise knowledge graph"
            className="enterprise-graph__canvas"
            role="img"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          >
            <defs>
              {Object.entries(layerColor).map(([layer, color]) => (
                <marker
                  id={`arrow-${layer.toLowerCase()}`}
                  key={layer}
                  markerHeight="7"
                  markerUnits="strokeWidth"
                  markerWidth="7"
                  orient="auto"
                  refX="7"
                  refY="3.5"
                  viewBox="0 0 7 7"
                >
                  <path d="M 0 0 L 7 3.5 L 0 7 z" fill={color} />
                </marker>
              ))}
            </defs>

            <g className="graph-network" transform={transform}>
              <g className="graph-edges">
                {enterpriseGraphEdges.map((edge) => {
                  const labelPosition = edgeLabelPosition(edge);
                  const labelWidth = Math.max(42, edge.label.length * 5.2);
                  const isSelectedRelationship =
                    edge.source === selectedId || edge.target === selectedId;
                  return (
                    <g
                      className={`graph-edge graph-edge--${edge.layer.toLowerCase()}${isSelectedRelationship ? " is-related" : ""}`}
                      key={edge.id}
                    >
                      <path
                        d={graphPath(edge)}
                        markerEnd={`url(#arrow-${edge.layer.toLowerCase()})`}
                        stroke={layerColor[edge.layer]}
                      />
                      {showEdgeLabels &&
                        (labeledEdgeIds.has(edge.id) ||
                          isSelectedRelationship) && (
                        <g
                          className="graph-edge__label"
                          transform={`translate(${labelPosition.x} ${labelPosition.y})`}
                        >
                          <rect
                            height="15"
                            rx="4"
                            width={labelWidth}
                            x={-labelWidth / 2}
                            y="-9"
                          />
                          <text textAnchor="middle">{edge.label}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              <g className="graph-nodes">
                {enterpriseGraphNodes.map((node) => {
                  const radius =
                    node.id === "customer" ? 30 : nodeRadius[node.type];
                  const isSelected = selectedId === node.id;
                  return (
                    <g
                      aria-label={`${node.label}, ${node.type}`}
                      className={`graph-svg-node graph-svg-node--${nodeTypeClass[node.type]}${isSelected ? " is-selected" : ""}`}
                      key={node.id}
                      onClick={() => selectNode(node)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectNode(node);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      transform={`translate(${node.position.x} ${node.position.y})`}
                    >
                      <title>{`${node.label} · ${node.type} · ${node.source}`}</title>
                      <circle className="graph-svg-node__selection" r={radius + 5} />
                      <circle className="graph-svg-node__surface" r={radius} />
                      <text textAnchor="middle" y="2.5">
                        {shortNodeLabels[node.id] ?? node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>

          <div className="enterprise-graph__legend" aria-label="Graph legend">
            <span className="legend-entity">Business entity</span>
            <span className="legend-data">Data & semantic</span>
            <span className="legend-policy">Governance</span>
            <span className="legend-product">Knowledge product</span>
            <span className="legend-application">Application</span>
          </div>
        </div>

        <aside className="graph-inspector" aria-label="Selected graph node">
          <div className="graph-inspector__eyebrow">
            <span>{selectedNode.type}</span>
            {selectedNode.authoritative && (
              <em>
                <CheckCircle2 aria-hidden="true" size={12} />
                Authoritative
              </em>
            )}
          </div>
          <h4>{selectedNode.label}</h4>
          <p>{selectedNode.description}</p>
          <dl>
            <div>
              <dt>Domain</dt>
              <dd>{selectedNode.domain}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{selectedNode.source}</dd>
            </div>
            <div>
              <dt>Trust</dt>
              <dd>{selectedNode.trust}%</dd>
            </div>
            <div>
              <dt>Quality</dt>
              <dd>{selectedNode.quality}%</dd>
            </div>
            <div>
              <dt>Connections</dt>
              <dd>{selectedConnections}</dd>
            </div>
          </dl>
          <div className="graph-inspector__provenance">
            <strong>Provenance</strong>
            <span>{selectedNode.source} → Customer 360</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
