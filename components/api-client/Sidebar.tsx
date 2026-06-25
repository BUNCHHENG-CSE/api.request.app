'use client'

import { useState } from 'react'
import {
  ChevronDown, ChevronRight, Plus, Search, Folder, Clock, Globe,
  GitBranch, Layers, MoreHorizontal, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Collection, HistoryEntry, HttpMethod, SidebarSection } from './types'

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:     'method-GET',
  POST:    'method-POST',
  PUT:     'method-PUT',
  PATCH:   'method-PATCH',
  DELETE:  'method-DELETE',
  HEAD:    'text-muted-foreground',
  OPTIONS: 'text-muted-foreground',
}

interface SidebarProps {
  collections: Collection[]
  history: HistoryEntry[]
  onSelectRequest: (collectionId: string, requestId: string) => void
  onNewRequest: () => void
  onToggleCollection: (id: string) => void
  activeSection: SidebarSection
  onSectionChange: (s: SidebarSection) => void
  onOpenProjects: () => void
  activeProjectName?: string
  onEditEnvironment?: (envName: string) => void
}

const NAV_ITEMS: { id: SidebarSection; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'collections', icon: Folder,     label: 'Collections' },
  { id: 'environments', icon: Globe,      label: 'Environments' },
  { id: 'history',      icon: Clock,      label: 'History' },
]

const BOTTOM_ITEMS: { id: SidebarSection; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'flows',    icon: GitBranch, label: 'Flows' },
  { id: 'specs',    icon: Layers,    label: 'Specs' },
  { id: 'projects', icon: Users,     label: 'Projects' },
]

export function Sidebar({
  collections,
  history,
  onSelectRequest,
  onNewRequest,
  onToggleCollection,
  activeSection,
  onSectionChange,
  onOpenProjects,
  activeProjectName,
  onEditEnvironment,
}: SidebarProps) {
  const [search, setSearch] = useState('')

  const sectionLabel: Record<SidebarSection, string> = {
    collections:  'Collections',
    environments: 'Environments',
    history:      'History',
    flows:        'Flows',
    specs:        'Specs',
    projects:     'Projects',
  }

  const showPanel = activeSection !== 'flows' && activeSection !== 'specs'

  return (
    <div className="flex h-full">
      {/* Icon rail */}
      <div className="flex flex-col items-center gap-1 w-12 bg-[oklch(0.09_0_0)] border-r border-border py-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            title={item.label}
            className={cn(
              'flex items-center justify-center size-9 rounded-lg transition-all duration-150',
              activeSection === item.id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="size-4" />
          </button>
        ))}

        <div className="flex-1" />

        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => item.id === 'projects' ? onOpenProjects() : onSectionChange(item.id)}
            title={item.label}
            className={cn(
              'flex items-center justify-center size-9 rounded-lg transition-all duration-150 relative',
              activeSection === item.id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="size-4" />
            {item.id === 'projects' && activeProjectName && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-[oklch(0.65_0.18_145)]" />
            )}
          </button>
        ))}
      </div>

      {/* Panel content — hidden when flows/specs take over the main area */}
      {showPanel && (
        <div className="flex flex-col flex-1 min-w-0 bg-[oklch(0.11_0_0)]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {sectionLabel[activeSection]}
            </span>
            <button
              onClick={onNewRequest}
              className="flex items-center justify-center size-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${sectionLabel[activeSection].toLowerCase()}...`}
                className="w-full bg-muted/50 border border-border rounded-md pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {activeSection === 'collections' && (
              <div className="space-y-0.5">
                {collections
                  .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                  .map((collection) => (
                    <div key={collection.id}>
                      <button
                        onClick={() => onToggleCollection(collection.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-foreground hover:bg-muted/60 transition-all group"
                      >
                        {collection.expanded
                          ? <ChevronDown className="size-3 text-muted-foreground flex-shrink-0" />
                          : <ChevronRight className="size-3 text-muted-foreground flex-shrink-0" />
                        }
                        <Folder className="size-3.5 text-primary/80 flex-shrink-0" />
                        <span className="flex-1 text-left truncate font-medium">{collection.name}</span>
                        <span className="text-muted-foreground text-[10px]">{collection.requests.length}</span>
                        <MoreHorizontal className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>

                      {collection.expanded && (
                        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pl-2">
                          {collection.requests
                            .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
                            .map((req) => (
                              <button
                                key={req.id}
                                onClick={() => onSelectRequest(collection.id, req.id)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted/60 transition-all group"
                              >
                                <span className={cn('font-bold text-[10px] w-10 flex-shrink-0 text-left', METHOD_COLORS[req.method])}>
                                  {req.method}
                                </span>
                                <span className="flex-1 text-left truncate text-foreground/80 group-hover:text-foreground">
                                  {req.name}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}

                {collections.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Folder className="size-8 text-muted-foreground/40 mb-3" />
                    <p className="text-xs text-muted-foreground">No collections yet</p>
                    <button
                      onClick={onNewRequest}
                      className="mt-3 text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="size-3" />
                      Create collection
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'history' && (
              <div className="space-y-0.5 mt-1">
                {history.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="size-8 text-muted-foreground/40 mb-3" />
                    <p className="text-xs text-muted-foreground">No history yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Send a request to see it here</p>
                  </div>
                )}
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 cursor-pointer transition-all group"
                  >
                    <span className={cn('font-bold text-[10px] w-10 flex-shrink-0', METHOD_COLORS[entry.method])}>
                      {entry.method}
                    </span>
                    <span className="flex-1 truncate text-xs text-foreground/80 group-hover:text-foreground">
                      {entry.url.replace('https://', '').replace('http://', '')}
                    </span>
                    <span className={cn(
                      'text-[10px] font-medium',
                      entry.status < 300 ? 'status-2xx' : entry.status < 400 ? 'status-3xx' : entry.status < 500 ? 'status-4xx' : 'status-5xx'
                    )}>
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'environments' && (
              <div className="space-y-1 mt-1">
                {['Development', 'Staging', 'Production'].map((env) => (
                  <button
                    key={env}
                    onClick={() => onEditEnvironment?.(env)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs hover:bg-muted/60 transition-all group"
                  >
                    <div className={cn(
                      'size-2 rounded-full flex-shrink-0',
                      env === 'Development' ? 'bg-[oklch(0.65_0.17_145)]' :
                      env === 'Staging'     ? 'bg-[oklch(0.72_0.16_65)]'  :
                      'bg-[oklch(0.65_0.22_25)]'
                    )} />
                    <span className="flex-1 text-left text-foreground/80 group-hover:text-foreground font-medium">{env}</span>
                    <MoreHorizontal className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed rail label when flows/specs active */}
      {!showPanel && (
        <div className="flex flex-col flex-1 min-w-0 bg-[oklch(0.11_0_0)] items-center justify-start pt-4 gap-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
            {sectionLabel[activeSection]}
          </span>
        </div>
      )}
    </div>
  )
}
