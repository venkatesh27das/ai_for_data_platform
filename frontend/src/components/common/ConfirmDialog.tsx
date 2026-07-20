import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  body: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ open, title, body, onCancel, onConfirm }: Props) {
  if (!open) return null
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <span className="dialog-icon"><AlertTriangle size={23} /></span>
        <h2 id="dialog-title">{title}</h2>
        <p>{body}</p>
        <div className="dialog-actions">
          <button className="button secondary" onClick={onCancel}>Cancel</button>
          <button className="button danger" onClick={onConfirm}>Delete project</button>
        </div>
      </div>
    </div>
  )
}

