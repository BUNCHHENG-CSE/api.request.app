'use client'

import { ChevronUp, ChevronDown, Terminal, Trash2, Info, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LogEntry } from './hooks/useWorkspace'

interface ConsolePanelProps {
  logs: LogEntry[]
  onClear: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}

const LOG_ICONS = {
  info: <Info className="size-3 text-blue-400 mt-0.5 shrink-0" />,
  warn: <AlertTriangle className="size-3 text-amber-400 mt-0.5 shrink-0" />,
  error: <XCircle className="size-3 text-rose-400 mt-0.5 shrink-0" />,
  log: <span className="size-1.5 rounded-full bg-foreground/25 mt-1 shrink-0 mx-0.5" />,
}

const LOG_TEXT = {
  info: 'text-blue-400',
  warn: 'text-amber-400',
  error: 'text-rose-400',
  log: 'text-foreground/80',
}

export function ConsolePanel({ logs, onClear, isMinimized, onToggleMinimize }: ConsolePanelProps) {
  const errorCount = logs.filter((l) => l.level === 'error').length
  const warnCount = logs.filter((l) => l.level === 'warn').length

  return (
    <div
      className={cn(
        'flex flex-col border-t border-border bg-card shrink-0 transition-all duration-200',
        isMinimized ? 'h-9' : 'h-52',
      )}
    >
      {/* Header */}
      <button
        onClick={onToggleMinimize}
        className="flex items-center justify-between px-4 h-9 bg-card hover:bg-surface/60 transition-colors cursor-pointer select-none shrink-0"
      >
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Console</span>
          {logs.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-surface text-[9px] font-semibold text-muted-foreground border border-border">
              {logs.length}
            </span>
          )}
          {errorCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-[9px] font-semibold text-rose-400 border border-rose-500/20">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
          {warnCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-[9px] font-semibold text-amber-400 border border-amber-500/20">
              {warnCount} warn{warnCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isMinimized && logs.length > 0 && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-md transition-colors"
              title="Clear console"
            >
              <Trash2 className="size-3" />
            </span>
          )}
          <span className="text-muted-foreground">
            {isMinimized ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </span>
        </div>
      </button>

      {/* Logs */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto font-mono text-[11px] p-1.5 space-y-0.5">
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground/35 text-xs py-6">
              No logs yet. Send a request to see output.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col px-2.5 py-1.5 rounded-lg hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground/35 whitespace-nowrap mt-0.5 text-[10px]">
                    {log.timestamp.toLocaleTimeString([], {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  {LOG_ICONS[log.level]}
                  <span className={cn('flex-1 leading-relaxed', LOG_TEXT[log.level])}>
                    {log.message}
                  </span>
                </div>
                {log.details && (
                  <div className="ml-16 mt-1 pl-3 border-l border-border/50 text-muted-foreground overflow-x-auto whitespace-pre text-[10px]">
                    {log.details}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
