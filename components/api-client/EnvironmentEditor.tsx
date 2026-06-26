'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import type { Environment } from './types'

interface EnvironmentEditorProps {
  environment: Environment
  onEnvironmentChange: (env: Environment) => void
  onClose: () => void
}

export function EnvironmentEditor({ environment, onEnvironmentChange, onClose }: EnvironmentEditorProps) {
  const [env, setEnv] = useState<Environment>(environment)

  const generateId = () => Math.random().toString(36).slice(2)

  const handleUpdateVar = (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    setEnv(prev => ({ ...prev, variables: prev.variables.map(v => v.id === id ? { ...v, [field]: val } : v) }))
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-3xl h-[80vh] bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold tracking-tight">Edit Environment</h2>
              <div className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono text-muted-foreground">
                {env.name}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {/* Content (Table) */}
          <div className="flex-1 overflow-auto p-4 bg-background">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-px bg-border">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/30 w-10"></div>
                <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/30">Variable Name</div>
                <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/30">Value</div>
                <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground bg-muted/30 w-12"></div>
              </div>

              <div className="flex flex-col bg-border gap-px">
                {env.variables.map((v) => (
                    <div key={v.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-px group focus-within:ring-1 focus-within:ring-primary/50 relative z-10">
                      <div className="flex items-center justify-center bg-background w-10">
                        <input type="checkbox" checked={v.enabled} onChange={(e) => handleUpdateVar(v.id, 'enabled', e.target.checked)} className="accent-primary" />
                      </div>
                      <input
                          value={v.key} onChange={(e) => handleUpdateVar(v.id, 'key', e.target.value)}
                          placeholder="BASE_URL"
                          className="bg-background px-3 py-2.5 text-xs font-mono focus:outline-none focus:bg-muted/10 transition-colors"
                      />
                      <input
                          value={v.value} onChange={(e) => handleUpdateVar(v.id, 'value', e.target.value)}
                          placeholder="https://api..."
                          className="bg-background px-3 py-2.5 text-xs font-mono focus:outline-none focus:bg-muted/10 transition-colors"
                      />
                      <button
                          onClick={() => setEnv(p => ({ ...p, variables: p.variables.filter(x => x.id !== v.id) }))}
                          className="bg-background flex items-center justify-center text-muted-foreground/30 hover:text-destructive transition-colors w-12"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                ))}
              </div>

              <div className="bg-background">
                <button
                    onClick={() => setEnv(p => ({ ...p, variables: [...p.variables, { id: generateId(), key: '', value: '', enabled: true }] }))}
                    className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 w-full transition-colors"
                >
                  <Plus className="size-3.5" /> Add new variable
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border bg-muted/10 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button
                onClick={() => { onEnvironmentChange(env); onClose(); }}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              <Save className="size-3.5" /> Save Changes
            </button>
          </div>
        </div>
      </div>
  )
}