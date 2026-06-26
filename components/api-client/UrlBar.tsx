'use client'

import { Send, Save, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
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
const METHOD_COLORS: Record<string, string> = {
  GET: 'text-blue-500',
  POST: 'text-amber-500',
  PUT: 'text-indigo-500',
  PATCH: 'text-purple-500',
  DELETE: 'text-rose-500',
}

export function UrlBar({ method, url, isLoading, onMethodChange, onUrlChange, onSend, onSave }: UrlBarProps) {
  return (
      <div className="flex items-center gap-3 px-4 py-3 bg-background border-b border-border">
        {/* URL Input Group */}
        <div className="flex flex-1 items-center bg-muted/10 border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all shadow-sm">
          <div className="relative group">
            <select
                value={method}
                onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
                className={cn(
                    "appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold outline-none cursor-pointer border-r border-border/50 hover:bg-muted/30 transition-colors",
                    METHOD_COLORS[method] || "text-foreground"
                )}
            >
              {METHODS.map((m) => <option key={m} value={m} className="text-foreground bg-background">{m}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
          </div>

          <input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              placeholder="https://api.example.com/v1/users"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
              onClick={onSend}
              disabled={isLoading || !url}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
                <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
                <Send className="size-4" />
            )}
            Send
          </button>
          <button
              onClick={onSave}
              className="p-2.5 text-muted-foreground border border-border bg-muted/10 rounded-lg hover:bg-muted/40 hover:text-foreground transition-all shadow-sm"
              title="Save Request"
          >
            <Save className="size-4" />
          </button>
        </div>
      </div>
  )
}