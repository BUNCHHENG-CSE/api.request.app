'use client'

import { useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Header, QueryParam } from './types'

type TabId = 'params' | 'headers' | 'auth' | 'body' | 'scripts' | 'settings'

interface RequestPanelProps {
  headers: Header[]
  params: QueryParam[]
  body: string
  bodyType: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary'
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onHeadersChange: (headers: Header[]) => void
  onParamsChange: (params: QueryParam[]) => void
  onBodyChange: (body: string) => void
  onBodyTypeChange: (type: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary') => void
}

const TABS: { id: TabId; label: string; badge?: number }[] = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'auth', label: 'Authorization' },
  { id: 'body', label: 'Body' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'settings', label: 'Settings' },
]

const BODY_TYPES = ['none', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'] as const

function generateId() {
  return Math.random().toString(36).slice(2)
}

function KeyValueTable({
  rows,
  onChange,
  placeholder,
}: {
  rows: (Header | QueryParam)[]
  onChange: (rows: (Header | QueryParam)[]) => void
  placeholder: string
}) {
  const addRow = () => {
    onChange([...rows, { id: generateId(), key: '', value: '', enabled: true }])
  }

  const updateRow = (id: string, field: 'key' | 'value', value: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const toggleRow = (id: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id))
  }

  return (
    <div className="flex flex-col">
      {/* Column headers */}
      <div className="grid grid-cols-[24px_1fr_1fr_56px] gap-0 px-4 py-2 border-b border-border">
        <div />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Key</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pl-3">Value</span>
        <div />
      </div>

      <div className="flex-1 overflow-y-auto">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={cn(
              'grid grid-cols-[24px_1fr_1fr_56px] gap-0 border-b border-border/40 group',
              !row.enabled && 'opacity-40'
            )}
          >
            <button
              onClick={() => toggleRow(row.id)}
              className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              {row.enabled ? (
                <div className="size-1.5 rounded-full bg-[oklch(0.65_0.17_145)]" />
              ) : (
                <div className="size-1.5 rounded-full bg-muted" />
              )}
            </button>
            <input
              value={row.key}
              onChange={(e) => updateRow(row.id, 'key', e.target.value)}
              placeholder={`${placeholder} key`}
              className="px-3 py-2.5 text-xs font-mono bg-transparent border-r border-border/40 focus:outline-none focus:bg-muted/20 text-foreground placeholder:text-muted-foreground/40 transition-colors"
            />
            <input
              value={row.value}
              onChange={(e) => updateRow(row.id, 'value', e.target.value)}
              placeholder="Value"
              className="px-3 py-2.5 text-xs font-mono bg-transparent border-r border-border/40 focus:outline-none focus:bg-muted/20 text-foreground placeholder:text-muted-foreground/40 transition-colors"
            />
            <div className="flex items-center justify-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => removeRow(row.id)}
                className="size-5 flex items-center justify-center rounded text-muted-foreground hover:text-[oklch(0.65_0.22_25)] transition-colors"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addRow}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all border-b border-border/40"
        >
          <Plus className="size-3" />
          Add {placeholder.toLowerCase()}
        </button>
      </div>
    </div>
  )
}

