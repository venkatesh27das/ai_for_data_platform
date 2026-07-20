import { Braces, CheckCircle2, ClipboardCheck, Network, TableProperties } from 'lucide-react'
import type { Artifact, ArtifactType, LogicalModelPayload } from '../../types'

interface Props {
  artifacts: Artifact[]
  onOpen: (artifact: Artifact) => void
}

const typeDetails: Record<ArtifactType, { label: string; icon: typeof Network }> = {
  logical_model: { label: 'Open model', icon: Network },
  mappings: { label: 'Review mappings', icon: TableProperties },
  dq_rules: { label: 'Review DQ rules', icon: ClipboardCheck },
  source_preview: { label: 'Open source', icon: TableProperties },
  validation: { label: 'Review findings', icon: CheckCircle2 },
  model_diff: { label: 'Open model diff', icon: Braces },
}

export function ArtifactSummaryCard({ artifacts, onOpen }: Props) {
  const latestByType = new Map<ArtifactType, Artifact>()
  for (const artifact of artifacts) {
    if (!latestByType.has(artifact.artifact_type)) {
      latestByType.set(artifact.artifact_type, artifact)
    }
  }
  const latest = Array.from(latestByType.values())
  const logicalModel = latest.find(isLogicalModelArtifact)
  const entities = logicalModel?.payload.entities.length ?? 0

  return (
    <section className="artifact-summary-card" aria-label="Generated assets">
      <div className="artifact-summary-title"><CheckCircle2 size={17} /><strong>Generated assets are ready</strong></div>
      <div className="artifact-summary-metrics">
        {entities > 0 && <span><strong>{entities}</strong> entities</span>}
        <span><strong>{latest.length}</strong> asset{latest.length === 1 ? '' : 's'}</span>
      </div>
      <div className="artifact-summary-actions">
        {latest.map((artifact) => {
          const detail = typeDetails[artifact.artifact_type]
          const Icon = detail.icon
          return <button key={artifact.id} onClick={() => onOpen(artifact)}><Icon size={14} />{detail.label}</button>
        })}
      </div>
    </section>
  )
}

function isLogicalModelArtifact(artifact: Artifact): artifact is Artifact<LogicalModelPayload> {
  return artifact.artifact_type === 'logical_model'
    && Array.isArray((artifact.payload as Partial<LogicalModelPayload>).entities)
}
