'use client'

import { useState } from 'react'
import { X, Plus, Folder, Check, Loader2, Pencil, Trash2, Upload, Download, FolderX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useSync } from '@/hooks/useSync'

export function ProjectModal() {
  const isOpen = useWorkspaceStore((state) => state.projectModalOpen)
  const setProjectModalOpen = useWorkspaceStore((state) => state.setProjectModalOpen)

  const sync = useSync()
  const { projects, activeProjectId, setActiveProjectId, createProject } = sync

  const [mode, setMode] = useState<'list' | 'create'>('list')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    setProjectModalOpen(false)
    setMode('list')
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
            <h2 className="text-sm font-semibold tracking-tight">
              {mode === 'list' ? 'Your Workspaces' : 'Create Workspace'}
            </h2>
            <button onClick={handleClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <X className="size-4" />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            {mode === 'list' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {projects.length === 0 ? (
                        <div className="text-center py-6 text-sm text-muted-foreground bg-muted/20 rounded-lg border border-border border-dashed">
                          You aren&#39;t in any workspaces yet.
                        </div>
                    ) : (
                        projects.map((p) => (
                            <div
                                key={p.id}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group",
                                    p.id === activeProjectId
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border bg-muted/10 hover:border-border/80 hover:bg-muted/30"
                                )}
                            >
                              <button onClick={() => { if (editingId) return; setActiveProjectId(p.id); handleClose(); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                                <div className={cn("p-2 rounded-md", p.id === activeProjectId ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground")}>
                                  <Folder className="size-4" />
                                </div>
                                {editingId === p.id ? <input autoFocus value={editingName} onClick={(event) => event.stopPropagation()} onChange={(event) => setEditingName(event.target.value)} className="min-w-0 flex-1 rounded-md border border-primary/40 bg-background px-2 py-1 text-xs outline-none ring-2 ring-primary/10" /> : <div><p className={cn("text-sm font-medium", p.id === activeProjectId ? "text-primary" : "text-foreground")}>{p.name}</p><p className="text-[10px] text-muted-foreground mt-0.5">{p.memberIds.length} member{p.memberIds.length !== 1 && 's'}</p></div>}
                              </button>
                              <div className="flex items-center gap-0.5">
                                {editingId === p.id ? <><button title="Save name" onClick={async () => { const next = editingName.trim(); if (!next) return; setWorkingId(p.id); const message = await sync.renameProject(p.id, next); setWorkingId(null); setStatus(message ?? 'Workspace renamed.'); if (!message) setEditingId(null) }} className="rounded bg-primary/10 p-1.5 text-primary hover:bg-primary/20"><Check className="size-3" /></button><button title="Cancel rename" onClick={() => setEditingId(null)} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><X className="size-3" /></button></> : <>
                                {p.id === activeProjectId && <Check className="mr-1 size-4 text-primary" />}
                                <button title="Rename workspace" onClick={() => { setEditingId(p.id); setEditingName(p.name); setStatus(null) }} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-3" /></button>
                                <button title="Export Bruno files" onClick={async () => { setWorkingId(p.id); setStatus(await sync.exportLocal(p.id)); setWorkingId(null); }} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Download className="size-3" /></button>
                                <button title="Import Bruno files" onClick={async () => { setWorkingId(p.id); setStatus(await sync.importLocal(p.id)); setWorkingId(null); }} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Upload className="size-3" /></button>
                                <button title="Delete local Bruno copy" onClick={async () => { if (!window.confirm(`Delete only the local Bruno copy for ${p.name}?`)) return; setWorkingId(p.id); setStatus(await sync.deleteLocal(p.id)); setWorkingId(null); }} className="rounded p-1.5 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500"><FolderX className="size-3" /></button>
                                <button title="Delete workspace" onClick={async () => { if (!window.confirm(`Delete ${p.name} and all of its resources?`)) return; setWorkingId(p.id); const message = await sync.deleteProject(p.id); setWorkingId(null); setStatus(message ?? 'Workspace deleted.'); }} className="rounded p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"><Trash2 className="size-3" /></button>
                                </>}
                                {workingId === p.id && <Loader2 className="size-3 animate-spin text-primary" />}
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                  {status && <p className="rounded-lg bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">{status}</p>}

                  <div className="pt-4 border-t border-border/50">
                    <button onClick={() => setMode('create')} className="flex w-full items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 text-xs font-medium transition-colors">
                      <Plus className="size-3.5" /> Create New
                    </button>
                  </div>
                </div>
            )}

            {mode === 'create' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace Name</label>
                    <input
                        value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Core API Team"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        autoFocus
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setMode('list')} className="flex-1 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                    <button
                        onClick={async () => { if (!name) return; setSaving(true); setError(null); const project = await createProject(name, ''); setSaving(false); if (project) handleClose(); else setError(sync.error ?? 'Could not create workspace.'); }}
                        disabled={!name || saving}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {saving && <Loader2 className="mr-1 inline size-3 animate-spin"/>}Create
                    </button>
                  </div>
                  {error && <p className="text-xs text-rose-500">{error}</p>}
                </div>
            )}
          </div>
        </div>
      </div>
  )
}
