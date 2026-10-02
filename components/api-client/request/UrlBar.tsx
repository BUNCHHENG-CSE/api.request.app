'use client'

import { useState, useRef, useEffect } from 'react'
import { Save, ChevronDown, Loader2, Copy, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { METHOD_TEXT, METHOD_BG } from '@/components/web/MethodBadge' // Assuming you moved this to UI
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { HttpMethod } from '@/types/api.types'
import { useSync } from '@/hooks/useSync'
import { normalizeHttpUrl } from '@/lib/http-url'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export function UrlBar() {
    const sync = useSync()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Pull exactly what we need from Zustand
    const tabs = useWorkspaceStore((state) => state.tabs)
    const activeTabId = useWorkspaceStore((state) => state.activeTabId)
    const updateActiveTab = useWorkspaceStore((state) => state.updateActiveTab)
    const loadingTabs = useWorkspaceStore((state) => state.loadingTabs)
    const handleSend = useWorkspaceStore((state) => state.handleSend)
    const addLog = useWorkspaceStore((state) => state.addLog)
    const collections = useWorkspaceStore((state) => state.collections)
    const handleCloseTab = useWorkspaceStore((state) => state.handleCloseTab)

    const request = tabs.find(t => t.id === activeTabId)
    const isLoading = loadingTabs.has(activeTabId)
    const isStored = collections.some((collection) => collection.requests.some((item) => item.id === activeTabId))

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    if (!request) return null

    return (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-background border-b border-border shrink-0">
            <div className="flex flex-1 items-center bg-surface border border-border rounded-xl overflow-visible focus-within:ring-1 focus-within:ring-primary/25 focus-within:border-primary/40 transition-all shadow-sm">

                <div ref={dropdownRef} className="relative shrink-0">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={cn(
                            'flex items-center gap-1.5 pl-3.5 pr-2.5 py-2.5 text-xs font-bold border-r border-border/60 hover:bg-accent/50 transition-colors rounded-l-xl',
                            METHOD_TEXT[request.method],
                        )}
                    >
                        {request.method}
                        <ChevronDown className={cn('size-3 text-muted-foreground transition-transform', dropdownOpen && 'rotate-180')} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden min-w-[120px]">
                            {METHODS.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => { updateActiveTab({ method: m }); setDropdownOpen(false) }}
                                    className={cn(
                                        'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-colors hover:bg-accent',
                                        METHOD_TEXT[m],
                                        m === request.method && 'bg-accent/50',
                                    )}
                                >
                                    <span className={cn('size-1.5 rounded-full', METHOD_BG[m].split(' ')[0])} />
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <input
                    value={request.url}
                    onChange={(e) => updateActiveTab({ url: e.target.value })}
                    onBlur={() => { if (!request.url.trim()) return; try { updateActiveTab({ url: normalizeHttpUrl(request.url) }) } catch { /* validation is shown when sending or saving */ } }}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    placeholder="api.example.com/v1/endpoint — protocol optional"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none font-mono"
                />
                <span title="Omit the protocol to use HTTP for localhost and HTTPS for public hosts" className="mr-2 hidden rounded-md bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground lg:inline">HTTP(S) optional</span>
            </div>

            <button
                onClick={handleSend}
                disabled={isLoading || !request.url.trim()}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:bg-primary/90 disabled:opacity-40 transition-all"
            >
                {isLoading ? 'Sending...' : 'Send'}
            </button>

            <button
                onClick={async () => { setSaving(true); const error = await sync.saveRequest(request); setSaving(false); if (error) addLog('error', error); else addLog('log', `Saved request: ${request.name || request.url}`) }}
                disabled={saving || !request.url.trim()}
                title={saving ? 'Saving request...' : 'Save request'}
                className="p-2.5 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground transition-all disabled:opacity-40"
            >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            </button>
            {isStored && (
                <>
                    <button onClick={async () => { const error = await sync.duplicateRequest(request.id); addLog(error ? 'error' : 'log', error ?? `Duplicated request: ${request.name}`) }} title="Duplicate request" className="p-2.5 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground transition-all"><Copy className="size-4" /></button>
                    <button onClick={async () => { if (!window.confirm(`Delete ${request.name}?`)) return; const error = await sync.deleteRequest(request.id); if (error) addLog('error', error); else { handleCloseTab(request.id); addLog('log', `Deleted request: ${request.name}`) } }} title="Delete request" className="p-2.5 rounded-xl border border-border bg-surface text-muted-foreground hover:border-rose-500/30 hover:text-rose-500 transition-all"><Trash2 className="size-4" /></button>
                </>
            )}
        </div>
    )
}
