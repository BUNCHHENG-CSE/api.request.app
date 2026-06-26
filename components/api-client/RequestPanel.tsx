'use client'

import { useRef } from 'react'
import { Upload, Wand2, Code2, Package, Clipboard, RefreshCw, Info, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KeyValueTable } from './ui/KeyValueTable'
import { CodeEditor } from './ui/CodeEditor'
import { SettingsRow } from './ui/Toggle'
import type {
  KeyValueRow,
  BodyType,
  Auth,
  AuthType,
  Scripts,
  RequestSettings,
  FormDataRow,
} from './types'

type PanelTab = 'params' | 'headers' | 'auth' | 'body' | 'scripts' | 'settings'

interface RequestPanelProps {
  headers: KeyValueRow[]
  params: KeyValueRow[]
  body: string
  bodyType: BodyType
  formDataRows?: FormDataRow[]
  formEncodedRows?: KeyValueRow[]
  graphqlQuery?: string
  graphqlVariables?: string
  auth: Auth
  scripts: Scripts
  settings: RequestSettings
  activeTab: PanelTab
  onTabChange: (tab: PanelTab) => void
  onHeadersChange: (h: KeyValueRow[]) => void
  onParamsChange: (p: KeyValueRow[]) => void
  onBodyChange: (b: string) => void
  onBodyTypeChange: (t: BodyType) => void
  onFormDataChange?: (rows: FormDataRow[]) => void
  onFormEncodedChange?: (rows: KeyValueRow[]) => void
  onGraphqlQueryChange?: (q: string) => void
  onGraphqlVariablesChange?: (v: string) => void
  onAuthChange: (a: Auth) => void
  onScriptsChange: (s: Scripts) => void
  onSettingsChange: (s: RequestSettings) => void
}

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

const BODY_TYPES: { id: BodyType; label: string }[] = [
  { id: 'none', label: 'none' },
  { id: 'form-data', label: 'form-data' },
  { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
  { id: 'raw', label: 'raw' },
  { id: 'binary', label: 'binary' },
  { id: 'graphql', label: 'GraphQL' },
]

const RAW_FORMATS = ['JSON', 'XML', 'HTML', 'Text', 'JavaScript']
const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'auth', label: 'Authorization' },
  { id: 'body', label: 'Body' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'settings', label: 'Settings' },
]

