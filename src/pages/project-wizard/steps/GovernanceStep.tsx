import {
  Check,
  Edit3,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";
import { ProjectSummaryPanel } from "../../../components/wizard/ProjectSummaryPanel";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Toggle } from "../../../components/ui/Toggle";
import { owners } from "../../../data/mock/wizardFixtures";
import { useNewProjectStore } from "../../../stores/newProjectStore";

const accessTone = {
  Read: "green",
  Contribute: "blue",
  Admin: "purple",
  Consume: "orange",
} as const;

const accessTabs = [
  "Users & Groups",
  "Roles & Permissions",
  "Access Levels",
  "Approval Workflow",
];

export function GovernanceStep() {
  const {
    accessEntries,
    addAccessEntry,
    informationTypes,
    policies,
    policyTags,
    removeAccessEntry,
    requireStewardApproval,
    sensitivity,
    setField,
    toggleArrayValue,
    togglePolicy,
  } = useNewProjectStore();
  const [activeTab, setActiveTab] = useState("Users & Groups");
  const [policyMessage, setPolicyMessage] = useState("");

  return (
    <div className="governance-layout">
      <div className="governance-main">
        <Card className="governance-section-card">
          <div className="numbered-heading">
            <span>1</span>
            <div>
              <h2>Data Classification & Sensitivity</h2>
              <p>
                Define the sensitivity level and classification policy for data
                in this knowledge layer.
              </p>
            </div>
          </div>
          <div className="classification-grid">
            <label>
              <span>Default Sensitivity Level</span>
              <select
                aria-label="Default Sensitivity Level"
                onChange={(event) => setField("sensitivity", event.target.value)}
                value={sensitivity}
              >
                <option>Confidential / PII</option>
                <option>Confidential</option>
                <option>Internal Use</option>
              </select>
              <small>
                This will be applied to all assets unless overridden by specific
                classifications.
              </small>
            </label>
            <div>
              <span>Information Types in Scope</span>
              <div className="tag-editor">
                {informationTypes.map((type) => (
                  <button
                    aria-label={`Remove ${type}`}
                    key={type}
                    onClick={() => toggleArrayValue("informationTypes", type)}
                    type="button"
                  >
                    {type} <span>×</span>
                  </button>
                ))}
              </div>
              <button
                className="inline-add"
                onClick={() =>
                  toggleArrayValue("informationTypes", "Behavioral Data")
                }
                type="button"
              >
                <Plus size={14} /> Add Information Type
              </button>
            </div>
            <div>
              <span>Policy Tags</span>
              <div className="tag-editor">
                {policyTags.map((tag) => (
                  <button
                    aria-label={`Remove ${tag}`}
                    key={tag}
                    onClick={() => toggleArrayValue("policyTags", tag)}
                    type="button"
                  >
                    {tag} <span>×</span>
                  </button>
                ))}
              </div>
              <button
                className="inline-add"
                onClick={() => toggleArrayValue("policyTags", "Restricted")}
                type="button"
              >
                <Plus size={14} /> Add Policy Tag
              </button>
            </div>
          </div>
        </Card>

        <Card className="governance-section-card">
          <div className="numbered-heading">
            <span>2</span>
            <div>
              <h2>Ownership & Stewardship</h2>
              <p>
                Assign domain owners and data stewards responsible for this
                knowledge layer.
              </p>
            </div>
          </div>
          <div className="owner-grid">
            {owners.map((owner) => (
              <button className="owner-card" key={owner.role} type="button">
                <span className={`owner-avatar owner-avatar--${owner.tone}`}>
                  {owner.initials}
                </span>
                <span>
                  <small>{owner.role}</small>
                  <strong>{owner.name}</strong>
                  <em>{owner.title}</em>
                </span>
                <Edit3 aria-hidden="true" size={13} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="governance-section-card access-control-card">
          <div className="numbered-heading">
            <span>3</span>
            <div>
              <h2>Access Control</h2>
              <p>
                Define who can access, contribute and consume this knowledge
                layer and its assets.
              </p>
            </div>
          </div>
          <div className="access-tabs" role="tablist">
            {accessTabs.map((tab) => (
              <button
                aria-selected={activeTab === tab}
                className={activeTab === tab ? "active" : ""}
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "Users & Groups" ? (
            <div className="access-content">
              <aside>
                <h3>Add Users or Groups</h3>
                <label className="mini-search">
                  <Search size={14} />
                  <input aria-label="Search users or groups" placeholder="Search users or groups..." />
                </label>
                <small>Recent</small>
                {["Data Analysts", "Data Stewards", "Business Analysts", "Solution Architects"].map(
                  (group) => (
                    <button key={group} type="button">
                      <Users size={14} /> {group} <Badge tone="slate">Group</Badge>
                    </button>
                  ),
                )}
              </aside>
              <div className="access-table-wrap">
                <table className="data-table access-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Access Level</th>
                      <th>Permissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <span className="access-name">
                            <span className={`owner-avatar owner-avatar--${entry.tone}`}>
                              {entry.initials}
                            </span>
                            {entry.name}
                          </span>
                        </td>
                        <td>{entry.type}</td>
                        <td>
                          <Badge tone={accessTone[entry.access]}>
                            {entry.access}
                          </Badge>
                        </td>
                        <td>{entry.permissions}</td>
                        <td>
                          <button aria-label={`Edit ${entry.name}`} className="icon-action" type="button">
                            <Edit3 size={13} />
                          </button>
                          <button
                            aria-label={`Remove ${entry.name}`}
                            className="icon-action"
                            onClick={() => removeAccessEntry(entry.id)}
                            type="button"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="inline-add access-add" onClick={addAccessEntry} type="button">
                  <Plus size={14} /> Add Another
                </button>
              </div>
            </div>
          ) : (
            <div className="access-tab-placeholder">
              <LockKeyhole size={24} />
              <strong>{activeTab}</strong>
              <p>
                Defaults are configured and will be enforced through the
                project approval workflow.
              </p>
            </div>
          )}
        </Card>

        <Card className="governance-section-card policy-section">
          <div className="numbered-heading">
            <span>4</span>
            <div>
              <h2>Compliance & Governance Policies</h2>
              <p>
                Select the applicable compliance frameworks and governance
                policies.
              </p>
            </div>
          </div>
          <div className="policy-grid">
            {policies.map((policy) => (
              <button
                aria-pressed={policy.selected}
                className={policy.selected ? "selected" : ""}
                key={policy.id}
                onClick={() => togglePolicy(policy.id)}
                type="button"
              >
                <span>
                  <ShieldCheck size={17} />
                </span>
                <span>
                  <strong>{policy.name}</strong>
                  <small>{policy.detail}</small>
                </span>
                {policy.selected && <Check size={14} />}
              </button>
            ))}
            <button
              className="add-policy"
              onClick={() => {
                const inactive = policies.find((policy) => !policy.selected);
                if (inactive) {
                  togglePolicy(inactive.id);
                  setPolicyMessage(`${inactive.name} added`);
                } else {
                  setPolicyMessage("All available policies are already selected");
                }
              }}
              type="button"
            >
              <Plus size={15} /> Add Policy
            </button>
          </div>
          {policyMessage && <p className="policy-message">{policyMessage}</p>}
        </Card>
      </div>

      <aside className="governance-aside">
        <ProjectSummaryPanel mode="governance" />
        <Card className="good-to-go-card">
          <Check aria-hidden="true" size={18} />
          <div>
            <strong>Good to go!</strong>
            <p>
              Governance and access settings look complete for this project.
            </p>
          </div>
        </Card>
        <Card className="approval-preview">
          <UserRound size={18} />
          <div>
            <h3>Steward approval</h3>
            <p>
              {requireStewardApproval
                ? "Enabled before publication"
                : "Not required for publication"}
            </p>
          </div>
          <Toggle
            checked={requireStewardApproval}
            label="Require steward approval"
            onChange={(checked) =>
              setField("requireStewardApproval", checked)
            }
          />
        </Card>
      </aside>
    </div>
  );
}
