import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Box, FileText, Mic, Paperclip, PlusSquare, Send, Sparkles, UploadCloud, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { givenName, useUserProfile } from '../../contexts/userProfile'

const examples = [
  { title: 'Sales Analytics Model', description: 'Build a sales model from SAP order and pricing tables', icon: Box, color: 'green' },
  { title: 'Customer 360 Model', description: 'Consolidate customer data from multiple systems', icon: Users, color: 'blue' },
  { title: 'Product Master Model', description: 'Create a product master with category and supplier info', icon: Box, color: 'orange' },
  { title: 'Finance Reporting Model', description: 'Design a finance model for P&L and balance sheet', icon: Sparkles, color: 'violet' },
]

export function HomePage() {
  const { displayName } = useUserProfile()
  const [scenario, setScenario] = useState('')
  const [sources, setSources] = useState<ImportedSource[]>([])
  const [sourceError, setSourceError] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [voiceState, setVoiceState] = useState<'idle' | 'listening'>('idle')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const scenarioRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const create = useMutation({
    mutationFn: async ({ description, attachedSources }: { description: string; initialMessage: string; attachedSources: ImportedSource[] }) => {
      const project = await api.createProject({
        name: projectName(description),
        objective: description,
        source_count: attachedSources.length,
      })
      try {
        await Promise.all(attachedSources.map((source) => api.uploadSource(project.id, source.file)))
      } catch (error) {
        await api.deleteProject(project.id).catch(() => undefined)
        throw error
      }
      return project
    },
    onSuccess: (project, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate(`/projects/${project.id}`, { state: { initialScenario: variables.initialMessage } })
    },
  })

  function submit(value = scenario) {
    const next = value.trim()
    if (!next || create.isPending) return
    setScenario(next)
    create.mutate({
      description: next,
      initialMessage: scenarioWithSources(next, sources),
      attachedSources: sources,
    })
  }

  async function importSources(files: FileList | null) {
    if (!files?.length) return
    setSourceError('')
    const available = Math.max(0, 6 - sources.length)
    const selected = Array.from(files).slice(0, available)
    if (!available) {
      setSourceError('You can attach up to 6 source files per project.')
      return
    }
    try {
      const imported = await Promise.all(selected.map(readSource))
      setSources((current) => [...current, ...imported])
      if (files.length > selected.length) setSourceError('Only the first 6 source files were attached.')
      scenarioRef.current?.focus()
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : 'Could not read the selected files.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function startNewProject() {
    setScenario('')
    setSources([])
    setSourceError('')
    scenarioRef.current?.focus()
  }

  function chooseExample(description: string) {
    setScenario(description)
    scenarioRef.current?.focus()
  }

  function startVoiceInput() {
    const Recognition = getSpeechRecognition()
    if (!Recognition) {
      setSourceError('Voice input is not supported by this browser. You can type the scenario instead.')
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onstart = () => setVoiceState('listening')
    recognition.onend = () => setVoiceState('idle')
    recognition.onerror = () => {
      setVoiceState('idle')
      setSourceError('Voice input could not start. Check microphone permission and try again.')
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim()
      if (transcript) setScenario((current) => current ? `${current} ${transcript}` : transcript)
    }
    recognition.start()
  }

  return (
    <div className="home-page">
      <section className="home-primary">
        <div className="hero-copy">
          <h1>Welcome, {givenName(displayName)}! <span>👋</span></h1>
          <h2>Let’s build your data model with the power of AI.</h2>
          <p>Describe your business scenario in natural language and I’ll help you create the right data model, mappings and quality rules.</p>
        </div>
        <div className="scenario-box">
          <textarea
            ref={scenarioRef}
            aria-label="Modelling scenario"
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit()
            }}
            placeholder="Describe your data modelling scenario..."
          />
          {!scenario && (
            <div className="scenario-examples">
              <span>For example:</span>
              <p>• Build a sales analytics model using SAP order data</p>
              <p>• Create a customer master model from Salesforce and SAP</p>
              <p>• Design a product master with category and supplier details</p>
            </div>
          )}
          <div className="scenario-actions">
            <input ref={fileInputRef} className="visually-hidden" type="file" multiple accept=".csv,.xlsx,.xlsm,.json,.ddl,.sql" onChange={(event) => void importSources(event.target.files)} />
            <button className="attach-button" type="button" onClick={() => fileInputRef.current?.click()}><Paperclip size={20} /><span>Attach files or drop here<small>CSV, XLSX, JSON, DDL</small></span></button>
            <div><button className={`icon-button ${voiceState === 'listening' ? 'listening' : ''}`} type="button" onClick={startVoiceInput} aria-label={voiceState === 'listening' ? 'Listening for scenario' : 'Voice input'} aria-pressed={voiceState === 'listening'}><Mic size={20} /></button><button className="send-button" onClick={() => submit()} disabled={!scenario.trim() || create.isPending} aria-label="Send scenario"><Send size={21} /></button></div>
          </div>
        </div>
        {sources.length > 0 && <div className="source-chips" aria-label="Attached source files">{sources.map((source) => <span key={source.id}><FileText size={13} />{source.name}<button type="button" aria-label={`Remove ${source.name}`} onClick={() => setSources((current) => current.filter((item) => item.id !== source.id))}><X size={12} /></button></span>)}</div>}
        {(create.isError || sourceError) && <p className="inline-error" role="alert">{sourceError || create.error?.message}</p>}
        <div className="quick-actions">
          <Quick icon={PlusSquare} title="New Project" body="Start a new modelling project from scratch" onClick={startNewProject} />
          <Quick icon={UploadCloud} title="Import Sources" body="Upload metadata or connect to a source" onClick={() => fileInputRef.current?.click()} />
          <Quick icon={Sparkles} title="Use Example" body="Try with a sample business scenario" onClick={() => chooseExample(examples[0]!.description)} />
          <Quick icon={BookOpen} title="Documentation" body="Learn how to get the most from the assistant" onClick={() => setHelpOpen(true)} />
        </div>
        <div className="tip">☼ <span>Tip: The more context you provide, the better and more accurate the model will be.</span></div>
      </section>
      <aside className="home-rail">
        <div className="rail-card">
          <div className="rail-heading"><h3>Example Scenarios</h3><span>↻</span></div>
          {examples.map(({ title, description, icon: Icon, color }) => (
            <button className="example-card" key={title} onClick={() => chooseExample(description)}>
              <span className={`example-icon ${color}`}><Icon size={22} /></span>
              <span><strong>{title}</strong><small>{description}</small></span>
              <ArrowRight size={19} />
            </button>
          ))}
        </div>
        <div className="rail-card recent-card">
          <div className="rail-heading"><h3>Start with a clear outcome</h3></div>
          <p>Name the business process, the decision you want to support, expected measures, and any source systems you already know.</p>
        </div>
      </aside>
      {helpOpen && <HomeHelp onClose={() => setHelpOpen(false)} />}
    </div>
  )
}

