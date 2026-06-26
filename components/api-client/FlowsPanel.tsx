'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Plus, GitBranch, Trash2, ChevronRight, CheckCircle2, XCircle, Loader2, StopCircle, RotateCcw, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Flow, FlowNode, HttpMethod } from './types'

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:     'text-blue-500',
  POST:    'text-amber-500',
  PUT:     'text-indigo-500',
  PATCH:   'text-purple-500',
  DELETE:  'text-rose-500',
  HEAD:    'text-muted-foreground',
  OPTIONS: 'text-muted-foreground',
}

const METHOD_BG: Record<HttpMethod, string> = {
  GET:     'bg-blue-500/10 border-blue-500/30',
  POST:    'bg-amber-500/10 border-amber-500/30',
  PUT:     'bg-indigo-500/10 border-indigo-500/30',
  PATCH:   'bg-purple-500/10 border-purple-500/30',
  DELETE:  'bg-rose-500/10 border-rose-500/30',
  HEAD:    'bg-muted/10 border-border',
  OPTIONS: 'bg-muted/10 border-border',
}

interface FlowsPanelProps {
  flows: Flow[]
  onUpdateFlow: (flow: Flow) => void
  onCreateFlow: (name: string) => Flow
}

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
            <path d="M0,0 L0,6 L8,3 z" fill="currentColor" className="text-border" />
          </marker>
        </defs>
        <path d={path} stroke="currentColor" strokeWidth="1.5" className="text-border" fill="none" markerEnd="url(#arrow)" />
        {label && (
            <text x={mx} y={(y1 + y2) / 2 - 5} textAnchor="middle" fontSize="10" fill="currentColor" className="text-muted-foreground font-mono">
              {label}
            </text>
        )}
      </g>
  )
}

function NodeCard({ node, onClick, selected }: { node: FlowNode; onClick: () => void; selected: boolean }) {
  if (node.type === 'start' || node.type === 'end') {
    return (
        <div
            onClick={onClick}
            style={{ left: node.x, top: node.y, width: 80, position: 'absolute' }}
            className={cn(
                'flex items-center justify-center h-[72px] rounded-full border-2 cursor-pointer transition-all select-none bg-background',
                selected ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20' : 'border-border hover:border-primary/50 hover:shadow-sm'
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
                'flex items-center justify-center h-[72px] border-2 cursor-pointer transition-all select-none rounded-lg bg-amber-500/10 border-amber-500/40',
                selected && 'border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/20',
                'hover:shadow-sm'
            )}
        >
          <div className="text-center">
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide">Condition</div>
            <div className="text-xs text-foreground/80 font-medium mt-0.5">{node.label}</div>
          </div>
        </div>
    )
  }

  const statusIcon = node.status === 'running' ? <Loader2 className="size-3 animate-spin text-primary" />
      : node.status === 'success' ? <CheckCircle2 className="size-3 text-green-500" />
          : node.status === 'error' ? <XCircle className="size-3 text-rose-500" /> : null

  return (
      <div
          onClick={onClick}
          style={{ left: node.x, top: node.y, width: 160, position: 'absolute' }}
          className={cn(
              'border rounded-lg cursor-pointer transition-all select-none overflow-hidden backdrop-blur-sm',
              node.method ? METHOD_BG[node.method] : 'bg-muted/10 border-border',
              selected && 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20 bg-background',
              'hover:shadow-md'
          )}
      >
        <div className="px-3 py-2 flex items-center gap-2 h-[72px]">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {node.method && <span className={cn('text-[9px] font-bold tracking-wide', METHOD_COLORS[node.method])}>{node.method}</span>}
              {statusIcon}
            </div>
            <span className="text-xs font-semibold text-foreground truncate leading-tight">{node.label}</span>
            <span className="text-[10px] text-muted-foreground truncate font-mono">{node.url?.replace('localhost:8080', '') || '—'}</span>
            {node.status === 'success' && node.response && (
                <span className="text-[9px] text-green-500">{node.response.status} · {node.response.time}ms</span>
            )}
          </div>
        </div>
      </div>
  )
}

