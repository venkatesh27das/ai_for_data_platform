import { GitCompareArrows, TriangleAlert } from 'lucide-react'
import type { ModelOperationImpact } from '../../types'

export function ImpactAnalysisCard({ impact }: { impact: ModelOperationImpact }) {
  return <section className="impact-card" aria-label="Proposed model change impact">
    <header><span><GitCompareArrows size={16} /></span><div><strong>Change impact analysis</strong><small>{impact.summary}</small></div><b>{!impact.valid ? 'Invalid target' : impact.material ? 'Material change' : 'Low impact'}</b></header>
    <div className="impact-grid"><div><strong>Proposed changes</strong><ul>{impact.changes.map((change) => <li key={change}>{change}</li>)}</ul></div><div><strong>Affected assets</strong><div className="impact-badges">{impact.affected_artifacts.map((artifact) => <span key={artifact}>{artifact.replace('_', ' ')}</span>)}</div></div></div>
    {(impact.validation_errors.length > 0 || impact.risks.length > 0) && <footer className={impact.valid ? '' : 'invalid'}><TriangleAlert size={14} /><span>{(impact.valid ? impact.risks : impact.validation_errors).join(' · ')}</span></footer>}
  </section>
}
