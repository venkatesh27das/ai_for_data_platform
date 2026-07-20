import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Check, Maximize, Package, ScanSearch, X, ZoomIn, ZoomOut } from 'lucide-react'
import type {
  Artifact,
  LogicalModelEntity,
  LogicalModelPayload,
  LogicalModelRelationship,
} from '../../types'

interface Props {
  artifact: Artifact<LogicalModelPayload>
  onClose: () => void
  onReview: (decision: 'approved' | 'changes_requested') => void
  onSaveLayout: (positions: Positions) => Promise<void>
  onRegenerate: () => void
}

interface Point { x: number; y: number }
type Positions = Record<string, Point>
interface Connector { id: string; path: string; labelX: number; labelY: number; cardinality: string }
interface Rect { left: number; right: number; top: number; bottom: number; centerX: number; centerY: number }
interface ConnectorPoints { startX: number; startY: number; endX: number; endY: number }

export function ModelCanvas({ artifact, onClose, onReview, onSaveLayout, onRegenerate }: Props) {
  const entities = useMemo(() => [...artifact.payload.entities].sort((left, right) => {
    if (left.kind === right.kind) return left.name.localeCompare(right.name)
    return left.kind === 'fact' ? -1 : 1
  }), [artifact.payload.entities])
  const relationships = useMemo(() => artifact.payload.relationships ?? [], [artifact.payload.relationships])
  const gridRef = useRef<HTMLDivElement>(null)
  const entityRefs = useRef(new Map<string, HTMLElement>())
  const [positions, setPositions] = useState<Positions>(() => savedOrDefaultPositions(artifact, entities))
  const positionsRef = useRef(positions)
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [zoom, setZoom] = useState(1)
  const [tab, setTab] = useState<'diagram' | 'details'>('diagram')
  const [selectedId, setSelectedId] = useState<string | null>(entities[0]?.id ?? null)

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid || tab !== 'diagram') return
    const update = () => {
      const gridRect = grid.getBoundingClientRect()
      setConnectors(relationships.flatMap((relationship) => {
        const source = entityRefs.current.get(relationship.from_entity_id)
        const target = entityRefs.current.get(relationship.to_entity_id)
        if (!source || !target) return []
        const points = connectorPoints(
          relativeRect(source.getBoundingClientRect(), gridRect, zoom),
          relativeRect(target.getBoundingClientRect(), gridRect, zoom),
        )
        return [{
          id: `${relationship.from_entity_id}-${relationship.to_entity_id}`,
          path: curvedPath(points),
          labelX: (points.startX + points.endX) / 2,
          labelY: (points.startY + points.endY) / 2,
          cardinality: relationship.cardinality,
        }]
      }))
    }
    const observer = new ResizeObserver(update)
    observer.observe(grid)
    entityRefs.current.forEach((element) => observer.observe(element))
    update()
    return () => observer.disconnect()
  }, [positions, relationships, tab, zoom])

  function startDrag(event: React.PointerEvent<HTMLElement>, entityId: string) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const origin = positions[entityId] ?? { x: 0, y: 0 }
    const start = { x: event.clientX, y: event.clientY }
    const element = event.currentTarget
    const move = (next: PointerEvent) => {
      const updated = {
        ...positionsRef.current,
        [entityId]: {
        x: Math.max(0, origin.x + (next.clientX - start.x) / zoom),
        y: Math.max(0, origin.y + (next.clientY - start.y) / zoom),
        },
      }
      positionsRef.current = updated
      setPositions(updated)
    }
    const stop = () => {
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', stop)
      element.removeEventListener('pointercancel', stop)
      void onSaveLayout(positionsRef.current)
    }
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', stop)
    element.addEventListener('pointercancel', stop)
  }

  const selected = entities.find((entity) => entity.id === selectedId)
  const canvasSize = extent(positions)

  return (
    <section className="artifact-panel">
      <div className="artifact-header">
        <div><h2>{artifact.name}</h2><span>v{artifact.version}</span></div>
        <div className="artifact-tabs">
          <button className={tab === 'diagram' ? 'active' : ''} onClick={() => setTab('diagram')}>▦ Diagram</button>
          <button className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>◔ Details</button>
          <button onClick={() => onReview('approved')}><Check size={13} /> Approve</button>
          <button onClick={() => onReview('changes_requested')}>Request changes</button>
          <button onClick={onRegenerate}>Regenerate</button>
          <button className="close-artifact" onClick={onClose} aria-label="Close asset"><X size={15} /></button>
        </div>
      </div>
      {tab === 'diagram' ? <div className="model-canvas model-canvas-interactive">
        <div className="canvas-tools">
          <button aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))}><ZoomIn size={15} /></button>
          <button aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0.5, value - 0.1))}><ZoomOut size={15} /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button aria-label="Fit canvas" onClick={() => setZoom(0.8)}><Maximize size={15} /></button>
        </div>
        <div className="canvas-scroll">
          <div className="canvas-stage" ref={gridRef} style={{ width: canvasSize.width, height: canvasSize.height, transform: `scale(${zoom})` }}>
            <svg className="relationships" aria-label="Entity relationships">
              <defs><marker id="relationship-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
              {connectors.map((connector) => <g key={connector.id}><path className="relationship-path" d={connector.path} markerEnd="url(#relationship-arrow)" /><text x={connector.labelX} y={connector.labelY - 7}>{formatCardinality(connector.cardinality)}</text></g>)}
            </svg>
            {entities.map((entity) => <EntityCard
              key={entity.id}
              entity={entity}
              position={positions[entity.id] ?? { x: 0, y: 0 }}
              selected={entity.id === selectedId}
              onSelect={() => setSelectedId(entity.id)}
              onPointerDown={(event) => startDrag(event, entity.id)}
              cardRef={(element) => { if (element) entityRefs.current.set(entity.id, element); else entityRefs.current.delete(entity.id) }}
            />)}
          </div>
        </div>
      </div> : <div className="model-details-panel">
        <nav>{entities.map((entity) => <button className={selectedId === entity.id ? 'active' : ''} key={entity.id} onClick={() => setSelectedId(entity.id)}>{entity.name}<small>{entity.kind}</small></button>)}</nav>
        {selected && <article><h3>{selected.name}</h3><p>{selected.kind === 'fact' ? 'Fact entity' : 'Dimension entity'} · {selected.attributes.length} attributes</p><table><tbody>{selected.attributes.map((attribute) => <tr key={attribute.name}><td>{attribute.key_type ?? '—'}</td><th>{attribute.name}</th><td>{attribute.data_type}</td></tr>)}</tbody></table></article>}
      </div>}
      <div className="status-strip">
        <Stat value={entities.length} label="Entities" /><Stat value={relationships.length} label="Relationships" /><Stat value={artifact.payload.mapping_count ?? 0} label="Mappings" /><Stat value={artifact.payload.dq_rule_count ?? 0} label="DQ Rules" />
        <span className="last-activity"><i /> {artifact.review_status === 'pending' ? 'Awaiting review' : artifact.review_status.replace('_', ' ')}</span>
      </div>
    </section>
  )
}

