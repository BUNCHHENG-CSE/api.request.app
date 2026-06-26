'use client'

import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { METHOD_TEXT } from './ui/MethodBadge'
import type { RequestTab } from './types'

interface TabBarProps {
  tabs: RequestTab[]
  activeTabId: string
  onTabSelect: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
}

export function TabBar({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: TabBarProps) {
  return (
    <div className="flex items-end bg-card border-b border-border overflow-x-auto no-scrollbar px-2 pt-2 gap-1 shrink-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onTabSelect(tab.id)}
            className={cn(
              'group relative flex items-center gap-1.5 px-3 py-2 min-w-32 max-w-52 cursor-pointer select-none transition-all rounded-t-lg border',
              isActive
                ? 'bg-background border-border border-b-background text-foreground z-10'
                : 'bg-surface/60 border-transparent text-muted-foreground hover:bg-surface hover:text-foreground',
            )}
          >
            {/* Active indicator stripe */}
            {isActive && (
              <span className="absolute top-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}

            <span
              className={cn(
                'text-[9px] font-bold tracking-wide shrink-0',
                METHOD_TEXT[tab.method] ?? 'text-muted-foreground',
              )}
            >
              {tab.method}
            </span>

            <span
              className={cn(
                'flex-1 text-xs truncate',
                isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              {tab.name || tab.url || 'Untitled'}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); onTabClose(tab.id) }}
              className={cn(
                'shrink-0 p-0.5 rounded transition-all',
                isActive
                  ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  : 'opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-foreground',
              )}
            >
              <X className="size-3" />
            </button>
          </div>
        )
      })}

      <button
        onClick={onNewTab}
        className="p-1.5 mb-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
        title="New tab"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
