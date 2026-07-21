import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BrainCircuit, CheckCircle2, CircleAlert, KeyRound, Server, SlidersHorizontal, Trash2 } from 'lucide-react'
import { ErrorState, LoadingState } from '../../components/common/States'
import { api } from '../../services/api'
import type { ProviderSettingsPayload } from '../../types'

const defaults: ProviderSettingsPayload = {
  provider: 'lm_studio', base_url: 'http://localhost:1234/v1', model: 'gemma-4-12b-qat', api_key: '',
  temperature: 0.2, request_timeout: 120, structured_output: true, tool_calling: true,
  data_dir: './data', max_upload_mb: 25, log_level: 'INFO',
}

const providerHelp: Record<string, string> = {
  lm_studio: 'Start the LM Studio local server, load a chat model, and use its OpenAI-compatible /v1 URL.',
  openai: 'Use the OpenAI API base URL, an API key, and an exact model ID available to that key.',
  custom: 'Use any endpoint that implements GET /models and POST /chat/completions in the OpenAI format.',
  anthropic: 'The native Anthropic adapter is planned but is not enabled in this release.',
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['provider-settings'], queryFn: api.getProviderSettings })
  const memory = useQuery({ queryKey: ['memory-settings'], queryFn: api.getMemorySettings })
  const userMemory = useQuery({ queryKey: ['user-memory'], queryFn: api.listUserMemory })
  const [form, setForm] = useState<ProviderSettingsPayload>(defaults)
  const [testResult, setTestResult] = useState<{ ok: boolean; detail: string; models: string[] } | null>(null)
  useEffect(() => { if (data) setForm({ ...data, api_key: '' }) }, [data])
  const save = useMutation({ mutationFn: api.saveProviderSettings, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['provider-settings'] }) })
  const test = useMutation({
    mutationFn: api.testProvider,
    onSuccess: setTestResult,
    onError: (err) => setTestResult({ ok: false, detail: err.message, models: [] }),
  })
  const saveMemory = useMutation({
    mutationFn: api.saveMemorySettings,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['memory-settings'] }),
  })
  const clearMemory = useMutation({
    mutationFn: api.deleteAllUserMemory,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['user-memory'] }),
  })

  function update<K extends keyof ProviderSettingsPayload>(key: K, value: ProviderSettingsPayload[K]) {
    if (key === 'provider' || key === 'base_url' || key === 'model' || key === 'api_key') setTestResult(null)
    setForm((current) => ({ ...current, [key]: value }))
  }

  const savedKeyApplies = Boolean(
    data?.api_key_configured
    && data.provider === form.provider
    && data.base_url.replace(/\/$/, '') === form.base_url.replace(/\/$/, ''),
  )

  if (isLoading) return <div className="settings-page"><LoadingState label="Loading settings" /></div>
  if (error) return <div className="settings-page"><ErrorState message={error.message} /></div>

  return (
    <div className="settings-page">
      <div className="page-title-row"><div><h1>Settings</h1><p>Configure model providers and local application defaults.</p></div></div>
      <form onSubmit={(event: FormEvent) => { event.preventDefault(); save.mutate(form) }}>
        <section className="settings-card">
          <div className="settings-heading"><span><Server size={22} /></span><div><h2>Chat model provider</h2><p>Choose LM Studio, OpenAI, or another OpenAI-compatible endpoint for all agent calls.</p></div></div>
          <div className="form-grid">
            <label>Active provider<select value={form.provider} onChange={(event) => update('provider', event.target.value)}><option value="lm_studio">LM Studio</option><option value="openai">OpenAI</option><option value="custom">Other OpenAI-compatible</option><option value="anthropic" disabled>Anthropic Claude (planned)</option></select></label>
            <label>Model name <span className="field-hint">Enter an ID or test first to discover models.</span><input required list="available-chat-models" value={form.model} onChange={(event) => update('model', event.target.value)} placeholder="e.g. gemma-4-12b-qat" /><datalist id="available-chat-models">{testResult?.models.map((model) => <option key={model} value={model} />)}</datalist></label>
            <div className="provider-guidance full">{providerHelp[form.provider] ?? providerHelp.custom}</div>
            <label className="full">Provider base URL<input required type="url" value={form.base_url} onChange={(event) => update('base_url', event.target.value)} placeholder="https://provider.example/v1" /></label>
            <label className="full">API key <span className="field-hint">{savedKeyApplies ? 'A key is stored for this endpoint; leave blank to keep it.' : form.provider === 'lm_studio' ? 'Usually optional for LM Studio.' : 'Required when the endpoint authenticates requests.'}</span><div className="input-icon"><KeyRound size={18} /><input type="password" value={form.api_key} onChange={(event) => update('api_key', event.target.value)} placeholder={savedKeyApplies ? '••••••••••••' : 'Enter API key'} autoComplete="new-password" /></div></label>
            <label>Temperature<input type="number" step="0.1" min="0" max="2" value={form.temperature} onChange={(event) => update('temperature', Number(event.target.value))} /></label>
            <label>Request timeout (seconds)<input type="number" min="5" max="600" value={form.request_timeout} onChange={(event) => update('request_timeout', Number(event.target.value))} /></label>
            <Toggle label="Structured-output mode" checked={form.structured_output} onChange={(checked) => update('structured_output', checked)} />
            <Toggle label="Tool calling enabled" checked={form.tool_calling} onChange={(checked) => update('tool_calling', checked)} />
          </div>
          <div className="settings-actions"><button type="button" className="button secondary" onClick={() => { setTestResult(null); test.mutate(form) }} disabled={test.isPending || !form.base_url.trim()}>{test.isPending ? 'Testing…' : 'Test & load models'}</button><button className="button primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save settings'}</button></div>
          {testResult && <div className={testResult.ok ? 'connection-result ok' : 'connection-result bad'}>{testResult.ok ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />} <span>{testResult.detail}{testResult.models.length ? ` · ${testResult.models.length} model${testResult.models.length === 1 ? '' : 's'} available in Model name.` : ''}</span></div>}
          {save.isSuccess && <div className="connection-result ok"><CheckCircle2 size={18} /> Settings saved. Secrets will not be returned by the API.</div>}
        </section>
        <section className="settings-card">
          <div className="settings-heading"><span><SlidersHorizontal size={22} /></span><div><h2>Local application</h2><p>Storage, uploads, and diagnostic defaults.</p></div></div>
          <div className="form-grid"><label className="full">Local data directory<input value={form.data_dir} onChange={(event) => update('data_dir', event.target.value)} /></label><label>Maximum upload size (MB)<input type="number" value={form.max_upload_mb} onChange={(event) => update('max_upload_mb', Number(event.target.value))} /></label><label>Logging level<select value={form.log_level} onChange={(event) => update('log_level', event.target.value)}><option>DEBUG</option><option>INFO</option><option>WARNING</option><option>ERROR</option></select></label></div>
        </section>
      </form>
      <section className="settings-card">
        <div className="settings-heading"><span><BrainCircuit size={22} /></span><div><h2>Memory</h2><p>Control durable context used by future modelling conversations.</p></div></div>
        <div className="memory-settings-row">
          <div><strong>Cross-project memory</strong><p>Allow confirmed summaries and preferences from one project to help another. Project-scoped memory remains enabled independently.</p></div>
          <Toggle label="" checked={memory.data?.cross_project_enabled ?? false} onChange={(checked) => saveMemory.mutate(checked)} />
        </div>
        <div className="memory-storage-row">
          <div><strong>{userMemory.data?.length ?? 0} cross-project memories stored</strong><p>Stored locally in SQLite. Turning memory off stops retrieval; deleting removes the saved entries.</p></div>
          <button type="button" className="button danger-outline" disabled={clearMemory.isPending || !userMemory.data?.length} onClick={() => { if (window.confirm('Delete all cross-project memory? Project-specific memories will remain.')) clearMemory.mutate() }}><Trash2 size={15} />{clearMemory.isPending ? 'Deleting…' : 'Delete memory'}</button>
        </div>
        {saveMemory.isSuccess && <div className="connection-result ok"><CheckCircle2 size={18} /> Memory preference saved.</div>}
        {(memory.error || userMemory.error || saveMemory.error || clearMemory.error) && <div className="connection-result bad"><CircleAlert size={18} /> Memory settings could not be updated.</div>}
      </section>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="toggle-row"><span>{label}</span><button type="button" role="switch" aria-checked={checked} className={checked ? 'toggle on' : 'toggle'} onClick={() => onChange(!checked)}><i /></button></label>
}
