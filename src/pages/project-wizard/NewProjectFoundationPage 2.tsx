import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const steps = [
  "Scope & Domains",
  "Sources & Assets",
  "Success Criteria",
  "Governance & Access",
  "Review & Create",
];

export function NewProjectFoundationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState("Customer 360 Knowledge Layer");

  return (
    <div className="page wizard-page">
      <div className="breadcrumbs">
        <button onClick={() => navigate("/projects")} type="button">
          Knowledge Projects
        </button>
        <span>/</span>
        <span>New Knowledge Project</span>
      </div>
      <div className="wizard-title-row">
        <div>
          <h1>New Knowledge Project</h1>
          <p>
            Define the business scope and initialize a governed enterprise
            knowledge-layer project.
          </p>
        </div>
        <Button onClick={() => navigate("/projects")} variant="secondary">
          Save Draft
        </Button>
      </div>

      <ol className="wizard-steps" aria-label="Project creation steps">
        {steps.map((step, index) => (
          <li
            aria-current={index === currentStep ? "step" : undefined}
            className={
              index === currentStep
                ? "wizard-step wizard-step--active"
                : index < currentStep
                  ? "wizard-step wizard-step--complete"
                  : "wizard-step"
            }
            key={step}
          >
            <span>{index < currentStep ? <Check size={14} /> : index + 1}</span>
            <strong>{step}</strong>
          </li>
        ))}
      </ol>

      <div className="wizard-layout">
        <Card className="wizard-form-card">
          <h2>{steps[currentStep]}</h2>
          {currentStep === 0 ? (
            <div className="form-grid">
              <label className="field field--full">
                <span>Project Name</span>
                <input
                  onChange={(event) => setProjectName(event.target.value)}
                  value={projectName}
                />
              </label>
              <label className="field field--full">
                <span>Business Objective</span>
                <textarea defaultValue="Create a unified and governed Customer 360 knowledge layer that connects customer identity, accounts, products, subscriptions, interactions, support cases, policies, consent, documents, operational events, and provenance." />
              </label>
              <label className="field">
                <span>Domain</span>
                <select defaultValue="Customer Service">
                  <option>Customer Service</option>
                </select>
              </label>
              <label className="field">
                <span>Expected Knowledge Product</span>
                <select defaultValue="Knowledge Graph + Retrieval Package">
                  <option>Knowledge Graph + Retrieval Package</option>
                </select>
              </label>
              <div className="field field--full">
                <span>Sub-domains</span>
                <div className="chip-list">
                  {["Customer", "Account", "Product", "Subscription", "Interaction", "Support", "Consent", "Policy"].map(
                    (item) => (
                      <button key={item} type="button">
                        {item} <span aria-hidden="true">×</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              <label className="field">
                <span>Primary Data Sensitivity</span>
                <select defaultValue="Confidential / PII">
                  <option>Confidential / PII</option>
                </select>
              </label>
              <label className="field">
                <span>Data Residency</span>
                <select defaultValue="US East">
                  <option>US East</option>
                </select>
              </label>
            </div>
          ) : (
            <div className="wizard-ready-state">
              <Check aria-hidden="true" size={27} />
              <strong>{steps[currentStep]} configuration is seeded</strong>
              <p>
                This foundation preserves the complete workflow route while the
                next slice adds the screenshot-matched controls and review
                behavior.
              </p>
            </div>
          )}
          <div className="wizard-card-footer">
            <Button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
            >
              Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                disabled={!projectName.trim()}
                onClick={() =>
                  setCurrentStep((step) => Math.min(steps.length - 1, step + 1))
                }
                variant="primary"
              >
                Continue to {steps[currentStep + 1]}
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/projects/customer-360")}
                variant="primary"
              >
                Create Project
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
            )}
          </div>
        </Card>

        <aside className="wizard-aside">
          <Card>
            <h2>Project Summary</h2>
            <dl className="summary-list">
              <div>
                <dt>Domain</dt>
                <dd>Customer Service</dd>
              </div>
              <div>
                <dt>Consumers</dt>
                <dd>4 consumer types</dd>
              </div>
              <div>
                <dt>Planned graph layers</dt>
                <dd>Metadata + Lineage + Semantic + Domain</dd>
              </div>
              <div>
                <dt>Data sensitivity</dt>
                <dd>Confidential / PII</dd>
              </div>
              <div>
                <dt>Estimated assets</dt>
                <dd>71 selected</dd>
              </div>
            </dl>
          </Card>
          <Card className="agent-guidance">
            <span className="icon-tile icon-tile--green">
              <Sparkles aria-hidden="true" size={21} />
            </span>
            <div>
              <h2>Agent Guidance</h2>
              <p>
                71 relevant assets were identified. Add three policy assets and
                two event sources to improve governance and real-time coverage.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
