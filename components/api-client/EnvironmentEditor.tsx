'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Save, Eye, EyeOff, Lock } from 'lucide-react'
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

const ENV_DOT_COLORS: Record<string, string> = {
  '#3b82f6': 'bg-blue-500',
  '#f59e0b': 'bg-amber-500',
  '#ef4444': 'bg-rose-500',
}

export function EnvironmentEditor({ environment, onEnvironmentChange, onClose }: EnvironmentEditorProps) {
  const [env, setEnv] = useState<Environment>(environment)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())

  const toggleReveal = (id: string) => {
    setRevealedIds((prev: Set<string>) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  const update = (id: string, field: keyof EnvironmentVariable, val: string | boolean) =>
    setEnv((prev) => ({
      ...prev,
      variables: prev.variables.map((v) => (v.id === id ? { ...v, [field]: val } : v)),
    }))

  const addVariable = () =>
    setEnv((prev) => ({
      ...prev,
      variables: [
        ...prev.variables,
        { id: generateId(), key: '', value: '', enabled: true, secret: false },
      ],
    }))

  const removeVariable = (id: string) =>
    setEnv((prev) => ({
      ...prev,
      variables: prev.variables.filter((v) => v.id !== id),
    }))

  const handleSave = () => {
    onEnvironmentChange(env)
    onClose()
  }

  const dotColor = ENV_DOT_COLORS[env.color] ?? 'bg-primary'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">Edit Environment</h2>
            <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-medium text-foreground')}>
              <span className={cn('size-1.5 rounded-full shrink-0', dotColor)} />
              {env.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[28px_1fr_1fr_28px_36px] gap-px bg-border">
              <div className="bg-surface/60 px-2 py-2.5" />
              <div className="bg-surface/60 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Variable Name
              </div>
              <div className="bg-surface/60 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Value
              </div>
              <div className="bg-surface/60 px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" title="Secret">
                <Lock className="size-3 text-muted-foreground/60 mx-auto" />
              </div>
              <div className="bg-surface/60" />
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-px bg-border">
              {env.variables.map((v) => {
                const isRevealed = revealedIds.has(v.id)
                return (
                  <div
                    key={v.id}
                    className={cn(
                      'grid grid-cols-[28px_1fr_1fr_28px_36px] gap-px group focus-within:bg-primary/5 transition-colors',
                      !v.enabled && 'opacity-50',
                    )}
                  >
                    <div className="bg-background flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={v.enabled}
                        onChange={(e) => update(v.id, 'enabled', e.target.checked)}
                        className="accent-primary size-3 cursor-pointer"
                      />
                    </div>
                    <input
                      value={v.key}
                      onChange={(e) => update(v.id, 'key', e.target.value)}
                      placeholder="VARIABLE_NAME"
                      className="bg-background px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/35 focus:outline-none"
                    />
                    <div className="bg-background flex items-center pr-1">
                      <input
                        type={v.secret && !isRevealed ? 'password' : 'text'}
                        value={v.value}
                        onChange={(e) => update(v.id, 'value', e.target.value)}
                        placeholder="value"
                        className="flex-1 bg-transparent px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/35 focus:outline-none min-w-0"
                      />
                      {v.secret && (
                        <button
                          onClick={() => toggleReveal(v.id)}
                          className="p-1.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
                        >
                          {isRevealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </button>
                      )}
                    </div>
                    <div className="bg-background flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={v.secret ?? false}
                        onChange={(e) => update(v.id, 'secret', e.target.checked)}
                        className="accent-primary size-3 cursor-pointer"
                        title="Mark as secret"
                      />
                    </div>
                    <button
                      onClick={() => removeVariable(v.id)}
                      className="bg-background flex items-center justify-center text-muted-foreground/25 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Add row */}
            <div className="bg-background">
              <button
                onClick={addVariable}
                className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-surface/60 w-full transition-colors"
              >
                <Plus className="size-3.5" />
                Add new variable
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
            <Lock className="size-3" />
            Secret variables are masked in logs. Use{' '}
            <code className="font-mono bg-surface/60 px-1 rounded">{`{{VARIABLE_NAME}}`}</code>{' '}
            to reference variables in requests.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-card/50 shrink-0">
          <span className="text-[10px] text-muted-foreground">
            {env.variables.filter((v) => v.enabled).length} of {env.variables.length} variables active
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground transition-colors border border-border"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Save className="size-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
