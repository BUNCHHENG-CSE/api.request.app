'use client'

import { useState } from 'react'
import { Search, Settings, ChevronDown, Zap,  LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from "@/components/web/theme-toggle"
import { MembersBar } from './MembersBar'
import type { Project, ProjectMember } from './types'

interface TopNavProps {
  environment: string
  onEnvironmentChange: (env: string) => void
  self: ProjectMember
  members: ProjectMember[]
  activeProject: Project | null
  onOpenProjects: () => void
}

const ENVIRONMENTS = ['No Environment', 'Development', 'Staging', 'Production']

export function TopNav({ environment, onEnvironmentChange, self, members, activeProject, onOpenProjects }: TopNavProps) {
  const [envOpen, setEnvOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  return (
      <header className="flex items-center justify-between px-5 h-13 bg-background border-b border-border/40 shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="size-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">FlowAPI</span>
          </div>
          <div className="h-5 w-px bg-border/50" />
          <button onClick={onOpenProjects} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-foreground/70">{activeProject ? activeProject.name : 'My Workspace'}</span>
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className={cn(
              'relative flex items-center gap-2 bg-muted/30 border rounded-lg px-3.5 py-2 transition-all',
              searchFocused ? 'border-primary/50 bg-muted/50 ring-1 ring-primary/20' : 'border-border/50 hover:border-border'
          )}>
            <Search className="size-4 text-muted-foreground" />
            <input
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search requests, collections..."
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MembersBar self={self} members={members} activeProject={activeProject} />
          <div className="h-5 w-px bg-border/50" />

          <div className="relative">
            <button onClick={() => setEnvOpen(!envOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-muted/20 border-border text-foreground/70 hover:text-foreground hover:bg-muted/40">
              <span className="hidden sm:inline">{environment}</span>
              <ChevronDown className={cn('size-3 transition-transform', envOpen && 'rotate-180')} />
            </button>
            {envOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl overflow-hidden min-w-45">
                  {ENVIRONMENTS.map((env) => (
                      <button
                          key={env}
                          onClick={() => { onEnvironmentChange(env); setEnvOpen(false) }}
                          className={cn('w-full flex items-center px-3 py-2 text-xs transition-all hover:bg-muted', env === environment ? 'bg-muted/50 font-medium' : 'text-muted-foreground hover:text-foreground')}
                      >
                        <span className="flex-1 text-left">{env}</span>
                        {env === environment && <span className="size-1.5 rounded-full bg-primary" />}
                      </button>
                  ))}
                </div>
            )}
          </div>

          <ThemeToggle />

          <div className="relative">
            <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative flex items-center justify-center size-9 rounded-full text-xs font-bold text-white transition-all hover:ring-2 hover:ring-primary/50"
                style={{ background: `linear-gradient(135deg, ${self.color}, ${self.color.replace('0.65', '0.50')})` }}
                suppressHydrationWarning
            >
              {self.name.substring(0, 2).toUpperCase()}
            </button>
            {userMenuOpen && (
                <div className="absolute top-full right-0 mt-3 z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl overflow-hidden w-48">
                  <div className="px-3 py-3 border-b border-border/50">
                    <p className="text-xs font-medium">{self.name}</p>
                  </div>
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-muted transition-all">
                    <Settings className="size-4" /><span>Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-muted transition-all text-red-500">
                    <LogOut className="size-4" /><span>Sign Out</span>
                  </button>
                </div>
            )}
          </div>
        </div>
      </header>
  )
}