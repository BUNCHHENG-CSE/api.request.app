'use client'

import { useState } from 'react'
import { Users, X, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProjectMember, Project } from './types'

interface MembersBarProps {
  self: ProjectMember
  members: ProjectMember[]
  activeProject: Project | null
}

function MemberAvatar({ member, isSelf, size = 'sm' }: { member: ProjectMember, isSelf?: boolean, size?: 'sm' | 'md' }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const initials = member?.name ? member.name.substring(0, 2).toUpperCase() : 'U'

  return (
      <div className="relative cursor-pointer" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-bold text-white shrink-0 transition-all shadow-sm',
                size === 'sm' ? 'size-7 text-[10px]' : 'size-9 text-xs',
                !member.online && 'opacity-40 grayscale',
                isSelf && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
            style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color.replace('0.65', '0.50')})` }}
            suppressHydrationWarning
        >
          {initials}
        </div>

        <div className={cn(
            'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background',
            member.online ? 'bg-green-500' : 'bg-muted-foreground/40'
        )} />

        {showTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none">
              <div className="bg-popover text-popover-foreground border border-border rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
                <div className="text-xs font-semibold">{member.name}{isSelf ? ' (you)' : ''}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Circle className={cn('size-1.5 fill-current', member.online ? 'text-green-500' : 'text-muted-foreground')} />
                  <span className="text-[10px] text-muted-foreground">{member.online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

export function MembersBar({ self, members, activeProject }: MembersBarProps) {
  const [open, setOpen] = useState(false)
  const onlineMembers = members.filter((m) => m.online)
  const allVisible = [self, ...members].slice(0, 5)
  const overflow = members.length > 4 ? members.length - 4 : 0

  if (!activeProject) {
    return (
        <div className="flex items-center gap-1.5">
          <MemberAvatar member={self} isSelf />
          <span className="text-xs text-muted-foreground hidden sm:block">Just you</span>
        </div>
    )
  }

  return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all',
            open ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:border-border/80'
        )}>
          <div className="flex items-center">
            {allVisible.map((m, i) => (
                <div key={m.id} className={cn('relative', i > 0 && '-ml-2')} style={{ zIndex: allVisible.length - i }}>
                  <MemberAvatar member={m} isSelf={m.id === self.id} />
                </div>
            ))}
            {overflow > 0 && (
                <div className="-ml-2 size-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground relative z-0">
                  +{overflow}
                </div>
            )}
          </div>
          <span className="font-medium hidden sm:block">{onlineMembers.length + 1} online</span>
        </button>

        {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5 text-primary" />
                    <span className="text-xs font-semibold">{activeProject.name} — Members</span>
                  </div>
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="size-3.5" /></button>
                </div>

                <div className="px-4 py-2 border-b border-border/50">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">You</div>
                  <div className="flex items-center gap-3">
                    <MemberAvatar member={self} isSelf size="md" />
                    <div>
                      <div className="text-sm font-semibold">{self.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Circle className="size-1.5 text-green-500 fill-current" />
                        <span className="text-[10px] text-muted-foreground">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 max-h-60 overflow-y-auto">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Team ({members.length})</div>
                  <div className="space-y-2">
                    {members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3">
                          <MemberAvatar member={m} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{m.name}</div>
                            <div className="flex items-center gap-1">
                              <Circle className={cn('size-1.5 fill-current', m.online ? 'text-green-500' : 'text-muted-foreground')} />
                              <span className="text-[10px] text-muted-foreground">{m.online ? 'Online' : 'Offline'}</span>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
        )}
      </div>
  )
}