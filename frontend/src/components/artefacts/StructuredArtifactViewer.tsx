import { X } from 'lucide-react'
import type { Artifact, ArtifactType } from '../../types'

interface Props {
  artifact: Artifact
  onClose: () => void
}

interface Column {
  key: string
  label: string
}

const columnsByType: Partial<Record<ArtifactType, Column[]>> = {
  source_preview: [
    { key: 'table_name', label: 'Source table' },
    { key: 'role', label: 'Role' },
    { key: 'column_count', label: 'Columns' },
    { key: 'description', label: 'Description' },
  ],
  mappings: [
    { key: 'source', label: 'Source' },
    { key: 'target', label: 'Target' },
    { key: 'transformation', label: 'Transformation' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'status', label: 'Status' },
  ],
  dq_rules: [
    { key: 'target', label: 'Target' },
    { key: 'rule_type', label: 'Rule' },
    { key: 'expression', label: 'Expression' },
    { key: 'severity', label: 'Severity' },
    { key: 'status', label: 'Status' },
  ],
  validation: [
    { key: 'severity', label: 'Severity' },
    { key: 'category', label: 'Category' },
    { key: 'message', label: 'Finding' },
    { key: 'recommended_action', label: 'Recommended action' },
    { key: 'requires_human', label: 'Human review' },
  ],
}

export function StructuredArtifactViewer({ artifact, onClose }: Props) {
  const columns = columnsByType[artifact.artifact_type] ?? []
  const rows = getRows(artifact)

  return (
    <section className="artifact-panel structured-artifact-viewer">
      <div className="artifact-header">
        <div><h2>{artifact.name}</h2><span>v{artifact.version}</span></div>
        <div className="artifact-tabs"><span className="artifact-ready">{artifact.status}</span><button className="close-artifact" onClick={onClose} aria-label="Close asset"><X size={15} /></button></div>
      </div>
      <div className="structured-table-wrap">
        <div className="structured-table-summary"><strong>{rows.length}</strong> records in this generated asset</div>
        <table className="structured-table">
          <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={`${artifact.id}-${index}`}>{columns.map((column) => <td key={column.key}>{renderValue(column.key, row[column.key])}</td>)}</tr>
          ))}</tbody>
        </table>
        {rows.length === 0 && <div className="empty-structured-asset">This asset contains no records.</div>}
      </div>
    </section>
  )
}

function getRows(artifact: Artifact): Array<Record<string, unknown>> {
  if (!isRecord(artifact.payload)) return []
  const candidate = artifact.artifact_type === 'validation'
    ? artifact.payload.findings
    : artifact.artifact_type === 'source_preview'
      ? artifact.payload.tables
      : artifact.payload.items
  return Array.isArray(candidate) ? candidate.filter(isRecord) : []
}

function renderValue(key: string, value: unknown) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value === null || value === undefined || value === '') return '—'
  if (['status', 'severity', 'confidence', 'role'].includes(key)) {
    return <span className={`table-badge badge-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{String(value)}</span>
  }
  return String(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

