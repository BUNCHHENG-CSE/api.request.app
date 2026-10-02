'use client'

import React, { useState } from 'react'
import {
  Folder, FolderOpen, Plus, History, Search, Blocks, FileJson, ChevronRight, Clock, Check, X, Loader2, Trash2, Pencil, ListChecks
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MethodBadge } from '@/components/web/MethodBadge'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { Collection, HistoryEntry, SidebarSection } from '@/types/api.types'
import { useSync } from '@/hooks/useSync'
import type { BackendHistory } from '@/types/backend.types'

const NAV_ITEMS: { id: SidebarSection; label: string; Icon: React.ElementType }[] = [
  { id: 'collections', label: 'Collections', Icon: Folder },
  { id: 'history', label: 'History', Icon: History },
  { id: 'flows', label: 'Flows', Icon: Blocks },
  { id: 'specs', label: 'Specs', Icon: FileJson },
]

export function Sidebar() {
  const [filter, setFilter] = useState('')
  const [newCollectionOpen, setNewCollectionOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [creatingCollection, setCreatingCollection] = useState(false)
  const [collectionError, setCollectionError] = useState<string | null>(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [historyDetail, setHistoryDetail] = useState<BackendHistory | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Pull state and actions from Zustand
  const collections = useWorkspaceStore((state) => state.collections)
  const history = useWorkspaceStore((state) => state.history)
  const activeSection = useWorkspaceStore((state) => state.sidebarSection)
  const setSidebarSection = useWorkspaceStore((state) => state.setSidebarSection)
  const handleSelectRequest = useWorkspaceStore((state) => state.handleSelectRequest)
  const handleNewTab = useWorkspaceStore((state) => state.handleNewTab)
  const sync = useSync()

  const createCollection = async () => {
    const name = newCollectionName.trim()
    if (!name || creatingCollection) return
    setCreatingCollection(true)
    setCollectionError(null)
    const error = await sync.createCollection(name)
    setCreatingCollection(false)
    if (error) { setCollectionError(error); return }
    setNewCollectionName('')
    setNewCollectionOpen(false)
  }
  const toggleRequest = (id: string) => {
    if (!selectedRequests.has(id) && selectedRequests.size >= 100) { setCollectionError('Bulk delete supports up to 100 requests at a time.'); return }
    setSelectedRequests((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const deleteSelected = async () => {
    if (!selectedRequests.size || !window.confirm(`Delete ${selectedRequests.size} selected requests?`)) return
    setBulkDeleting(true)
    const message = await sync.bulkDeleteRequests([...selectedRequests])
    setBulkDeleting(false)
    if (message) { setCollectionError(message); return }
    setSelectedRequests(new Set()); setBulkMode(false)
  }
  const openHistory = async (id: string) => {
    setHistoryLoading(true)
    const detail = await sync.getHistory(id)
    setHistoryLoading(false)
    setHistoryDetail(detail)
  }

  const isFullscreen = activeSection === 'flows' || activeSection === 'specs'

  if (isFullscreen) {
    return (
        <nav className="flex flex-col items-center pt-4 gap-1 h-full bg-card border-r border-border w-14">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                  key={id}
                  onClick={() => setSidebarSection(id)}
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

  return (
      <div className="flex flex-col h-full bg-card">
        <div className="flex border-b border-border shrink-0">
          {NAV_ITEMS.map(({ id, label }) => (
              <button
                  key={id}
                  onClick={() => setSidebarSection(id)}
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
              <div className="flex gap-1">
                <button onClick={() => { setBulkMode((value) => !value); setSelectedRequests(new Set()) }} title="Select multiple requests" className={cn('p-1.5 rounded-lg transition-colors shrink-0', bulkMode ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20')}><ListChecks className="size-3.5" /></button>
                <button onClick={() => { setNewCollectionOpen(true); setCollectionError(null) }} title="New collection" className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"><Folder className="size-3.5" /></button>
                <button onClick={handleNewTab} title="New request" className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"><Plus className="size-3.5" /></button>
              </div>
          )}
          {activeSection === 'history' && history.length > 0 && (
              <button onClick={async () => { if (!window.confirm('Clear all execution history?')) return; const message = await sync.clearHistory(); if (message) setCollectionError(message) }} title="Clear history" className="p-1.5 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"><Trash2 className="size-3.5" /></button>
          )}
        </div>

        {activeSection === 'collections' && bulkMode && (
            <div className="flex items-center gap-2 border-b border-border/50 bg-primary/5 px-3 py-2">
              <span className="flex-1 text-[10px] font-medium text-muted-foreground">{selectedRequests.size} selected</span>
              <button onClick={() => { setBulkMode(false); setSelectedRequests(new Set()) }} className="rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => void deleteSelected()} disabled={!selectedRequests.size || bulkDeleting} className="flex items-center gap-1 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-40">{bulkDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />} Delete</button>
            </div>
        )}

        {activeSection === 'collections' && newCollectionOpen && (
            <div className="border-b border-border/50 p-2.5">
              <div className="flex items-center gap-1.5">
                <input autoFocus value={newCollectionName} onChange={(event) => setNewCollectionName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void createCollection(); if (event.key === 'Escape') setNewCollectionOpen(false) }} placeholder="Collection name" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" />
                <button onClick={() => void createCollection()} disabled={!newCollectionName.trim() || creatingCollection} title="Create collection" className="rounded-lg bg-primary p-1.5 text-primary-foreground disabled:opacity-40">{creatingCollection ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}</button>
                <button onClick={() => { setNewCollectionOpen(false); setCollectionError(null) }} title="Cancel" className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
              </div>
              {collectionError && <p className="mt-1.5 text-[10px] text-rose-500">{collectionError}</p>}
            </div>
        )}

        <div className="flex-1 overflow-y-auto">
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
                                onSelect={(reqId) => handleSelectRequest(col.id, reqId)}
                                bulkMode={bulkMode}
                                selectedRequests={selectedRequests}
                                onToggleRequest={toggleRequest}
                                onRename={col.id.startsWith('uncollected-') ? undefined : async (name) => { const message = await sync.renameCollection(col.id, name); if (message) setCollectionError(message) }}
                                deleteTitle={col.id.startsWith('uncollected-') ? 'Delete all uncollected requests' : 'Delete collection'}
                                onDelete={col.id.startsWith('uncollected-')
                                  ? col.requests.length ? async () => { if (!window.confirm(`Delete all ${col.requests.length} uncollected requests? This permanently deletes the requests.`)) return; const message = await sync.bulkDeleteRequests(col.requests.map((request) => request.id)); if (message) setCollectionError(message) } : undefined
                                  : async () => { if (!window.confirm(`Delete collection ${col.name}? Requests will be kept.`)) return; const message = await sync.deleteCollection(col.id); if (message) setCollectionError(message) }}
                            />
                        ))
                )}
              </div>
          )}

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
                        .map((entry) => <HistoryItem key={entry.id} entry={entry} onClick={() => void openHistory(entry.id)} />)
                )}
              </div>
          )}
        </div>
        {(historyLoading || historyDetail) && (
            <HistoryDetail detail={historyDetail} loading={historyLoading} onClose={() => setHistoryDetail(null)} />
        )}
      </div>
  )
}

