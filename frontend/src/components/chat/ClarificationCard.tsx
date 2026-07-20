import { useEffect, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import type { ClarificationQuestion } from '../../types'

export function ClarificationCard({ questions, disabled, onSubmit }: {
  questions: ClarificationQuestion[]
  disabled: boolean
  onSubmit: (answer: string) => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  useEffect(() => setAnswers({}), [questions])

  function submit() {
    const response = questions
      .map((question) => {
        const answer = answers[question.id]?.trim()
        return answer ? `[clarification:${question.category}] ${answer}` : ''
      })
      .filter(Boolean)
      .join('\n')
    if (response) onSubmit(response)
  }

  return (
    <section className="clarification-card" aria-label="Required modelling clarifications">
      <header><span><CircleHelp size={16} /></span><div><strong>Modelling decisions needed</strong><small>Answer these before model generation continues.</small></div></header>
      {questions.map((question) => <div className="clarification-question" key={question.id}>
        <label htmlFor={`clarification-${question.id}`}>{question.question}</label>
        <p>{question.rationale}</p>
        {question.options.length > 0 && <div className="clarification-options">{question.options.map((option) => <button type="button" className={answers[question.id] === option ? 'selected' : ''} key={option} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}>{option}</button>)}</div>}
        <input id={`clarification-${question.id}`} value={answers[question.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Type your answer…" />
      </div>)}
      <footer><button type="button" disabled={disabled || !questions.some((question) => answers[question.id]?.trim())} onClick={submit}>Continue modelling</button></footer>
    </section>
  )
}
