import { ChevronDown, FolderKanban, Home, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Brand } from './Brand'
import { ProviderStatus } from './ProviderStatus'
import { api } from '../../services/api'
import { relativeTime } from '../../utils/date'

const nav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export function AppShell() {
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: api.listProjects })
  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <ProviderStatus />
          <span className="divider" />
          <Settings size={20} />
          <span className="avatar">AS</span>
          <span className="user-name">Ananya Sen</span>
          <ChevronDown size={15} />
        </div>
      </header>
      <aside className="sidebar">
        <nav>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={21} /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="recent-nav">
          <p>RECENT PROJECTS</p>
          {projects.slice(0, 4).map((project) => (
            <NavLink to={`/projects/${project.id}`} key={project.id}>
              <span className="recent-icon">▱</span>
              <span><strong>{project.name}</strong><small>{relativeTime(project.updated_at)}</small></span>
            </NavLink>
          ))}
          <NavLink className="view-all" to="/projects">View all projects →</NavLink>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}
