'use client'

import { cn } from '@/lib/utils'
import type { HttpMethod } from '@/types/api.types'

/** Maps each HTTP method to its Tailwind color classes */
export const METHOD_TEXT: Record<HttpMethod, string> = {
  GET:     'text-blue-400',
  POST:    'text-amber-400',
  PUT:     'text-indigo-400',
  PATCH:   'text-purple-400',
  DELETE:  'text-rose-400',
  HEAD:    'text-slate-400',
  OPTIONS: 'text-slate-400',
}
export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:     'text-blue-500',
  POST:    'text-amber-500',
  PUT:     'text-indigo-500',
  PATCH:   'text-purple-500',
  DELETE:  'text-rose-500',
  HEAD:    'text-muted-foreground',
  OPTIONS: 'text-muted-foreground',
}

// const METHOD_BG: Record<HttpMethod, string> = {
//   GET:     'bg-blue-500/10 border-blue-500/30',
//   POST:    'bg-amber-500/10 border-amber-500/30',
//   PUT:     'bg-indigo-500/10 border-indigo-500/30',
//   PATCH:   'bg-purple-500/10 border-purple-500/30',
//   DELETE:  'bg-rose-500/10 border-rose-500/30',
//   HEAD:    'bg-muted/10 border-border',
//   OPTIONS: 'bg-muted/10 border-border',
// }

export const METHOD_BG: Record<HttpMethod, string> = {
  GET:     'bg-blue-500/10 border-blue-500/25 text-blue-400',
  POST:    'bg-amber-500/10 border-amber-500/25 text-amber-400',
  PUT:     'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
  PATCH:   'bg-purple-500/10 border-purple-500/25 text-purple-400',
  DELETE:  'bg-rose-500/10 border-rose-500/25 text-rose-400',
  HEAD:    'bg-slate-500/10 border-slate-500/25 text-slate-400',
  OPTIONS: 'bg-slate-500/10 border-slate-500/25 text-slate-400',
}
export const METHOD_BADGE: Record<HttpMethod, string> = {
  GET:     'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
  POST:    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  PUT:     'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30',
  PATCH:   'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
  DELETE:  'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
  HEAD:    'bg-muted/20 text-muted-foreground border border-border',
  OPTIONS: 'bg-muted/20 text-muted-foreground border border-border',
}

interface MethodBadgeProps {
  method: HttpMethod
  size?: 'xs' | 'sm'
  className?: string
}

export function MethodBadge({ method, size = 'sm', className }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold tracking-wide rounded border select-none shrink-0',
        size === 'xs' ? 'text-[9px] px-1.5 py-0.5 min-w-[42px]' : 'text-[10px] px-2 py-0.5 min-w-[52px]',
        METHOD_BG[method],
        className,
      )}
    >
      {method}
    </span>
  )
}