function JsonHighlight({ code }: { code: string }) {
  const highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)"(\s*:)/g, '<span class="json-key">"$1"</span>$2')
    .replace(/:\s*"([^"]*?)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')

  return (
    <div
      className="font-mono text-xs leading-relaxed whitespace-pre text-foreground"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

export function RequestPanel({
  headers,
  params,
  body,
  bodyType,
  activeTab,
  onTabChange,
  onHeadersChange,
  onParamsChange,
  onBodyChange,
  onBodyTypeChange,
}: RequestPanelProps) {
  const enabledParams = params.filter((p) => p.enabled && p.key).length
  const enabledHeaders = headers.filter((h) => h.enabled && h.key).length
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-4 border-b border-border bg-[oklch(0.12_0_0)] overflow-x-auto">
        {TABS.map(({ id, label }) => {
          const count = id === 'params' ? enabledParams : id === 'headers' ? enabledHeaders : 0
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-all whitespace-nowrap',
                activeTab === id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/70'
              )}
            >
              {label}
              {count > 0 && (
                <span className="flex items-center justify-center size-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                  {count}
                </span>
              )}
              {activeTab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'params' && (
          <KeyValueTable
            rows={params}
            onChange={onParamsChange as any}
            placeholder="Param"
          />
        )}

        {activeTab === 'headers' && (
          <KeyValueTable
            rows={headers}
            onChange={onHeadersChange as any}
            placeholder="Header"
          />
        )}

        {activeTab === 'auth' && (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Auth Type</label>
              <div className="flex flex-wrap gap-2">
                {['Bearer Token', 'API Key', 'Basic Auth', 'OAuth 2.0', 'No Auth'].map((type) => (
                  <button
                    key={type}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      type === 'Bearer Token'
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:border-border/60'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Token</label>
              <input
                placeholder="Enter your Bearer token..."
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
            </div>
          </div>
        )}

        {activeTab === 'body' && (
          <div className="flex flex-col h-full">
            {/* Body type selector */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
              {BODY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => onBodyTypeChange(type)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    bodyType === type
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <span className={cn('size-1.5 rounded-full', bodyType === type ? 'bg-primary' : 'bg-muted-foreground')} />
                  {type}
                </button>
              ))}
            </div>

            {/* Body editor */}
            {bodyType === 'none' ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="size-12 rounded-2xl bg-muted/30 flex items-center justify-center mb-3">
                  <span className="text-xl">∅</span>
                </div>
                <p className="text-sm text-muted-foreground">No body for this request</p>
                <button
                  onClick={() => onBodyTypeChange('json')}
                  className="mt-3 text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <Plus className="size-3" />
                  Add body
                </button>
              </div>
            ) : (
              <div className="flex-1 relative overflow-hidden">
                {/* Line numbers */}
                <div className="flex h-full">
                  <div className="flex flex-col items-end px-3 py-3 bg-[oklch(0.11_0_0)] border-r border-border/50 select-none min-w-[40px]">
                    {body.split('\n').map((_, i) => (
                      <span key={i} className="text-xs text-muted-foreground/40 font-mono leading-5">
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 relative">
                    {isEditing ? (
                      <textarea
                        value={body}
                        onChange={(e) => onBodyChange(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                        className="absolute inset-0 w-full h-full resize-none bg-transparent px-4 py-3 text-xs font-mono text-foreground focus:outline-none leading-5"
                        spellCheck={false}
                      />
                    ) : (
                      <div
                        onClick={() => setIsEditing(true)}
                        className="absolute inset-0 px-4 py-3 cursor-text overflow-auto"
                      >
                        <JsonHighlight code={body} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor toolbar */}
                <div className="absolute top-2 right-3 flex items-center gap-1">
                  <button
                    onClick={() => {
                      try {
                        const pretty = JSON.stringify(JSON.parse(body), null, 2)
                        onBodyChange(pretty)
                      } catch {}
                    }}
                    className="px-2 py-1 text-[10px] font-medium rounded bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all"
                  >
                    Beautify
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pre-request Script</label>
                <span className="text-[10px] text-muted-foreground/50">Runs before the request</span>
              </div>
              <div className="bg-[oklch(0.11_0_0)] rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2 bg-[oklch(0.13_0_0)] border-b border-border flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[oklch(0.65_0.22_25)]" />
                  <div className="size-2 rounded-full bg-[oklch(0.72_0.16_65)]" />
                  <div className="size-2 rounded-full bg-[oklch(0.65_0.17_145)]" />
                  <span className="text-[10px] text-muted-foreground/50 ml-2">pre-request.js</span>
                </div>
                <textarea
                  defaultValue={`// Write your pre-request script here\nconst token = pm.environment.get("token");\npm.request.headers.add({ key: "Authorization", value: "Bearer " + token });`}
                  className="w-full h-28 bg-transparent p-4 text-xs font-mono text-foreground/80 resize-none focus:outline-none leading-5"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 space-y-4">
            {[
              { label: 'Follow Redirects', desc: 'Automatically follow HTTP redirects', default: true },
              { label: 'SSL Certificate Verification', desc: 'Verify SSL certificates for HTTPS requests', default: true },
              { label: 'Send Cookies', desc: 'Include cookies in the request', default: true },
              { label: 'Store Cookies', desc: 'Store cookies from the response', default: false },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between py-3 border-b border-border/40">
                <div>
                  <p className="text-sm font-medium text-foreground">{setting.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                </div>
                <ToggleSwitch defaultChecked={setting.default} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ToggleSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <button
      onClick={() => setChecked(!checked)}
      className={cn(
        'w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
