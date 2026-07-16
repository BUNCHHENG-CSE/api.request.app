'use client'

import { useState } from 'react'
import { Clipboard, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CodeEditor } from '@/components/web/CodeEditor' // Assuming moved to UI
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

const SNIPPETS = [
    'Set environment variable',
    'Get environment variable',
    'Log response body',
    'Assert status 200',
    'Set bearer token',
]

export function ScriptsTab() {
    const [activeScript, setActiveScript] = useState<'preRequest' | 'postResponse'>('preRequest')

    const tabs = useWorkspaceStore((state) => state.tabs)
    const activeTabId = useWorkspaceStore((state) => state.activeTabId)
    const updateActiveTab = useWorkspaceStore((state) => state.updateActiveTab)

    const request = tabs.find(t => t.id === activeTabId)
    if (!request) return null

    const scripts = request.scripts

    const updateScripts = (val: string) => {
        updateActiveTab({ scripts: { ...scripts, [activeScript]: val } })
    }

    return (
        <div className="flex h-full min-h-0">
            <div className="w-36 shrink-0 border-r border-border flex flex-col bg-card">
                {(['preRequest', 'postResponse'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setActiveScript(s)}
                        className={cn(
                            'px-4 py-3 text-xs font-medium text-left transition-colors',
                            activeScript === s
                                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground border-l-2 border-transparent',
                        )}
                    >
                        {s === 'preRequest' ? 'Pre-request' : 'Post-response'}
                    </button>
                ))}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <CodeEditor
                    value={scripts[activeScript]}
                    onChange={updateScripts}
                    placeholder={
                        activeScript === 'preRequest'
                            ? '// Use JavaScript to configure this request dynamically.\n// pm.environment.set("token", "my-token");'
                            : '// Use JavaScript to write tests, visualize response, and more.\n// pm.test("Status is 200", () => pm.response.to.have.status(200));'
                    }
                    className="flex-1"
                />

                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card shrink-0">
                    <button className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface transition-colors">
                        <Package className="size-3" /> Packages
                    </button>
                    <div className="relative group">
                        <button className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface transition-colors">
                            <Clipboard className="size-3" /> Snippets
                        </button>
                        <div className="absolute bottom-full right-0 mb-2 z-40 hidden group-hover:block bg-popover border border-border rounded-xl shadow-xl overflow-hidden w-52">
                            {SNIPPETS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => updateScripts(scripts[activeScript] + `// ${s}\n`)}
                                    className="w-full text-left px-4 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}