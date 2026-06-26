'use client'

import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KeyValueRow } from '../types'

interface KeyValueTableProps {
  items: KeyValueRow[]
  onChange: (items: KeyValueRow[]) => void
  placeholderKey?: string
  placeholderValue?: string
  showDescription?: boolean
  className?: string
}

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

export function KeyValueTable({
  items,
  onChange,
  placeholderKey = 'Key',
  placeholderValue = 'Value',
  showDescription = false,
  className,
}: KeyValueTableProps) {
  const update = (id: string, field: keyof KeyValueRow, val: string | boolean) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: val } : i)))

  const add = () =>
    onChange([...items, { id: generateId(), key: '', value: '', enabled: true, description: '' }])

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id))

  const cols = showDescription
    ? 'grid-cols-[28px_1fr_1fr_1fr_36px]'
    : 'grid-cols-[28px_1fr_1fr_36px]'

  return (
    <div className={cn('w-full flex flex-col', className)}>
      {/* Header */}
      <div className={cn('grid gap-px bg-border', cols)}>
        <div className="bg-surface px-2 py-2" />
        <div className="bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Key
        </div>
        <div className="bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Value
        </div>
        {showDescription && (
          <div className="bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </div>
        )}
        <div className="bg-surface" />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-px bg-border">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'grid gap-px group',
              cols,
              !item.enabled && 'opacity-50',
            )}
          >
            <div className="bg-background flex items-center justify-center">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => update(item.id, 'enabled', e.target.checked)}
                className="accent-primary size-3 cursor-pointer"
              />
            </div>
            <input
              value={item.key}
              onChange={(e) => update(item.id, 'key', e.target.value)}
              placeholder={placeholderKey}
              className="bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:bg-surface transition-colors"
            />
            <input
              value={item.value}
              onChange={(e) => update(item.id, 'value', e.target.value)}
              placeholder={placeholderValue}
              className="bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:bg-surface transition-colors"
            />
            {showDescription && (
              <input
                value={item.description ?? ''}
                onChange={(e) => update(item.id, 'description', e.target.value)}
                placeholder="Description"
                className="bg-background px-3 py-2 text-xs text-muted-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:bg-surface transition-colors"
              />
            )}
            <button
              onClick={() => remove(item.id)}
              className="bg-background flex items-center justify-center text-muted-foreground/20 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add row */}
      <button
        onClick={add}
        className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface/60 w-full transition-colors border-t border-border"
      >
        <Plus className="size-3.5" />
        Add row
      </button>
    </div>
  )
}
