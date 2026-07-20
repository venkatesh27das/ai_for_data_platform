import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Box, Mic, Paperclip, PlusSquare, Send, Sparkles, UploadCloud, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

const examples = [
  { title: 'Sales Analytics Model', description: 'Build a sales model from SAP order and pricing tables', icon: Box, color: 'green' },
  { title: 'Customer 360 Model', description: 'Consolidate customer data from multiple systems', icon: Users, color: 'blue' },
  { title: 'Product Master Model', description: 'Create a product master with category and supplier info', icon: Box, color: 'orange' },
  { title: 'Finance Reporting Model', description: 'Design a finance model for P&L and balance sheet', icon: Sparkles, color: 'violet' },
]

export function HomePage() {
  const [scenario, setScenario] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: () => api.createProject({ name: projectName(scenario), objective: scenario }),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate(`/projects/${project.id}`, { state: { initialScenario: scenario } })
    },
  })

  function submit(value = scenario) {
    const next = value.trim()
    if (!next || create.isPending) return
    setScenario(next)
    create.mutate()
  }

  return (
    <div className="home-page">
      <section className="home-primary">
        <div className="hero-copy">
          <h1>Welcome, Ananya! <span>👋</span></h1>
          <h2>Let’s build your data model with the power of AI.</h2>
          <p>Describe your business scenario in natural language and I’ll help you create the right data model, mappings and quality rules.</p>
        </div>
        <div className="scenario-box">
          <textarea
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
            <button className="attach-button" type="button"><Paperclip size={20} /><span>Attach files or drop here<small>CSV, XLSX, JSON, DDL</small></span></button>
            <div><button className="icon-button" type="button" disabled aria-label="Voice input"><Mic size={20} /></button><button className="send-button" onClick={() => submit()} disabled={!scenario.trim() || create.isPending} aria-label="Send scenario"><Send size={21} /></button></div>
          </div>
        </div>
        {create.isError && <p className="inline-error">{create.error.message}</p>}
        <div className="quick-actions">
          <Quick icon={PlusSquare} title="New Project" body="Start a new modelling project from scratch" onClick={() => setScenario('')} />
          <Quick icon={UploadCloud} title="Import Sources" body="Upload metadata or connect to a source" />
          <Quick icon={Sparkles} title="Use Example" body="Try with a sample business scenario" onClick={() => setScenario(examples[0]!.description)} />
          <Quick icon={BookOpen} title="Documentation" body="Learn how to get the most from the assistant" />
        </div>
        <div className="tip">☼ <span>Tip: The more context you provide, the better and more accurate the model will be.</span></div>
      </section>
      <aside className="home-rail">
        <div className="rail-card">
          <div className="rail-heading"><h3>Example Scenarios</h3><span>↻</span></div>
          {examples.map(({ title, description, icon: Icon, color }) => (
            <button className="example-card" key={title} onClick={() => setScenario(description)}>
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
    </div>
  )
}

function projectName(scenario: string) {
  const words = scenario.trim().replace(/[.!?].*$/, '').split(/\s+/).slice(0, 6).join(' ')
  return words ? words.replace(/^(build|create|design)\s+(an?\s+)?/i, '') : 'Untitled modelling project'
}

function Quick({ icon: Icon, title, body, onClick }: { icon: typeof PlusSquare; title: string; body: string; onClick?: () => void }) {
  return <button className="quick-card" onClick={onClick}><span><Icon size={26} /></span><strong>{title}</strong><small>{body}</small></button>
}

