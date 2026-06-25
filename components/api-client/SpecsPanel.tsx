'use client'

import { useState } from 'react'
import { Layers, ChevronDown, ChevronRight, Download, Search, AlertTriangle, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Spec, SpecEndpoint, HttpMethod } from './types'

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:     'text-[oklch(0.65_0.18_145)]',
  POST:    'text-[oklch(0.72_0.16_65)]',
  PUT:     'text-[oklch(0.65_0.18_255)]',
  PATCH:   'text-[oklch(0.72_0.16_200)]',
  DELETE:  'text-[oklch(0.65_0.22_25)]',
  HEAD:    'text-muted-foreground',
  OPTIONS: 'text-muted-foreground',
}

const METHOD_BADGE: Record<HttpMethod, string> = {
  GET:     'bg-[oklch(0.65_0.18_145)]/15 text-[oklch(0.65_0.18_145)] border border-[oklch(0.65_0.18_145)]/30',
  POST:    'bg-[oklch(0.72_0.16_65)]/15 text-[oklch(0.72_0.16_65)] border border-[oklch(0.72_0.16_65)]/30',
  PUT:     'bg-[oklch(0.65_0.18_255)]/15 text-[oklch(0.65_0.18_255)] border border-[oklch(0.65_0.18_255)]/30',
  PATCH:   'bg-[oklch(0.72_0.16_200)]/15 text-[oklch(0.72_0.16_200)] border border-[oklch(0.72_0.16_200)]/30',
  DELETE:  'bg-[oklch(0.65_0.22_25)]/15 text-[oklch(0.65_0.22_25)] border border-[oklch(0.65_0.22_25)]/30',
  HEAD:    'bg-muted/20 text-muted-foreground border border-border',
  OPTIONS: 'bg-muted/20 text-muted-foreground border border-border',
}

const STATUS_COLORS: Record<number, string> = {
  200: 'text-[oklch(0.65_0.18_145)]',
  201: 'text-[oklch(0.65_0.18_145)]',
  204: 'text-[oklch(0.65_0.18_145)]',
  400: 'text-[oklch(0.72_0.16_65)]',
  401: 'text-[oklch(0.65_0.22_25)]',
  403: 'text-[oklch(0.65_0.22_25)]',
  404: 'text-[oklch(0.65_0.22_25)]',
  409: 'text-[oklch(0.65_0.22_25)]',
  500: 'text-[oklch(0.65_0.22_25)]',
}

function getStatusColor(status: number): string {
  return STATUS_COLORS[status] ?? (status < 400 ? 'text-[oklch(0.65_0.18_145)]' : 'text-[oklch(0.65_0.22_25)]')
}

// ─── Endpoint detail card ─────────────────────────────────────────────────────