interface ImportedSource {
  id: string
  name: string
  size: number
  content: string
  file: File
}

interface SpeechRecognitionResultEventLike {
  results: ArrayLike<ArrayLike<{ transcript?: string }>>
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  start: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognition(): SpeechRecognitionConstructor | undefined {
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

async function readSource(file: File): Promise<ImportedSource> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const readable = ['csv', 'json', 'ddl', 'sql'].includes(extension ?? '')
  const content = readable ? (await file.text()).slice(0, 20_000) : ''
  return { id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name, size: file.size, content, file }
}

function scenarioWithSources(scenario: string, sources: ImportedSource[]): string {
  if (!sources.length) return scenario
  const sourceContext = sources.map((source) => `- ${source.name} (${formatBytes(source.size)})`).join('\n')
  return `${scenario}\n\nAttached source files (profiled by the backend):\n${sourceContext}`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function HomeHelp({ onClose }: { onClose: () => void }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="dialog help-dialog" role="dialog" aria-modal="true" aria-labelledby="home-help-title" onMouseDown={(event) => event.stopPropagation()}><div className="help-dialog-heading"><span><BookOpen size={20} /></span><button type="button" aria-label="Close documentation" onClick={onClose}><X size={17} /></button></div><h2 id="home-help-title">How to start a modelling project</h2><ol><li>Describe the business process, analytical outcome, measures, grain and source systems.</li><li>Optionally attach CSV, JSON, DDL, SQL or spreadsheet metadata.</li><li>Send the scenario and answer the assistant’s modelling clarifications.</li><li>Open generated assets to review the model, mappings, DQ rules and findings.</li></ol><div className="dialog-actions"><button type="button" className="button primary" onClick={onClose}>Got it</button></div></section></div>
}

function projectName(scenario: string) {
  const words = scenario.trim().replace(/[.!?].*$/, '').split(/\s+/).slice(0, 6).join(' ')
  return words ? words.replace(/^(build|create|design)\s+(an?\s+)?/i, '') : 'Untitled modelling project'
}

function Quick({ icon: Icon, title, body, onClick }: { icon: typeof PlusSquare; title: string; body: string; onClick?: () => void }) {
  return <button className="quick-card" onClick={onClick}><span><Icon size={26} /></span><strong>{title}</strong><small>{body}</small></button>
}
