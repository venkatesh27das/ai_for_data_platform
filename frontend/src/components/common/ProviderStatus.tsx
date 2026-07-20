import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'

export function ProviderStatus() {
  const { data, isError } = useQuery({ queryKey: ['provider-settings'], queryFn: api.getProviderSettings })
  const connected = !isError && data !== undefined
  const label = connected
    ? `${data.provider === 'lm_studio' ? 'LM Studio' : data.provider} configured`
    : 'Provider offline'
  return (
    <div className="provider-status" title={connected ? `${data.provider}: ${data.model}` : 'Backend unavailable'}>
      <span className={connected ? 'status-dot online' : 'status-dot'} />
      <span>{label}</span>
    </div>
  )
}