function EndpointCard({ endpoint, baseUrl }: { endpoint: SpecEndpoint; baseUrl: string }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const fullUrl = `${baseUrl}${endpoint.path}`

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn(
      'rounded-xl border transition-all overflow-hidden',
      endpoint.deprecated ? 'border-border/50 opacity-60' : 'border-border hover:border-border/80',
      expanded && 'border-primary/30 shadow-md shadow-primary/5'
    )}>
      {/* Row header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-all text-left"
      >
        <span className={cn('text-[10px] font-bold w-14 text-center py-0.5 rounded-md flex-shrink-0', METHOD_BADGE[endpoint.method])}>
          {endpoint.method}
        </span>
        <code className="text-xs text-foreground/90 font-mono flex-1 truncate">{endpoint.path}</code>
        {endpoint.deprecated && (
          <span className="flex items-center gap-1 text-[10px] text-[oklch(0.72_0.16_65)] bg-[oklch(0.72_0.16_65)]/10 px-2 py-0.5 rounded-full border border-[oklch(0.72_0.16_65)]/20 flex-shrink-0">
            <AlertTriangle className="size-2.5" />
            Deprecated
          </span>
        )}
        <span className="text-xs text-muted-foreground truncate max-w-64 flex-shrink-0 hidden md:block">{endpoint.summary}</span>
        {expanded ? (
          <ChevronDown className="size-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border bg-[oklch(0.10_0_0)]">
          {/* URL row */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold w-20 flex-shrink-0">Full URL</span>
            <code className="text-xs text-primary font-mono flex-1">{fullUrl}</code>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              {copied ? <Check className="size-3.5 text-[oklch(0.65_0.18_145)]" /> : <Copy className="size-3.5" />}
            </button>
          </div>

          {/* Description */}
          {endpoint.description && (
            <div className="px-4 py-2.5 border-b border-border/50">
              <p className="text-xs text-muted-foreground leading-relaxed">{endpoint.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 divide-x divide-border/50">
            {/* Parameters */}
            <div className="px-4 py-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2.5">Parameters</div>
              {endpoint.parameters.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 italic">No parameters</p>
              ) : (
                <div className="space-y-2">
                  {endpoint.parameters.map((param) => (
                    <div key={param.name} className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <code className="text-xs font-mono text-foreground/90">{param.name}</code>
                          {param.required && (
                            <span className="text-[9px] text-[oklch(0.65_0.22_25)] font-medium">required</span>
                          )}
                          <span className="text-[9px] text-muted-foreground/60 bg-muted/40 px-1.5 py-0.5 rounded font-mono">{param.in}</span>
                          <span className="text-[9px] text-muted-foreground/60 bg-muted/40 px-1.5 py-0.5 rounded font-mono">{param.type}</span>
                        </div>
                        {param.example && (
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">e.g. {param.example}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Responses */}
            <div className="px-4 py-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2.5">Responses</div>
              <div className="space-y-2">
                {endpoint.responses.map((resp) => (
                  <div key={resp.status} className="flex items-start gap-2">
                    <span className={cn('text-xs font-bold font-mono flex-shrink-0 w-8', getStatusColor(resp.status))}>
                      {resp.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground leading-snug">{resp.description}</p>
                      {resp.example && (
                        <code className="text-[10px] text-muted-foreground/60 font-mono block mt-1 truncate">{resp.example}</code>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface SpecsPanelProps {
  specs: Spec[]
}

export function SpecsPanel({ specs }: SpecsPanelProps) {
  const [activeSpecId, setActiveSpecId] = useState<string>(specs[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  const activeSpec = specs.find((s) => s.id === activeSpecId) ?? specs[0]

  const toggleTag = (tag: string) => {
    setExpandedTags((prev) => ({ ...prev, [tag]: prev[tag] === false ? true : false }))
  }

  const isTagExpanded = (tag: string) => expandedTags[tag] !== false // default open

  const filteredEndpoints = activeSpec?.endpoints.filter((ep) => {
    if (!search) return true
    const q = search.toLowerCase()
    return ep.path.toLowerCase().includes(q) || ep.summary.toLowerCase().includes(q) || ep.method.toLowerCase().includes(q) || ep.tag.toLowerCase().includes(q)
  }) ?? []

  const tagGroups = filteredEndpoints.reduce<Record<string, SpecEndpoint[]>>((acc, ep) => {
    if (!acc[ep.tag]) acc[ep.tag] = []
    acc[ep.tag].push(ep)
    return acc
  }, {})

  const handleExport = () => {
    if (!activeSpec) return
    const blob = new Blob([JSON.stringify(activeSpec, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeSpec.name.toLowerCase().replace(/\s+/g, '-')}-spec.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyBase = () => {
    navigator.clipboard.writeText(activeSpec?.baseUrl ?? '').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const totalCount = activeSpec?.endpoints.length ?? 0
  const methodCounts = activeSpec?.endpoints.reduce<Partial<Record<HttpMethod, number>>>((acc, ep) => {
    acc[ep.method] = (acc[ep.method] ?? 0) + 1
    return acc
  }, {}) ?? {}

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-[oklch(0.11_0_0)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Specs</span>
          <span className="text-xs text-muted-foreground">— OpenAPI endpoint reference</span>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all text-xs"
        >
          <Download className="size-3.5" />
          Export JSON
        </button>
      </div>

      {/* Spec tabs */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-border bg-[oklch(0.10_0_0)] flex-shrink-0 overflow-x-auto">
        {specs.map((s) => (
          <button
            key={s.id}
            onClick={() => { setActiveSpecId(s.id); setSearch('') }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all',
              s.id === activeSpecId
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}
          >
            <Layers className="size-3" />
            {s.name}
            <span className="text-[9px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full">
              {s.endpoints.length}
            </span>
          </button>
        ))}
      </div>

      {activeSpec ? (
        <>
          {/* Spec meta bar */}
          <div className="flex items-center gap-6 px-5 py-3 border-b border-border bg-[oklch(0.095_0_0)] flex-shrink-0 overflow-x-auto">
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Base URL</span>
              <div className="flex items-center gap-1.5">
                <code className="text-xs text-foreground/90 font-mono">{activeSpec.baseUrl}</code>
                <button onClick={handleCopyBase} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Version</span>
              <span className="text-xs text-foreground/90 font-mono">{activeSpec.version}</span>
            </div>
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Endpoints</span>
              <span className="text-xs text-foreground/90 font-mono">{totalCount}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              {(Object.entries(methodCounts) as [HttpMethod, number][]).map(([m, count]) => (
                <div key={m} className="flex items-center gap-1">
                  <span className={cn('text-[10px] font-bold', METHOD_COLORS[m])}>{m}</span>
                  <span className="text-[10px] text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative ml-auto flex-shrink-0">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter endpoints..."
                className="bg-muted/40 border border-border rounded-lg pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 w-48"
              />
            </div>
          </div>

          {/* Endpoint groups */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {Object.keys(tagGroups).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <Search className="size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No endpoints match your search</p>
              </div>
            ) : (
              Object.entries(tagGroups).map(([tag, endpoints]) => (
                <div key={tag}>
                  {/* Tag header */}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-2 mb-3 group w-full"
                  >
                    {isTagExpanded(tag)
                      ? <ChevronDown className="size-3.5 text-muted-foreground" />
                      : <ChevronRight className="size-3.5 text-muted-foreground" />
                    }
                    <span className="text-sm font-semibold text-foreground">{tag}</span>
                    <span className="text-[10px] text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-full">
                      {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 h-px bg-border/50 ml-1" />
                  </button>

                  {isTagExpanded(tag) && (
                    <div className="space-y-2 ml-1">
                      {endpoints.map((ep) => (
                        <EndpointCard key={ep.id} endpoint={ep} baseUrl={activeSpec.baseUrl} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <Layers className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No specs available</p>
        </div>
      )}
    </div>
  )
}
