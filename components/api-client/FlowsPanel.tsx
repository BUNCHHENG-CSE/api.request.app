'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Plus, GitBranch, Trash2, ChevronRight, CheckCircle2, XCircle, Loader2, StopCircle, RotateCcw, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Flow, FlowNode, HttpMethod } from './types'

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:     'method-GET',
  POST:    'method-POST',
  PUT:     'method-PUT',
  PATCH:   'method-PATCH',
  DELETE:  'method-DELETE',
  HEAD:    'text-muted-foreground',
  OPTIONS: 'text-muted-foreground',
}

const METHOD_BG: Record<HttpMethod, string> = {
  GET:     'bg-[oklch(0.65_0.18_145)]/10 border-[oklch(0.65_0.18_145)]/30',
  POST:    'bg-[oklch(0.72_0.16_65)]/10 border-[oklch(0.72_0.16_65)]/30',
  PUT:     'bg-[oklch(0.65_0.18_255)]/10 border-[oklch(0.65_0.18_255)]/30',
  PATCH:   'bg-[oklch(0.72_0.16_200)]/10 border-[oklch(0.72_0.16_200)]/30',
  DELETE:  'bg-[oklch(0.65_0.22_25)]/10 border-[oklch(0.65_0.22_25)]/30',
  HEAD:    'bg-muted/10 border-border',
  OPTIONS: 'bg-muted/10 border-border',
}

interface FlowsPanelProps {
  flows: Flow[]
  onUpdateFlow: (flow: Flow) => void
  onCreateFlow: (name: string) => Flow
}

// ─── SVG arrow between nodes ──────────────────────────────────────────────────

