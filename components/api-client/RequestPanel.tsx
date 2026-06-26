'use client'

import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = 'params' | 'headers' | 'auth' | 'body' | 'scripts'
type BodyType = 'none' | 'json' | 'form' | 'text' | 'xml'

interface KeyValue {
  id: string
  key: string
  value: string
  enabled: boolean
}

interface RequestPanelProps {
  headers: KeyValue[]
  params: KeyValue[]
  body: string
  bodyType: BodyType
  activeTab: string
  onTabChange: (tab: TabType) => void
  onHeadersChange: (h: KeyValue[]) => void
  onParamsChange: (p: KeyValue[]) => void
  onBodyChange: (b: string) => void
  onBodyTypeChange: (t: BodyType) => void
}

export function RequestPanel({ headers, params, body, bodyType, activeTab, onTabChange, onHeadersChange, onParamsChange, onBodyChange, onBodyTypeChange }: RequestPanelProps) {

  const generateId = () => {
      // eslint-disable-next-line react-hooks/purity
      return Math.random().toString(36).slice(2);
  }

    const KeyValueTable = ({ items, onChange, placeholderKey = "Key", placeholderValue = "Value" }: { items: KeyValue[], onChange: (items: KeyValue[]) => void, placeholderKey?: string, placeholderValue?: string }) => {
    const handleUpdate = (id: string, field: keyof KeyValue, val: string | boolean) => onChange(items.map(i => i.id === id ? { ...i, [field]: val } : i))
    const handleAdd = () => onChange([...items, { id: generateId(), key: '', value: '', enabled: true }])
    const handleRemove = (id: string) => onChange(items.filter(i => i.id !== id))

    return (
        <div className="w-full">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-px bg-border/50 border-b border-border">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/20 w-10"></div>
            <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/20">Key</div>
            <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/20">Value</div>
            <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/20 w-12"></div>
          </div>

          {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-px bg-border/30 border-b border-border/50 group">
                <div className="flex items-center justify-center bg-background w-10">
                  <input type="checkbox" checked={item.enabled} onChange={(e) => handleUpdate(item.id, 'enabled', e.target.checked)} className="accent-primary" />
                </div>
                <input value={item.key} onChange={(e) => handleUpdate(item.id, 'key', e.target.value)} placeholder={placeholderKey} className="bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:bg-muted/20" />
                <input value={item.value} onChange={(e) => handleUpdate(item.id, 'value', e.target.value)} placeholder={placeholderValue} className="bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:bg-muted/20" />
                <button onClick={() => handleRemove(item.id)} className="bg-background flex items-center justify-center text-muted-foreground/30 hover:text-destructive transition-colors w-12">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
          ))}

          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 w-full transition-colors">
            <Plus className="size-3.5" /> Add new row
          </button>
        </div>
    )
  }

  return (
      <div className="flex flex-col h-full bg-background min-h-0">
        <div className="flex items-center px-4 border-b border-border bg-muted/10 gap-1">
          {(['params', 'headers', 'auth', 'body', 'scripts'] as TabType[]).map((tab) => (
              <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={cn(
                      "px-3 py-2.5 text-xs font-medium capitalize border-b-2 transition-all",
                      activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
              >
                {tab}
                {tab === 'params' && params.length > 0 && <span className="ml-1.5 text-[10px] bg-muted px-1.5 rounded-full">{params.length}</span>}
                {tab === 'headers' && headers.length > 0 && <span className="ml-1.5 text-[10px] bg-muted px-1.5 rounded-full">{headers.length}</span>}
              </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto min-h-0">
            {/* eslint-disable-next-line react-hooks/static-components */}
          {activeTab === 'params' && <KeyValueTable items={params} onChange={onParamsChange} placeholderKey="Query Param" />}
            {/* eslint-disable-next-line react-hooks/static-components */}
          {activeTab === 'headers' && <KeyValueTable items={headers} onChange={onHeadersChange} placeholderKey="Header Name" />}

          {activeTab === 'body' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/10">
                  {(['none', 'json', 'form', 'text', 'xml'] as BodyType[]).map((type) => (
                      <button
                          key={type}
                          onClick={() => onBodyTypeChange(type)}
                          className={cn(
                              "px-2 py-1 text-xs rounded-md capitalize transition-colors",
                              bodyType === type ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                      >
                        {type}
                      </button>
                  ))}
                </div>

                {bodyType === 'none' ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground bg-muted/5">This request does not have a body</div>
                ) : (
                    <textarea
                        value={body}
                        onChange={(e) => onBodyChange(e.target.value)}
                        spellCheck={false}
                        className="flex-1 w-full p-4 bg-background text-foreground font-mono text-xs leading-relaxed resize-none focus:outline-none"
                        placeholder={`Enter ${bodyType} body here...`}
                    />
                )}
              </div>
          )}
        </div>
      </div>
  )
}