export function RequestPanel({
  headers,
  params,
  body,
  bodyType,
  formDataRows = [],
  formEncodedRows = [],
  graphqlQuery = '',
  graphqlVariables = '',
  auth,
  scripts,
  settings,
  activeTab,
  onTabChange,
  onHeadersChange,
  onParamsChange,
  onBodyChange,
  onBodyTypeChange,
  onFormDataChange,
  onFormEncodedChange,
  onGraphqlQueryChange,
  onGraphqlVariablesChange,
  onAuthChange,
  onScriptsChange,
  onSettingsChange,
}: RequestPanelProps) {
  const [rawFormat, setRawFormat] = useState('JSON')

  return (
    <div className="flex flex-col h-full bg-background min-h-0">
      {/* Tab bar */}
      <div className="flex items-center px-3 border-b border-border bg-card shrink-0 overflow-x-auto no-scrollbar">
        {PANEL_TABS.map((tab) => {
          const badge =
            tab.id === 'params' && params.length > 0
              ? params.filter((p) => p.enabled).length
              : tab.id === 'headers' && headers.length > 0
              ? headers.filter((h) => h.enabled).length
              : null
          const hasDot =
            (tab.id === 'auth' && auth.type !== 'none') ||
            (tab.id === 'body' && bodyType !== 'none') ||
            (tab.id === 'scripts' && (scripts.preRequest || scripts.postResponse))

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap shrink-0',
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {tab.label}
              {badge !== null && (
                <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">
                  {badge}
                </span>
              )}
              {hasDot && !badge && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto min-h-0">
        {activeTab === 'params' && (
          <KeyValueTable
            items={params}
            onChange={onParamsChange}
            placeholderKey="Parameter"
            showDescription
          />
        )}

        {activeTab === 'headers' && (
          <KeyValueTable
            items={headers}
            onChange={onHeadersChange}
            placeholderKey="Header Name"
            placeholderValue="Header Value"
            showDescription
          />
        )}

        {activeTab === 'auth' && (
          <AuthTab auth={auth} onChange={onAuthChange} />
        )}

        {activeTab === 'body' && (
          <BodyTab
            bodyType={bodyType}
            body={body}
            rawFormat={rawFormat}
            formDataRows={formDataRows}
            formEncodedRows={formEncodedRows}
            graphqlQuery={graphqlQuery}
            graphqlVariables={graphqlVariables}
            onBodyTypeChange={onBodyTypeChange}
            onBodyChange={onBodyChange}
            onRawFormatChange={setRawFormat}
            onFormDataChange={onFormDataChange ?? (() => {})}
            onFormEncodedChange={onFormEncodedChange ?? (() => {})}
            onGraphqlQueryChange={onGraphqlQueryChange ?? (() => {})}
            onGraphqlVariablesChange={onGraphqlVariablesChange ?? (() => {})}
          />
        )}

        {activeTab === 'scripts' && (
          <ScriptsTab scripts={scripts} onChange={onScriptsChange} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab settings={settings} onChange={onSettingsChange} />
        )}
      </div>
    </div>
  )
}

// ── useState shim inside same file (RequestPanel is a 'use client' module) ────
import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Auth Tab
// ─────────────────────────────────────────────────────────────────────────────
function AuthTab({ auth, onChange }: { auth: Auth; onChange: (a: Auth) => void }) {
  const AUTH_TYPES: { id: AuthType; label: string }[] = [
    { id: 'none', label: 'No Auth' },
    { id: 'bearer', label: 'Bearer Token' },
    { id: 'basic', label: 'Basic Auth' },
    { id: 'api-key', label: 'API Key' },
    { id: 'oauth2', label: 'OAuth 2.0' },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Type selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Auth Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AUTH_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ ...auth, type: t.id })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                auth.type === t.id
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:border-border/80',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bearer Token */}
      {auth.type === 'bearer' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Token
          </label>
          <input
            value={auth.token ?? ''}
            onChange={(e) => onChange({ ...auth, token: e.target.value })}
            placeholder="Enter bearer token..."
            className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all w-full"
          />
        </div>
      )}

      {/* Basic Auth */}
      {auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Username
            </label>
            <input
              value={auth.username ?? ''}
              onChange={(e) => onChange({ ...auth, username: e.target.value })}
              placeholder="username"
              className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={auth.password ?? ''}
              onChange={(e) => onChange({ ...auth, password: e.target.value })}
              placeholder="••••••••"
              className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>
        </div>
      )}

      {/* API Key */}
      {auth.type === 'api-key' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Key Name
              </label>
              <input
                value={auth.apiKeyName ?? 'X-API-Key'}
                onChange={(e) => onChange({ ...auth, apiKeyName: e.target.value })}
                className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Add to
              </label>
              <select
                value={auth.apiKeyIn ?? 'header'}
                onChange={(e) => onChange({ ...auth, apiKeyIn: e.target.value as 'header' | 'query' })}
                className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer"
              >
                <option value="header">Header</option>
                <option value="query">Query Param</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Value
            </label>
            <input
              value={auth.apiKey ?? ''}
              onChange={(e) => onChange({ ...auth, apiKey: e.target.value })}
              placeholder="your-api-key"
              className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all w-full"
            />
          </div>
        </div>
      )}

      {auth.type === 'none' && (
        <p className="text-xs text-muted-foreground mt-2">
          This request does not use any authorization. Select a type above to configure.
        </p>
      )}

      {auth.type === 'oauth2' && (
        <div className="rounded-xl border border-border bg-surface p-4 text-xs text-muted-foreground">
          OAuth 2.0 flow configuration coming soon. Use a bearer token for now.
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Body Tab
// ─────────────────────────────────────────────────────────────────────────────
interface BodyTabProps {
  bodyType: BodyType
  body: string
  rawFormat: string
  formDataRows: FormDataRow[]
  formEncodedRows: KeyValueRow[]
  graphqlQuery: string
  graphqlVariables: string
  onBodyTypeChange: (t: BodyType) => void
  onBodyChange: (b: string) => void
  onRawFormatChange: (f: string) => void
  onFormDataChange: (rows: FormDataRow[]) => void
  onFormEncodedChange: (rows: KeyValueRow[]) => void
  onGraphqlQueryChange: (q: string) => void
  onGraphqlVariablesChange: (v: string) => void
}

function BodyTab({
  bodyType,
  body,
  rawFormat,
  formDataRows,
  formEncodedRows,
  graphqlQuery,
  graphqlVariables,
  onBodyTypeChange,
  onBodyChange,
  onRawFormatChange,
  onFormDataChange,
  onFormEncodedChange,
  onGraphqlQueryChange,
  onGraphqlVariablesChange,
}: BodyTabProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')
  const [rawFormatOpen, setRawFormatOpen] = useState(false)

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(body)
      onBodyChange(JSON.stringify(parsed, null, 2))
    } catch { /* not valid JSON */ }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Body type selector */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 bg-card shrink-0 flex-wrap">
        {BODY_TYPES.map((bt) => (
          <label key={bt.id} className="flex items-center gap-1.5 cursor-pointer">
            <span
              className={cn(
                'size-3.5 rounded-full border-2 flex items-center justify-center transition-all',
                bodyType === bt.id ? 'border-primary' : 'border-muted-foreground/40',
              )}
            >
              {bodyType === bt.id && <span className="size-1.5 rounded-full bg-primary" />}
            </span>
            <button
              onClick={() => onBodyTypeChange(bt.id)}
              className={cn(
                'text-xs transition-colors',
                bodyType === bt.id ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {bt.label}
            </button>
          </label>
        ))}

        {/* Raw format dropdown */}
        {bodyType === 'raw' && (
          <div className="relative ml-1">
            <button
              onClick={() => setRawFormatOpen(!rawFormatOpen)}
              className="flex items-center gap-1 text-xs text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded-md"
            >
              {rawFormat} <ChevronDown className="size-3" />
            </button>
            {rawFormatOpen && (
              <div className="absolute top-full left-0 mt-1 z-40 bg-popover border border-border rounded-xl shadow-xl overflow-hidden min-w-[100px]">
                {RAW_FORMATS.map((f) => (
                  <button
                    key={f}
                    onClick={() => { onRawFormatChange(f); setRawFormatOpen(false) }}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors',
                      f === rawFormat ? 'text-primary font-medium' : 'text-muted-foreground',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Beautify / Schema (raw/json) */}
        {(bodyType === 'raw' || bodyType === 'json') && body.trim() && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-surface transition-colors"
            >
              <Code2 className="size-3" /> Schema
            </button>
            <button
              onClick={handleBeautify}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-surface transition-colors"
            >
              <Wand2 className="size-3" /> Beautify
            </button>
          </div>
        )}

        {/* GraphQL Auto Fetch */}
        {bodyType === 'graphql' && (
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-1 text-[10px] text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded-md">
              Auto Fetch <ChevronDown className="size-3" />
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="size-3" />
            </button>
            <button className="p-1 text-amber-400" title="Schema not loaded">
              <Info className="size-3" />
            </button>
          </div>
        )}
      </div>

      {/* Body content area */}
      <div className="flex-1 min-h-0 overflow-auto">
        {/* None */}
        {bodyType === 'none' && (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground/50">
            This request does not have a body
          </div>
        )}

        {/* form-data */}
        {bodyType === 'form-data' && (
          <FormDataTable rows={formDataRows} onChange={onFormDataChange} />
        )}

        {/* x-www-form-urlencoded */}
        {bodyType === 'x-www-form-urlencoded' && (
          <div>
            <div className="flex items-center justify-end px-4 py-2 border-b border-border/50 bg-card">
              <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                Bulk Edit
              </button>
            </div>
            <KeyValueTable
              items={formEncodedRows}
              onChange={onFormEncodedChange}
              placeholderKey="Key"
              placeholderValue="Value"
              showDescription
            />
          </div>
        )}

        {/* raw */}
        {bodyType === 'raw' && (
          <CodeEditor
            value={body}
            onChange={onBodyChange}
            language={rawFormat.toLowerCase()}
            placeholder={`Enter ${rawFormat} body here...`}
          />
        )}

        {/* binary */}
        {bodyType === 'binary' && (
          <div className="flex flex-col items-start gap-3 p-4">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFileName(f.name)
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border hover:border-primary/40 text-xs text-muted-foreground hover:text-foreground bg-surface hover:bg-surface/60 transition-all"
            >
              <Upload className="size-4" />
              {fileName ? fileName : 'Select file'}
            </button>
            {fileName && (
              <p className="text-[10px] text-muted-foreground">
                File ready to upload: <span className="text-foreground font-mono">{fileName}</span>
              </p>
            )}
          </div>
        )}

        {/* GraphQL */}
        {bodyType === 'graphql' && (
          <div className="flex h-full min-h-0">
            <div className="flex-1 flex flex-col border-r border-border min-h-0">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 bg-card shrink-0">
                Query
              </div>
              <CodeEditor
                value={graphqlQuery}
                onChange={onGraphqlQueryChange}
                placeholder="# Write your GraphQL query here..."
              />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/50 bg-card shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  GraphQL Variables
                </span>
                <Info className="size-3 text-muted-foreground/50" />
              </div>
              <CodeEditor
                value={graphqlVariables}
                onChange={onGraphqlVariablesChange}
                placeholder='{"variable": "value"}'
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// form-data table (with file/text type per row)
// ─────────────────────────────────────────────────────────────────────────────
function FormDataTable({
  rows,
  onChange,
}: {
  rows: FormDataRow[]
  onChange: (rows: FormDataRow[]) => void
}) {
  const update = (id: string, field: keyof FormDataRow, val: string | boolean) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)))

  const addRow = () =>
    onChange([...rows, { id: generateId(), key: '', value: '', enabled: true, type: 'text', description: '' }])

  const removeRow = (id: string) => onChange(rows.filter((r) => r.id !== id))

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-[28px_1fr_100px_1fr_1fr_36px] gap-px bg-border">
        {['', 'Key', 'Type', 'Value', 'Description', ''].map((h, i) => (
          <div
            key={i}
            className="bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {h}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-px bg-border">
        {rows.map((row) => (
          <div
            key={row.id}
            className={cn('grid grid-cols-[28px_1fr_100px_1fr_1fr_36px] gap-px group', !row.enabled && 'opacity-50')}
          >
            <div className="bg-background flex items-center justify-center">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(e) => update(row.id, 'enabled', e.target.checked)}
                className="accent-primary size-3 cursor-pointer"
              />
            </div>
            <input
              value={row.key}
              onChange={(e) => update(row.id, 'key', e.target.value)}
              placeholder="Key"
              className="bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:bg-surface"
            />
            <select
              value={row.type}
              onChange={(e) => update(row.id, 'type', e.target.value as 'text' | 'file')}
              className="bg-background px-3 py-2 text-xs text-muted-foreground focus:outline-none focus:bg-surface cursor-pointer"
            >
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
            <input
              value={row.value}
              onChange={(e) => update(row.id, 'value', e.target.value)}
              placeholder={row.type === 'file' ? 'Select file...' : 'Value'}
              className="bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:bg-surface"
            />
            <input
              value={row.description ?? ''}
              onChange={(e) => update(row.id, 'description', e.target.value)}
              placeholder="Description"
              className="bg-background px-3 py-2 text-xs text-muted-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:bg-surface"
            />
            <button
              onClick={() => removeRow(row.id)}
              className="bg-background flex items-center justify-center text-muted-foreground/20 hover:text-rose-400 transition-colors"
            >
              <span className="sr-only">Remove</span>
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface/60 w-full transition-colors border-t border-border"
      >
        + Add row
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Scripts Tab
// ─────────────────────────────────────────────────────────────────────────────
function ScriptsTab({ scripts, onChange }: { scripts: Scripts; onChange: (s: Scripts) => void }) {
  const [activeScript, setActiveScript] = useState<'preRequest' | 'postResponse'>('preRequest')

  const SNIPPETS = [
    'Set environment variable',
    'Get environment variable',
    'Log response body',
    'Assert status 200',
    'Set bearer token',
  ]

  return (
    <div className="flex h-full min-h-0">
      {/* Left nav */}
      <div className="w-36 shrink-0 border-r border-border flex flex-col bg-card">
        {(['preRequest', 'postResponse'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveScript(s)}
            className={cn(
              'px-4 py-3 text-xs font-medium text-left transition-colors',
              activeScript === s
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground border-l-2 border-transparent',
            )}
          >
            {s === 'preRequest' ? 'Pre-request' : 'Post-response'}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col min-h-0">
        <CodeEditor
          value={scripts[activeScript]}
          onChange={(v) => onChange({ ...scripts, [activeScript]: v })}
          placeholder={
            activeScript === 'preRequest'
              ? '// Use JavaScript to configure this request dynamically.\n// pm.environment.set("token", "my-token");'
              : '// Use JavaScript to write tests, visualize response, and more.\n// pm.test("Status is 200", () => pm.response.to.have.status(200));'
          }
          className="flex-1"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card shrink-0">
          <div className="relative">
            <button
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface transition-colors"
            >
              <Package className="size-3" /> Packages
            </button>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface transition-colors">
              <Clipboard className="size-3" /> Snippets
            </button>
            <div className="absolute bottom-full right-0 mb-2 z-40 hidden group-hover:block bg-popover border border-border rounded-xl shadow-xl overflow-hidden w-52">
              {SNIPPETS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const snippet = `// ${s}\n`
                    onChange({ ...scripts, [activeScript]: scripts[activeScript] + snippet })
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Tab
// ─────────────────────────────────────────────────────────────────────────────
function SettingsTab({
  settings,
  onChange,
}: {
  settings: RequestSettings
  onChange: (s: RequestSettings) => void
}) {
  const set = <K extends keyof RequestSettings>(key: K, val: RequestSettings[K]) =>
    onChange({ ...settings, [key]: val })

  return (
    <div className="p-4 max-w-2xl space-y-1 overflow-auto">
      {/* HTTP Version */}
      <div className="flex items-start justify-between gap-6 py-3 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">HTTP version</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 tracking-wide">
              NEW
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Select the HTTP version to use for sending the request.
          </p>
        </div>
        <select
          value={settings.httpVersion}
          onChange={(e) => set('httpVersion', e.target.value as RequestSettings['httpVersion'])}
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer shrink-0"
        >
          <option value="auto">Auto</option>
          <option value="1.0">HTTP/1.0</option>
          <option value="1.1">HTTP/1.1</option>
          <option value="2">HTTP/2</option>
        </select>
      </div>

      <SettingsRow
        label="Enable SSL certificate verification"
        description="Verify SSL certificates when sending a request. Verification failures will result in the request being aborted."
        checked={settings.sslVerification}
        onChange={(v) => set('sslVerification', v)}
      />
      <SettingsRow
        label="Automatically follow redirects"
        description="Follow HTTP 3xx responses as redirects."
        checked={settings.followRedirects}
        onChange={(v) => set('followRedirects', v)}
      />
      <SettingsRow
        label="Follow original HTTP method"
        description="Redirect with the original HTTP method instead of the default behavior of redirecting with GET."
        checked={settings.followOriginalMethod}
        onChange={(v) => set('followOriginalMethod', v)}
      />
      <SettingsRow
        label="Follow Authorization header"
        description="Retain authorization header when a redirect happens to a different hostname."
        checked={settings.followAuthHeader}
        onChange={(v) => set('followAuthHeader', v)}
      />
      <SettingsRow
        label="Remove referer header on redirect"
        description="Remove the referer header when a redirect happens."
        checked={settings.removeRefererOnRedirect}
        onChange={(v) => set('removeRefererOnRedirect', v)}
      />
      <SettingsRow
        label="Enable strict HTTP parser"
        description="Restrict responses with invalid HTTP headers."
        checked={settings.strictHttpParser}
        onChange={(v) => set('strictHttpParser', v)}
      />
      <SettingsRow
        label="Encode URL automatically"
        description="Encode the URL's path, query parameters, and authentication fields."
        checked={settings.encodeUrlAutomatically}
        onChange={(v) => set('encodeUrlAutomatically', v)}
      />
      <SettingsRow
        label="Disable cookie jar"
        description="Prevent cookies used in this request from being stored in the cookie jar."
        checked={settings.disableCookieJar}
        onChange={(v) => set('disableCookieJar', v)}
      />
      <SettingsRow
        label="Use server cipher suite during handshake"
        description="Use the server's cipher suite order instead of the client's during handshake."
        checked={settings.useServerCipherSuite}
        onChange={(v) => set('useServerCipherSuite', v)}
      />

      {/* Max redirects */}
      <div className="flex items-start justify-between gap-6 py-3 border-b border-border/40">
        <div>
          <span className="text-xs font-medium text-foreground">Maximum number of redirects</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Set a cap on the maximum number of redirects to follow.
          </p>
        </div>
        <input
          type="number"
          min={0}
          max={100}
          value={settings.maxRedirects}
          onChange={(e) => set('maxRedirects', Number(e.target.value))}
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all w-20 text-right shrink-0"
        />
      </div>

      {/* TLS protocols */}
      <div className="flex items-start justify-between gap-6 py-3 border-b border-border/40">
        <div>
          <span className="text-xs font-medium text-foreground">TLS/SSL protocols disabled during handshake</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Specify the SSL and TLS protocol versions to be disabled during handshake.
          </p>
        </div>
        <input
          value={settings.disabledTlsProtocols}
          onChange={(e) => set('disabledTlsProtocols', e.target.value)}
          placeholder="e.g. TLSv1"
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all w-40 shrink-0"
        />
      </div>

      {/* Cipher suite */}
      <div className="flex items-start justify-between gap-6 py-3">
        <div>
          <span className="text-xs font-medium text-foreground">Cipher suite selection</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Order of cipher suites the SSL server profile uses to establish a secure connection.
          </p>
        </div>
        <input
          value={settings.cipherSuiteSelection}
          onChange={(e) => set('cipherSuiteSelection', e.target.value)}
          placeholder="Enter cipher suites"
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all w-40 shrink-0"
        />
      </div>
    </div>
  )
}
