'use client'

import { SettingsRow } from '@/components/web/Toggle'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { RequestSettings } from '@/types/api.types'

export function SettingsTab() {
    const tabs = useWorkspaceStore((state) => state.tabs)
    const activeTabId = useWorkspaceStore((state) => state.activeTabId)
    const updateActiveTab = useWorkspaceStore((state) => state.updateActiveTab)

    const request = tabs.find(t => t.id === activeTabId)
    if (!request) return null

    const settings = request.settings

    const set = <K extends keyof RequestSettings>(key: K, val: RequestSettings[K]) => {
        updateActiveTab({ settings: { ...settings, [key]: val } })
    }

    return (
        <div className="p-4 max-w-2xl space-y-1 overflow-auto">
            <div className="flex items-start justify-between gap-6 py-3 border-b border-border/40">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">HTTP version</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 tracking-wide">
              NEW
            </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Select the HTTP version to use for sending the request.
                    </p>
                </div>
                <select
                    value={settings.httpVersion}
                    onChange={(e) => set('httpVersion', e.target.value as RequestSettings['httpVersion'])}
                    className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer shrink-0"
                >
                    <option value="auto">Auto</option>
                    <option value="1.0">HTTP/1.0</option>
                    <option value="1.1">HTTP/1.1</option>
                    <option value="2">HTTP/2</option>
                </select>
            </div>

            <SettingsRow
                label="Enable SSL certificate verification"
                description="Verify SSL certificates when sending a request."
                checked={settings.sslVerification}
                onChange={(v) => set('sslVerification', v)}
            />
            <SettingsRow
                label="Automatically follow redirects"
                description="Follow HTTP 3xx responses as redirects."
                checked={settings.followRedirects}
                onChange={(v) => set('followRedirects', v)}
            />

            <div className="flex items-start justify-between gap-6 py-3 border-b border-border/40">
                <div>
                    <span className="text-xs font-medium text-foreground">Maximum number of redirects</span>
                </div>
                <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.maxRedirects}
                    onChange={(e) => set('maxRedirects', Number(e.target.value))}
                    className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all w-20 text-right shrink-0"
                />
            </div>
        </div>
    )
}