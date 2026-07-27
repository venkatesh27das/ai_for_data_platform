import {
  AlertTriangle,
  CheckCircle2,
  CirclePlus,
  Database,
  GitBranch,
  GripVertical,
  Info,
  Lightbulb,
  Network,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  projectAssets,
} from "../../../data/mock/wizardFixtures";
import { useNewProjectStore } from "../../../stores/newProjectStore";
import { ProjectSummaryPanel } from "../../../components/wizard/ProjectSummaryPanel";
import { Card } from "../../../components/ui/Card";
import { Toggle } from "../../../components/ui/Toggle";

const allSubdomains = [
  "Customer",
  "Account",
  "Product",
  "Subscription",
  "Interaction",
  "Support",
  "Consent",
  "Policy",
];

const allConsumers = ["RAG Apps", "Copilots", "AI Agents", "Analytics"];

const assetIcons = [Database, GitBranch, Network, ShieldCheck, Database];

export function ScopeStep() {
  const {
    addQuestion,
    businessObjective,
    businessQuestions,
    domain,
    enableRecommendations,
    expectedProduct,
    projectName,
    removeQuestion,
    requireStewardApproval,
    residency,
    sensitivity,
    setField,
    subdomains,
    targetConsumers,
    toggleArrayValue,
    updateQuestion,
  } = useNewProjectStore();

  return (
    <div className="wizard-layout wizard-layout--scope">
      <Card className="wizard-form-card scope-card">
        <h2>Scope & Domains</h2>
        <div className="scope-form">
          <label className="field field--horizontal">
            <span>
              Project Name <em>*</em>
            </span>
            <input
              aria-label="Project Name"
              onChange={(event) => setField("projectName", event.target.value)}
              value={projectName}
            />
          </label>
          <label className="field field--horizontal">
            <span>
              Business Objective <em>*</em>
            </span>
            <textarea
              aria-label="Business Objective"
              onChange={(event) =>
                setField("businessObjective", event.target.value)
              }
              value={businessObjective}
            />
          </label>
          <label className="field field--horizontal">
            <span>
              Domain <em>*</em>
            </span>
            <select
              aria-label="Domain"
              onChange={(event) => setField("domain", event.target.value)}
              value={domain}
            >
              <option>Customer Service</option>
              <option>Customer</option>
              <option>Governance</option>
              <option>Supply Chain</option>
            </select>
          </label>
          <div className="field field--horizontal">
            <span>
              Sub-domains <em>*</em>
            </span>
            <div className="multi-select-grid">
              {allSubdomains.map((subdomain) => (
                <button
                  aria-pressed={subdomains.includes(subdomain)}
                  className={subdomains.includes(subdomain) ? "selected" : ""}
                  key={subdomain}
                  onClick={() => toggleArrayValue("subdomains", subdomain)}
                  type="button"
                >
                  {subdomain}
                </button>
              ))}
            </div>
          </div>
          <div className="field field--horizontal">
            <span>
              Target Consumers <em>*</em>
            </span>
            <div className="multi-select-grid multi-select-grid--consumers">
              {allConsumers.map((consumer) => (
                <button
                  aria-pressed={targetConsumers.includes(consumer)}
                  className={targetConsumers.includes(consumer) ? "selected" : ""}
                  key={consumer}
                  onClick={() => toggleArrayValue("targetConsumers", consumer)}
                  type="button"
                >
                  {consumer}
                </button>
              ))}
            </div>
          </div>
          <div className="field field--horizontal field--align-start">
            <span>
              Key Business Questions <em>*</em>
            </span>
            <div className="question-list">
              {businessQuestions.map((question, index) => (
                <div key={`${index}-${question.slice(0, 10)}`}>
                  <GripVertical aria-hidden="true" size={16} />
                  <input
                    aria-label={`Business question ${index + 1}`}
                    onChange={(event) =>
                      updateQuestion(index, event.target.value)
                    }
                    value={question}
                  />
                  <button
                    aria-label={`Remove business question ${index + 1}`}
                    disabled={businessQuestions.length <= 1}
                    onClick={() => removeQuestion(index)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                  </button>
                </div>
              ))}
              <button className="inline-add" onClick={addQuestion} type="button">
                <CirclePlus aria-hidden="true" size={16} />
                Add question
              </button>
            </div>
          </div>
          <label className="field field--horizontal">
            <span>
              Expected Knowledge Product <em>*</em>
            </span>
            <select
              aria-label="Expected Knowledge Product"
              onChange={(event) =>
                setField("expectedProduct", event.target.value)
              }
              value={expectedProduct}
            >
              <option>Knowledge Graph + Retrieval Package</option>
              <option>Semantic Model + API Package</option>
              <option>Document Index + MCP Bundle</option>
            </select>
          </label>
          <div className="field-row-pair">
            <label className="field">
              <span>
                Primary Data Sensitivity <em>*</em>
              </span>
              <select
                aria-label="Primary Data Sensitivity"
                onChange={(event) => setField("sensitivity", event.target.value)}
                value={sensitivity}
              >
                <option>Confidential / PII</option>
                <option>Confidential</option>
                <option>Internal</option>
              </select>
            </label>
            <label className="field">
              <span>Data Residency</span>
              <select
                aria-label="Data Residency"
                onChange={(event) => setField("residency", event.target.value)}
                value={residency}
              >
                <option>US East</option>
                <option>EU West</option>
                <option>India</option>
              </select>
            </label>
          </div>
          <div className="toggle-row">
            <label>
              <Toggle
                checked={enableRecommendations}
                label="Enable agent recommendations"
                onChange={(checked) =>
                  setField("enableRecommendations", checked)
                }
              />
              <span>
                Enable agent recommendations <Info size={13} />
              </span>
            </label>
            <label>
              <Toggle
                checked={requireStewardApproval}
                label="Require steward approval before publish"
                onChange={(checked) =>
                  setField("requireStewardApproval", checked)
                }
              />
              <span>
                Require steward approval before publish <Info size={13} />
              </span>
            </label>
          </div>
        </div>
      </Card>

      <aside className="wizard-aside wizard-aside--scope">
        <ProjectSummaryPanel mode="scope" />
        <Card className="recommended-assets-card">
          <div className="aside-card-heading">
            <h2>Recommended Starting Assets</h2>
            <button type="button">View all</button>
          </div>
          <ul>
            {projectAssets.slice(0, 5).map((asset, index) => {
              const Icon = assetIcons[index];
              return (
                <li key={asset.id}>
                  <Icon aria-hidden="true" size={16} />
                  <span>{asset.name}</span>
                  <small>{asset.source}</small>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="agent-guidance agent-guidance--stacked">
          <div className="agent-guidance__title">
            <span className="icon-tile icon-tile--green">
              <Sparkles aria-hidden="true" size={20} />
            </span>
            <div>
              <h2>Agent Guidance</h2>
              <p>
                Based on the selected domain, 71 relevant enterprise assets can
                be discovered across catalog, MDM, documents and graph stores.
              </p>
            </div>
          </div>
          <ul className="guidance-list">
            <li>
              <CheckCircle2 size={15} /> Good coverage for Customer domain
            </li>
            <li>
              <AlertTriangle size={15} /> Consider adding real-time interaction
              sources
            </li>
            <li>
              <Lightbulb size={15} /> Steward approval recommended for high
              sensitivity data
            </li>
          </ul>
        </Card>
      </aside>
    </div>
  );
}
