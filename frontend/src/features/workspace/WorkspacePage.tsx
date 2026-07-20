import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Clock3, Download, Home, MoreVertical, Redo2, Settings, Undo2 } from 'lucide-react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Brand } from '../../components/common/Brand'
import { ErrorState, LoadingState } from '../../components/common/States'
import { MessageBubble } from '../../components/chat/MessageBubble'
import { ChatComposer } from '../../components/chat/ChatComposer'
import { ModelCanvas } from '../../components/artefacts/ModelCanvas'
import { api, streamMessage } from '../../services/api'
import type { Message } from '../../types'

interface LocationState { initialScenario?: string }

export function WorkspacePage() {
  const { projectId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const initialScenario = (location.state as LocationState | null)?.initialScenario
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({ queryKey: ['project', projectId], queryFn: () => api.getProject(projectId), enabled: Boolean(projectId) })
  const { data: savedMessages = [], isLoading: messagesLoading } = useQuery({ queryKey: ['messages', projectId], queryFn: () => api.listMessages(projectId), enabled: Boolean(projectId) })
  const [optimistic, setOptimistic] = useState<Message[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [progress, setProgress] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamError, setStreamError] = useState('')
  const controllerRef = useRef<AbortController | null>(null)
  const initialSent = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const send = useCallback(async (content: string) => {
    const now = new Date().toISOString()
    setOptimistic((items) => [...items, { id: `local-${Date.now()}`, project_id: projectId, role: 'user', content, created_at: now }])
    setStreamingText('')
    setStreamError('')
    setStreaming(true)
    const controller = new AbortController()
    controllerRef.current = controller
    try {
      await streamMessage(projectId, content, (event) => {
        if (event.event === 'progress') setProgress(event.data.label ?? '')
        if (event.event === 'token') setStreamingText((current) => current + (event.data.content ?? ''))
        if (event.event === 'error') setStreamError(event.data.detail ?? 'The provider returned an error.')
        if (event.event === 'done') setProgress('')
      }, controller.signal)
      setOptimistic([])
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['messages', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
      ])
      setStreamingText('')
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setStreamError(error instanceof Error ? error.message : 'Streaming failed')
    } finally {
      setStreaming(false)
      setProgress('')
    }
  }, [projectId, queryClient])

  useEffect(() => {
    if (initialScenario && !initialSent.current && !messagesLoading && savedMessages.length === 0) {
      initialSent.current = true
      navigate(location.pathname, { replace: true, state: null })
      void send(initialScenario)
    }
  }, [initialScenario, location.pathname, messagesLoading, navigate, savedMessages.length, send])

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [optimistic, progress, savedMessages, streamingText])
  useEffect(() => () => controllerRef.current?.abort(), [])

  if (projectLoading) return <LoadingState label="Opening project" />
  if (projectError || !project) return <ErrorState message={projectError?.message ?? 'Project not found'} />
  const visibleMessages = [...savedMessages, ...optimistic]

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <Brand />
        <button className="project-title">{project.name} <ChevronDown size={15} /></button>
        <div className="save-state"><span /> {streaming ? 'Generating…' : 'Draft saved'}</div>
        <div className="workspace-actions"><button title="Undo"><Undo2 size={19} /></button><button title="Redo"><Redo2 size={19} /></button><button title="History"><Clock3 size={19} /></button><button className="export-button"><Download size={17} /> Export <ChevronDown size={14} /></button><button title="More"><MoreVertical size={20} /></button></div>
      </header>
      <aside className="workspace-nav"><Brand compact /><NavLink to="/"><Home size={22} /><span>Home</span></NavLink><NavLink to="/projects" className="active"><span className="folder-icon">▱</span><span>Projects</span></NavLink><NavLink to="/settings"><Settings size={22} /><span>Settings</span></NavLink><button className="workspace-avatar">AS</button></aside>
      <main className="workspace-main">
        <section className="conversation-panel">
          <div className="conversation-scroll" ref={scrollRef}>
            <div className="day-divider"><span>Today</span></div>
            {!messagesLoading && !visibleMessages.length && <div className="empty-conversation"><strong>Start with your modelling scenario</strong><span>Describe the analytical objective, likely sources, and the questions this model should answer.</span></div>}
            {visibleMessages.map((message) => <MessageBubble key={message.id} message={message} />)}
            {(streaming || streamingText) && <MessageBubble streaming message={{ role: 'assistant', content: streamingText || ' ', created_at: new Date().toISOString() }} />}
            {progress && <div className="progress-event"><span className="mini-spinner" /> {progress}</div>}
            {streamError && <div className="chat-error">{streamError}<button onClick={() => { const userMessages = visibleMessages.filter((item) => item.role === 'user'); const last = userMessages[userMessages.length - 1]; if (last) void send(last.content) }}>Retry</button></div>}
          </div>
          <div className="composer-wrap"><ChatComposer disabled={streaming} streaming={streaming} onSend={(value) => void send(value)} onStop={() => controllerRef.current?.abort()} /><div className="composer-tip">♧ Tip: add source-system names and the desired fact grain when you know them.</div></div>
        </section>
        <ModelCanvas />
      </main>
    </div>
  )
}
