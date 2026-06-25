'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Environment, EnvironmentVariable } from './types'

interface EnvironmentEditorProps {
  environment: Environment
  onEnvironmentChange: (env: Environment) => void
  onClose: () => void
}

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

export function EnvironmentEditor({ environment, onEnvironmentChange, onClose }: EnvironmentEditorProps) {
  const [vars, setVars] = useState<EnvironmentVariable[]>(environment.variables)
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set())

  const handleAddVariable = () => {
    setVars([...vars, { id: generateId(), key: '', value: '', enabled: true }])
  }

  const handleUpdateVariable = (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    setVars(vars.map((v) => v.id === id ? { ...v, [field]: val } : v))
  }

  const handleDeleteVariable = (id: string) => {
    setVars(vars.filter((v) => v.id !== id))
  }

  const handleSave = () => {
    onEnvironmentChange({ ...environment, variables: vars })
    onClose()
  }

  const toggleHidden = (id: string) => {
    const newHidden = new Set(hiddenKeys)
    if (newHidden.has(id)) newHidden.delete(id)
    else newHidden.add(id)
    setHiddenKeys(newHidden)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[oklch(0.17_0_0)] border border-border rounded-xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[80vh] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn(
              'size-3 rounded-full flex-shrink-0',
              environment.name === 'Development' ? 'bg-[oklch(0.65_0.17_145)]' :
              environment.name === 'Staging'     ? 'bg-[oklch(0.72_0.16_65)]'  :
              'bg-[oklch(0.65_0.22_25)]'
            )} />
            <h2 className="text-lg font-semibold text-foreground">{environment.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-3 pb-2 border-b border-border">
              <div className="col-span-5 text-xs font-semibold text-muted-foreground uppercase">Variable</div>
              <div className="col-span-6 text-xs font-semibold text-muted-foreground uppercase">Value</div>
              <div className="col-span-1" />
            </div>

            {/* Variables */}
            {vars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">No variables yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add your first variable to get started</p>
              </div>
            ) : (
              vars.map((variable) => (
                <div key={variable.id} className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-muted/30 transition-all group">
                  {/* Enabled toggle */}
                  <div className="col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={variable.enabled}
                      onChange={(e) => handleUpdateVariable(variable.id, 'enabled', e.target.checked)}
                      className="size-4 rounded border-border accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Key input */}
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={variable.key}
                      onChange={(e) => handleUpdateVariable(variable.id, 'key', e.target.value)}
                      placeholder="e.g., API_URL"
                      className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
                    />
                  </div>

                  {/* Value input */}
                  <div className="col-span-6 relative">
                    <input
                      type={hiddenKeys.has(variable.id) ? 'password' : 'text'}
                      value={variable.value}
                      onChange={(e) => handleUpdateVariable(variable.id, 'value', e.target.value)}
                      placeholder="e.g., https://api.example.com"
                      className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono pr-9"
                    />
                    <button
                      onClick={() => toggleHidden(variable.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 text-muted-foreground hover:text-foreground transition-all"
                    >
                      {hiddenKeys.has(variable.id) ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>

                  {/* Delete button */}
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteVariable(variable.id)}
                      className="flex items-center justify-center size-7 rounded text-muted-foreground hover:text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 bg-[oklch(0.12_0_0)]">
          <button
            onClick={handleAddVariable}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-all"
          >
            <Plus className="size-3.5" />
            Add variable
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-xs font-medium text-primary-foreground transition-all"
            >
              Save Environment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
