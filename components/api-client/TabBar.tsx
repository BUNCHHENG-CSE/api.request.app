'use client'

import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RequestTab } from './types'

interface TabBarProps {
  tabs: RequestTab[]
  activeTabId: string
  onTabSelect: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-blue-500',
  POST: 'text-amber-500',
  PUT: 'text-indigo-500',
  PATCH: 'text-purple-500',
  DELETE: 'text-rose-500',
}

export function TabBar({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: TabBarProps) {
  return (
      <div className="flex items-center bg-muted/20 border-b border-border overflow-x-auto no-scrollbar pt-2 px-2 gap-1.5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
              <div
                  key={tab.id}
                  className={cn(
                      "group relative flex items-center gap-2 px-3 py-2 min-w-35 max-w-50 border border-transparent rounded-t-lg transition-all cursor-pointer select-none",
                      isActive
                          ? "bg-background border-border border-b-transparent z-10 before:absolute before:-bottom-px before:left-0 before:right-0 before:h-0.5 before:bg-background"
                          : "hover:bg-muted/50 text-muted-foreground border-b-border"
                  )}
                  onClick={() => onTabSelect(tab.id)}
              >
                {/* THIS LINE IS FIXED: The method color is always applied now */}
                <span className={cn("text-[9px] font-bold tracking-wide", METHOD_COLORS[tab.method] || "text-muted-foreground")}>
              {tab.method}
            </span>
                <span className={cn("flex-1 text-xs truncate", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
              {tab.name || tab.url || 'Untitled Request'}
            </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onTabClose(tab.id) }}
                    className={cn("p-0.5 rounded-md transition-colors", isActive ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:bg-muted/80 hover:text-foreground")}
                >
                  <X className="size-3" />
                </button>
                {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-t-lg" />}
              </div>
          )
        })}

        <button onClick={onNewTab} className="p-1.5 mx-1 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
          <Plus className="size-4" />
        </button>
      </div>
  )
}