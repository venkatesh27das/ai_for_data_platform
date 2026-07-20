export function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.max(0, Math.round(diff / 3_600_000))
  if (hours < 1) return 'Updated just now'
  if (hours < 24) return `Updated ${hours}h ago`
  const days = Math.round(hours / 24)
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`
}

