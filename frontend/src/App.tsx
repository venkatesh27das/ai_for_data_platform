import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/common/AppShell'
import { HomePage } from './features/home/HomePage'
import { ProjectsPage } from './features/projects/ProjectsPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { WorkspacePage } from './features/workspace/WorkspacePage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/projects/:projectId" element={<WorkspacePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

