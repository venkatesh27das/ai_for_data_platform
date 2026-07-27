import { CheckCircle2, Database, Pause, RotateCcw, Save, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { sourceSystems } from "../../data/mock/customer360Fixtures";
import { Toggle } from "../../components/ui/Toggle";
import { Button, Status, TextAction, WorkspacePageHeader, WorkspacePanel } from "../../components/workspace/WorkspaceUi";

const initialToggles = {
  discover: true,
  attach: true,
  publish: false,
  steward: true,
  approval: true,
  review: true,
  audit: true,
  rollback: true,
  notes: true,
};

export function SettingsPage() {
  const [toggles, setToggles] = useState(initialToggles);
  const [saved, setSaved] = useState(false);
  const setToggle = (key: keyof typeof initialToggles) => (value: boolean) => {
    setToggles((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };
  return (
    <div className="workspace-screen">
      <WorkspacePageHeader actions={<><Button onClick={()=>{setToggles(initialToggles);setSaved(false)}}><RotateCcw size={14}/>Reset</Button><Button onClick={()=>setSaved(true)} variant="primary"><Save size={14}/>Save Changes</Button></>} description="Manage project configuration, integrations, schedules, notifications and lifecycle settings." title="Project Settings" />
      {saved && <div className="settings-success"><CheckCircle2 size={15}/>Project settings saved successfully.</div>}
      <div className="settings-workspace-grid">
        <div className="settings-main">
          <WorkspacePanel title="1. General Configuration"><div className="settings-form-grid"><label>Project Name<input defaultValue="Customer 360 Knowledge Layer"/></label><label>Project ID<input defaultValue="KP-2024-0007" readOnly/></label><label>Domain<select defaultValue="Customer Domain"><option>Customer Domain</option></select></label><label>Description<textarea defaultValue="Unified knowledge layer for customer 360 insights across enterprise systems."/></label><label>Business Owner<select defaultValue="Sarah Chen"><option>Sarah Chen</option></select></label><label>Technical Owner<select defaultValue="Rahul Mehta"><option>Rahul Mehta</option></select></label><label>Project Status<select defaultValue="Active"><option>Active</option><option>Paused</option></select></label><label>Environment<select defaultValue="Dev Environment"><option>Dev Environment</option><option>Production</option></select></label></div></WorkspacePanel>
          <WorkspacePanel title="2. Build & Sync Settings"><div className="build-settings"><div>{[["Metadata Sync","Every 15 minutes"],["Asset Discovery","Every 1 hour"],["Graph Rebuild","Every 6 hours"],["Quality Scan","Every 24 hours"]].map((row)=><label key={row[0]}>{row[0]}<select defaultValue={row[1]}><option>{row[1]}</option><option>Manual</option></select></label>)}<p>Next scheduled run <b>May 27, 2024 02:00 AM IST</b></p></div><div>{[["discover","Auto-discover new assets"],["attach","Auto-attach policies"],["publish","Auto-publish draft builds"],["steward","Require steward approval before publish"]].map(([key,label])=><label className="toggle-setting" key={key}><span>{label}</span><Toggle checked={toggles[key as keyof typeof toggles]} label={label} onChange={setToggle(key as keyof typeof toggles)}/></label>)}</div></div></WorkspacePanel>
          <WorkspacePanel className="settings-integrations-panel" title="3. Integrations & Connected Platforms"><table className="workspace-table compact-table"><thead><tr><th>Platform</th><th>Connection Health</th><th>Last Sync</th><th>Actions</th></tr></thead><tbody>{sourceSystems.map((source,index)=><tr key={source.name}><td><strong>{source.name}</strong></td><td><Status tone={index===2?"amber":"green"}>{index===2?"Warning":"Healthy"}</Status></td><td>{["2 minutes ago","5 minutes ago","18 minutes ago","32 minutes ago","1 hour ago","45 minutes ago"][index]}</td><td><button aria-label={`Configure ${source.name}`}>⋮</button></td></tr>)}</tbody></table></WorkspacePanel>
          <WorkspacePanel title="4. Access & Approval Defaults"><div className="access-settings"><div><label>Default Access Model<select defaultValue="Role-based (RBAC)"><option>Role-based (RBAC)</option></select></label>{[["approval","Approval Workflow Enabled"],["review","Steward Review Required"],["audit","Audit Logging Enabled"]].map(([key,label])=><label className="toggle-setting" key={key}><span>{label}</span><Toggle checked={toggles[key as keyof typeof toggles]} label={label} onChange={setToggle(key as keyof typeof toggles)}/></label>)}</div><div><label>Retention Policy<select defaultValue="365 days"><option>365 days</option><option>90 days</option></select></label><label>Data Residency<select defaultValue="US - East (N. Virginia)"><option>US - East (N. Virginia)</option></select></label><label>Sensitivity Classification<div className="chip-row"><span>Confidential / PII ×</span><span>Internal Use ×</span><span>Customer ×</span></div></label></div></div></WorkspacePanel>
          <WorkspacePanel title="5. Notifications"><div className="notification-list">{["Notify on failed pipelines","Notify on steward review required","Notify on publish complete","Weekly health summary","Consumer usage alerts"].map((item)=><label key={item}><input defaultChecked type="checkbox"/>{item}</label>)}</div></WorkspacePanel>
          <WorkspacePanel className="settings-lifecycle-panel" title="6. Versioning & Lifecycle"><div className="lifecycle-grid"><dl className="metric-list"><div><dt>Current Version</dt><dd><Status>v1.3.0</Status></dd></div><div><dt>Draft Version</dt><dd><Status tone="blue">v1.4.0-draft</Status></dd></div><div><dt>Rollback Allowed</dt><dd><Toggle checked={toggles.rollback} label="Rollback allowed" onChange={setToggle("rollback")}/></dd></div><div><dt>Retention Window</dt><dd>90 days</dd></div><div><dt>Release Notes Required</dt><dd><Toggle checked={toggles.notes} label="Release notes required" onChange={setToggle("notes")}/></dd></div></dl><table className="workspace-table compact-table"><thead><tr><th>Version</th><th>Released By</th><th>Released On</th><th>Status</th></tr></thead><tbody>{[["v1.3.0","Sarah Chen","May 20, 2024","Active"],["v1.2.0","Rahul Mehta","May 06, 2024","Released"],["v1.1.0","Ananya Sharma","Apr 18, 2024","Released"]].map((row)=><tr key={row[0]}>{row.map((cell,index)=><td key={cell}>{index===3?<Status tone={cell==="Active"?"green":"blue"}>{cell}</Status>:cell}</td>)}</tr>)}</tbody></table></div><TextAction>View all versions</TextAction></WorkspacePanel>
          <WorkspacePanel className="danger-panel" title="7. Administrative Actions (Danger Zone)"><div className="danger-actions">{[[Pause,"Pause Project","Temporarily pause all automated jobs and scheduled tasks."],[Database,"Clone Project","Create a copy of this project with the same configuration."],[ShieldCheck,"Archive Project","Archive project and restrict all changes."],[Trash2,"Delete Project","Permanently delete project and all associated data."]].map(([Icon,title,copy],index)=>{const ActionIcon=Icon as typeof Pause;return <div key={String(title)}><ActionIcon size={16}/><span><strong>{String(title)}</strong><small>{String(copy)}</small></span><Button>{index===3?"Delete":String(title).split(" ")[0]}</Button></div>})}</div></WorkspacePanel>
        </div>
        <aside className="settings-aside">
          <WorkspacePanel title="Settings Summary"><dl className="metric-list"><div><dt>Connected Platforms</dt><dd>6</dd></div><div><dt>Enabled Automations</dt><dd>4</dd></div><div><dt>Notification Rules</dt><dd>5</dd></div><div><dt>Approval Workflow</dt><dd className="trend--up">Enabled</dd></div><div><dt>Current Version</dt><dd>v1.3.0</dd></div></dl></WorkspacePanel>
          <WorkspacePanel action={<TextAction>View all</TextAction>} title="Recent Configuration Changes"><ul className="workspace-list">{[["Enabled steward approval before publish","18 minutes ago"],["Updated Databricks connection","45 minutes ago"],["Changed quality scan frequency","2 hours ago"],["Updated retention policy to 365 days","Yesterday"]].map((row)=><li key={row[0]}><span><strong>{row[0]}</strong><small>by Sarah Chen</small></span><time>{row[1]}</time></li>)}</ul></WorkspacePanel>
          <div className="configuration-health"><ShieldCheck size={34}/><div><strong>Configuration Healthy</strong><p>All critical settings are properly configured and automations are running as expected.</p><small>Last health check: 5 minutes ago</small></div></div>
        </aside>
      </div>
    </div>
  );
}
