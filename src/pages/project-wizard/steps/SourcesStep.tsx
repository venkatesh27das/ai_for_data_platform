import {
  Boxes,
  Check,
  Filter,
  Grid2X2,
  Info,
  List,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SourceSystemLogo } from "../../../components/assets/SourceSystemLogo";
import { sourceSystems } from "../../../data/mock/wizardFixtures";
import { useNewProjectStore } from "../../../stores/newProjectStore";
import { Card } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Toggle } from "../../../components/ui/Toggle";

export function SourcesStep() {
  const { assets, selectRecommendedAssets, toggleAsset } = useNewProjectStore();
  const [query, setQuery] = useState("");
  const [assetType, setAssetType] = useState("All");
  const [domain, setDomain] = useState("All");
  const [role, setRole] = useState("All");
  const [recommendationApplied, setRecommendationApplied] = useState(false);

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const normalized = query.trim().toLowerCase();
        return (
          (!normalized ||
            `${asset.name} ${asset.subtype} ${asset.source}`
              .toLowerCase()
              .includes(normalized)) &&
          (assetType === "All" || asset.type === assetType) &&
          (domain === "All" || asset.domain === domain) &&
          (role === "All" || asset.role === role)
        );
      }),
    [assetType, assets, domain, query, role],
  );

  const selectedAssets = assets.filter((asset) => asset.selected);
  const selectedAssetCount = selectedAssets.reduce(
    (total, asset) => total + asset.assetCount,
    0,
  );
  const sourceCount = new Set(selectedAssets.map((asset) => asset.source)).size;

  return (
    <div className="sources-screen">
      <Card className="source-systems-panel">
        <div className="panel-title">
          <h2>1. Connect Source Systems</h2>
          <Info aria-hidden="true" size={14} />
          <p>Connect and sync assets from your enterprise systems.</p>
        </div>
        <ul className="source-system-list">
          {sourceSystems.map((source) => (
            <li key={source.id}>
              <SourceSystemLogo name={source.name} />
              <div>
                <strong>{source.name}</strong>
                <small>
                  <span className="status-dot status-dot--green" />
                  {source.status}
                </small>
              </div>
              <em>{source.assetCount.toLocaleString()} assets</em>
              <button aria-label={`Sync ${source.name}`} type="button">
                <RefreshCw aria-hidden="true" size={14} />
              </button>
            </li>
          ))}
        </ul>
        <button className="connect-source-button" type="button">
          <Plus aria-hidden="true" size={15} /> Connect More Systems
        </button>
        <div className="source-panel-footer">
          <span>Last synced: 8 minutes ago</span>
          <button type="button">
            Sync All <RefreshCw size={13} />
          </button>
        </div>
      </Card>

      <Card className="asset-selection-panel">
        <div className="panel-title">
          <h2>2. Discover & Select Assets</h2>
          <Info aria-hidden="true" size={14} />
          <p>Review discovered assets and select those relevant to your project.</p>
        </div>
        <div className="asset-filter-toolbar">
          <label className="asset-search">
            <Search aria-hidden="true" size={15} />
            <input
              aria-label="Search discovered assets"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets by name, description, or owner..."
              type="search"
              value={query}
            />
          </label>
          <label>
            <span>Asset Type</span>
            <select
              aria-label="Filter by asset type"
              onChange={(event) => setAssetType(event.target.value)}
              value={assetType}
            >
              <option>All</option>
              {Array.from(new Set(assets.map((asset) => asset.type))).map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </label>
          <label>
            <span>Domain</span>
            <select
              aria-label="Filter by asset domain"
              onChange={(event) => setDomain(event.target.value)}
              value={domain}
            >
              <option>All</option>
              <option>Customer</option>
              <option>Compliance</option>
              <option>Product</option>
            </select>
          </label>
          <label>
            <span>Knowledge Role</span>
            <select
              aria-label="Filter by knowledge role"
              onChange={(event) => setRole(event.target.value)}
              value={role}
            >
              <option>All</option>
              {Array.from(new Set(assets.map((asset) => asset.role))).map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </label>
          <button className="filter-button" type="button">
            <Filter aria-hidden="true" size={14} /> Filters
          </button>
        </div>
        <div className="asset-table-meta">
          <span>Showing 1–{filteredAssets.length} of 71 assets</span>
          <span>
            Sort by:
            <select aria-label="Sort assets" defaultValue="Relevance">
              <option>Relevance</option>
              <option>Name</option>
              <option>Source</option>
            </select>
            <button aria-label="List view" type="button">
              <List size={14} />
            </button>
            <button aria-label="Grid view" type="button">
              <Grid2X2 size={14} />
            </button>
          </span>
        </div>
        <div className="asset-table-scroll">
          <table className="data-table asset-selection-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Asset Name</th>
                <th>Asset Type</th>
                <th>Source System</th>
                <th>Domain</th>
                <th>Knowledge Role</th>
                <th>Relevance</th>
                <th>Include</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <button
                      aria-label={`${asset.selected ? "Deselect" : "Select"} ${asset.name}`}
                      className={`asset-check${asset.selected ? " asset-check--selected" : ""}`}
                      onClick={() => toggleAsset(asset.id)}
                      type="button"
                    >
                      {asset.selected && <Check size={12} />}
                    </button>
                  </td>
                  <td>
                    <span className="asset-name-cell">
                      <span className={`asset-type-icon tone-${asset.tone}`}>
                        <Boxes aria-hidden="true" size={15} />
                      </span>
                      <span>
                        <strong>{asset.name}</strong>
                        <small>{asset.subtype}</small>
                      </span>
                    </span>
                  </td>
                  <td>{asset.type}</td>
                  <td>{asset.source}</td>
                  <td>{asset.domain}</td>
                  <td>{asset.role}</td>
                  <td>
                    <span className="relevance-cell">
                      <strong>{asset.relevance}%</strong>
                      <ProgressBar
                        compact
                        tone={asset.relevance >= 80 ? "green" : "amber"}
                        value={asset.relevance}
                      />
                    </span>
                  </td>
                  <td>
                    <Toggle
                      checked={asset.selected}
                      label={`Include ${asset.name}`}
                      onChange={() => toggleAsset(asset.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAssets.length === 0 && (
          <div className="asset-empty">
            <Search size={23} />
            <strong>No matching assets</strong>
            <span>Clear or change the filters to see discovered assets.</span>
          </div>
        )}
        <div className="asset-selection-footer">
          <strong>{selectedAssets.length} representative asset groups selected</strong>
          <span>{selectedAssetCount} enterprise assets in scope</span>
        </div>
      </Card>

      <aside className="selection-summary-panel">
        <Card>
          <div className="panel-title">
            <h2>Selection Summary</h2>
            <Info aria-hidden="true" size={14} />
          </div>
          <dl className="selection-stats">
            <div>
              <dt>Selected Assets</dt>
              <dd>{selectedAssetCount}</dd>
            </div>
            <div>
              <dt>Source Systems</dt>
              <dd>{sourceCount}</dd>
            </div>
            <div>
              <dt>Domains Covered</dt>
              <dd>2</dd>
            </div>
            <div>
              <dt>Estimated Concepts</dt>
              <dd>~210</dd>
            </div>
            <div>
              <dt>Estimated Relationships</dt>
              <dd>~620</dd>
            </div>
          </dl>
          <div className="role-mix">
            <h3>Top Knowledge Roles</h3>
            <div>
              <span className="role-donut" />
              <ul>
                <li><span className="legend-dot legend-dot--orange" /> Entity Source <strong>43%</strong></li>
                <li><span className="legend-dot legend-dot--purple" /> Semantic Authority <strong>17%</strong></li>
                <li><span className="legend-dot legend-dot--green" /> Identity Anchor <strong>14%</strong></li>
                <li><span className="legend-dot legend-dot--blue" /> Provenance Source <strong>14%</strong></li>
              </ul>
            </div>
          </div>
        </Card>
        <Card className="ai-recommendation-card">
          <div>
            <Sparkles aria-hidden="true" size={18} />
            <h3>AI Recommendation</h3>
          </div>
          <p>
            Based on your scope, add all high-confidence policy and operational
            sources to improve governance and real-time coverage.
          </p>
          <button
            disabled={recommendationApplied}
            onClick={() => {
              selectRecommendedAssets();
              setRecommendationApplied(true);
            }}
            type="button"
          >
            {recommendationApplied ? "Recommendations applied" : "Apply recommendations"}
          </button>
        </Card>
      </aside>
    </div>
  );
}