function NodeDetail({ node, onUpdate, onDelete }: { node: FlowNode; onUpdate: (n: FlowNode) => void; onDelete: () => void }) {
  return (
      <div className="w-80 flex-shrink-0 border-l border-border bg-background/50 backdrop-blur-md flex flex-col overflow-y-auto shadow-2xl z-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10">
          <span className="text-xs font-semibold text-foreground">Node Properties</span>
          <button onClick={onDelete} className="text-muted-foreground hover:text-rose-500 transition-colors bg-muted/30 p-1.5 rounded-md hover:bg-rose-500/10">
            <Trash2 className="size-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Label</span>
            <input
                value={node.label} onChange={(e) => onUpdate({ ...node, label: e.target.value })}
                className="bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
            />
          </label>
          {node.type === 'request' && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">HTTP Method</span>
                  <select
                      value={node.method ?? 'GET'} onChange={(e) => onUpdate({ ...node, method: e.target.value as HttpMethod })}
                      className="bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm cursor-pointer"
                  >
                    {(['GET','POST','PUT','PATCH','DELETE'] as HttpMethod[]).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Endpoint URL</span>
                  <input
                      value={node.url ?? ''} onChange={(e) => onUpdate({ ...node, url: e.target.value })}
                      className="bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
                      placeholder="https://api..."
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">JSON Body</span>
                  <textarea
                      value={node.body ?? ''} onChange={(e) => onUpdate({ ...node, body: e.target.value })} rows={5}
                      className="bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
                      placeholder="{}"
                  />
                </label>
              </>
          )}
          {node.response && (
              <div className="rounded-md border border-border bg-muted/10 p-3 shadow-inner">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Last Response</div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('text-xs font-bold', node.response.status < 400 ? 'text-green-500' : 'text-rose-500')}>{node.response.status}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">{node.response.time}ms</span>
                </div>
                <pre className="text-[10px] text-muted-foreground font-mono overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap break-words bg-background/50 p-2 rounded border border-border/50">
              {node.response.body.slice(0, 200)}
            </pre>
              </div>
          )}
        </div>
      </div>
  )
}

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
      ...activeFlow, nodes: activeFlow.nodes.filter((n) => n.id !== selectedNodeId),
      edges: activeFlow.edges.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId),
    })
    setSelectedNodeId(null)
  }, [activeFlow, selectedNodeId, onUpdateFlow])

  const runFlow = useCallback(async () => {
    if (!activeFlow || running) return
    setRunning(true)
    setSelectedNodeId(null)

    const resetFlow: Flow = { ...activeFlow, nodes: activeFlow.nodes.map((n) => ({ ...n, status: 'idle', response: undefined })) }
    onUpdateFlow(resetFlow)

    const requestNodes = resetFlow.nodes.filter((n) => n.type === 'request')
    for (const node of requestNodes) {
      onUpdateFlow({ ...resetFlow, nodes: resetFlow.nodes.map((n) => n.id === node.id ? { ...n, status: 'running' } : n) })
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))
      const time = Math.floor(Math.random() * 200) + 60
      const ok = Math.random() > 0.15
      const status = ok ? (node.method === 'POST' ? 201 : 200) : 500
      const response = { status, time, body: ok ? '{"success":true}' : '{"error":"Server Error"}' }

      resetFlow.nodes = resetFlow.nodes.map((n) => n.id === node.id ? { ...n, status: ok ? 'success' : 'error', response } : n)
      onUpdateFlow({ ...resetFlow })
    }
    setRunning(false)
  }, [activeFlow, running, onUpdateFlow])

  const stopFlow = useCallback(() => {
    if (!activeFlow) return
    setRunning(false)
    onUpdateFlow({ ...activeFlow, nodes: activeFlow.nodes.map((n) => ({ ...n, status: 'idle', response: undefined })) })
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
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Flows</span>
            <span className="text-xs text-muted-foreground">— visual request orchestration</span>
          </div>
          <div className="flex items-center gap-2">
            {running ? (
                <button onClick={stopFlow} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all text-xs font-medium">
                  <StopCircle className="size-3.5" /> Stop
                </button>
            ) : (
                <button onClick={runFlow} disabled={!activeFlow} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all text-xs font-semibold disabled:opacity-40">
                  <Play className="size-3.5 fill-current" /> Run Flow
                </button>
            )}
            <button onClick={() => setShowNewFlow(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all text-xs">
              <Plus className="size-3.5" /> New Flow
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-muted/10 flex-shrink-0 overflow-x-auto">
          {flows.map((f) => (
              <button
                  key={f.id} onClick={() => { setActiveFlowId(f.id); setSelectedNodeId(null) }}
                  className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all',
                      f.id === activeFlowId ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
              >
                <Zap className="size-3" /> {f.name}
              </button>
          ))}

          {showNewFlow && (
              <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-border/50">
                <input
                    autoFocus value={newFlowName} onChange={(e) => setNewFlowName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFlow(); if (e.key === 'Escape') setShowNewFlow(false) }}
                    placeholder="Flow name..."
                    className="bg-background border border-primary/40 rounded-md px-2.5 py-1.5 text-xs text-foreground w-36 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all shadow-sm"
                />
                <button onClick={handleCreateFlow} className="text-primary hover:text-primary/80 text-xs font-medium bg-primary/10 px-2 py-1.5 rounded-md">Add</button>
                <button onClick={() => setShowNewFlow(false)} className="text-muted-foreground hover:text-foreground text-xs hover:bg-muted/40 px-2 py-1.5 rounded-md transition-colors">Cancel</button>
              </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto relative bg-muted/5">
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
              <defs>
                <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="1" fill="currentColor" className="text-border/80" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>

            {activeFlow ? (
                <div ref={canvasRef} style={{ width: 1300, height: CANVAS_H + 120, position: 'relative' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                    {activeFlow.edges.map((edge) => {
                      const from = activeFlow.nodes.find((n) => n.id === edge.from)
                      const to = activeFlow.nodes.find((n) => n.id === edge.to)
                      if (!from || !to) return null
                      return <Arrow key={edge.id} fromX={from.x} fromY={from.y} toX={to.x} toY={to.y} label={edge.label} />
                    })}
                  </svg>

                  {activeFlow.nodes.map((node) => (
                      <NodeCard key={node.id} node={node} selected={selectedNodeId === node.id} onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)} />
                  ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <GitBranch className="size-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No flows yet</p>
                </div>
            )}
          </div>

          {selectedNode && <NodeDetail node={selectedNode} onUpdate={updateNode} onDelete={deleteNode} />}
        </div>

        {activeFlow && activeFlow.nodes.some((n) => n.status !== 'idle') && (
            <div className="border-t border-border bg-background px-5 py-3 flex-shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Run log</span>
                <button onClick={stopFlow} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors bg-muted/40 hover:bg-muted px-2 py-1 rounded-md">
                  <RotateCcw className="size-3" /> Reset
                </button>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {activeFlow.nodes.filter((n) => n.type === 'request').map((n) => (
                    <div key={n.id} className="flex items-center gap-1.5">
                      {n.status === 'idle' && <div className="size-2 rounded-full bg-muted-foreground/30" />}
                      {n.status === 'running' && <Loader2 className="size-3 animate-spin text-primary" />}
                      {n.status === 'success' && <CheckCircle2 className="size-3 text-green-500" />}
                      {n.status === 'error' && <XCircle className="size-3 text-rose-500" />}
                      <span className={cn('text-xs font-medium', n.status === 'success' ? 'text-green-600 dark:text-green-400' : n.status === 'error' ? 'text-rose-600 dark:text-rose-400' : n.status === 'running' ? 'text-primary' : 'text-muted-foreground')}>
                  {n.label}
                </span>
                      {n.status !== 'idle' && n.status !== 'running' && <ChevronRight className="size-3 text-muted-foreground/40" />}
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  )
}