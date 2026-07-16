'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface CodeEditorProps {
  value: string
  onChange: (val: string) => void
  language?: string
  placeholder?: string
  readOnly?: boolean
  className?: string
  minHeight?: string
}

/** Lightweight syntax-highlight-free code editor with line numbers and tab support. */
export function CodeEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  className,
  minHeight = '100%',
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lines = value.split('\n')
  const lineCount = Math.max(lines.length, 1)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (readOnly) return
      if (e.key === 'Tab') {
        e.preventDefault()
        const el = e.currentTarget
        const start = el.selectionStart
        const end = el.selectionEnd
        const next = value.substring(0, start) + '  ' + value.substring(end)
        onChange(next)
        // Restore cursor position after React re-render
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 2
            textareaRef.current.selectionEnd = start + 2
          }
        })
      }
    },
    [value, onChange, readOnly],
  )

  return (
    <div className={cn('flex min-h-0 overflow-auto font-mono text-xs', className)} style={{ minHeight }}>
      {/* Line numbers */}
      <div
        className="select-none flex flex-col items-end px-3 pt-3 pb-3 text-muted-foreground/30 bg-surface/30 border-r border-border shrink-0"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <span key={i} className="leading-5">
            {i + 1}
          </span>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={cn(
          'flex-1 resize-none bg-transparent px-4 py-3 text-foreground leading-5 focus:outline-none placeholder:text-muted-foreground/30',
          readOnly && 'cursor-default',
        )}
        style={{ minHeight }}
      />
    </div>
  )
}
