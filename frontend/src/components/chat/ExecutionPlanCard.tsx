import { CheckCircle2, GitBranch, ShieldAlert, Wrench } from 'lucide-react'
import type { ExecutionState } from '../../types'

interface Props {
  execution: ExecutionState
  disabled: boolean
  onApprove: () => void
  onReject: () => void
}

export function ExecutionPlanCard({ execution, disabled, onApprove, onReject }: Props) {
  const plan = execution.plan
  if (!plan) return null
  return <section className="execution-plan-card" aria-label="Autonomous execution plan">
    <header><span><GitBranch size={15} /></span><div><strong>Execution plan</strong><small>{plan.execution_mode === 'fallback' ? 'Safe fallback plan' : plan.execution_mode === 'deterministic' ? 'Optimized standard plan' : plan.execution_mode === 'cached' ? 'Reused verified plan' : 'AI-planned'} · {plan.steps.length} steps</small></div><b>{execution.workflow_stage?.replace(/_/g, ' ')}</b></header>
    <ol>{plan.steps.map((step) => <li key={step.id} className={`plan-step ${step.status}`}><CheckCircle2 size={13} /><span><strong>{step.title}</strong><small>{step.skill_id}{step.required_tools.length ? ` · ${step.required_tools.join(', ')}` : ''}</small></span></li>)}</ol>
    <footer><span><Wrench size={13} /> {execution.tool_trace.length}/{plan.tool_call_budget} tool calls</span><span><GitBranch size={13} /> {execution.decision_trace.length} decisions</span></footer>
    {execution.approval_status === 'required' && <div className="plan-approval"><ShieldAlert size={16} /><span><strong>Approval required</strong><small>{plan.approval_reason ?? 'Review this external-capability plan before execution.'}</small></span><button disabled={disabled} onClick={onReject}>Reject</button><button disabled={disabled} onClick={onApprove}>Approve plan</button></div>}
  </section>
}