// Sub-components for Sidebar
function EmptyState({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
      <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
        <span className="text-muted-foreground/25">{icon}</span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground/60">{sub}</p>
      </div>
  )
}

function CollectionItem({ collection, filter, onSelect, onRename, onDelete, deleteTitle, bulkMode, selectedRequests, onToggleRequest }: {
  collection: Collection; filter: string; onSelect: (reqId: string) => void; onRename?: (name: string) => void; onDelete?: () => void
  deleteTitle?: string; bulkMode: boolean; selectedRequests: Set<string>; onToggleRequest: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(collection.expanded)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(collection.name)

  const filteredRequests = filter
      ? collection.requests.filter(
          (r) => r.name.toLowerCase().includes(filter.toLowerCase()) || r.method.toLowerCase().includes(filter.toLowerCase()),
      )
      : collection.requests

  if (filter && filteredRequests.length === 0) return null

  const isExpanded = expanded || !!filter

  return (
      <div className="mb-0.5">
        <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground/80 hover:bg-accent hover:text-foreground transition-all group"
        >
          <ChevronRight className={cn('size-3 text-muted-foreground transition-transform shrink-0', isExpanded && 'rotate-90')} />
          {isExpanded ? <FolderOpen className="size-3.5 text-primary/70 shrink-0" /> : <Folder className="size-3.5 text-muted-foreground shrink-0" />}
          {renaming ? <input autoFocus value={name} onClick={(event) => event.stopPropagation()} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { event.stopPropagation(); if (event.key === 'Enter' && name.trim()) { onRename?.(name.trim()); setRenaming(false) } if (event.key === 'Escape') { setName(collection.name); setRenaming(false) } }} className="min-w-0 flex-1 rounded border border-primary/40 bg-background px-1.5 py-0.5 text-xs outline-none" /> : <span className="flex-1 text-left truncate">{collection.name}</span>}
          <span className="text-[10px] text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded-md shrink-0">{collection.requests.length}</span>
          {onRename && !renaming && <span role="button" tabIndex={0} title="Rename collection" onClick={(event) => { event.stopPropagation(); setName(collection.name); setRenaming(true) }} onKeyDown={(event) => { if (event.key === 'Enter') { event.stopPropagation(); setRenaming(true) } }} className="rounded p-0.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-primary"><Pencil className="size-3" /></span>}
          {renaming && <><span role="button" tabIndex={0} title="Save name" onClick={(event) => { event.stopPropagation(); if (name.trim()) onRename?.(name.trim()); setRenaming(false) }} className="rounded p-0.5 text-primary"><Check className="size-3" /></span><span role="button" tabIndex={0} title="Cancel rename" onClick={(event) => { event.stopPropagation(); setName(collection.name); setRenaming(false) }} className="rounded p-0.5 text-muted-foreground"><X className="size-3" /></span></>}
          {onDelete && <span role="button" tabIndex={0} title={deleteTitle ?? 'Delete collection'} onClick={(event) => { event.stopPropagation(); onDelete() }} onKeyDown={(event) => { if (event.key === 'Enter') { event.stopPropagation(); onDelete() } }} className="rounded p-0.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-rose-500"><Trash2 className="size-3" /></span>}
        </button>

        {isExpanded && (
            <div className="ml-4 pl-3 mt-0.5 border-l border-border/50 space-y-0.5">
              {filteredRequests.map((req) => (
                  <button
                      key={req.id}
                      onClick={() => bulkMode ? onToggleRequest(req.id) : onSelect(req.id)}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors group"
                  >
                    {bulkMode && <span className={cn('flex size-3.5 items-center justify-center rounded border', selectedRequests.has(req.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background')}>{selectedRequests.has(req.id) && <Check className="size-2.5" />}</span>}
                    <MethodBadge method={req.method} size="xs" />
                    <span className="flex-1 text-left truncate text-muted-foreground group-hover:text-foreground transition-colors">{req.name}</span>
                  </button>
              ))}
            </div>
        )}
      </div>
  )
}

function HistoryItem({ entry, onClick }: { entry: HistoryEntry; onClick: () => void }) {
  const isSuccess = entry.status < 400

  return (
      <button onClick={onClick} className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group text-left">
        <MethodBadge method={entry.method} size="xs" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground group-hover:text-foreground truncate transition-colors font-mono">{entry.url}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-[10px] font-bold', isSuccess ? 'text-green-400' : 'text-rose-400')}>{entry.status}</span>
            <span className="text-[10px] text-muted-foreground/60">{entry.time}ms</span>
          </div>
        </div>
      </button>
  )
}

function HistoryDetail({ detail, loading, onClose }: { detail: BackendHistory | null; loading: boolean; onClose: () => void }) {
  let headers = detail?.response_headers ?? '{}'
  try { headers = JSON.stringify(JSON.parse(headers), null, 2) } catch { /* show raw backend value */ }
  return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && onClose()}>
        <div className="flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Execution details</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Persistent backend history record</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button>
          </div>
          {loading || !detail ? <div className="flex h-56 items-center justify-center"><Loader2 className="size-5 animate-spin text-primary" /></div> : (
              <div className="space-y-4 overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <DetailMetric label="Status" value={detail.error ? 'Failed' : String(detail.status)} tone={detail.error || detail.status >= 400 ? 'error' : 'success'} />
                  <DetailMetric label="Duration" value={`${detail.time} ms`} />
                  <DetailMetric label="Size" value={`${detail.size_bytes} B`} />
                  <DetailMetric label="Method" value={detail.method} />
                </div>
                <div className="rounded-xl border border-border bg-muted/10 p-3">
                  <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Request URL</p>
                  <p className="break-all font-mono text-xs">{detail.url}</p>
                </div>
                {detail.error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-500">{detail.error}</div>}
                <div className="grid gap-4 lg:grid-cols-2">
                  <DetailCode title="Response headers" value={headers} />
                  <DetailCode title="Response body" value={detail.response_body || '(empty response)'} />
                </div>
              </div>
          )}
        </div>
      </div>
  )
}

function DetailMetric({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'error' }) {
  return <div className="rounded-xl border border-border bg-muted/10 p-3"><p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className={cn('mt-1 text-sm font-semibold', tone === 'success' && 'text-emerald-500', tone === 'error' && 'text-rose-500')}>{value}</p></div>
}

function DetailCode({ title, value }: { title: string; value: string }) {
  return <div className="min-w-0"><p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background p-3 font-mono text-[11px] text-muted-foreground">{value}</pre></div>
}
