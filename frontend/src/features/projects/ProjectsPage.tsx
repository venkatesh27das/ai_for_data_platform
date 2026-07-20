import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Database, ExternalLink, FolderKanban, MoreVertical, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { ProjectStatus } from '../../components/common/ProjectStatus'
import { ErrorState, LoadingState } from '../../components/common/States'
import { api } from '../../services/api'
import type { Project, ProjectStatus as Status } from '../../types'
import { relativeTime } from '../../utils/date'

type Filter = 'all' | Status

export function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useQuery({ queryKey: ['projects'], queryFn: api.listProjects })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const remove = useMutation({ mutationFn: api.deleteProject, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }) })
  const duplicate = useMutation({ mutationFn: api.duplicateProject, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }) })

  const filtered = useMemo(() => projects.filter((project) => {
    const term = search.toLowerCase()
    return (filter === 'all' || project.status === filter) && `${project.name} ${project.objective}`.toLowerCase().includes(term)
  }), [filter, projects, search])

  const counts = {
    draft: projects.filter((item) => item.status === 'draft').length,
    inProgress: projects.filter((item) => item.status === 'in_progress').length,
    completed: projects.filter((item) => item.status === 'completed').length,
  }

  return (
    <div className="projects-page">
      <section className="projects-main">
        <div className="page-title-row"><div><h1>Projects</h1><p>Manage your modelling projects and continue your work.</p></div><button className="button primary" onClick={() => navigate('/')}><Plus size={19} /> New Project</button></div>
        <div className="project-controls">
          <label className="search-field"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects by name or description..." /></label>
          <div className="filter-tabs">
            {([['all', 'All'], ['draft', 'Draft'], ['in_progress', 'In Progress'], ['completed', 'Completed']] as const).map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}
          </div>
        </div>
        {isLoading ? <LoadingState label="Loading projects" /> : error ? <ErrorState message={error.message} /> : (
          <div className="project-table-wrap">
            <table className="project-table">
              <thead><tr><th>PROJECT</th><th>STATUS</th><th>LAST UPDATED</th><th>SOURCES</th><th>MODEL SUMMARY</th><th>ACTIONS</th></tr></thead>
              <tbody>
                {filtered.map((project, index) => (
                  <tr key={project.id}>
                    <td><div className="project-cell"><span className={`project-glyph glyph-${index % 4}`}><FolderKanban size={22} /></span><span><button onClick={() => navigate(`/projects/${project.id}`)}>{project.name}</button><small>{project.objective || 'No objective entered yet'}</small></span></div></td>
                    <td><ProjectStatus status={project.status} /></td>
                    <td><span className="table-stack"><strong>{relativeTime(project.updated_at)}</strong><small>{new Date(project.updated_at).toLocaleString()}</small></span></td>
                    <td><span className="source-count"><Database size={17} /> <strong>{project.source_count}</strong><small>Sources</small></span></td>
                    <td><div className="summary-progress"><span>{project.entity_count} Entities · {project.mapping_count} Mappings</span><div><i style={{ width: `${Math.min(100, project.entity_count * 12)}%` }} /></div></div></td>
                    <td><div className="row-actions"><button title="Open" onClick={() => navigate(`/projects/${project.id}`)}><ExternalLink size={18} /></button><button title="Duplicate" onClick={() => duplicate.mutate(project.id)}><Copy size={18} /></button><button title="More actions" onClick={() => setDeleteTarget(project)}><MoreVertical size={18} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <div className="empty-projects">No projects match this view.</div>}
          </div>
        )}
        <div className="table-footer">Showing {filtered.length} of {projects.length} projects <span>10 per page⌄ &nbsp; ‹ &nbsp; <b>1</b> &nbsp; ›</span></div>
      </section>
      <aside className="projects-rail">
        <div className="rail-card"><h3>Project Summary</h3><Summary icon={FolderKanban} value={projects.length} label="Total Projects" /><Summary icon={FolderKanban} value={counts.draft} label="Draft" /><Summary icon={FolderKanban} value={counts.inProgress} label="In Progress" /><Summary icon={FolderKanban} value={counts.completed} label="Completed" /></div>
        <div className="rail-card"><h3>Quick Tip</h3><p>Use “New Project” to start from scratch, then describe the decision your dimensional model should support.</p></div>
      </aside>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete this project?" body={`“${deleteTarget?.name ?? ''}” and its conversation will be permanently removed.`} onCancel={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) remove.mutate(deleteTarget.id); setDeleteTarget(null) }} />
    </div>
  )
}

function Summary({ icon: Icon, value, label }: { icon: typeof FolderKanban; value: number; label: string }) {
  return <div className="summary-row"><span><Icon size={20} /></span><div><strong>{value}</strong><small>{label}</small></div></div>
}
