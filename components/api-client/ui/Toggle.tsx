'use client'

import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label?: string
  description?: string
  size?: 'sm' | 'md'
  className?: string
}

export function Toggle({ checked, onChange, label, description, size = 'sm', className }: ToggleProps) {
  const trackClass = size === 'sm'
    ? 'w-7 h-4'
    : 'w-9 h-5'
  const thumbClass = size === 'sm'
    ? 'size-3 translate-x-0.5'
    : 'size-4 translate-x-0.5'
  const thumbOnClass = size === 'sm'
    ? 'translate-x-3.5'
    : 'translate-x-4.5'

  return (
    <label className={cn('flex items-center gap-3 cursor-pointer group', className)}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          trackClass,
          checked
            ? 'bg-primary border-primary'
            : 'bg-muted border-border',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200',
            thumbClass,
            checked && thumbOnClass,
          )}
        />
      </button>
      {(label || description) && (
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          {checked ? 'ON' : 'OFF'}
        </span>
      )}
    </label>
  )
}

interface SettingsRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (val: boolean) => void
  badge?: string
  extra?: React.ReactNode
}

export function SettingsRow({ label, description, checked, onChange, badge, extra }: SettingsRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-border/40 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{label}</span>
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 tracking-wide">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {extra}
        <Toggle checked={checked} onChange={onChange} />
      </div>
    </div>
  )
}
