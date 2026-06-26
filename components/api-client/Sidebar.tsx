'use client'

import { useState } from 'react'
import {
  Folder,
  FolderOpen,
  Plus,
  History,
  Search,
  Blocks,
  FileJson,
  ChevronRight,
  Clock,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MethodBadge } from './ui/MethodBadge'
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

type NavSection = 'collections' | 'history' | 'flows' | 'specs'

const NAV_ITEMS: { id: NavSection; label: string; Icon: React.ElementType }[] = [
  { id: 'collections', label: 'Collections', Icon: Folder },
  { id: 'history', label: 'History', Icon: History },
  { id: 'flows', label: 'Flows', Icon: Blocks },
  { id: 'specs', label: 'Specs', Icon: FileJson },
]

export function Sidebar({
  collections,
  history,
  onSelectRequest,
  onNewRequest,
  onToggleCollection,
  activeSection,
  onSectionChange,
}: SidebarProps) {
  const [filter, setFilter] = useState('')
  const isFullscreen = activeSection === 'flows' || activeSection === 'specs'

  // ── Collapsed icon rail (for flows/specs fullscreen) ─────────────────────────
  if (isFullscreen) {
    return (
      <nav className="flex flex-col items-center pt-4 gap-1 h-full bg-card border-r border-border w-14">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            title={label}
            className={cn(
              'flex items-center justify-center size-9 rounded-xl transition-all',
              activeSection === id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="size-4.5" />
          </button>
        ))}
      </nav>
    )
  }

  // ── Full sidebar ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Section tabs */}
      <div className="flex border-b border-border shrink-0">
        {NAV_ITEMS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={cn(
              'flex-1 py-2.5 text-[11px] font-medium transition-all border-b-2 capitalize',
              activeSection === id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + New button */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={activeSection === 'history' ? 'Filter history...' : 'Filter collections...'}
            className="w-full bg-surface border border-border rounded-lg pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
          />
        </div>
        {activeSection === 'collections' && (
          <button
            onClick={onNewRequest}
            title="New request"
            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Collections */}
        {activeSection === 'collections' && (
          <div className="p-1.5">
            {collections.length === 0 ? (
              <EmptyState icon={<Folder className="size-8" />} label="No collections" sub="Create one to get started" />
            ) : (
              collections
                .filter((c) => !filter || c.name.toLowerCase().includes(filter.toLowerCase()))
                .map((col) => (
                  <CollectionItem
                    key={col.id}
                    collection={col}
                    filter={filter}
                    onToggle={() => onToggleCollection(col.id)}
                    onSelect={(reqId) => onSelectRequest(col.id, reqId)}
                  />
                ))
            )}
          </div>
        )}

        {/* History */}
        {activeSection === 'history' && (
          <div className="p-1.5">
            {history.length === 0 ? (
              <EmptyState icon={<Clock className="size-8" />} label="No history yet" sub="Send a request to see it here" />
            ) : (
              history
                .filter(
                  (e) =>
                    !filter ||
                    e.url.toLowerCase().includes(filter.toLowerCase()) ||
                    e.method.toLowerCase().includes(filter.toLowerCase()),
                )
                .map((entry) => <HistoryItem key={entry.id} entry={entry} />)
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode
  label: string
  sub: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
      <span className="text-muted-foreground/25">{icon}</span>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/60">{sub}</p>
    </div>
  )
}

function CollectionItem({
  collection,
  filter,
  onToggle,
  onSelect,
}: {
  collection: Collection
  filter: string
  onToggle: () => void
  onSelect: (reqId: string) => void
}) {
  const filteredRequests = filter
    ? collection.requests.filter(
        (r) =>
          r.name.toLowerCase().includes(filter.toLowerCase()) ||
          r.method.toLowerCase().includes(filter.toLowerCase()),
      )
    : collection.requests

  if (filter && filteredRequests.length === 0) return null

  const isExpanded = collection.expanded || !!filter

  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground/80 hover:bg-accent hover:text-foreground transition-all group"
      >
        <ChevronRight
          className={cn('size-3 text-muted-foreground transition-transform shrink-0', isExpanded && 'rotate-90')}
        />
        {isExpanded ? (
          <FolderOpen className="size-3.5 text-primary/70 shrink-0" />
        ) : (
          <Folder className="size-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="flex-1 text-left truncate">{collection.name}</span>
        <span className="text-[10px] text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded-md shrink-0">
          {collection.requests.length}
        </span>
      </button>

      {isExpanded && (
        <div className="ml-4 pl-3 mt-0.5 border-l border-border/50 space-y-0.5">
          {filteredRequests.map((req) => (
            <button
              key={req.id}
              onClick={() => onSelect(req.id)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors group"
            >
              <MethodBadge method={req.method} size="xs" />
              <span className="flex-1 text-left truncate text-muted-foreground group-hover:text-foreground transition-colors">
                {req.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const isSuccess = entry.status < 400

  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group">
      <MethodBadge method={entry.method} size="xs" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground group-hover:text-foreground truncate transition-colors font-mono">
          {entry.url}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              'text-[10px] font-bold',
              isSuccess ? 'text-green-400' : 'text-rose-400',
            )}
          >
            {entry.status}
          </span>
          <span className="text-[10px] text-muted-foreground/60">{entry.time}ms</span>
          <span className="text-[10px] text-muted-foreground/40">
            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-400 transition-all">
        <Trash2 className="size-3" />
      </button>
    </div>
  )
}
