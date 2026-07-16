'use client'

import { useState, useRef } from 'react'
import { Code2, Wand2, ChevronDown, Upload, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CodeEditor } from '@/components/web/CodeEditor'
import { KeyValueTable } from '@/components/web/KeyValueTable'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { BodyType, FormDataRow } from '@/types/api.types'

const BODY_TYPES: { id: BodyType; label: string }[] = [
    { id: 'none', label: 'none' },
    { id: 'form-data', label: 'form-data' },
    { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
    { id: 'raw', label: 'raw' },
    { id: 'binary', label: 'binary' },
    { id: 'graphql', label: 'GraphQL' },
]

const RAW_FORMATS = ['JSON', 'XML', 'HTML', 'Text', 'JavaScript']

function generateId() { return Math.random().toString(36).slice(2, 11) }

export function BodyTab() {
    const [rawFormatOpen, setRawFormatOpen] = useState(false)
    const [rawFormat, setRawFormat] = useState('JSON')
    const [fileName, setFileName] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)

    // Zustand bindings
    const tabs = useWorkspaceStore((state) => state.tabs)
    const activeTabId = useWorkspaceStore((state) => state.activeTabId)
    const updateActiveTab = useWorkspaceStore((state) => state.updateActiveTab)

    const request = tabs.find(t => t.id === activeTabId)
    if (!request) return null

    const handleBeautify = () => {
        try {
            const parsed = JSON.parse(request.body)
            updateActiveTab({ body: JSON.stringify(parsed, null, 2) })
        } catch { /* not valid JSON */ }
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 bg-card shrink-0 flex-wrap">
                {BODY_TYPES.map((bt) => (
                    <label key={bt.id} className="flex items-center gap-1.5 cursor-pointer">
            <span className={cn('size-3.5 rounded-full border-2 flex items-center justify-center transition-all', request.bodyType === bt.id ? 'border-primary' : 'border-muted-foreground/40')}>
              {request.bodyType === bt.id && <span className="size-1.5 rounded-full bg-primary" />}
            </span>
                        <button
                            onClick={() => updateActiveTab({ bodyType: bt.id })}
                            className={cn('text-xs transition-colors', request.bodyType === bt.id ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground')}
                        >
                            {bt.label}
                        </button>
                    </label>
                ))}

                {request.bodyType === 'raw' && (
                    <div className="relative ml-1">
                        <button onClick={() => setRawFormatOpen(!rawFormatOpen)} className="flex items-center gap-1 text-xs text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded-md">
                            {rawFormat} <ChevronDown className="size-3" />
                        </button>
                        {rawFormatOpen && (
                            <div className="absolute top-full left-0 mt-1 z-40 bg-popover border border-border rounded-xl shadow-xl overflow-hidden min-w-[6.25rem]">
                                {RAW_FORMATS.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => { setRawFormat(f); setRawFormatOpen(false) }}
                                        className={cn('w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors', f === rawFormat ? 'text-primary font-medium' : 'text-muted-foreground')}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(request.bodyType === 'raw' || request.bodyType === 'json') && request.body.trim() && (
                    <div className="flex items-center gap-1 ml-auto">
                        <button className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-surface transition-colors">
                            <Code2 className="size-3" /> Schema
                        </button>
                        <button onClick={handleBeautify} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-surface transition-colors">
                            <Wand2 className="size-3" /> Beautify
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
                {request.bodyType === 'none' && (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground/50">
                        This request does not have a body
                    </div>
                )}

                {request.bodyType === 'form-data' && (
                    <FormDataTable rows={request.formDataRows || []} onChange={(formDataRows) => updateActiveTab({ formDataRows })} />
                )}

                {request.bodyType === 'x-www-form-urlencoded' && (
                    <KeyValueTable
                        items={request.formEncodedRows || []}
                        onChange={(formEncodedRows) => updateActiveTab({ formEncodedRows })}
                        placeholderKey="Key"
                        placeholderValue="Value"
                        showDescription
                    />
                )}

                {request.bodyType === 'raw' && (
                    <CodeEditor
                        value={request.body}
                        onChange={(body) => updateActiveTab({ body })}
                        language={rawFormat.toLowerCase()}
                        placeholder={`Enter ${rawFormat} body here...`}
                    />
                )}

                {request.bodyType === 'binary' && (
                    <div className="flex flex-col items-start gap-3 p-4">
                        <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
                        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border hover:border-primary/40 text-xs text-muted-foreground hover:text-foreground bg-surface hover:bg-surface/60 transition-all">
                            <Upload className="size-4" /> {fileName || 'Select file'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function FormDataTable({ rows, onChange }: { rows: FormDataRow[], onChange: (rows: FormDataRow[]) => void }) {
    const update = (id: string, field: keyof FormDataRow, val: string | boolean) => onChange(rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)))
    const addRow = () => onChange([...rows, { id: generateId(), key: '', value: '', enabled: true, type: 'text', description: '' }])
    const removeRow = (id: string) => onChange(rows.filter((r) => r.id !== id))

    return (
        <div className="w-full flex flex-col">
            <div className="grid grid-cols-[28px_1fr_100px_1fr_1fr_36px] gap-px bg-border">
                {['', 'Key', 'Type', 'Value', 'Description', ''].map((h, i) => (
                    <div key={i} className="bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</div>
                ))}
            </div>
            <div className="flex flex-col gap-px bg-border">
                {rows.map((row) => (
                    <div key={row.id} className={cn('grid grid-cols-[28px_1fr_100px_1fr_1fr_36px] gap-px group', !row.enabled && 'opacity-50')}>
                        <div className="bg-background flex items-center justify-center">
                            <input type="checkbox" checked={row.enabled} onChange={(e) => update(row.id, 'enabled', e.target.checked)} className="accent-primary size-3 cursor-pointer" />
                        </div>
                        <input value={row.key} onChange={(e) => update(row.id, 'key', e.target.value)} placeholder="Key" className="bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none" />
                        <select value={row.type} onChange={(e) => update(row.id, 'type', e.target.value)} className="bg-background px-3 py-2 text-xs text-muted-foreground focus:outline-none cursor-pointer">
                            <option value="text">Text</option>
                            <option value="file">File</option>
                        </select>
                        <input value={row.value} onChange={(e) => update(row.id, 'value', e.target.value)} placeholder={row.type === 'file' ? 'Select file...' : 'Value'} className="bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none" />
                        <input value={row.description ?? ''} onChange={(e) => update(row.id, 'description', e.target.value)} placeholder="Description" className="bg-background px-3 py-2 text-xs text-muted-foreground focus:outline-none" />
                        <button onClick={() => removeRow(row.id)} className="bg-background flex items-center justify-center text-muted-foreground/20 hover:text-rose-400">
                            <Trash2 className="size-3.5" />
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={addRow} className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface/60 w-full border-t border-border">
                <Plus className="size-3.5" /> Add row
            </button>
        </div>
    )
}