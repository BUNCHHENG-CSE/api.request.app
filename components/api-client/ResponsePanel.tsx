'use client'

import { useState } from 'react'
import { Copy, Check, Download, Clock, Database, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Response } from './types'

type ResponseTab = 'body' | 'headers' | 'cookies' | 'timeline'

interface ResponsePanelProps {
  response: Response | null
  isLoading: boolean
}

function StatusBadge({ status }: { status: number }) {
  const colorClass =
    status < 300
      ? 'bg-[oklch(0.65_0.17_145/0.15)] text-[oklch(0.65_0.17_145)] border-[oklch(0.65_0.17_145/0.3)]'
      : status < 400
      ? 'bg-[oklch(0.65_0.18_255/0.15)] text-[oklch(0.65_0.18_255)] border-[oklch(0.65_0.18_255/0.3)]'
      : status < 500
      ? 'bg-[oklch(0.72_0.16_65/0.15)] text-[oklch(0.72_0.16_65)] border-[oklch(0.72_0.16_65/0.3)]'
      : 'bg-[oklch(0.65_0.22_25/0.15)] text-[oklch(0.65_0.22_25)] border-[oklch(0.65_0.22_25/0.3)]'

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold', colorClass)}>
      <span className={cn('size-1.5 rounded-full', colorClass.includes('145') ? 'bg-[oklch(0.65_0.17_145)]' : colorClass.includes('255') ? 'bg-[oklch(0.65_0.18_255)]' : colorClass.includes('65/0.15)') ? 'bg-[oklch(0.72_0.16_65)]' : 'bg-[oklch(0.65_0.22_25)]')} />
      {status}
    </span>
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
      className="font-mono text-xs leading-5 whitespace-pre text-foreground"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

function LoadingPulse() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="relative">
        <div className="size-16 rounded-full border-2 border-primary/30 animate-ping absolute inset-0" />
        <div className="size-16 rounded-full border-2 border-primary/60 flex items-center justify-center">
          <Zap className="size-6 text-primary animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-foreground">Sending request...</p>
        <p className="text-xs text-muted-foreground">Waiting for response</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="size-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

function EmptyResponse() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="size-14 rounded-2xl bg-muted/20 border border-border flex items-center justify-center">
        <Database className="size-6 text-muted-foreground/40" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground/70">No response yet</p>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Hit <span className="text-primary font-medium">Send</span> to execute your request and see the response here
        </p>
      </div>
      <div className="flex flex-col gap-2 mt-2 w-full max-w-xs">
        {[
          '⚡ Send + Get a successful response',
          '📊 Send + Visualize response',
          '🧪 Send + Write tests',
        ].map((tip) => (
          <div
            key={tip}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/40 text-xs text-muted-foreground/70"
          >
            {tip}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResponsePanel({ response, isLoading }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>('body')
  const [copied, setCopied] = useState(false)

  const copyBody = () => {
    if (response) {
      navigator.clipboard.writeText(response.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const TABS: ResponseTab[] = ['body', 'headers', 'cookies', 'timeline']

  return (
    <div className="flex flex-col h-full min-h-0 border-t border-border">
      {/* Response header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-[oklch(0.12_0_0)]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response</span>
          {response && (
            <div className="flex items-center gap-3">
              <StatusBadge status={response.status} />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span className="text-foreground font-medium">{response.time}ms</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Database className="size-3" />
                <span className="text-foreground font-medium">{response.size}</span>
              </div>
            </div>
          )}
        </div>

        {response && (
          <div className="flex items-center gap-1">
            <button
              onClick={copyBody}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all"
            >
              {copied ? <Check className="size-3 text-[oklch(0.65_0.17_145)]" /> : <Copy className="size-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all">
              <Download className="size-3" />
              Save
            </button>
          </div>
        )}
      </div>

      {/* Tabs (only when we have response) */}
      {response && (
        <div className="flex items-center gap-0 px-4 border-b border-border bg-[oklch(0.11_0_0)]">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative px-3 py-2.5 text-xs font-medium capitalize transition-all',
                activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <LoadingPulse />
        ) : !response ? (
          <EmptyResponse />
        ) : (
          <>
            {activeTab === 'body' && (
              <div className="flex min-h-full">
                {/* Line numbers */}
                <div className="flex flex-col items-end px-3 py-3 bg-[oklch(0.11_0_0)] border-r border-border/50 select-none min-w-[40px] self-start sticky top-0">
                  {response.body.split('\n').map((_, i) => (
                    <span key={i} className="text-xs text-muted-foreground/40 font-mono leading-5">
                      {i + 1}
                    </span>
                  ))}
                </div>
                <div className="flex-1 px-4 py-3">
                  <JsonHighlight code={response.body} />
                </div>
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="overflow-auto h-full">
                <div className="grid grid-cols-[200px_1fr] gap-0">
                  <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-[oklch(0.11_0_0)]">Key</div>
                  <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-[oklch(0.11_0_0)]">Value</div>
                  {Object.entries(response.headers).map(([key, val]) => (
                    <>
                      <div key={`k-${key}`} className="px-4 py-2.5 text-xs font-mono text-[oklch(0.70_0.15_260)] border-b border-border/40 font-medium">{key}</div>
                      <div key={`v-${key}`} className="px-4 py-2.5 text-xs font-mono text-[oklch(0.72_0.14_145)] border-b border-border/40">{val}</div>
                    </>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cookies' && (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No cookies in this response</p>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="p-6 space-y-3">
                {[
                  { label: 'DNS Lookup', time: '12ms', color: 'bg-[oklch(0.65_0.18_255)]' },
                  { label: 'TCP Connect', time: '34ms', color: 'bg-[oklch(0.65_0.15_220)]' },
                  { label: 'TLS Handshake', time: '45ms', color: 'bg-[oklch(0.72_0.16_65)]' },
                  { label: 'Request Sent', time: '2ms', color: 'bg-[oklch(0.65_0.17_145)]' },
                  { label: 'Waiting (TTFB)', time: `${response.time - 93}ms`, color: 'bg-primary' },
                  { label: 'Content Download', time: '8ms', color: 'bg-[oklch(0.65_0.22_25)]' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-32 text-xs text-muted-foreground text-right flex-shrink-0">{step.label}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className={cn('h-2 rounded-full transition-all', step.color)} style={{ width: `${Math.max(20, parseInt(step.time) / 2)}%` }} />
                      <span className="text-xs font-mono text-foreground">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
