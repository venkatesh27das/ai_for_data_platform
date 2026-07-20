import { Paperclip, Send, Sparkles, Square } from 'lucide-react'
import { useState } from 'react'

interface Props {
  disabled?: boolean
  streaming?: boolean
  onSend: (content: string) => void
  onStop: () => void
}

export function ChatComposer({ disabled, streaming, onSend, onStop }: Props) {
  const [value, setValue] = useState('')
  const send = () => {
    const content = value.trim()
    if (!content || disabled) return
    setValue('')
    onSend(content)
  }
  return (
    <div className="chat-composer">
      <textarea value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} placeholder="Ask anything about your model..." aria-label="Chat message" />
      <div><span><button aria-label="Attach file"><Paperclip size={18} /></button><button aria-label="Assistant tools"><Sparkles size={18} /></button></span>{streaming ? <button className="composer-send stop" onClick={onStop} aria-label="Stop response"><Square size={17} /></button> : <button className="composer-send" disabled={!value.trim() || disabled} onClick={send} aria-label="Send message"><Send size={19} /></button>}</div>
    </div>
  )
}

