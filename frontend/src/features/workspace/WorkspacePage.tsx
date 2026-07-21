import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Clock3, Download, Home, MoreVertical, Redo2, Settings, Undo2, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Brand } from '../../components/common/Brand'
import { ErrorState, LoadingState } from '../../components/common/States'
import { MessageBubble } from '../../components/chat/MessageBubble'
import { ChatComposer } from '../../components/chat/ChatComposer'
import { ExecutionPlanCard } from '../../components/chat/ExecutionPlanCard'
import { ClarificationCard } from '../../components/chat/ClarificationCard'
import { ImpactAnalysisCard } from '../../components/chat/ImpactAnalysisCard'
import { ArtifactSummaryCard } from '../../components/artefacts/ArtifactSummaryCard'
import { ModelCanvas } from '../../components/artefacts/ModelCanvas'
import { StructuredArtifactViewer } from '../../components/artefacts/StructuredArtifactViewer'
import { api, followMessageRun, streamMessage } from '../../services/api'
import { displayInitials, useUserProfile } from '../../contexts/userProfile'
import type { Artifact, LogicalModelPayload, Message, StreamEvent } from '../../types'

interface LocationState { initialScenario?: string }

export function WorkspacePage() {
  const { projectId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { displayName } = useUserProfile()
  const initialScenario = (location.state as LocationState | null)?.initialScenario
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({ queryKey: ['project', projectId], queryFn: () => api.getProject(projectId), enabled: Boolean(projectId) })
  const { data: savedMessages = [], isLoading: messagesLoading } = useQuery({ queryKey: ['messages', projectId], queryFn: () => api.listMessages(projectId), enabled: Boolean(projectId) })
  const { data: artifacts = [] } = useQuery({ queryKey: ['artifacts', projectId], queryFn: () => api.listArtifacts(projectId), enabled: Boolean(projectId) })
  const { data: execution } = useQuery({ queryKey: ['execution', projectId], queryFn: () => api.getExecutionState(projectId), enabled: Boolean(projectId) })
  const [optimistic, setOptimistic] = useState<Message[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [progress, setProgress] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamError, setStreamError] = useState('')
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)
  const activeRunRef = useRef<string | null>(null)
  const initialSent = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    if (event.event === 'progress') {
      const mode = event.data.execution_mode === 'fallback' ? ' · safe fallback used' : ''
      setProgress(`${event.data.label ?? ''}${mode}`)
    }
    if (event.event === 'token') setStreamingText((current) => current + (event.data.content ?? ''))
    if (event.event === 'error') setStreamError(event.data.detail ?? 'The provider returned an error.')
    if (event.event === 'done') setProgress('')
  }, [])

  const send = useCallback(async (content: string) => {
    const now = new Date().toISOString()
    setOptimistic((items) => [...items, { id: `local-${Date.now()}`, project_id: projectId, role: 'user', content, created_at: now }])
    setStreamingText('')
    setStreamError('')
    setStreaming(true)
    const controller = new AbortController()
    controllerRef.current = controller
    try {
      await streamMessage(projectId, content, handleStreamEvent, controller.signal, (runId) => { activeRunRef.current = runId })
      setOptimistic([])
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['messages', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['artifacts', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['execution', projectId] }),
      ])
      setStreamingText('')
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setStreamError(error instanceof Error ? error.message : 'Streaming failed')
    } finally {
      activeRunRef.current = null
      setStreaming(false)
      setProgress('')
    }
  }, [handleStreamEvent, projectId, queryClient])

  const stopRun = useCallback(async () => {
    const runId = activeRunRef.current
    if (runId) await api.cancelRun(projectId, runId).catch(() => undefined)
    controllerRef.current?.abort()
  }, [projectId])

  useEffect(() => {
    if (initialScenario && !initialSent.current && !messagesLoading && savedMessages.length === 0) {
      initialSent.current = true
      navigate(location.pathname, { replace: true, state: null })
      void send(initialScenario)
    }
  }, [initialScenario, location.pathname, messagesLoading, navigate, savedMessages.length, send])

  useEffect(() => {
    if (!projectId || initialScenario) return
    const controller = new AbortController()
    void api.getActiveRun(projectId).then(async (run) => {
      if (!run || controller.signal.aborted) return
      activeRunRef.current = run.run_id
      controllerRef.current = controller
      setStreamingText('')
      setStreamError('')
      setStreaming(true)
      try {
        await followMessageRun(projectId, run.run_id, handleStreamEvent, controller.signal)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['messages', projectId] }),
          queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
          queryClient.invalidateQueries({ queryKey: ['artifacts', projectId] }),
          queryClient.invalidateQueries({ queryKey: ['execution', projectId] }),
        ])
        setStreamingText('')
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setStreamError(error instanceof Error ? error.message : 'Run reconnect failed')
      } finally {
        activeRunRef.current = null
        setStreaming(false)
        setProgress('')
      }
    }).catch((error: unknown) => setStreamError(error instanceof Error ? error.message : 'Could not inspect the active run'))
    return () => controller.abort()
  }, [handleStreamEvent, initialScenario, projectId, queryClient])

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [optimistic, progress, savedMessages, streamingText])
  useEffect(() => () => controllerRef.current?.abort(), [])

  if (projectLoading) return <LoadingState label="Opening project" />
  if (projectError || !project) return <ErrorState message={projectError?.message ?? 'Project not found'} />
  const visibleMessages = [...savedMessages, ...optimistic]
  const activeArtifact = artifacts.find((artifact) => artifact.id === activeArtifactId)

  async function reviewArtifact(decision: 'approved' | 'changes_requested') {
    if (!activeArtifact) return
    await api.reviewArtifact(projectId, activeArtifact.id, decision)
    await queryClient.invalidateQueries({ queryKey: ['artifacts', projectId] })
  }

  async function reviseArtifact(payload: Record<string, unknown>) {
    if (!activeArtifact) return
    const revision = await api.reviseArtifact(projectId, activeArtifact.id, payload)
    await queryClient.invalidateQueries({ queryKey: ['artifacts', projectId] })
    setActiveArtifactId(revision.id)
  }

  async function saveLayout(positions: Record<string, { x: number; y: number }>) {
    if (!activeArtifact) return
    await api.saveArtifactLayout(projectId, activeArtifact.id, positions)
    await queryClient.invalidateQueries({ queryKey: ['artifacts', projectId] })
  }

  function regenerateArtifact() {
    if (!activeArtifact || streaming) return
    setActiveArtifactId(null)
    void send(`[regenerate:${activeArtifact.artifact_type}] Regenerate this asset using the latest approved project context and explain material changes.`)
  }

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <Brand />
        <button className="project-title">{project.name} <ChevronDown size={15} /></button>
        <div className="save-state"><span /> {streaming ? 'Generating…' : 'Draft saved'}</div>
        <div className="workspace-actions"><button title="Undo"><Undo2 size={19} /></button><button title="Redo"><Redo2 size={19} /></button><button title="Artifact history" onClick={() => setHistoryOpen(true)}><Clock3 size={19} /></button><button className="export-button"><Download size={17} /> Export <ChevronDown size={14} /></button><button title="More"><MoreVertical size={20} /></button></div>
      </header>
      <aside className="workspace-nav"><Brand compact /><NavLink to="/"><Home size={22} /><span>Home</span></NavLink><NavLink to="/projects" className="active"><span className="folder-icon">▱</span><span>Projects</span></NavLink><NavLink to="/settings"><Settings size={22} /><span>Settings</span></NavLink><button className="workspace-avatar" aria-label={`${displayName} profile`}>{displayInitials(displayName)}</button></aside>
      <main className={`workspace-main ${activeArtifact ? 'viewer-open' : 'chat-only'}`}>
        <section className="conversation-panel">
          <div className="conversation-scroll" ref={scrollRef}>
            <div className="day-divider"><span>Today</span></div>
            {!messagesLoading && !visibleMessages.length && <div className="empty-conversation"><strong>Start with your modelling scenario</strong><span>Describe the analytical objective, likely sources, and the questions this model should answer.</span></div>}
            {visibleMessages.map((message) => <MessageBubble key={message.id} message={message} />)}
            {(streaming || streamingText) && <MessageBubble streaming message={{ role: 'assistant', content: streamingText || ' ', created_at: new Date().toISOString() }} />}
            {progress && <div className="progress-event"><span className="mini-spinner" /> {progress}</div>}
            {execution?.clarification_questions && execution.clarification_questions.length > 0 && <ClarificationCard questions={execution.clarification_questions} disabled={streaming} onSubmit={(answer) => void send(answer)} />}
            {execution?.operation_impact && <ImpactAnalysisCard impact={execution.operation_impact} />}
            {execution?.plan && <ExecutionPlanCard execution={execution} disabled={streaming} onApprove={() => void send('approve plan')} onReject={() => void send('reject plan')} />}
            {streamError && <div className="chat-error">{streamError}<button onClick={() => { const userMessages = visibleMessages.filter((item) => item.role === 'user'); const last = userMessages[userMessages.length - 1]; if (last) void send(last.content) }}>Retry</button></div>}
            {artifacts.length > 0 && <ArtifactSummaryCard artifacts={artifacts} onOpen={(artifact) => setActiveArtifactId(artifact.id)} />}
          </div>
          <div className="composer-wrap"><ChatComposer disabled={streaming} streaming={streaming} onSend={(value) => void send(value)} onStop={() => void stopRun()} /><div className="composer-tip">♧ Tip: add source-system names and the desired fact grain when you know them.</div></div>
        </section>
        {activeArtifact && isLogicalModelArtifact(activeArtifact) && <ModelCanvas artifact={activeArtifact} onClose={() => setActiveArtifactId(null)} onReview={(decision) => void reviewArtifact(decision)} onSaveLayout={saveLayout} onRegenerate={regenerateArtifact} />}
        {activeArtifact && !isLogicalModelArtifact(activeArtifact) && <StructuredArtifactViewer artifact={activeArtifact} onClose={() => setActiveArtifactId(null)} onReview={(decision) => void reviewArtifact(decision)} onRevise={reviseArtifact} onRegenerate={regenerateArtifact} />}
      </main>
      {historyOpen && <aside className="artifact-history" aria-label="Artifact version history"><header><div><strong>Artifact history</strong><small>{artifacts.length} saved versions</small></div><button onClick={() => setHistoryOpen(false)} aria-label="Close history"><X size={16} /></button></header><div>{artifacts.map((artifact) => <button key={artifact.id} onClick={() => { setActiveArtifactId(artifact.id); setHistoryOpen(false) }}><span><strong>{artifact.name}</strong><small>{artifact.artifact_type.replace('_', ' ')}</small></span><span>v{artifact.version}<small>{artifact.review_status}</small></span></button>)}</div></aside>}
    </div>
  )
}

function isLogicalModelArtifact(artifact: Artifact): artifact is Artifact<LogicalModelPayload> {
  const payload = artifact.payload as Partial<LogicalModelPayload>
  return artifact.artifact_type === 'logical_model'
    && Array.isArray(payload.entities)
    && Array.isArray(payload.relationships)
}