function Arrow({ fromX, fromY, toX, toY, label }: { fromX: number; fromY: number; toX: number; toY: number; label?: string }) {
  const NODE_W = 160
  const NODE_H = 72

  const x1 = fromX + NODE_W
  const y1 = fromY + NODE_H / 2
  const x2 = toX
  const y2 = toY + NODE_H / 2
  const mx = (x1 + x2) / 2
  const path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`

  return (
    <g>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="oklch(0.45 0 0)" />
        </marker>
      </defs>
      <path d={path} stroke="oklch(0.35 0 0)" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" strokeDasharray="none" />
      {label && (
        <text x={mx} y={(y1 + y2) / 2 - 5} textAnchor="middle" fontSize="10" fill="oklch(0.55 0 0)" fontFamily="monospace">
          {label}
        </text>
      )}
    </g>
  )
}

// ─── Flow node card ───────────────────────────────────────────────────────────

function NodeCard({ node, onClick, selected }: { node: FlowNode; onClick: () => void; selected: boolean }) {
  if (node.type === 'start' || node.type === 'end') {
    return (
      <div
        onClick={onClick}
        style={{ left: node.x, top: node.y, width: 80, position: 'absolute' }}
        className={cn(
          'flex items-center justify-center h-[72px] rounded-full border-2 cursor-pointer transition-all select-none',
          selected
            ? 'border-primary bg-primary/20 shadow-lg shadow-primary/30'
            : 'border-border bg-[oklch(0.15_0_0)] hover:border-primary/50',
        )}
      >
        <span className="text-xs font-semibold text-foreground/80">{node.label}</span>
      </div>
    )
  }

  if (node.type === 'condition') {
    return (
      <div
        onClick={onClick}
        style={{ left: node.x, top: node.y, width: 160, position: 'absolute' }}
        className={cn(
          'flex items-center justify-center h-[72px] border-2 cursor-pointer transition-all select-none',
          'bg-[oklch(0.72_0.16_65)]/10 border-[oklch(0.72_0.16_65)]/40',
          selected && 'border-primary shadow-lg shadow-primary/20',
          'rounded-lg'
        )}
      >
        <div className="text-center">
          <div className="text-[10px] text-[oklch(0.72_0.16_65)] font-bold uppercase tracking-wide">Condition</div>
          <div className="text-xs text-foreground/80 font-medium mt-0.5">{node.label}</div>
        </div>
      </div>
    )
  }

  // Request node
  const statusIcon = node.status === 'running'
    ? <Loader2 className="size-3 animate-spin text-primary" />
    : node.status === 'success'
    ? <CheckCircle2 className="size-3 text-[oklch(0.65_0.18_145)]" />
    : node.status === 'error'
    ? <XCircle className="size-3 text-[oklch(0.65_0.22_25)]" />
    : null

  return (
    <div
      onClick={onClick}
      style={{ left: node.x, top: node.y, width: 160, position: 'absolute' }}
      className={cn(
        'border rounded-lg cursor-pointer transition-all select-none overflow-hidden',
        node.method ? METHOD_BG[node.method] : 'bg-muted/10 border-border',
        selected && 'ring-2 ring-primary shadow-lg shadow-primary/20',
        'hover:shadow-md'
      )}
    >
      <div className="px-3 py-2 flex items-center gap-2 h-[72px]">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {node.method && (
              <span className={cn('text-[9px] font-bold tracking-wide', METHOD_COLORS[node.method])}>
                {node.method}
              </span>
            )}
            {statusIcon}
          </div>
          <span className="text-xs font-semibold text-foreground truncate leading-tight">
            {node.label}
          </span>
          <span className="text-[10px] text-muted-foreground truncate font-mono">
            {node.url?.replace('localhost:8080', '') || '—'}
          </span>
          {node.status === 'success' && node.response && (
            <span className="text-[9px] text-[oklch(0.65_0.18_145)]">{node.response.status} · {node.response.time}ms</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Node detail panel ────────────────────────────────────────────────────────

function NodeDetail({ node, onUpdate, onDelete }: {
  node: FlowNode
  onUpdate: (n: FlowNode) => void
  onDelete: () => void
}) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-border bg-[oklch(0.11_0_0)] flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-semibold text-foreground">Node Editor</span>
        <button onClick={onDelete} className="text-muted-foreground hover:text-[oklch(0.65_0.22_25)] transition-colors">
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Label</span>
          <input
            value={node.label}
            onChange={(e) => onUpdate({ ...node, label: e.target.value })}
            className="bg-muted/40 border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </label>
        {node.type === 'request' && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Method</span>
              <select
                value={node.method ?? 'GET'}
                onChange={(e) => onUpdate({ ...node, method: e.target.value as HttpMethod })}
                className="bg-muted/40 border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {(['GET','POST','PUT','PATCH','DELETE'] as HttpMethod[]).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">URL</span>
              <input
                value={node.url ?? ''}
                onChange={(e) => onUpdate({ ...node, url: e.target.value })}
                className="bg-muted/40 border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="localhost:8080/endpoint"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Body (JSON)</span>
              <textarea
                value={node.body ?? ''}
                onChange={(e) => onUpdate({ ...node, body: e.target.value })}
                rows={4}
                className="bg-muted/40 border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="{}"
              />
            </label>
          </>
        )}
        {node.response && (
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Last Response</div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                'text-xs font-bold',
                node.response.status < 400 ? 'text-[oklch(0.65_0.18_145)]' : 'text-[oklch(0.65_0.22_25)]'
              )}>{node.response.status}</span>
              <span className="text-[10px] text-muted-foreground">{node.response.time}ms</span>
            </div>
            <pre className="text-[10px] text-muted-foreground font-mono overflow-x-auto max-h-24 overflow-y-auto whitespace-pre-wrap break-words">
              {node.response.body.slice(0, 200)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function FlowsPanel({ flows, onUpdateFlow, onCreateFlow }: FlowsPanelProps) {
  const [activeFlowId, setActiveFlowId] = useState<string>(flows[0]?.id ?? '')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [showNewFlow, setShowNewFlow] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  const activeFlow = flows.find((f) => f.id === activeFlowId) ?? flows[0]
  const selectedNode = activeFlow?.nodes.find((n) => n.id === selectedNodeId) ?? null

  const updateNode = useCallback((updated: FlowNode) => {
    if (!activeFlow) return
    onUpdateFlow({ ...activeFlow, nodes: activeFlow.nodes.map((n) => n.id === updated.id ? updated : n) })
  }, [activeFlow, onUpdateFlow])

  const deleteNode = useCallback(() => {
    if (!activeFlow || !selectedNodeId) return
    onUpdateFlow({
      ...activeFlow,
      nodes: activeFlow.nodes.filter((n) => n.id !== selectedNodeId),
      edges: activeFlow.edges.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId),
    })
    setSelectedNodeId(null)
  }, [activeFlow, selectedNodeId, onUpdateFlow])

  const runFlow = useCallback(async () => {
    if (!activeFlow || running) return
    setRunning(true)
    setSelectedNodeId(null)

    // reset all nodes
    const resetFlow: Flow = {
      ...activeFlow,
      nodes: activeFlow.nodes.map((n) => ({ ...n, status: 'idle', response: undefined })),
    }
    onUpdateFlow(resetFlow)

    const requestNodes = resetFlow.nodes.filter((n) => n.type === 'request')
    for (const node of requestNodes) {
      // mark running
      onUpdateFlow({
        ...resetFlow,
        nodes: resetFlow.nodes.map((n) => n.id === node.id ? { ...n, status: 'running' } : n),
      })
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))
      const time = Math.floor(Math.random() * 200) + 60
      const ok = Math.random() > 0.15
      const status = ok ? (node.method === 'POST' ? 201 : 200) : 500
      const response = { status, time, body: ok ? '{"success":true}' : '{"error":"Internal Server Error"}' }

      resetFlow.nodes = resetFlow.nodes.map((n) =>
        n.id === node.id ? { ...n, status: ok ? 'success' : 'error', response } : n
      )
      onUpdateFlow({ ...resetFlow })
    }

    setRunning(false)
  }, [activeFlow, running, onUpdateFlow])

  const stopFlow = useCallback(() => {
    if (!activeFlow) return
    setRunning(false)
    onUpdateFlow({
      ...activeFlow,
      nodes: activeFlow.nodes.map((n) => ({ ...n, status: 'idle', response: undefined })),
    })
  }, [activeFlow, onUpdateFlow])

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) return
    const flow = onCreateFlow(newFlowName.trim())
    setActiveFlowId(flow.id)
    setNewFlowName('')
    setShowNewFlow(false)
  }

  const CANVAS_H = 400

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-[oklch(0.11_0_0)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Flows</span>
          <span className="text-xs text-muted-foreground">— visual request orchestration</span>
        </div>
        <div className="flex items-center gap-2">
          {running ? (
            <button
              onClick={stopFlow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.65_0.22_25)]/15 border border-[oklch(0.65_0.22_25)]/30 text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.65_0.22_25)]/25 transition-all text-xs font-medium"
            >
              <StopCircle className="size-3.5" />
              Stop
            </button>
          ) : (
            <button
              onClick={runFlow}
              disabled={!activeFlow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-xs font-medium disabled:opacity-40"
            >
              <Play className="size-3.5" />
              Run Flow
            </button>
          )}
          <button
            onClick={() => setShowNewFlow(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all text-xs"
          >
            <Plus className="size-3.5" />
            New Flow
          </button>
        </div>
      </div>

      {/* Flow tabs */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-border bg-[oklch(0.10_0_0)] flex-shrink-0 overflow-x-auto">
        {flows.map((f) => (
          <button
            key={f.id}
            onClick={() => { setActiveFlowId(f.id); setSelectedNodeId(null) }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all',
              f.id === activeFlowId
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}
          >
            <Zap className="size-3" />
            {f.name}
          </button>
        ))}

        {showNewFlow && (
          <div className="flex items-center gap-1.5 ml-1">
            <input
              autoFocus
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFlow(); if (e.key === 'Escape') setShowNewFlow(false) }}
              placeholder="Flow name..."
              className="bg-muted/40 border border-primary/40 rounded-md px-2 py-1 text-xs text-foreground w-32 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button onClick={handleCreateFlow} className="text-primary hover:text-primary/80 text-xs font-medium">Add</button>
            <button onClick={() => setShowNewFlow(false)} className="text-muted-foreground hover:text-foreground text-xs">Cancel</button>
          </div>
        )}
      </div>

      {/* Canvas + detail */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-auto relative bg-[oklch(0.095_0_0)]">
          {/* Dot grid background */}
          <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="oklch(0.25 0 0)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {activeFlow ? (
            <div ref={canvasRef} style={{ width: 1300, height: CANVAS_H + 120, position: 'relative' }}>
              {/* SVG edges */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                {activeFlow.edges.map((edge) => {
                  const from = activeFlow.nodes.find((n) => n.id === edge.from)
                  const to = activeFlow.nodes.find((n) => n.id === edge.to)
                  if (!from || !to) return null
                  const fromW = (from.type === 'start' || from.type === 'end') ? 80 : 160
                  return <Arrow key={edge.id} fromX={from.x} fromY={from.y} toX={to.x} toY={to.y} label={edge.label} />
                })}
              </svg>

              {/* Nodes */}
              {activeFlow.nodes.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  selected={selectedNodeId === node.id}
                  onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <GitBranch className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No flows yet</p>
              <button
                onClick={() => setShowNewFlow(true)}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                <Plus className="size-3" /> Create your first flow
              </button>
            </div>
          )}
        </div>

        {/* Node detail sidebar */}
        {selectedNode && (
          <NodeDetail node={selectedNode} onUpdate={updateNode} onDelete={deleteNode} />
        )}
      </div>

      {/* Run log */}
      {activeFlow && activeFlow.nodes.some((n) => n.status !== 'idle') && (
        <div className="border-t border-border bg-[oklch(0.10_0_0)] px-5 py-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Run log</span>
            <button
              onClick={stopFlow}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {activeFlow.nodes.filter((n) => n.type === 'request').map((n) => (
              <div key={n.id} className="flex items-center gap-1.5">
                {n.status === 'idle' && <div className="size-2 rounded-full bg-muted-foreground/30" />}
                {n.status === 'running' && <Loader2 className="size-3 animate-spin text-primary" />}
                {n.status === 'success' && <CheckCircle2 className="size-3 text-[oklch(0.65_0.18_145)]" />}
                {n.status === 'error' && <XCircle className="size-3 text-[oklch(0.65_0.22_25)]" />}
                <span className={cn(
                  'text-xs',
                  n.status === 'success' ? 'text-[oklch(0.65_0.18_145)]' :
                  n.status === 'error' ? 'text-[oklch(0.65_0.22_25)]' :
                  n.status === 'running' ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {n.label}
                </span>
                {n.status !== 'idle' && n.status !== 'running' && (
                  <ChevronRight className="size-3 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
