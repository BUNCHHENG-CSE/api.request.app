'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Zap, Settings2, LogOut, Search, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/web/theme-toggle'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useSync } from '@/hooks/useSync'

const ENVIRONMENTS = ['No Environment', 'Development', 'Staging', 'Production']
const ENV_COLORS: Record<string, string> = {
  Development: 'bg-blue-500',
  Staging: 'bg-amber-500',
  Production: 'bg-rose-500',
  'No Environment': 'bg-muted-foreground',
}

export function TopNav() {
  const [envOpen, setEnvOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [mounted, setMounted] = useState(false)

  const envRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Zustand State
  const environment = useWorkspaceStore((state) => state.environment)
  const environments = useWorkspaceStore((state) => state.environments)
  const setEnvironment = useWorkspaceStore((state) => state.setEnvironment)
  const setEditingEnvironment = useWorkspaceStore((state) => state.setEditingEnvironment)
  const setProjectModalOpen = useWorkspaceStore((state) => state.setProjectModalOpen)
  const setProfileSettingsOpen = useWorkspaceStore((state) => state.setProfileSettingsOpen)

  // Sync State (For user avatar and current workspace name)
  const sync = useSync()
  const activeProject = sync.projects.find((p) => p.id === sync.activeProjectId) ?? null

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const handler = (e: MouseEvent) => {
      if (envRef.current && !envRef.current.contains(e.target as Node)) setEnvOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selfName = sync.self?.name || 'User'
  const selfColor = sync.self?.color || '#3b82f6'
  const initials = selfName.substring(0, 2).toUpperCase()

  return (
      <header className="flex items-center gap-3 px-4 h-12 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="size-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">FlowAPI</span>
          </div>

          <div className="h-4 w-px bg-border" />

          <button
              onClick={() => setProjectModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{activeProject ? activeProject.name : 'My Workspace'}</span>
            <ChevronDown className="size-3 opacity-60" />
          </button>
        </div>

        <div className="flex-1 flex justify-center px-4 max-w-lg mx-auto">
          <div className={cn('relative flex items-center gap-2.5 w-full bg-surface border rounded-lg px-3 py-1.5 transition-all', searchFocused ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border hover:border-border/80')}>
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <input
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search requests, collections..."
                className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div ref={envRef} className="relative">
            <div className="flex items-center gap-0.5">
              <button
                  onClick={() => setEnvOpen(!envOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-l-lg border border-r-0 border-border bg-surface text-xs font-medium text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
              >
                <span className={cn('size-1.5 rounded-full shrink-0', ENV_COLORS[environment] ?? 'bg-muted-foreground')} />
                <span className="hidden sm:inline max-w-24 truncate">{environment}</span>
                <ChevronDown className={cn('size-3 opacity-50 transition-transform', envOpen && 'rotate-180')} />
              </button>
              {environment !== 'No Environment' && (
                  <button
                      onClick={() => setEditingEnvironment(environments.find(e => e.name === environment) || null)}
                      className="p-1.5 border border-border bg-surface rounded-r-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Settings2 className="size-3.5" />
                  </button>
              )}
            </div>

            {envOpen && (
                <div className="absolute top-full right-0 mt-1.5 z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden min-w-44">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Environments</p>
                  </div>
                  {ENVIRONMENTS.map((env) => (
                      <button
                          key={env}
                          onClick={() => { setEnvironment(env); setEnvOpen(false) }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors', env === environment ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
                      >
                        <span className={cn('size-1.5 rounded-full shrink-0', ENV_COLORS[env] ?? 'bg-muted-foreground')} />
                        <span className="flex-1 text-left">{env}</span>
                      </button>
                  ))}
                </div>
            )}
          </div>

          <ThemeToggle />

          <div ref={userRef} className="relative">
            <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative flex items-center justify-center size-7 rounded-full text-[10px] font-bold text-white ring-2 ring-transparent hover:ring-primary/40 transition-all shrink-0"
                style={{ background: mounted ? selfColor : 'var(--muted)' }}
            >
              {mounted ? initials : ''}
            </button>

            {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden w-52">
                  <div className="py-1">
                    <button
                        onClick={() => { setUserMenuOpen(false); setProfileSettingsOpen(true) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <UserCircle className="size-3.5 text-muted-foreground" /> Profile Settings
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <LogOut className="size-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </header>
  )
}