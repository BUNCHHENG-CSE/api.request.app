'use client'

import { useState } from 'react'
import { X, Plus, LogIn, Folder, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, ProjectMember } from './types'

interface ProjectModalProps {
  projects: Project[]
  activeProjectId: string | null
  self: ProjectMember
  onCreateProject: (name: string, desc: string) => void
  onJoinProject: (code: string) => void
  onSelectProject: (id: string) => void
  onClose: () => void
}

export function ProjectModal({ projects, activeProjectId, onCreateProject, onJoinProject, onSelectProject, onClose }: ProjectModalProps) {
  const [mode, setMode] = useState<'list' | 'create' | 'join'>('list')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
            <h2 className="text-sm font-semibold tracking-tight">
              {mode === 'list' ? 'Your Workspaces' : mode === 'create' ? 'Create Workspace' : 'Join Workspace'}
            </h2>
            <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {/* Content */}
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
                            <button
                                key={p.id}
                                onClick={() => { onSelectProject(p.id); onClose(); }}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group",
                                    p.id === activeProjectId
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border bg-muted/10 hover:border-border/80 hover:bg-muted/30"
                                )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-md", p.id === activeProjectId ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground")}>
                                  <Folder className="size-4" />
                                </div>
                                <div>
                                  <p className={cn("text-sm font-medium", p.id === activeProjectId ? "text-primary" : "text-foreground")}>{p.name}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.memberIds.length} member{p.memberIds.length !== 1 && 's'}</p>
                                </div>
                              </div>
                              {p.id === activeProjectId && <Check className="size-4 text-primary" />}
                            </button>
                        ))
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                    <button onClick={() => setMode('create')} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 text-xs font-medium transition-colors">
                      <Plus className="size-3.5" /> Create New
                    </button>
                    <button onClick={() => setMode('join')} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 text-xs font-medium transition-colors">
                      <LogIn className="size-3.5" /> Join Existing
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
                        onClick={() => { if(name) { onCreateProject(name, ''); onClose(); } }}
                        disabled={!name}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                    >
                      Create
                    </button>
                  </div>
                </div>
            )}

            {mode === 'join' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invite Code</label>
                    <input
                        value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character code"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        autoFocus
                        maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setMode('list')} className="flex-1 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                    <button
                        onClick={() => { if(code) { onJoinProject(code); onClose(); } }}
                        disabled={code.length < 6}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                    >
                      Join
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}