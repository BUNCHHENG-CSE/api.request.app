'use client'

import { useState } from 'react'
import { Copy, Check, Clock, Database, Zap, Wand2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

type ResponseTab = 'body' | 'headers' | 'cookies' | 'timeline'

function StatusBadge({ status }: { status: number }) {
  const isSuccess = status < 300
  const isRedirect = status >= 300 && status < 400
  const isClientError = status >= 400 && status < 500
  const isServerError = status >= 500

  const cls = isSuccess ? 'bg-green-500/15 text-green-400 border-green-500/25'
      : isRedirect ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
          : isClientError ? 'bg-orange-500/15 text-orange-400 border-orange-500/25'
              : isServerError ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                  : 'bg-muted/20 text-muted-foreground border-border'

  const dotCls = isSuccess ? 'bg-green-500' : isRedirect ? 'bg-amber-500' : isClientError ? 'bg-orange-500' : 'bg-rose-500'

  return (
      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold border', cls)}>
      <span className={cn('size-1.5 rounded-full', dotCls)} />
        {status}
    </span>
  )
}

export function ResponsePanel() {
  const [activeTab, setActiveTab] = useState<ResponseTab>('body')
  const [copied, setCopied] = useState(false)
  const [prettify, setPrettify] = useState(true)

  // Extract from Zustand
  const activeTabId = useWorkspaceStore((state) => state.activeTabId)
  const responses = useWorkspaceStore((state) => state.responses)
  const loadingTabs = useWorkspaceStore((state) => state.loadingTabs)

  const response = responses[activeTabId] ?? null
  const isLoading = loadingTabs.has(activeTabId)

  const isJson = response?.headers['content-type']?.includes('json')

  const copyBody = () => {
    if (response?.body) navigator.clipboard.writeText(response.body).then()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadBody = () => {
    if (!response?.body) return
    const blob = new Blob([response.body], { type: response.headers['content-type'] ?? 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response.${isJson ? 'json' : 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const TABS: ResponseTab[] = ['body', 'headers', 'cookies', 'timeline']

  return (
      <div className="flex flex-col h-full min-h-0 border-t border-border bg-background">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Response</span>
            {response && (
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={response.status} />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span className="font-medium text-foreground">{response.time}ms</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Database className="size-3" />
                    <span className="font-medium text-foreground">{response.size}</span>
                  </div>
                </div>
            )}
          </div>

          {response && (
              <div className="flex items-center gap-1">
                {isJson && (
                    <button
                        onClick={() => setPrettify(!prettify)}
                        className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] transition-colors', prettify ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface')}
                    >
                      <Wand2 className="size-3" /> Prettify
                    </button>
                )}
                <button onClick={downloadBody} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
                  <Download className="size-3" /> Save
                </button>
                <button onClick={copyBody} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] hover:bg-surface transition-colors">
                  {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3 text-muted-foreground" />}
                  <span className={copied ? 'text-green-400' : 'text-muted-foreground'}>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
          )}
        </div>

        {response && (
            <div className="flex items-center px-4 border-b border-border bg-card shrink-0">
              {TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={cn('relative px-3 py-2 text-xs font-medium capitalize transition-colors', activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                    {tab}
                    {activeTab === tab && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-t-full" />}
                  </button>
              ))}
            </div>
        )}

        <div className="flex-1 overflow-auto min-h-0">
          {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="relative">
                  <Zap className="size-6 text-primary" />
                  <div className="absolute inset-0 animate-ping">
                    <Zap className="size-6 text-primary opacity-30" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Sending request...</p>
              </div>
          ) : !response ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Database className="size-8 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground">Hit Send to get a response</p>
              </div>
          ) : activeTab === 'body' ? (
              <pre className="flex-1 px-4 py-3 text-foreground font-mono text-xs leading-5 overflow-auto whitespace-pre">
            {isJson && prettify ? JSON.stringify(JSON.parse(response.body), null, 2) : response.body}
          </pre>
          ) : activeTab === 'headers' ? (
              <div className="p-4 space-y-1">
                {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                      <span className="text-xs font-mono text-blue-400 shrink-0 min-w-40">{k}</span>
                      <span className="text-xs font-mono text-muted-foreground break-all">{v}</span>
                    </div>
                ))}
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-xs text-muted-foreground/50">Data not available</p>
              </div>
          )}
        </div>
      </div>
  )
}