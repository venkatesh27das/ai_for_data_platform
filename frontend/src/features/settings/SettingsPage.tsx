import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, CircleAlert, KeyRound, Server, SlidersHorizontal } from 'lucide-react'
import { ErrorState, LoadingState } from '../../components/common/States'
import { api } from '../../services/api'
import type { ProviderSettingsPayload } from '../../types'

const defaults: ProviderSettingsPayload = {
  provider: 'lm_studio', base_url: 'http://localhost:1234/v1', model: 'gemma-4-12b-qat', api_key: '',
  temperature: 0.2, request_timeout: 120, structured_output: true, tool_calling: true,
  data_dir: './data', max_upload_mb: 25, log_level: 'INFO',
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['provider-settings'], queryFn: api.getProviderSettings })
  const [form, setForm] = useState<ProviderSettingsPayload>(defaults)
  const [testResult, setTestResult] = useState<{ ok: boolean; detail: string } | null>(null)
  useEffect(() => { if (data) setForm({ ...data, api_key: '' }) }, [data])
  const save = useMutation({ mutationFn: api.saveProviderSettings, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['provider-settings'] }) })
  const test = useMutation({ mutationFn: api.testProvider, onSuccess: setTestResult, onError: (err) => setTestResult({ ok: false, detail: err.message }) })

  function update<K extends keyof ProviderSettingsPayload>(key: K, value: ProviderSettingsPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  if (isLoading) return <div className="settings-page"><LoadingState label="Loading settings" /></div>
  if (error) return <div className="settings-page"><ErrorState message={error.message} /></div>

  return (
    <div className="settings-page">
      <div className="page-title-row"><div><h1>Settings</h1><p>Configure model providers and local application defaults.</p></div></div>
      <form onSubmit={(event: FormEvent) => { event.preventDefault(); save.mutate(form) }}>
        <section className="settings-card">
          <div className="settings-heading"><span><Server size={22} /></span><div><h2>LLM provider</h2><p>All agent model calls use this provider abstraction.</p></div></div>
          <div className="form-grid">
            <label>Active provider<select value={form.provider} onChange={(event) => update('provider', event.target.value)}><option value="lm_studio">LM Studio</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic Claude</option><option value="custom">Custom OpenAI-compatible</option></select></label>
            <label>Model name<input value={form.model} onChange={(event) => update('model', event.target.value)} /></label>
            <label className="full">Provider base URL<input type="url" value={form.base_url} onChange={(event) => update('base_url', event.target.value)} /></label>
            <label className="full">API key <span className="field-hint">{data?.api_key_configured ? 'A key is stored; leave blank to keep it.' : 'Optional for LM Studio.'}</span><div className="input-icon"><KeyRound size={18} /><input type="password" value={form.api_key} onChange={(event) => update('api_key', event.target.value)} placeholder={data?.api_key_configured ? '••••••••••••' : 'Enter API key'} autoComplete="new-password" /></div></label>
            <label>Temperature<input type="number" step="0.1" min="0" max="2" value={form.temperature} onChange={(event) => update('temperature', Number(event.target.value))} /></label>
            <label>Request timeout (seconds)<input type="number" min="5" max="600" value={form.request_timeout} onChange={(event) => update('request_timeout', Number(event.target.value))} /></label>
            <Toggle label="Structured-output mode" checked={form.structured_output} onChange={(checked) => update('structured_output', checked)} />
            <Toggle label="Tool calling enabled" checked={form.tool_calling} onChange={(checked) => update('tool_calling', checked)} />
          </div>
          <div className="settings-actions"><button type="button" className="button secondary" onClick={() => { setTestResult(null); test.mutate(form) }} disabled={test.isPending}>{test.isPending ? 'Testing…' : 'Test connection'}</button><button className="button primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save settings'}</button></div>
          {testResult && <div className={testResult.ok ? 'connection-result ok' : 'connection-result bad'}>{testResult.ok ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />} {testResult.detail}</div>}
          {save.isSuccess && <div className="connection-result ok"><CheckCircle2 size={18} /> Settings saved. Secrets will not be returned by the API.</div>}
        </section>
        <section className="settings-card">
          <div className="settings-heading"><span><SlidersHorizontal size={22} /></span><div><h2>Local application</h2><p>Storage, uploads, and diagnostic defaults.</p></div></div>
          <div className="form-grid"><label className="full">Local data directory<input value={form.data_dir} onChange={(event) => update('data_dir', event.target.value)} /></label><label>Maximum upload size (MB)<input type="number" value={form.max_upload_mb} onChange={(event) => update('max_upload_mb', Number(event.target.value))} /></label><label>Logging level<select value={form.log_level} onChange={(event) => update('log_level', event.target.value)}><option>DEBUG</option><option>INFO</option><option>WARNING</option><option>ERROR</option></select></label></div>
        </section>
      </form>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="toggle-row"><span>{label}</span><button type="button" role="switch" aria-checked={checked} className={checked ? 'toggle on' : 'toggle'} onClick={() => onChange(!checked)}><i /></button></label>
}
