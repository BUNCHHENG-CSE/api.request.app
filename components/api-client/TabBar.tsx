'use client'

import { X, Plus, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HttpMethod, RequestTab } from './types'

const METHOD_DOT: Record<HttpMethod, string> = {
  GET: 'bg-[oklch(0.65_0.17_145)]',
  POST: 'bg-[oklch(0.72_0.16_65)]',
  PUT: 'bg-[oklch(0.65_0.18_255)]',
  PATCH: 'bg-[oklch(0.65_0.15_220)]',
  DELETE: 'bg-[oklch(0.65_0.22_25)]',
  HEAD: 'bg-muted-foreground',
  OPTIONS: 'bg-muted-foreground',
}

const METHOD_TEXT: Record<HttpMethod, string> = {
  GET: 'text-[oklch(0.65_0.17_145)]',
  POST: 'text-[oklch(0.72_0.16_65)]',
  PUT: 'text-[oklch(0.65_0.18_255)]',
  PATCH: 'text-[oklch(0.65_0.15_220)]',
  DELETE: 'text-[oklch(0.65_0.22_25)]',
  HEAD: 'text-muted-foreground',
  OPTIONS: 'text-muted-foreground',
}

interface TabBarProps {
  tabs: RequestTab[]
  activeTabId: string
  onTabSelect: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
}

export function TabBar({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: TabBarProps) {
  return (
    <div className="flex items-stretch bg-[oklch(0.10_0_0)] border-b border-border overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        const displayName = tab.name || tab.url.replace(/^https?:\/\//, '').split('/').slice(0, 2).join('/') || 'New Request'

        return (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2.5 min-w-0 max-w-52 flex-shrink-0 cursor-pointer border-r border-border transition-all group',
              isActive
                ? 'bg-[oklch(0.13_0_0)] text-foreground'
                : 'bg-[oklch(0.10_0_0)] text-muted-foreground hover:bg-[oklch(0.12_0_0)] hover:text-foreground/70'
            )}
          >
            {/* Active indicator */}
            {isActive && (
              <span className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
            )}

            {/* Method dot */}
            <span className={cn('size-2 rounded-full flex-shrink-0', METHOD_DOT[tab.method])} />

            {/* Method label */}
            <span className={cn('text-[10px] font-bold flex-shrink-0', METHOD_TEXT[tab.method])}>
              {tab.method}
            </span>

            {/* Tab name */}
            <span className="truncate text-xs">{displayName}</span>

            {/* Modified indicator / close button */}
            <button
              onClick={(e) => { e.stopPropagation(); onTabClose(tab.id) }}
              className={cn(
                'ml-auto flex-shrink-0 size-4 flex items-center justify-center rounded transition-all',
                'text-muted-foreground hover:text-foreground hover:bg-muted',
                !isActive && 'opacity-0 group-hover:opacity-100'
              )}
            >
              <X className="size-2.5" />
            </button>
          </div>
        )
      })}

      {/* New tab button */}
      <button
        onClick={onNewTab}
        className="flex items-center justify-center px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-[oklch(0.13_0_0)] transition-all flex-shrink-0"
      >
        <Plus className="size-4" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  )
}
