import { Bot, UserRound } from 'lucide-react'
import type { Message } from '../../types'

export function MessageBubble({ message, streaming = false }: { message: Pick<Message, 'role' | 'content' | 'created_at'>; streaming?: boolean }) {
  const assistant = message.role === 'assistant'
  return (
    <article className={`message ${assistant ? 'assistant' : 'user'}`}>
      <span className={`message-avatar ${assistant ? 'bot' : ''}`}>{assistant ? <Bot size={18} /> : <UserRound size={17} />}</span>
      <div className="message-body">
        <div className="message-meta"><strong>{assistant ? 'Assistant' : 'You'}</strong><time>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>
        <div className="message-content">{message.content}{streaming && <span className="stream-cursor" />}</div>
      </div>
    </article>
  )
}

