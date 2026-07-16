'use client'

import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { METHOD_TEXT } from '@/components/web/MethodBadge' // Assuming you moved this to components/ui/
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

export function TabBar() {
    const tabs = useWorkspaceStore((state) => state.tabs)
    const activeTabId = useWorkspaceStore((state) => state.activeTabId)
    const setActiveTabId = useWorkspaceStore((state) => state.setActiveTabId)
    const handleCloseTab = useWorkspaceStore((state) => state.handleCloseTab)
    const handleNewTab = useWorkspaceStore((state) => state.handleNewTab)

    return (
        <div className="flex items-end bg-card border-b border-border overflow-x-auto no-scrollbar px-2 pt-2 gap-1 shrink-0">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId
                return (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setActiveTabId(tab.id)}
                        className={cn(
                            'group relative flex items-center gap-1.5 px-3 py-2 min-w-32 max-w-52 cursor-pointer select-none transition-all rounded-t-lg border',
                            isActive
                                ? 'bg-background border-border border-b-background text-foreground z-10'
                                : 'bg-surface/60 border-transparent text-muted-foreground hover:bg-surface hover:text-foreground',
                        )}
                    >
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
                            onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id) }}
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
                onClick={handleNewTab}
                className="p-1.5 mb-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                title="New tab"
            >
                <Plus className="size-4" />
            </button>
        </div>
    )
}