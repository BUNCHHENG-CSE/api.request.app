'use client'

import { ChevronUp, ChevronDown, Terminal, Trash2, Info, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogEntry {
  id: string
  level: 'log' | 'error' | 'warn' | 'info'
  message: string
  timestamp: Date
  details?: string
}

interface ConsolePanelProps {
  logs: LogEntry[]
  onClear: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}

export function ConsolePanel({ logs, onClear, isMinimized, onToggleMinimize }: ConsolePanelProps) {
  return (
      <div className={cn(
          "flex flex-col border-t border-border bg-background transition-all duration-300 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]",
          isMinimized ? "h-10" : "h-64"
      )}>
        {/* Header Bar */}
        <div
            className="flex items-center justify-between px-4 h-10 border-b border-border/50 bg-muted/20 cursor-pointer select-none hover:bg-muted/40 transition-colors"
            onClick={onToggleMinimize}
        >
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Console</span>
            {logs.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground ml-2">
              {logs.length}
            </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isMinimized && (
                <button
                    onClick={(e) => { e.stopPropagation(); onClear(); }}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors mr-1"
                    title="Clear Console"
                >
                  <Trash2 className="size-3.5" />
                </button>
            )}
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              {isMinimized ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>

        {/* Logs Area */}
        {!isMinimized && (
            <div className="flex-1 overflow-y-auto font-mono text-[11px] p-2 bg-background space-y-1">
              {logs.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground/50">
                    No logs yet. Send a request to see output.
                  </div>
              ) : (
                  logs.map((log) => (
                      <div key={log.id} className="flex flex-col py-1 px-2 rounded hover:bg-muted/30 group transition-colors">
                        <div className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 whitespace-nowrap mt-0.5">
                    {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                  </span>

                          {log.level === 'info' && <Info className="size-3.5 text-blue-500 mt-0.5 shrink-0" />}
                          {log.level === 'warn' && <AlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />}
                          {log.level === 'error' && <XCircle className="size-3.5 text-rose-500 mt-0.5 shrink-0" />}
                          {log.level === 'log' && <div className="size-1.5 rounded-full bg-foreground/30 mt-1.5 shrink-0 ml-1 mr-1" />}

                          <span className={cn(
                              "flex-1",
                              log.level === 'error' ? "text-rose-500 font-medium" :
                                  log.level === 'warn' ? "text-amber-500 font-medium" :
                                      "text-foreground/90"
                          )}>
                    {log.message}
                  </span>
                        </div>

                        {log.details && (
                            <div className="ml-16 mt-1 pl-3 border-l-2 border-border/50 text-muted-foreground overflow-x-auto whitespace-pre pb-1">
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