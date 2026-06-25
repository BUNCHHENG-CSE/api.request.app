'use client'

import { useState, useRef } from 'react'
import { Send, ChevronDown, Save, Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HttpMethod } from './types'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: 'text-[oklch(0.65_0.17_145)]',
  POST: 'text-[oklch(0.72_0.16_65)]',
  PUT: 'text-[oklch(0.65_0.18_255)]',
  PATCH: 'text-[oklch(0.65_0.15_220)]',
  DELETE: 'text-[oklch(0.65_0.22_25)]',
  HEAD: 'text-muted-foreground',
  OPTIONS: 'text-muted-foreground',
}

const METHOD_SEND_STYLES: Record<HttpMethod, string> = {
  GET: 'bg-[oklch(0.65_0.17_145)] hover:bg-[oklch(0.58_0.17_145)] shadow-[0_0_16px_oklch(0.65_0.17_145/0.3)]',
  POST: 'bg-[oklch(0.62_0.16_65)] hover:bg-[oklch(0.55_0.16_65)] shadow-[0_0_16px_oklch(0.62_0.16_65/0.3)]',
  PUT: 'bg-[oklch(0.65_0.18_255)] hover:bg-[oklch(0.58_0.18_255)] shadow-[0_0_16px_oklch(0.65_0.18_255/0.3)]',
  PATCH: 'bg-[oklch(0.65_0.15_220)] hover:bg-[oklch(0.58_0.15_220)] shadow-[0_0_16px_oklch(0.65_0.15_220/0.3)]',
  DELETE: 'bg-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.58_0.22_25)] shadow-[0_0_16px_oklch(0.65_0.22_25/0.3)]',
  HEAD: 'bg-muted hover:bg-muted/80',
  OPTIONS: 'bg-muted hover:bg-muted/80',
}

interface UrlBarProps {
  method: HttpMethod
  url: string
  isLoading: boolean
  onMethodChange: (method: HttpMethod) => void
  onUrlChange: (url: string) => void
  onSend: () => void
  onSave: () => void
}

export function UrlBar({ method, url, isLoading, onMethodChange, onUrlChange, onSend, onSave }: UrlBarProps) {
  const [methodOpen, setMethodOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[oklch(0.13_0_0)]">
      {/* Method selector */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setMethodOpen(!methodOpen)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold tracking-wide transition-all duration-150',
            'bg-muted/50 border-border hover:border-border/80 hover:bg-muted',
            METHOD_STYLES[method]
          )}
        >
          {method}
          <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform duration-200', methodOpen && 'rotate-180')} />
        </button>

        {methodOpen && (
          <div className="absolute top-full left-0 mt-1.5 z-50 bg-[oklch(0.17_0_0)] border border-border rounded-xl shadow-2xl overflow-hidden min-w-[130px]">
            {METHODS.map((m) => (
              <button
                key={m}
                onClick={() => { onMethodChange(m); setMethodOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-sm font-bold tracking-wide transition-all',
                  'hover:bg-muted/60',
                  m === method ? 'bg-muted/40' : '',
                  METHOD_STYLES[m]
                )}
              >
                {m}
                {m === method && (
                  <span className="ml-auto size-1.5 rounded-full bg-current opacity-70" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* URL input */}
      <div className="flex-1 relative">
        <input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Enter request URL..."
          className={cn(
            'w-full bg-muted/30 border border-border rounded-lg px-4 py-2 text-sm font-mono text-foreground',
            'placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40',
            'transition-all duration-150'
          )}
          spellCheck={false}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onSave}
          title="Save request"
          className="flex items-center justify-center size-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border/60 hover:bg-muted transition-all"
        >
          <Save className="size-4" />
        </button>

        <button
          onClick={onSend}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60',
            METHOD_SEND_STYLES[method]
          )}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          <span>{isLoading ? 'Sending...' : 'Send'}</span>
        </button>
      </div>
    </div>
  )
}
