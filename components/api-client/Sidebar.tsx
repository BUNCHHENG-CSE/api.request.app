'use client'


import { Folder, FolderOpen, Plus, History, Search, Blocks, FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Collection, HistoryEntry, SidebarSection } from './types'

interface SidebarProps {
  collections: Collection[]
  history: HistoryEntry[]
  onSelectRequest: (collectionId: string, requestId: string) => void
  onNewRequest: () => void
  onToggleCollection: (id: string) => void
  activeSection: SidebarSection
  onSectionChange: (section: SidebarSection) => void
  onOpenProjects: () => void
  activeProjectName?: string
  onEditEnvironment?: (envName: string) => void
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-blue-500',
  POST: 'text-amber-500',
  PUT: 'text-indigo-500',
  PATCH: 'text-purple-500',
  DELETE: 'text-rose-500',
}

export function Sidebar({ collections, history, onSelectRequest, onNewRequest, onToggleCollection, activeSection, onSectionChange }: SidebarProps) {
  const isFullscreenView = activeSection === 'flows' || activeSection === 'specs'

  if (isFullscreenView) {
    return (
        <div className="flex flex-col items-center py-4 gap-4 h-full bg-muted/10 border-r border-border">
          {['collections', 'history', 'flows', 'specs'].map((section) => (
              <button
                  key={section}
                  onClick={() => onSectionChange(section as SidebarSection)}
                  className={cn(
                      "p-2.5 rounded-xl transition-all duration-200",
                      activeSection === section ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={section.charAt(0).toUpperCase() + section.slice(1)}
              >
                {section === 'collections' && <Folder className="size-5" />}
                {section === 'history' && <History className="size-5" />}
                {section === 'flows' && <Blocks className="size-5" />}
                {section === 'specs' && <FileJson className="size-5" />}
              </button>
          ))}
        </div>
    )
  }

  return (
      <div className="flex flex-col h-full bg-background border-r border-border">
        {/* Search & Actions */}
        <div className="px-3 py-3 border-b border-border/50 bg-muted/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                  placeholder="Filter..."
                  className="w-full bg-muted/40 border border-border/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
            </div>
            <button onClick={onNewRequest} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
              <Plus className="size-4" />
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex bg-muted/30 p-1 rounded-lg">
            {(['collections', 'history', 'flows', 'specs'] as const).map((s) => (
                <button
                    key={s}
                    onClick={() => onSectionChange(s)}
                    className={cn(
                        "flex-1 py-1 text-[11px] font-medium rounded-md transition-all capitalize",
                        activeSection === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                  {s}
                </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {activeSection === 'collections' && collections.map((col) => (
              <div key={col.id} className="mb-1">
                <button
                    onClick={() => onToggleCollection(col.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-all group"
                >
                  {col.expanded ? <FolderOpen className="size-3.5 text-primary/70" /> : <Folder className="size-3.5 text-muted-foreground" />}
                  <span className="flex-1 text-left truncate">{col.name}</span>
                </button>
                {col.expanded && (
                    <div className="pl-4 pr-1 mt-0.5 space-y-0.5 relative before:absolute before:left-3.5 before:top-0 before:bottom-0 before:w-px before:bg-border/50">
                      {col.requests.map((req) => (
                          <button
                              key={req.id}
                              onClick={() => onSelectRequest(col.id, req.id)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted/60 transition-colors group"
                          >
                    <span className={cn('text-[9px] font-bold w-10 text-left', METHOD_COLORS[req.method] || 'text-muted-foreground')}>
                      {req.method}
                    </span>
                            <span className="flex-1 text-left truncate text-muted-foreground group-hover:text-foreground transition-colors">{req.name}</span>
                          </button>
                      ))}
                    </div>
                )}
              </div>
          ))}

          {activeSection === 'history' && (
              <div className="space-y-0.5">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                      <History className="size-8 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">No request history yet.<br/>Send a request to see it here.</p>
                    </div>
                ) : (
                    history.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted/50 cursor-pointer text-xs group transition-colors">
                          <span className={cn('text-[9px] font-bold w-10', METHOD_COLORS[entry.method] || 'text-muted-foreground')}>{entry.method}</span>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-foreground/80 group-hover:text-foreground">{entry.url}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                              <span className={cn(entry.status < 400 ? 'text-green-500' : 'text-rose-500')}>{entry.status}</span>
                              <span>{entry.time}ms</span>
                              <span>{entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                    ))
                )}
              </div>
          )}
        </div>
      </div>
  )
}