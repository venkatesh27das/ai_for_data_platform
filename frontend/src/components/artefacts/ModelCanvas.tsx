import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Maximize, Package, ScanSearch, X, ZoomIn, ZoomOut } from 'lucide-react'
import type {
  Artifact,
  LogicalModelEntity,
  LogicalModelPayload,
  LogicalModelRelationship,
} from '../../types'

interface Props {
  artifact: Artifact<LogicalModelPayload>
  onClose: () => void
}

interface Connector {
  id: string
  path: string
  labelX: number
  labelY: number
  cardinality: string
}

export function ModelCanvas({ artifact, onClose }: Props) {
  const entities = [...artifact.payload.entities].sort((left, right) => {
    if (left.kind === right.kind) return left.name.localeCompare(right.name)
    return left.kind === 'fact' ? -1 : 1
  })
  const relationships = useMemo(
    () => artifact.payload.relationships ?? [],
    [artifact.payload.relationships],
  )
  const relationshipCount = relationships.length
  const gridRef = useRef<HTMLDivElement>(null)
  const entityRefs = useRef(new Map<string, HTMLElement>())
  const [connectors, setConnectors] = useState<Connector[]>([])

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const updateConnectors = () => {
      const gridRect = grid.getBoundingClientRect()
      setConnectors(relationships.flatMap((relationship) => {
        const source = entityRefs.current.get(relationship.from_entity_id)
        const target = entityRefs.current.get(relationship.to_entity_id)
        if (!source || !target) return []

        const sourceRect = relativeRect(source.getBoundingClientRect(), gridRect, grid)
        const targetRect = relativeRect(target.getBoundingClientRect(), gridRect, grid)
        const points = connectorPoints(sourceRect, targetRect)

        return [{
          id: `${relationship.from_entity_id}-${relationship.to_entity_id}`,
          path: curvedPath(points),
          labelX: (points.startX + points.endX) / 2,
          labelY: (points.startY + points.endY) / 2,
          cardinality: relationship.cardinality,
        }]
      }))
    }

    const observer = new ResizeObserver(updateConnectors)
    observer.observe(grid)
    entityRefs.current.forEach((element) => observer.observe(element))
    updateConnectors()

    return () => observer.disconnect()
  }, [relationships])

  return (
    <div className="artifact-panel">
      <div className="artifact-header">
        <div><h2>{artifact.name}</h2><span>v{artifact.version}</span></div>
        <div className="artifact-tabs"><button className="active">▦ Diagram</button><button>◔ Details</button><button className="close-artifact" onClick={onClose} aria-label="Close asset"><X size={15} /></button></div>
      </div>
      <div className="model-canvas">
        <div className="canvas-tools"><button aria-label="Zoom in"><ZoomIn size={15} /></button><button aria-label="Zoom out"><ZoomOut size={15} /></button><span>100%</span><button aria-label="Fit canvas"><Maximize size={15} /></button></div>
        <div className="dynamic-entity-grid" ref={gridRef}>
          <svg className="relationships" aria-label="Entity relationships">
            <defs>
              <marker id="relationship-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            {connectors.map((connector) => (
              <g key={connector.id}>
                <path className="relationship-path" d={connector.path} markerEnd="url(#relationship-arrow)" />
                <text x={connector.labelX} y={connector.labelY - 7}>{formatCardinality(connector.cardinality)}</text>
              </g>
            ))}
          </svg>
          {entities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              cardRef={(element) => {
                if (element) entityRefs.current.set(entity.id, element)
                else entityRefs.current.delete(entity.id)
              }}
            />
          ))}
        </div>
      </div>
      <div className="status-strip">
        <Stat value={entities.length} label="Entities" />
        <Stat value={relationshipCount} label="Relationships" />
        <Stat value={artifact.payload.mapping_count ?? 0} label="Mappings" />
        <Stat value={artifact.payload.dq_rule_count ?? 0} label="DQ Rules" />
        <span className="last-activity"><i /> Generated asset</span>
      </div>
    </div>
  )
}

function EntityCard({ entity, cardRef }: { entity: LogicalModelEntity; cardRef: (element: HTMLElement | null) => void }) {
  const Icon = entity.kind === 'fact' ? ScanSearch : Package
  return (
    <article ref={cardRef} className={`entity-card ${entity.kind === 'fact' ? 'entity-fact' : 'entity-dimension'}`}>
      <header><Icon size={15} /><strong>{entity.name}</strong></header>
      <ul>{entity.attributes.map((attribute) => (
        <li key={`${entity.id}-${attribute.name}`} className={attribute.key_type ? 'key-field' : ''}>
          {attribute.key_type && <b>{attribute.key_type}</b>}{attribute.name} ({attribute.data_type})
        </li>
      ))}</ul>
      {entity.attributes.length > 7 && <footer>+ {entity.attributes.length - 7} more</footer>}
    </article>
  )
}

interface Rect {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
}

interface Points {
  startX: number
  startY: number
  endX: number
  endY: number
}

function relativeRect(rect: DOMRect, gridRect: DOMRect, grid: HTMLElement): Rect {
  const left = rect.left - gridRect.left + grid.scrollLeft
  const top = rect.top - gridRect.top + grid.scrollTop
  return {
    left,
    right: left + rect.width,
    top,
    bottom: top + rect.height,
    centerX: left + rect.width / 2,
    centerY: top + rect.height / 2,
  }
}

function connectorPoints(source: Rect, target: Rect): Points {
  const horizontalDistance = target.centerX - source.centerX
  const verticalDistance = target.centerY - source.centerY

  if (Math.abs(horizontalDistance) >= Math.abs(verticalDistance)) {
    return {
      startX: horizontalDistance >= 0 ? source.right : source.left,
      startY: source.centerY,
      endX: horizontalDistance >= 0 ? target.left : target.right,
      endY: target.centerY,
    }
  }

  return {
    startX: source.centerX,
    startY: verticalDistance >= 0 ? source.bottom : source.top,
    endX: target.centerX,
    endY: verticalDistance >= 0 ? target.top : target.bottom,
  }
}

function curvedPath(points: Points): string {
  const horizontal = Math.abs(points.endX - points.startX) >= Math.abs(points.endY - points.startY)
  if (horizontal) {
    const middleX = (points.startX + points.endX) / 2
    return `M ${points.startX} ${points.startY} C ${middleX} ${points.startY}, ${middleX} ${points.endY}, ${points.endX} ${points.endY}`
  }

  const middleY = (points.startY + points.endY) / 2
  return `M ${points.startX} ${points.startY} C ${points.startX} ${middleY}, ${points.endX} ${middleY}, ${points.endX} ${points.endY}`
}

function formatCardinality(cardinality: LogicalModelRelationship['cardinality']): string {
  return cardinality
    .split('-')
    .filter((part) => part !== 'to')
    .join(' → ')
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="strip-stat"><strong>{value}</strong><small>{label}</small></div>
}
