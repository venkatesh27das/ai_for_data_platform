import { LoaderCircle, TriangleAlert } from 'lucide-react'

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return <div className="state-message"><LoaderCircle className="spin" size={21} /> {label}…</div>
}

export function ErrorState({ message }: { message: string }) {
  return <div className="state-message error"><TriangleAlert size={21} /> {message}</div>
}

