import {
  Boxes,
  Database,
  Globe2,
  Layers3,
  Network,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { useNewProjectStore } from "../../stores/newProjectStore";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface ProjectSummaryPanelProps {
  mode?: "scope" | "standard" | "governance" | "review";
  onEdit?: () => void;
}

export function ProjectSummaryPanel({
  mode = "standard",
  onEdit,
}: ProjectSummaryPanelProps) {
  const {
    accessEntries,
    assets,
    domain,
    policies,
    projectName,
    requireStewardApproval,
    sensitivity,
    successMetrics,
    targetConsumers,
  } = useNewProjectStore();
  const selectedAssets = assets.filter((asset) => asset.selected);
  const selectedAssetCount = selectedAssets.reduce(
    (total, asset) => total + asset.assetCount,
    0,
  );
  const sourceCount = new Set(selectedAssets.map((asset) => asset.source)).size;
  const criticalCount = successMetrics.filter(
    (metric) => metric.criticality === "Critical",
  ).length;
  const highCount = successMetrics.filter(
    (metric) => metric.criticality === "High",
  ).length;

  return (
    <Card className="wizard-summary-card">
      <div className="wizard-summary-card__heading">
        <h2>Project Summary</h2>
        {onEdit && (
          <button onClick={onEdit} type="button">
            Edit
          </button>
        )}
      </div>

      {mode !== "scope" && (
        <div className="summary-project">
          <span className="summary-project__icon">
            <Network aria-hidden="true" size={22} />
          </span>
          <div>
            <strong>{projectName}</strong>
            <small>{domain} Domain</small>
          </div>
        </div>
      )}

      <dl className="summary-list summary-list--icons">
        {mode === "scope" ? (
          <>
            <div>
              <dt>
                <Globe2 aria-hidden="true" size={15} /> Domain
              </dt>
              <dd>{domain}</dd>
            </div>
            <div>
              <dt>
                <Users aria-hidden="true" size={15} /> Consumers
              </dt>
              <dd>{targetConsumers.length} consumer types</dd>
            </div>
            <div>
              <dt>
                <Layers3 aria-hidden="true" size={15} /> Planned Graph Layers
              </dt>
              <dd>Metadata + Lineage + Semantic + Domain</dd>
            </div>
            <div>
              <dt>
                <ShieldCheck aria-hidden="true" size={15} /> Data Sensitivity
              </dt>
              <dd>
                {sensitivity} <Badge tone="red">High</Badge>
              </dd>
            </div>
            <div>
              <dt>
                <Database aria-hidden="true" size={15} /> Estimated Assets
              </dt>
              <dd>~71 candidate assets</dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>
                <Boxes aria-hidden="true" size={15} /> Source Systems
              </dt>
              <dd>{sourceCount || 6}</dd>
            </div>
            <div>
              <dt>
                <Database aria-hidden="true" size={15} /> Selected Assets
              </dt>
              <dd>{selectedAssetCount}</dd>
            </div>
            <div>
              <dt>
                <Globe2 aria-hidden="true" size={15} /> Domains Covered
              </dt>
              <dd>2</dd>
            </div>
            <div>
              <dt>
                <Target aria-hidden="true" size={15} /> Estimated Concepts
              </dt>
              <dd>~210</dd>
            </div>
            <div>
              <dt>
                <Network aria-hidden="true" size={15} /> Estimated Relationships
              </dt>
              <dd>~620</dd>
            </div>
          </>
        )}
      </dl>

      {mode === "governance" && (
        <div className="summary-section">
          <h3>Governance Summary</h3>
          <dl className="summary-compact">
            <div>
              <dt>Default Sensitivity</dt>
              <dd>
                <span className="status-dot status-dot--amber" />
                {sensitivity}
              </dd>
            </div>
            <div>
              <dt>Policy Tags</dt>
              <dd>4</dd>
            </div>
            <div>
              <dt>Owners Assigned</dt>
              <dd>4</dd>
            </div>
            <div>
              <dt>Access Groups</dt>
              <dd>{accessEntries.length}</dd>
            </div>
            <div>
              <dt>Approval Workflow</dt>
              <dd>{requireStewardApproval ? "Enabled" : "Disabled"}</dd>
            </div>
          </dl>
          <h3>Key Policies</h3>
          <ul className="summary-checks">
            {policies
              .filter((policy) => policy.selected)
              .slice(0, 4)
              .map((policy) => (
                <li key={policy.id}>
                  <ShieldCheck aria-hidden="true" size={14} />
                  <span>{policy.name}</span>
                  <small>Enabled</small>
                </li>
              ))}
          </ul>
        </div>
      )}

      {mode === "review" && (
        <>
          <div className="summary-section">
            <h3>Graph Layers Planned</h3>
            <div className="summary-badges">
              {["Metadata", "Lineage", "Semantic", "Domain", "Operational"].map(
                (layer) => (
                  <Badge key={layer} tone="slate" outline>
                    {layer}
                  </Badge>
                ),
              )}
            </div>
          </div>
          <div className="summary-section">
            <h3>Success Metrics</h3>
            <dl className="summary-compact">
              <div>
                <dt>
                  <span className="status-dot status-dot--red" />
                  Critical
                </dt>
                <dd>{criticalCount}</dd>
              </div>
              <div>
                <dt>
                  <span className="status-dot status-dot--orange" />
                  High
                </dt>
                <dd>{highCount}</dd>
              </div>
              <div>
                <dt>
                  <span className="status-dot status-dot--amber" />
                  Medium
                </dt>
                <dd>{successMetrics.length - criticalCount - highCount}</dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </Card>
  );
}
