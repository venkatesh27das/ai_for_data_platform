import type { ProjectStatus as Status } from '../../types'

const labels: Record<Status, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  needs_review: 'Needs Review',
  completed: 'Completed',
  failed: 'Failed',
}

export function ProjectStatus({ status }: { status: Status }) {
  return <span className={`project-status status-${status}`}>{labels[status]}</span>
}

