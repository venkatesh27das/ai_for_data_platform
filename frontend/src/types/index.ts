export type ProjectStatus = 'draft' | 'in_progress' | 'needs_review' | 'completed' | 'failed'

export interface Project {
  id: string
  name: string
  objective: string
  status: ProjectStatus
  workflow_stage: string
  source_count: number
  entity_count: number
  mapping_count: number
  dq_rule_count: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  project_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface ProviderSettings {
  provider: string
  base_url: string
  model: string
  api_key_configured: boolean
  temperature: number
  request_timeout: number
  structured_output: boolean
  tool_calling: boolean
  data_dir: string
  max_upload_mb: number
  log_level: string
}

export interface ProviderSettingsPayload extends Omit<ProviderSettings, 'api_key_configured'> {
  api_key?: string
}

export interface StreamEvent {
  event: 'progress' | 'token' | 'done' | 'error'
  data: { content?: string; label?: string; detail?: string }
}

