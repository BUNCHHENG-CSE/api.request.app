'use client'

import { useState } from 'react'
import { X, Minimize2, Maximize2, Trash2, ChevronDown, Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type LogLevel = 'log' | 'error' | 'warn' | 'info'

interface LogEntry {
  id: string
  level: LogLevel
  message: string
  timestamp: Date
  details?: string
}

interface TerminalCommand {
  id: string
  command: string
  output?: string
  timestamp: Date
  status: 'success' | 'error'
}

interface Issue {
  id: string
  level: 'error' | 'warning'
  title: string
  description: string
  file?: string
  line?: number
  timestamp: Date
}

interface ConsolePanelProps {
  logs: LogEntry[]
  onClear: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}

const LOG_STYLES: Record<LogLevel, { text: string; dot: string; bg: string }> = {
  log: { text: 'text-foreground/80', dot: 'bg-muted-foreground', bg: '' },
  error: { text: 'text-[oklch(0.65_0.22_25)]', dot: 'bg-[oklch(0.65_0.22_25)]', bg: 'bg-[oklch(0.65_0.22_25/0.05)]' },
  warn: { text: 'text-[oklch(0.72_0.16_65)]', dot: 'bg-[oklch(0.72_0.16_65)]', bg: 'bg-[oklch(0.72_0.16_65/0.05)]' },
  info: { text: 'text-[oklch(0.65_0.18_255)]', dot: 'bg-[oklch(0.65_0.18_255)]', bg: 'bg-[oklch(0.65_0.18_255/0.05)]' },
}

type ConsolePanelTab = 'console' | 'terminal' | 'issues'

export function ConsolePanel({ logs, onClear, isMinimized, onToggleMinimize }: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState<ConsolePanelTab>('console')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [terminalCommands, setTerminalCommands] = useState<TerminalCommand[]>([
    { id: '1', command: 'npm run dev', output: 'Ready on http://localhost:3000', timestamp: new Date(Date.now() - 600000), status: 'success' },
    { id: '2', command: 'git status', output: 'On branch main. Nothing to commit.', timestamp: new Date(Date.now() - 300000), status: 'success' },
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const [issues, setIssues] = useState<Issue[]>([
    { id: '1', level: 'warning', title: 'Unused variable', description: '"header" is defined but never used', file: 'components/TopNav.tsx', line: 42, timestamp: new Date(Date.now() - 450000) },
  ])
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

  const tabs: ConsolePanelTab[] = ['console', 'terminal', 'issues']
  const errorCount = logs.filter((l) => l.level === 'error').length
  const issueCount = issues.length

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim()) return

    const command = terminalInput.trim()
    let output = ''
    let status: 'success' | 'error' = 'success'

    // Simulate common commands
    if (command === 'npm run dev') {
      output = 'Ready on http://localhost:3000'
    } else if (command === 'git status') {
      output = 'On branch main\nNothing to commit, working tree clean'
    } else if (command === 'git log --oneline -3') {
      output = 'a1f8d2c Add terminal and issues tabs\n9e3b4c1 Update API client\n7k2m9n3 Initial setup'
    } else if (command.startsWith('pnpm add')) {
      output = `Added ${command.replace('pnpm add ', '')} to package.json`
    } else if (command === 'clear') {
      setTerminalCommands([])
      setTerminalInput('')
      return
    } else {
      output = `Command not found: ${command}`
      status = 'error'
    }

    setTerminalCommands((prev) => [
      { id: Math.random().toString(36).slice(2), command, output, timestamp: new Date(), status },
      ...prev,
    ])
    setTerminalInput('')
  }

  return (
    <div className={cn(
      'flex flex-col border-t border-border bg-[oklch(0.11_0_0)] transition-all duration-300',
      isMinimized ? 'h-10' : 'h-44'
    )}>
      {/* Console header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-1 text-xs font-medium capitalize transition-all rounded-md',
                activeTab === tab
                  ? 'text-foreground bg-muted/50'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
              {tab === 'console' && errorCount > 0 && (
                <span className="flex items-center justify-center size-4 rounded-full bg-[oklch(0.65_0.22_25/0.2)] text-[oklch(0.65_0.22_25)] text-[10px] font-bold">
                  {errorCount}
                </span>
              )}
              {tab === 'issues' && issueCount > 0 && (
                <span className="flex items-center justify-center size-4 rounded-full bg-[oklch(0.72_0.16_65/0.2)] text-[oklch(0.72_0.16_65)] text-[10px] font-bold">
                  {issueCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(logs.length > 0 || terminalCommands.length > 0 || issues.length > 0) && (
            <button
              onClick={() => {
                onClear()
                setTerminalCommands([])
                setIssues([])
              }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <Trash2 className="size-3" />
              Clear
            </button>
          )}
          <button
            onClick={onToggleMinimize}
            className="flex items-center justify-center size-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            {isMinimized ? <Maximize2 className="size-3" /> : <Minimize2 className="size-3" />}
          </button>
        </div>
      </div>

      {/* Console content */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {activeTab === 'console' && (
            <>
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                  <p className="text-xs font-medium text-foreground/50">No logs yet</p>
                  <p className="text-xs text-muted-foreground/40 mt-1">Send a request to view its details in the console</p>
                </div>
              ) : (
                <div className="py-1">
                  {logs.map((log) => {
                    const style = LOG_STYLES[log.level]
                    const isExpanded = expandedLog === log.id
                    return (
                      <div
                        key={log.id}
                        className={cn('border-b border-border/30', style.bg)}
                      >
                        <button
                          onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/20 transition-all"
                        >
                          <span className={cn('size-1.5 rounded-full flex-shrink-0', style.dot)} />
                          <span className="text-muted-foreground/50 text-[10px] font-mono flex-shrink-0">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <span className={cn('flex-1 text-xs font-mono truncate', style.text)}>
                            {log.message}
                          </span>
                          {log.details && (
                            <ChevronDown className={cn('size-3 text-muted-foreground transition-transform flex-shrink-0', isExpanded && 'rotate-180')} />
                          )}
                        </button>
                        {isExpanded && log.details && (
                          <div className="px-4 pb-3 pl-12">
                            <pre className="text-xs font-mono text-muted-foreground/70 whitespace-pre-wrap">{log.details}</pre>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'terminal' && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Terminal output */}
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                {terminalCommands.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-muted-foreground/60">Terminal is ready</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {terminalCommands.map((cmd) => (
                      <div key={cmd.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[oklch(0.65_0.17_145)]">$</span>
                          <span className="text-foreground">{cmd.command}</span>
                        </div>
                        {cmd.output && (
                          <div className={cn(
                            'pl-6 whitespace-pre-wrap',
                            cmd.status === 'error' ? 'text-[oklch(0.65_0.22_25)]' : 'text-muted-foreground/80'
                          )}>
                            {cmd.output}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terminal input */}
              <div className="border-t border-border px-4 py-2 flex-shrink-0 bg-[oklch(0.09_0_0)]">
                <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-[oklch(0.65_0.17_145)]">flowapi@workspace</span>
                  <span className="text-muted-foreground">~</span>
                  <span className="text-[oklch(0.65_0.17_145)]">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type a command..."
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/50 outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center size-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Send className="size-3" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <>
              {issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                  <div className="size-12 rounded-lg bg-[oklch(0.65_0.17_145/0.1)] flex items-center justify-center mb-3">
                    <AlertCircle className="size-6 text-[oklch(0.65_0.17_145)]" />
                  </div>
                  <p className="text-xs font-medium text-foreground/70">No issues detected</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Great code quality!</p>
                </div>
              ) : (
                <div className="py-2">
                  {issues.map((issue) => {
                    const isExpanded = expandedIssue === issue.id
                    const isError = issue.level === 'error'
                    return (
                      <div
                        key={issue.id}
                        className={cn(
                          'border-b border-border/30',
                          isError ? 'bg-[oklch(0.65_0.22_25/0.05)]' : 'bg-[oklch(0.72_0.16_65/0.05)]'
                        )}
                      >
                        <button
                          onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/20 transition-all"
                        >
                          <div className={cn(
                            'flex items-center justify-center size-5 rounded flex-shrink-0',
                            isError ? 'bg-[oklch(0.65_0.22_25/0.2)]' : 'bg-[oklch(0.72_0.16_65/0.2)]'
                          )}>
                            <span className={cn('text-xs font-bold', isError ? 'text-[oklch(0.65_0.22_25)]' : 'text-[oklch(0.72_0.16_65)]')}>
                              {isError ? 'E' : 'W'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-xs font-medium truncate', isError ? 'text-[oklch(0.65_0.22_25)]' : 'text-[oklch(0.72_0.16_65)]')}>
                              {issue.title}
                            </p>
                            {issue.file && (
                              <p className="text-[10px] text-muted-foreground/60">
                                {issue.file}:{issue.line}
                              </p>
                            )}
                          </div>
                          <ChevronDown className={cn('size-3 text-muted-foreground transition-transform flex-shrink-0', isExpanded && 'rotate-180')} />
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-3 pl-12">
                            <p className="text-xs text-muted-foreground/70">{issue.description}</p>
                            {issue.file && (
                              <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
                                {issue.file}:{issue.line}:{1}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

