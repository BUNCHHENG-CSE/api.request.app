'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Save, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { METHOD_TEXT, METHOD_BG } from './ui/MethodBadge'
import type { HttpMethod } from './types'

interface UrlBarProps {
  method: HttpMethod
  url: string
  isLoading: boolean
  onMethodChange: (method: HttpMethod) => void
  onUrlChange: (url: string) => void
  onSend: () => void
  onSave: () => void
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export function UrlBar({ method, url, isLoading, onMethodChange, onUrlChange, onSend, onSave }: UrlBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-background border-b border-border shrink-0">
      {/* Method + URL grouped */}
      <div className="flex flex-1 items-center bg-surface border border-border rounded-xl overflow-visible focus-within:ring-1 focus-within:ring-primary/25 focus-within:border-primary/40 transition-all shadow-sm">
        {/* Method dropdown */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              'flex items-center gap-1.5 pl-3.5 pr-2.5 py-2.5 text-xs font-bold border-r border-border/60 hover:bg-accent/50 transition-colors rounded-l-xl',
              METHOD_TEXT[method],
            )}
          >
            {method}
            <ChevronDown className={cn('size-3 text-muted-foreground transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden min-w-[120px]">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => { onMethodChange(m); setDropdownOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-colors hover:bg-accent',
                    METHOD_TEXT[m],
                    m === method && 'bg-accent/50',
                  )}
                >
                  <span className={cn('size-1.5 rounded-full', METHOD_BG[m].split(' ')[0])} />
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* URL Input */}
        <input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="https://api.example.com/v1/endpoint"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none font-mono"
        />
      </div>

      {/* Send button */}
      <button
        onClick={onSend}
        disabled={isLoading || !url.trim()}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <Send className="size-3.5" />
        )}
        Send
      </button>

      {/* Save */}
      <button
        onClick={onSave}
        title="Save request"
        className="p-2.5 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
      >
        <Save className="size-4" />
      </button>
    </div>
  )
}
