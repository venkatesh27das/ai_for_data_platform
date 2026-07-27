import {
  Check,
  CirclePlus,
  ClipboardCheck,
  Info,
  Target,
  Trash2,
} from "lucide-react";
import { ProjectSummaryPanel } from "../../../components/wizard/ProjectSummaryPanel";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { useNewProjectStore } from "../../../stores/newProjectStore";
import type { SuccessMetric } from "../../../types/wizard";

const criticalityTone = {
  Critical: "red",
  High: "orange",
  Medium: "amber",
} as const;

export function SuccessCriteriaStep() {
  const {
    acceptanceCriteria,
    addMetric,
    businessObjective,
    removeMetric,
    setField,
    successMetrics,
    toggleCriterion,
    updateMetric,
  } = useNewProjectStore();
  const criticalCount = successMetrics.filter(
    (metric) => metric.criticality === "Critical",
  ).length;
  const highCount = successMetrics.filter(
    (metric) => metric.criticality === "High",
  ).length;
  const mediumCount = successMetrics.length - criticalCount - highCount;

  return (
    <div className="criteria-layout">
      <div className="criteria-main">
        <Card className="criteria-card">
          <section className="criteria-section">
            <div className="numbered-heading">
              <span>1</span>
              <div>
                <h2>Business Objectives</h2>
                <p>What business outcomes should this knowledge layer enable?</p>
              </div>
            </div>
            <label className="objective-textarea">
              <span className="sr-only">Business outcomes</span>
              <textarea
                aria-label="Business outcomes"
                maxLength={1000}
                onChange={(event) =>
                  setField("businessObjective", event.target.value)
                }
                value={businessObjective}
              />
              <small>{businessObjective.length} / 1000</small>
            </label>
          </section>

          <section className="criteria-section">
            <div className="numbered-heading">
              <span>2</span>
              <div>
                <h2>Key Success Metrics</h2>
                <p>Define the measurable quality and performance targets.</p>
              </div>
            </div>
            <div className="metrics-table-wrap">
              <table className="data-table metrics-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Target</th>
                    <th>Measurement Method</th>
                    <th>Criticality</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {successMetrics.map((metric) => (
                    <MetricRow
                      key={metric.id}
                      metric={metric}
                      onRemove={() => removeMetric(metric.id)}
                      onUpdate={(field, value) =>
                        updateMetric(metric.id, field, value)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <button className="add-metric-button" onClick={addMetric} type="button">
              <CirclePlus aria-hidden="true" size={15} /> Add Success Metric
            </button>
          </section>

          <section className="criteria-section">
            <div className="numbered-heading">
              <span>3</span>
              <div>
                <h2>Acceptance Criteria</h2>
                <p>
                  Define the conditions that must be met before this knowledge
                  layer is ready for publication.
                </p>
              </div>
            </div>
            <div className="acceptance-grid">
              {acceptanceCriteria.map((criterion) => (
                <label key={criterion.id}>
                  <button
                    aria-checked={criterion.selected}
                    aria-label={criterion.label}
                    className={`check-control${criterion.selected ? " check-control--checked" : ""}`}
                    onClick={() => toggleCriterion(criterion.id)}
                    role="checkbox"
                    type="button"
                  >
                    {criterion.selected && <Check size={12} />}
                  </button>
                  <span>{criterion.label}</span>
                </label>
              ))}
            </div>
          </section>
        </Card>
      </div>

      <aside className="criteria-aside">
        <ProjectSummaryPanel />
        <Card className="metric-summary-card">
          <h2>Key Success Metrics</h2>
          <div className="metric-summary-chart">
            <span className="metric-donut">
              <strong>{successMetrics.length}</strong>
              <small>Total Metrics</small>
            </span>
            <ul>
              <li><span className="status-dot status-dot--red" /> Critical <strong>{criticalCount}</strong></li>
              <li><span className="status-dot status-dot--orange" /> High <strong>{highCount}</strong></li>
              <li><span className="status-dot status-dot--amber" /> Medium <strong>{mediumCount}</strong></li>
              <li><span className="status-dot status-dot--green" /> Low <strong>0</strong></li>
            </ul>
          </div>
        </Card>
        <Card className="criteria-note-card">
          <ClipboardCheck aria-hidden="true" size={18} />
          <div>
            <h3>Publication gate</h3>
            <p>
              Critical metrics and selected acceptance criteria will become
              governed release checks.
            </p>
          </div>
        </Card>
      </aside>
    </div>
  );
}

interface MetricRowProps {
  metric: SuccessMetric;
  onRemove: () => void;
  onUpdate: (
    field: "target" | "method" | "criticality",
    value: string,
  ) => void;
}

function MetricRow({ metric, onRemove, onUpdate }: MetricRowProps) {
  return (
    <tr>
      <td>
        <span className="metric-name">
          <span className={`metric-icon icon-tile--${metric.tone}`}>
            <Target aria-hidden="true" size={15} />
          </span>
          <span>
            <strong>{metric.name}</strong>
            <small>{metric.description}</small>
          </span>
        </span>
      </td>
      <td>
        <input
          aria-label={`${metric.name} target`}
          onChange={(event) => onUpdate("target", event.target.value)}
          value={metric.target}
        />
      </td>
      <td>
        <select
          aria-label={`${metric.name} measurement method`}
          onChange={(event) => onUpdate("method", event.target.value)}
          value={metric.method}
        >
          <option>{metric.method}</option>
          <option>Automated Quality Check</option>
          <option>Human Review</option>
          <option>Operational Monitoring</option>
        </select>
      </td>
      <td>
        <label className="criticality-select">
          <Badge tone={criticalityTone[metric.criticality]}>
            {metric.criticality}
          </Badge>
          <select
            aria-label={`${metric.name} criticality`}
            onChange={(event) => onUpdate("criticality", event.target.value)}
            value={metric.criticality}
          >
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
          </select>
        </label>
      </td>
      <td>
        <button
          aria-label={`Remove ${metric.name}`}
          className="icon-action"
          onClick={onRemove}
          type="button"
        >
          <Trash2 aria-hidden="true" size={14} />
        </button>
        <Info className="metric-info" size={13} />
      </td>
    </tr>
  );
}
