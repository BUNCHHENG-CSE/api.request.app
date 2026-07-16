'use client'

import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { AuthType } from '@/types/api.types'

const AUTH_TYPES: { id: AuthType; label: string }[] = [
    { id: 'none', label: 'No Auth' },
    { id: 'bearer', label: 'Bearer Token' },
    { id: 'basic', label: 'Basic Auth' },
    { id: 'api-key', label: 'API Key' },
]

export function AuthTab() {
    const tabs = useWorkspaceStore((state) => state.tabs)
    const activeTabId = useWorkspaceStore((state) => state.activeTabId)
    const updateActiveTab = useWorkspaceStore((state) => state.updateActiveTab)

    const request = tabs.find(t => t.id === activeTabId)
    if (!request) return null

    const auth = request.auth

    const updateAuth = (updates: Partial<typeof auth>) => {
        updateActiveTab({ auth: { ...auth, ...updates } })
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Auth Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {AUTH_TYPES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => updateAuth({ type: t.id })}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                                auth.type === t.id
                                    ? 'bg-primary/15 border-primary/30 text-primary'
                                    : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:border-border/80',
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {auth.type === 'bearer' && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Token
                    </label>
                    <input
                        value={auth.token ?? ''}
                        onChange={(e) => updateAuth({ token: e.target.value })}
                        placeholder="Enter bearer token..."
                        className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all w-full"
                    />
                </div>
            )}

            {auth.type === 'none' && (
                <p className="text-xs text-muted-foreground mt-2">
                    This request does not use any authorization. Select a type above to configure.
                </p>
            )}
        </div>
    )
}