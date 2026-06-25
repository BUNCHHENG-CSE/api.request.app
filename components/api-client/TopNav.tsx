'use client'

import { useState } from 'react'
import { Search, Bell, Settings, ChevronDown, Zap, User, LogOut, Gauge, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import {ThemeToggle} from "@/components/web/theme-toggle";
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

export function TopNav({
  environment,
  onEnvironmentChange,
  self,
  members,
  activeProject,
  onOpenProjects,
}: TopNavProps) {

  const [envOpen, setEnvOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [notificationCount] = useState(3)

  return (
    <header className="flex items-center justify-between px-5 h-13 bg-[oklch(0.08_0_0)] border-b border-border/40 flex-shrink-0 backdrop-blur-sm">
      {/* Left: Logo + workspace */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.18_255)] to-[oklch(0.60_0.20_280)] flex items-center justify-center shadow-lg shadow-primary/25">
            <Zap className="size-4 text-white" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">FlowAPI</span>
        </div>

        <div className="h-5 w-px bg-border/30" />

        <button
          onClick={onOpenProjects}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <span className="text-foreground/70">{activeProject ? activeProject.name : 'My Workspace'}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className={cn(
          'relative flex items-center gap-2 bg-muted/20 border rounded-lg px-3.5 py-2 transition-all duration-200',
          searchFocused ? 'border-primary/50 bg-muted/40 ring-1 ring-primary/20' : 'border-border/30 hover:border-border/50'
        )}>
          <Search className="size-4 text-muted-foreground flex-shrink-0" />
          <input
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search requests, collections..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <kbd className="text-[11px] text-muted-foreground/50 bg-muted/40 px-2 py-1 rounded font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Members bar */}
        <MembersBar self={self} members={members} activeProject={activeProject} />

        <div className="h-5 w-px bg-border/30" />

        {/* Environment selector */}
        <div className="relative">
          <button
            onClick={() => setEnvOpen(!envOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-muted/20 border-border/30 text-foreground/70 hover:text-foreground hover:border-border/50 hover:bg-muted/35"
          >
            <div className={cn(
              'size-2 rounded-full transition-colors',
              environment === 'Development' ? 'bg-[oklch(0.65_0.17_145)]' :
              environment === 'Staging'     ? 'bg-[oklch(0.72_0.16_65)]'  :
              environment === 'Production'  ? 'bg-[oklch(0.65_0.22_25)]'  :
              'bg-muted-foreground/50'
            )} />
            <span className="hidden sm:inline">{environment}</span>
            <ChevronDown className={cn('size-3 transition-transform', envOpen && 'rotate-180')} />
          </button>

          {envOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 bg-[oklch(0.14_0_0)] border border-border/40 rounded-lg shadow-xl overflow-hidden min-w-[180px] backdrop-blur-sm">
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env}
                  onClick={() => { onEnvironmentChange(env); setEnvOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all hover:bg-muted/50',
                    env === environment ? 'text-foreground bg-muted/40' : 'text-muted-foreground/80 hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'size-1.5 rounded-full',
                    env === 'Development' ? 'bg-[oklch(0.65_0.17_145)]' :
                    env === 'Staging'     ? 'bg-[oklch(0.72_0.16_65)]'  :
                    env === 'Production'  ? 'bg-[oklch(0.65_0.22_25)]'  :
                    'bg-muted-foreground/50'
                  )} />
                  <span className="flex-1">{env}</span>
                  {env === environment && <span className="size-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-border/30" />

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200"
        >
          <Bell className="size-4.5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-[oklch(0.65_0.22_25)] rounded-full" />
          )}
        </button>

        {/* Theme Toggle */}
        <ThemeToggle/>

        {/* Settings */}
        <button
          title="Settings"
          className="flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200"
        >
          <Settings className="size-4.5" />
        </button>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="relative flex items-center justify-center size-9 rounded-full text-xs font-bold text-white transition-all hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${self.color}, ${self.color.replace('0.65', '0.50')})` }}
            title={self.name}
          >
            {self.avatar}
            {userMenuOpen && (
              <div className="absolute inset-0 rounded-full bg-black/20" />
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-3 z-50 bg-[oklch(0.14_0_0)] border border-border/40 rounded-lg shadow-xl overflow-hidden w-48 backdrop-blur-sm">
              <div className="px-3 py-3 border-b border-border/30">
                <p className="text-xs font-medium text-foreground">{self.name}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">Active in project</p>
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground/90 hover:text-foreground hover:bg-muted/50 transition-all">
                <Gauge className="size-4" />
                <span>Profile Settings</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground/90 hover:text-foreground hover:bg-muted/50 transition-all border-t border-border/30">
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
