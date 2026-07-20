import type { Artifact, ExecutionState, MemoryEntry, MemorySettings, Message, Project, ProjectSource, ProviderSettings, ProviderSettingsPayload, StreamEvent } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null
    throw new Error(body?.detail ?? `Request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  listProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (input: { name: string; objective: string; source_count?: number }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(input) }),
  updateProject: (id: string, input: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  duplicateProject: (id: string) => request<Project>(`/projects/${id}/duplicate`, { method: 'POST' }),
  deleteProject: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  listMessages: (id: string) => request<Message[]>(`/projects/${id}/messages`),
  listArtifacts: (id: string) => request<Artifact[]>(`/projects/${id}/artifacts`),
  getExecutionState: (id: string) => request<ExecutionState>(`/projects/${id}/execution`),
  reviewArtifact: (projectId: string, artifactId: string, decision: 'approved' | 'changes_requested', note = '') =>
    request<Artifact>(`/projects/${projectId}/artifacts/${artifactId}/review`, {
      method: 'POST', body: JSON.stringify({ decision, note }),
    }),
  reviseArtifact: (projectId: string, artifactId: string, payload: Record<string, unknown>) =>
    request<Artifact>(`/projects/${projectId}/artifacts/${artifactId}/revisions`, {
      method: 'POST', body: JSON.stringify({ payload }),
    }),
  saveArtifactLayout: (projectId: string, artifactId: string, positions: Record<string, { x: number; y: number }>) =>
    request<Artifact>(`/projects/${projectId}/artifacts/${artifactId}/layout`, {
      method: 'PUT', body: JSON.stringify({ positions }),
    }),
  listSources: (id: string) => request<ProjectSource[]>(`/projects/${id}/sources`),
  uploadSource: async (id: string, file: File) => {
    const body = new FormData()
    body.append('file', file)
    const response = await fetch(`${API_URL}/projects/${id}/sources`, { method: 'POST', body })
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { detail?: string } | null
      throw new Error(error?.detail ?? `Source upload failed (${response.status})`)
    }
    return response.json() as Promise<ProjectSource>
  },
  getProviderSettings: () => request<ProviderSettings>('/settings/provider'),
  saveProviderSettings: (input: ProviderSettingsPayload) =>
    request<ProviderSettings>('/settings/provider', { method: 'PUT', body: JSON.stringify(input) }),
  testProvider: (input: ProviderSettingsPayload) =>
    request<{ ok: boolean; detail: string; models: string[] }>('/settings/provider/test', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getMemorySettings: () => request<MemorySettings>('/memory/settings'),
  saveMemorySettings: (crossProjectEnabled: boolean) =>
    request<MemorySettings>('/memory/settings', {
      method: 'PUT',
      body: JSON.stringify({ cross_project_enabled: crossProjectEnabled }),
    }),
  listUserMemory: () => request<MemoryEntry[]>('/memory/user'),
  deleteAllUserMemory: () => request<void>('/memory/user', { method: 'DELETE' }),
  deleteProjectMemory: (projectId: string) =>
    request<void>(`/projects/${projectId}/memory`, { method: 'DELETE' }),
  cancelRun: (projectId: string, runId: string) =>
    request<{ run_id: string; status: string }>(
      `/projects/${projectId}/messages/runs/${runId}/cancel`,
      { method: 'POST' },
    ),
  getActiveRun: (projectId: string) =>
    request<{ run_id: string; status: string } | null>(
      `/projects/${projectId}/messages/runs/active`,
    ),
}

export async function streamMessage(
  projectId: string,
  content: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  onRunId?: (runId: string) => void,
): Promise<void> {
  const idempotencyKey = crypto.randomUUID()
  const response = await fetch(`${API_URL}/projects/${projectId}/messages/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, idempotency_key: idempotencyKey }),
    signal,
  })
  if (!response.ok || !response.body) throw new Error(`Streaming request failed (${response.status})`)
  const runId = response.headers.get('X-Workflow-Run-ID') ?? ''
  if (runId) onRunId?.(runId)
  let lastSequence = 0
  try {
    lastSequence = await consumeEventStream(response, onEvent, signal, lastSequence)
  } catch (error) {
    if (signal?.aborted || !runId) throw error
    const resumed = await fetch(
      `${API_URL}/projects/${projectId}/messages/runs/${runId}/stream?after=${lastSequence}`,
      { signal },
    )
    if (!resumed.ok || !resumed.body) throw error
    await consumeEventStream(resumed, onEvent, signal, lastSequence)
  }
}

export async function followMessageRun(
  projectId: string,
  runId: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  after = 0,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/messages/runs/${runId}/stream?after=${after}`,
    { signal },
  )
  if (!response.ok || !response.body) throw new Error(`Run reconnect failed (${response.status})`)
  await consumeEventStream(response, onEvent, signal, after)
}

async function consumeEventStream(
  response: Response,
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal | undefined,
  initialSequence: number,
): Promise<number> {
  if (!response.body) return initialSequence
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let sequence = initialSequence
  while (true) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''
    for (const chunk of chunks) {
      let event = 'message'
      let data = ''
      for (const line of chunk.split('\n')) {
        if (line.startsWith('id: ')) sequence = Number(line.slice(4)) || sequence
        if (line.startsWith('event: ')) event = line.slice(7)
        if (line.startsWith('data: ')) data += line.slice(6)
      }
      if (data) onEvent({ event, data: JSON.parse(data) } as StreamEvent)
    }
  }
  return sequence
}
