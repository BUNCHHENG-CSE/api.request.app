'use client'

import { useState } from 'react'
import { Copy, Check,  Clock, Database, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApiResponse } from './types'

type ResponseTab = 'body' | 'headers' | 'cookies' | 'timeline'

interface ResponsePanelProps {
    response: ApiResponse | null
    isLoading: boolean
}

function StatusBadge({ status }: { status: number }) {
    const isSuccess = status < 300
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold',
            isSuccess ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'
        )}>
      <span className={cn('size-1.5 rounded-full', isSuccess ? 'bg-green-500' : 'bg-red-500')} />
            {status}
    </span>
    )
}

export function ResponsePanel({ response, isLoading }: ResponsePanelProps) {
    const [activeTab, setActiveTab] = useState<ResponseTab>('body')
    const [copied, setCopied] = useState(false)

    const copyBody = () => {
        if (response?.body) navigator.clipboard.writeText(response.body)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const TABS: ResponseTab[] = ['body', 'headers', 'cookies', 'timeline']

    return (
        <div className="flex flex-col h-full min-h-0 border-t border-border">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response</span>
                    {response && (
                        <div className="flex items-center gap-3">
                            <StatusBadge status={response.status} />
                            <div className="flex items-center gap-1.5 text-xs"><Clock className="size-3 text-muted-foreground" /><span className="font-medium">{response.time}ms</span></div>
                            <div className="flex items-center gap-1.5 text-xs"><Database className="size-3 text-muted-foreground" /><span className="font-medium">{response.size}</span></div>
                        </div>
                    )}
                </div>
                {response && (
                    <div className="flex items-center gap-1">
                        <button onClick={copyBody} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted transition-all">
                            {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                )}
            </div>

            {response && (
                <div className="flex items-center gap-0 px-4 border-b border-border bg-muted/10">
                    {TABS.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={cn('relative px-3 py-2.5 text-xs font-medium capitalize', activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                            {tab}
                            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 overflow-auto min-h-0 bg-background">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4"><Zap className="size-6 text-primary animate-pulse" /><p className="text-sm font-medium">Sending request...</p></div>
                ) : !response ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground"><Database className="size-6 opacity-40" /><p className="text-sm">Hit Send to get a response</p></div>
                ) : (
                    activeTab === 'body' && (
                        <div className="flex min-h-full">
                            <div className="flex flex-col items-end px-3 py-3 bg-muted/20 border-r border-border select-none min-w-10">
                                {response.body.split('\n').map((_, i) => <span key={i} className="text-xs text-muted-foreground/40 font-mono leading-5">{i + 1}</span>)}
                            </div>
                            <div className="flex-1 px-4 py-3 whitespace-pre font-mono text-xs leading-5">
                                {response.body}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}