function EntityCard({ entity, position, selected, onSelect, onPointerDown, cardRef }: { entity: LogicalModelEntity; position: Point; selected: boolean; onSelect: () => void; onPointerDown: (event: React.PointerEvent<HTMLElement>) => void; cardRef: (element: HTMLElement | null) => void }) {
  const Icon = entity.kind === 'fact' ? ScanSearch : Package
  return <article ref={cardRef} style={{ left: position.x, top: position.y }} onClick={onSelect} onPointerDown={onPointerDown} className={`entity-card canvas-entity ${entity.kind === 'fact' ? 'entity-fact' : 'entity-dimension'} ${selected ? 'selected' : ''}`}><header><Icon size={15} /><strong>{entity.name}</strong></header><ul>{entity.attributes.slice(0, 8).map((attribute) => <li key={`${entity.id}-${attribute.name}`} className={attribute.key_type ? 'key-field' : ''}>{attribute.key_type && <b>{attribute.key_type}</b>}{attribute.name} ({attribute.data_type})</li>)}</ul>{entity.attributes.length > 8 && <footer>+ {entity.attributes.length - 8} more</footer>}</article>
}

function savedOrDefaultPositions(artifact: Artifact<LogicalModelPayload>, entities: LogicalModelEntity[]): Positions {
  const layout = (artifact.payload as LogicalModelPayload & { layout?: { positions?: Positions } }).layout?.positions
  if (layout && Object.keys(layout).length) return layout
  const fact = entities.find((entity) => entity.kind === 'fact')
  const dimensions = entities.filter((entity) => entity.kind !== 'fact')
  const positions: Positions = {}
  if (fact) positions[fact.id] = { x: 390, y: 190 }
  dimensions.forEach((entity, index) => {
    const left = index % 2 === 0
    positions[entity.id] = { x: left ? 50 : 730, y: 50 + Math.floor(index / 2) * 270 }
  })
  return positions
}

function extent(positions: Positions) {
  const values = Object.values(positions)
  return { width: Math.max(980, ...values.map((point) => point.x + 260)), height: Math.max(620, ...values.map((point) => point.y + 260)) }
}

function relativeRect(rect: DOMRect, gridRect: DOMRect, zoom: number): Rect {
  const left = (rect.left - gridRect.left) / zoom
  const top = (rect.top - gridRect.top) / zoom
  const width = rect.width / zoom
  const height = rect.height / zoom
  return { left, right: left + width, top, bottom: top + height, centerX: left + width / 2, centerY: top + height / 2 }
}

function connectorPoints(source: Rect, target: Rect): ConnectorPoints {
  const horizontalDistance = target.centerX - source.centerX
  const verticalDistance = target.centerY - source.centerY
  if (Math.abs(horizontalDistance) >= Math.abs(verticalDistance)) return { startX: horizontalDistance >= 0 ? source.right : source.left, startY: source.centerY, endX: horizontalDistance >= 0 ? target.left : target.right, endY: target.centerY }
  return { startX: source.centerX, startY: verticalDistance >= 0 ? source.bottom : source.top, endX: target.centerX, endY: verticalDistance >= 0 ? target.top : target.bottom }
}

function curvedPath(points: ConnectorPoints): string {
  const horizontal = Math.abs(points.endX - points.startX) >= Math.abs(points.endY - points.startY)
  if (horizontal) { const middleX = (points.startX + points.endX) / 2; return `M ${points.startX} ${points.startY} C ${middleX} ${points.startY}, ${middleX} ${points.endY}, ${points.endX} ${points.endY}` }
  const middleY = (points.startY + points.endY) / 2
  return `M ${points.startX} ${points.startY} C ${points.startX} ${middleY}, ${points.endX} ${middleY}, ${points.endX} ${points.endY}`
}

function formatCardinality(cardinality: LogicalModelRelationship['cardinality']): string { return cardinality.split('-').filter((part) => part !== 'to').join(' → ') }
function Stat({ value, label }: { value: number; label: string }) { return <div className="strip-stat"><strong>{value}</strong><small>{label}</small></div> }
