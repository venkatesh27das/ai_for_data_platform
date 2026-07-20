import { Boxes } from 'lucide-react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-mark"><Boxes size={21} strokeWidth={2.2} /></span>
      {!compact && <><strong>AI Data Modelling Assistant</strong><span className="mvp-pill">MVP</span></>}
    </div>
  )
}

