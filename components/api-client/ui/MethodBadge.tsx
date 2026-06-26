'use client'

import { cn } from '@/lib/utils'
import type { HttpMethod } from '../types'

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

export const METHOD_BG: Record<HttpMethod, string> = {
  GET:     'bg-blue-500/10 border-blue-500/25 text-blue-400',
  POST:    'bg-amber-500/10 border-amber-500/25 text-amber-400',
  PUT:     'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
  PATCH:   'bg-purple-500/10 border-purple-500/25 text-purple-400',
  DELETE:  'bg-rose-500/10 border-rose-500/25 text-rose-400',
  HEAD:    'bg-slate-500/10 border-slate-500/25 text-slate-400',
  OPTIONS: 'bg-slate-500/10 border-slate-500/25 text-slate-400',
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
