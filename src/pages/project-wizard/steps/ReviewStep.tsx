import {
  CheckCircle2,
  Database,
  Edit3,
  Globe2,
  Layers3,
  Network,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { ProjectSummaryPanel } from "../../../components/wizard/ProjectSummaryPanel";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import {
  executionStages,
  owners,
  sourceSystems,
} from "../../../data/mock/wizardFixtures";
import { useNewProjectStore } from "../../../stores/newProjectStore";

interface ReviewStepProps {
  onEdit: (step: number) => void;
}

export function ReviewStep({ onEdit }: ReviewStepProps) {
  const {
    acceptanceCriteria,
    accessEntries,
    assets,
    businessObjective,
    domain,
    expectedProduct,
    informationTypes,
    policies,
    policyTags,
    projectName,
    sensitivity,
    subdomains,
    successMetrics,
    targetConsumers,
  } = useNewProjectStore();
  const selectedAssets = assets.filter((asset) => asset.selected);
  const selectedAssetCount = selectedAssets.reduce(
    (total, asset) => total + asset.assetCount,
    0,
  );

  return (
    <div className="review-layout">
      <div className="review-main">
        <Card className="review-section">
          <ReviewHeading title="1. Project Overview" onEdit={() => onEdit(0)} />
          <div className="review-overview-grid">
            <div>
              <small>Project Name</small>
              <strong>{projectName}</strong>
            </div>
            <div>
              <small>Business Objective</small>
              <p>{businessObjective}</p>
            </div>
            <div>
              <small>Domain</small>
              <strong>{domain}</strong>
            </div>
            <div className="review-span-2">
              <small>Sub-domains</small>
              <div className="summary-badges">
                {subdomains.map((item) => (
                  <Badge key={item} tone="slate" outline>
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <small>Target Consumers</small>
              <div className="summary-badges">
                {targetConsumers.map((item) => (
                  <Badge key={item} tone="slate" outline>
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="review-span-full">
              <small>Expected Knowledge Product</small>
              <strong>{expectedProduct}</strong>
            </div>
          </div>
        </Card>

        <div className="review-two-column">
          <Card className="review-section">
            <ReviewHeading
              title="2. Selected Sources & Assets"
              onEdit={() => onEdit(1)}
            />
            <div className="review-source-logos">
              {sourceSystems.slice(0, 7).map((source) => (
                <span key={source.id}>
                  <Database size={13} />
                  {source.name.replace(" Unity Catalog", "").replace(" Data Catalog", "")}
                </span>
              ))}
            </div>
            <div className="review-stat-strip">
              <span><Database size={14} /><strong>7</strong><small>Source Systems</small></span>
              <span><Layers3 size={14} /><strong>{selectedAssetCount}</strong><small>Selected Assets</small></span>
              <span><Globe2 size={14} /><strong>2</strong><small>Domains Covered</small></span>
              <span><Target size={14} /><strong>~210</strong><small>Estimated Concepts</small></span>
              <span><Network size={14} /><strong>~620</strong><small>Relationships</small></span>
            </div>
            <table className="data-table review-assets-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Knowledge Role</th>
                </tr>
              </thead>
              <tbody>
                {selectedAssets.slice(0, 7).map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.name}</td>
                    <td>{asset.type}</td>
                    <td>{asset.source}</td>
                    <td>{asset.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="card-link" onClick={() => onEdit(1)} type="button">
              View all {selectedAssetCount} assets
            </button>
          </Card>

          <div className="review-stack">
            <Card className="review-section">
              <ReviewHeading
                title="3. Success Criteria Summary"
                onEdit={() => onEdit(2)}
              />
              <div className="review-metrics">
                <ul>
                  {successMetrics.slice(0, 7).map((metric) => (
                    <li key={metric.id}>
                      <span>{metric.name}</span>
                      <strong>{metric.target}</strong>
                    </li>
                  ))}
                </ul>
                <ul className="review-acceptance">
                  {acceptanceCriteria
                    .filter((criterion) => criterion.selected)
                    .slice(0, 4)
                    .map((criterion) => (
                      <li key={criterion.id}>
                        <CheckCircle2 size={13} />
                        {criterion.label}
                      </li>
                    ))}
                </ul>
              </div>
            </Card>
            <Card className="review-section">
              <ReviewHeading
                title="4. Governance & Access Summary"
                onEdit={() => onEdit(3)}
              />
              <div className="review-governance">
                <div>
                  <small>Default Sensitivity</small>
                  <strong>
                    <span className="status-dot status-dot--amber" />
                    {sensitivity}
                  </strong>
                </div>
                <div>
                  <small>Policy Tags</small>
                  <div className="summary-badges">
                    {policyTags.map((tag) => (
                      <Badge key={tag} tone="slate" outline>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="review-span-full">
                  <small>Owners</small>
                  <div className="review-owner-row">
                    {owners.map((owner) => (
                      <span key={owner.role}>
                        <em className={`owner-avatar owner-avatar--${owner.tone}`}>
                          {owner.initials}
                        </em>
                        <span>
                          <strong>{owner.name}</strong>
                          <small>{owner.role}</small>
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <small>Access Groups</small>
                  <strong>
                    <Users size={14} /> {accessEntries.length} groups configured
                  </strong>
                </div>
                <div>
                  <small>Policies</small>
                  <strong>
                    <ShieldCheck size={14} />{" "}
                    {policies.filter((policy) => policy.selected).length} enabled
                  </strong>
                </div>
                <div>
                  <small>Information Types</small>
                  <strong>{informationTypes.length} classified</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="review-section execution-plan-card">
          <div className="review-section__heading">
            <h2>5. Project Execution Plan</h2>
          </div>
          <div className="execution-plan">
            {executionStages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.name}>
                  <span className="execution-number">{index + 1}</span>
                  <Icon aria-hidden="true" size={18} />
                  <strong>{stage.name}</strong>
                  <p>{stage.description}</p>
                  <small>Agent: {stage.agent}</small>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <aside className="review-aside">
        <ProjectSummaryPanel mode="review" onEdit={() => onEdit(0)} />
        <Card className="review-governance-summary">
          <h2>Governance Summary</h2>
          <dl className="summary-compact">
            <div><dt>Default Sensitivity</dt><dd>{sensitivity}</dd></div>
            <div><dt>Approval Workflow</dt><dd>Enabled</dd></div>
            <div><dt>Access Groups</dt><dd>{accessEntries.length}</dd></div>
            <div><dt>Policy Count</dt><dd>{policies.filter((policy) => policy.selected).length}</dd></div>
          </dl>
        </Card>
        <Card className="readiness-check-card">
          <h2>Readiness Check</h2>
          <ul>
            {[
              "Scope complete",
              "Assets selected",
              "Metrics defined",
              "Governance configured",
            ].map((item) => (
              <li key={item}><CheckCircle2 size={15} /> {item}</li>
            ))}
          </ul>
          <p>
            Initial build may require steward review for low-confidence mappings.
          </p>
        </Card>
      </aside>
    </div>
  );
}

function ReviewHeading({
  onEdit,
  title,
}: {
  onEdit: () => void;
  title: string;
}) {
  return (
    <div className="review-section__heading">
      <h2>{title}</h2>
      <button onClick={onEdit} type="button">
        <Edit3 aria-hidden="true" size={13} /> Edit
      </button>
    </div>
  );
}
