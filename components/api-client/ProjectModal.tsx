'use client'

import { useState } from 'react'
import { X, Plus, LogIn, Copy, Check, Users, FolderOpen, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, ProjectMember } from './types'

interface ProjectModalProps {
  projects: Project[]
  activeProjectId: string | null
  self: ProjectMember
  onCreateProject: (name: string, description: string) => Project
  onJoinProject: (code: string) => Project | null
  onSelectProject: (id: string | null) => void
  onClose: () => void
}

type Tab = 'browse' | 'create' | 'join'

function InviteCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border hover:border-primary/40 hover:bg-muted/60 transition-all group"
    >
      <code className="text-sm font-mono font-bold tracking-widest text-primary">{code}</code>
      {copied
        ? <Check className="size-3.5 text-[oklch(0.65_0.18_145)]" />
        : <Copy className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      }
    </button>
  )
}

function ProjectCard({
  project,
  isActive,
  isOwner,
  onSelect,
}: {
  project: Project
  isActive: boolean
  isOwner: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all group',
        isActive
          ? 'border-primary/50 bg-primary/8 shadow-md shadow-primary/10'
          : 'border-border hover:border-border/80 hover:bg-muted/20'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'size-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm',
            isActive ? 'bg-primary/20 text-primary' : 'bg-muted/60 text-muted-foreground group-hover:bg-muted/80'
          )}>
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">{project.name}</span>
              {isOwner && (
                <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20 flex-shrink-0">Owner</span>
              )}
              {isActive && (
                <span className="text-[9px] text-[oklch(0.65_0.18_145)] bg-[oklch(0.65_0.18_145)]/10 px-1.5 py-0.5 rounded-full border border-[oklch(0.65_0.18_145)]/20 flex-shrink-0">Active</span>
              )}
            </div>
            {project.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{project.description}</p>
            )}
          </div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3" />
          <span>{project.memberIds.length} member{project.memberIds.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FolderOpen className="size-3" />
          <span>{project.collectionIds.length} collection{project.collectionIds.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Code:</span>
          <code className="text-[10px] font-mono font-bold text-primary tracking-widest">{project.inviteCode}</code>
        </div>
      </div>
    </button>
  )
}

export function ProjectModal({
  projects,
  activeProjectId,
  self,
  onCreateProject,
  onJoinProject,
  onSelectProject,
  onClose,
}: ProjectModalProps) {
  const [tab, setTab] = useState<Tab>('browse')
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [createdProject, setCreatedProject] = useState<Project | null>(null)

  const myProjects = projects.filter((p) => p.memberIds.includes(self.id))

  const handleCreate = () => {
    if (!createName.trim()) return
    const p = onCreateProject(createName.trim(), createDesc.trim())
    setCreatedProject(p)
    setCreateName('')
    setCreateDesc('')
  }

  const handleJoin = () => {
    if (!joinCode.trim()) return
    setJoinError('')
    const p = onJoinProject(joinCode)
    if (!p) {
      setJoinError(`No project found with code "${joinCode.toUpperCase().trim()}". Check the code and try again.`)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl bg-[oklch(0.12_0_0)] border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Projects</h2>
              <p className="text-[11px] text-muted-foreground">Collaborate and share endpoints with your team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-border flex-shrink-0">
          {([
            { id: 'browse' as Tab, label: 'My Projects', icon: FolderOpen },
            { id: 'create' as Tab, label: 'Create', icon: Plus },
            { id: 'join' as Tab, label: 'Join', icon: LogIn },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setCreatedProject(null); setJoinError('') }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                tab === id
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Browse tab */}
          {tab === 'browse' && (
            <div className="p-5 space-y-3">
              {myProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <div className="size-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-1">
                    <FolderOpen className="size-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No projects yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Create a project to share your collections and endpoints with teammates, or join one with an invite code.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => setTab('create')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/25 transition-all">
                      <Plus className="size-3.5" />
                      Create project
                    </button>
                    <button onClick={() => setTab('join')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-muted-foreground text-xs hover:text-foreground hover:bg-muted/60 transition-all">
                      <LogIn className="size-3.5" />
                      Join with code
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {activeProjectId && (
                    <button
                      onClick={() => { onSelectProject(null); onClose() }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/50 transition-all"
                    >
                      Leave active project (go to personal workspace)
                    </button>
                  )}
                  {myProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      isActive={p.id === activeProjectId}
                      isOwner={p.ownerId === self.id}
                      onSelect={() => { onSelectProject(p.id); onClose() }}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {/* Create tab */}
          {tab === 'create' && (
            <div className="p-5">
              {createdProject ? (
                <div className="flex flex-col items-center text-center gap-5 py-6">
                  <div className="size-16 rounded-2xl bg-[oklch(0.65_0.18_145)]/15 border border-[oklch(0.65_0.18_145)]/30 flex items-center justify-center">
                    <Sparkles className="size-7 text-[oklch(0.65_0.18_145)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">{createdProject.name} created!</h3>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Share the invite code below with your teammates so they can join your project.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Invite Code</span>
                    <InviteCodeDisplay code={createdProject.inviteCode} />
                    <p className="text-[10px] text-muted-foreground">Click to copy</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    Open Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Project name <span className="text-[oklch(0.65_0.22_25)]">*</span></label>
                    <input
                      autoFocus
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                      placeholder="e.g. E-commerce Backend"
                      className="bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Description <span className="text-muted-foreground/40">(optional)</span></label>
                    <textarea
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                      placeholder="What is this project for?"
                      rows={3}
                      className="bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!createName.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus className="size-4" />
                    Create Project
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Join tab */}
          {tab === 'join' && (
            <div className="p-5 space-y-5">
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <div className="size-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-2">
                  <LogIn className="size-6 text-muted-foreground/70" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Join a project</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Enter the 6-character invite code shared by your project owner.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-medium">Invite code</label>
                <input
                  autoFocus
                  value={joinCode}
                  onChange={(e) => { setJoinCode(e.target.value.toUpperCase().slice(0, 6)); setJoinError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="e.g. ABC123"
                  maxLength={6}
                  className={cn(
                    'bg-muted/40 border rounded-xl px-3.5 py-2.5 text-sm text-foreground text-center font-mono font-bold tracking-[0.25em] uppercase placeholder:text-muted-foreground/40 placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all',
                    joinError ? 'border-[oklch(0.65_0.22_25)]/50 focus:ring-[oklch(0.65_0.22_25)]/30' : 'border-border focus:border-primary/40'
                  )}
                />
                {joinError && (
                  <p className="text-xs text-[oklch(0.65_0.22_25)]">{joinError}</p>
                )}
              </div>

              <button
                onClick={handleJoin}
                disabled={joinCode.length < 6}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <LogIn className="size-4" />
                Join Project
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Open a second browser tab to simulate another user joining the same project.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
