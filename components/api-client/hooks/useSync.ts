'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Project, ProjectMember, Collection, Flow, Spec, SyncEvent, SyncEventType } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

const AVATAR_COLORS = [
  'oklch(0.65 0.18 255)',  // blue
  'oklch(0.65 0.18 145)',  // green
  'oklch(0.65 0.18 30)',   // orange
  'oklch(0.65 0.18 320)',  // pink
  'oklch(0.65 0.18 200)',  // cyan
  'oklch(0.65 0.18 80)',   // yellow
]

const MEMBER_NAMES = ['Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Drew']

function getOrCreateSelf() {
  // 1. Guard against Server-Side Rendering (SSR)
  if (typeof window === 'undefined') {
    // Return a temporary dummy user for the server render
    return {
      id: 'server-fallback',
      name: 'Guest',
      color: 'bg-muted' // or whatever your default Avatar colors look like
    }
  }

  // 2. Safe to use browser APIs now
  const stored = sessionStorage.getItem('flowapi_self')

  if (stored) return JSON.parse(stored)

  const nameIdx = Math.floor(Math.random() * MEMBER_NAMES.length)
  const colorIdx = Math.floor(Math.random() * AVATAR_COLORS.length)

  const newSelf = {
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    name: MEMBER_NAMES[nameIdx],
    color: AVATAR_COLORS[colorIdx]
  }

  sessionStorage.setItem('flowapi_self', JSON.stringify(newSelf))
  return newSelf
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* quota exceeded – ignore */ }
}

// ─── Default seed data ────────────────────────────────────────────────────────

const DEFAULT_PROJECTS: Project[] = []

const DEFAULT_FLOWS: Flow[] = [
  {
    id: 'flow-1',
    name: 'Auth Flow',
    projectId: undefined,
    nodes: [
      { id: 'n1', type: 'start', label: 'Start', x: 60, y: 160, status: 'idle' },
      { id: 'n2', type: 'request', label: 'Register User', method: 'POST', url: 'localhost:8080/register', body: '{"username":"test","password":"pass"}', x: 220, y: 120, status: 'idle' },
      { id: 'n3', type: 'request', label: 'Login', method: 'POST', url: 'localhost:8080/login', body: '{"username":"test","password":"pass"}', x: 440, y: 120, status: 'idle' },
      { id: 'n4', type: 'condition', label: 'Token valid?', x: 660, y: 160, status: 'idle' },
      { id: 'n5', type: 'request', label: 'Get Profile', method: 'GET', url: 'localhost:8080/me', x: 860, y: 80, status: 'idle' },
      { id: 'n6', type: 'end', label: 'End', x: 1050, y: 160, status: 'idle' },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n3', to: 'n4' },
      { id: 'e4', from: 'n4', to: 'n5', label: 'yes' },
      { id: 'e5', from: 'n4', to: 'n6', label: 'no' },
      { id: 'e6', from: 'n5', to: 'n6' },
    ],
  },
  {
    id: 'flow-2',
    name: 'CRUD Products',
    projectId: undefined,
    nodes: [
      { id: 'n1', type: 'start', label: 'Start', x: 60, y: 160, status: 'idle' },
      { id: 'n2', type: 'request', label: 'Create Product', method: 'POST', url: 'localhost:8080/products', x: 220, y: 160, status: 'idle' },
      { id: 'n3', type: 'request', label: 'Get Products', method: 'GET', url: 'localhost:8080/products', x: 440, y: 160, status: 'idle' },
      { id: 'n4', type: 'request', label: 'Delete Product', method: 'DELETE', url: 'localhost:8080/products/:id', x: 660, y: 160, status: 'idle' },
      { id: 'n5', type: 'end', label: 'End', x: 860, y: 160, status: 'idle' },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n3', to: 'n4' },
      { id: 'e4', from: 'n4', to: 'n5' },
    ],
  },
]

const DEFAULT_SPECS: Spec[] = [
  {
    id: 'spec-1',
    name: 'Auth API',
    version: '1.0.0',
    baseUrl: 'localhost:8080',
    projectId: undefined,
    endpoints: [
      {
        id: 'ep-1', method: 'POST', path: '/register', summary: 'Register a new user', tag: 'Auth',
        parameters: [
          { name: 'username', in: 'body', required: true, type: 'string', example: 'arzur' },
          { name: 'password', in: 'body', required: true, type: 'string', example: 'a@123' },
          { name: 'email', in: 'body', required: false, type: 'string', example: 'user@example.com' },
        ],
        responses: [
          { status: 201, description: 'User registered successfully', example: '{"success":true,"id":1}' },
          { status: 409, description: 'Username already taken' },
        ],
      },
      {
        id: 'ep-2', method: 'POST', path: '/login', summary: 'Authenticate a user', tag: 'Auth',
        parameters: [
          { name: 'username', in: 'body', required: true, type: 'string', example: 'arzur' },
          { name: 'password', in: 'body', required: true, type: 'string', example: 'a@123' },
        ],
        responses: [
          { status: 200, description: 'Login successful', example: '{"token":"eyJ...","expiresIn":3600}' },
          { status: 401, description: 'Invalid credentials' },
        ],
      },
      {
        id: 'ep-3', method: 'PUT', path: '/refresh', summary: 'Refresh access token', tag: 'Auth',
        parameters: [
          { name: 'Authorization', in: 'header', required: true, type: 'string', example: 'Bearer <refresh_token>' },
        ],
        responses: [
          { status: 200, description: 'New access token issued' },
          { status: 401, description: 'Refresh token expired' },
        ],
      },
      {
        id: 'ep-4', method: 'DELETE', path: '/logout', summary: 'Invalidate session', tag: 'Auth',
        parameters: [
          { name: 'Authorization', in: 'header', required: true, type: 'string', example: 'Bearer <token>' },
        ],
        responses: [
          { status: 204, description: 'Logged out successfully' },
        ],
      },
      {
        id: 'ep-5', method: 'GET', path: '/users', summary: 'List all users', tag: 'Users',
        parameters: [
          { name: 'page', in: 'query', required: false, type: 'number', example: '1' },
          { name: 'limit', in: 'query', required: false, type: 'number', example: '10' },
          { name: 'Authorization', in: 'header', required: true, type: 'string', example: 'Bearer <token>' },
        ],
        responses: [
          { status: 200, description: 'Array of users', example: '{"users":[...],"total":2}' },
          { status: 403, description: 'Forbidden — admin only' },
        ],
      },
      {
        id: 'ep-6', method: 'GET', path: '/users/:id', summary: 'Get user by ID', tag: 'Users',
        parameters: [
          { name: 'id', in: 'path', required: true, type: 'string', example: '42' },
        ],
        responses: [
          { status: 200, description: 'User object' },
          { status: 404, description: 'User not found' },
        ],
      },
      {
        id: 'ep-7', method: 'PATCH', path: '/users/:id', summary: 'Update user fields', tag: 'Users',
        parameters: [
          { name: 'id', in: 'path', required: true, type: 'string', example: '42' },
          { name: 'email', in: 'body', required: false, type: 'string' },
          { name: 'username', in: 'body', required: false, type: 'string' },
        ],
        responses: [
          { status: 200, description: 'Updated user object' },
          { status: 404, description: 'User not found' },
        ],
      },
      {
        id: 'ep-8', method: 'GET', path: '/products', summary: 'List products', tag: 'Products', deprecated: false,
        parameters: [
          { name: 'category', in: 'query', required: false, type: 'string', example: 'electronics' },
        ],
        responses: [
          { status: 200, description: 'Array of products' },
        ],
      },
      {
        id: 'ep-9', method: 'POST', path: '/products', summary: 'Create a product', tag: 'Products',
        parameters: [
          { name: 'name', in: 'body', required: true, type: 'string' },
          { name: 'price', in: 'body', required: true, type: 'number' },
          { name: 'category', in: 'body', required: false, type: 'string' },
        ],
        responses: [
          { status: 201, description: 'Created product' },
          { status: 400, description: 'Validation error' },
        ],
      },
    ],
  },
]

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSync() {
  const [self] = useState<ProjectMember>(() => getOrCreateSelf())
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('flowapi_projects', DEFAULT_PROJECTS))
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [flows, setFlows] = useState<Flow[]>(() => loadFromStorage('flowapi_flows', DEFAULT_FLOWS))
  const [specs, setSpecs] = useState<Spec[]>(() => loadFromStorage('flowapi_specs', DEFAULT_SPECS))
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  // ── broadcast helpers ──────────────────────────────────────────────────────

  const broadcast = useCallback((type: SyncEventType, payload: unknown) => {
    channelRef.current?.postMessage({
      type,
      senderId: self.id,
      payload,
      timestamp: new Date().toISOString(),
    } satisfies SyncEvent)
  }, [self.id])

  // ── persist helpers ────────────────────────────────────────────────────────

  const persistProjects = useCallback((p: Project[]) => {
    setProjects(p)
    saveToStorage('flowapi_projects', p)
  }, [])

  const persistFlows = useCallback((f: Flow[]) => {
    setFlows(f)
    saveToStorage('flowapi_flows', f)
  }, [])

  const persistSpecs = useCallback((s: Spec[]) => {
    setSpecs(s)
    saveToStorage('flowapi_specs', s)
  }, [])

  // ── BroadcastChannel setup ─────────────────────────────────────────────────

  useEffect(() => {
    const ch = new BroadcastChannel('flowapi_sync')
    channelRef.current = ch

    ch.onmessage = (evt: MessageEvent<SyncEvent>) => {
      const { type, senderId, payload } = evt.data
      if (senderId === self.id) return

      switch (type) {
        case 'member_joined':
        case 'member_heartbeat': {
          const m = payload as ProjectMember
          setMembers((prev) => {
            const idx = prev.findIndex((x) => x.id === m.id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = { ...m, online: true }
              return next
            }
            return [...prev, { ...m, online: true }]
          })
          // reply with our own heartbeat so the newcomer sees us
          if (type === 'member_joined') {
            broadcast('member_heartbeat', { ...self, online: true, lastSeen: new Date().toISOString() })
          }
          break
        }
        case 'member_left': {
          const m = payload as { id: string }
          setMembers((prev) => prev.map((x) => x.id === m.id ? { ...x, online: false } : x))
          break
        }
        case 'project_updated': {
          const updated = payload as Project[]
          setProjects(updated)
          saveToStorage('flowapi_projects', updated)
          break
        }
        case 'collection_updated': {
          // handled in ApiClient via storage event; this is a broadcast supplement
          break
        }
        case 'flow_updated': {
          const f = payload as Flow[]
          setFlows(f)
          saveToStorage('flowapi_flows', f)
          break
        }
      }
    }

    // announce ourselves
    broadcast('member_joined', { ...self, online: true })

    // heartbeat every 15s
    const hb = setInterval(() => {
      broadcast('member_heartbeat', { ...self, online: true, lastSeen: new Date().toISOString() })
    }, 15_000)

    // mark others offline after 45s without heartbeat
    const decay = setInterval(() => {
      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          online: (Date.now() - new Date(m.lastSeen).getTime()) < 45_000,
        }))
      )
    }, 10_000)

    return () => {
      broadcast('member_left', { id: self.id })
      ch.close()
      clearInterval(hb)
      clearInterval(decay)
    }
  }, [self, broadcast])

  // ── Project actions ────────────────────────────────────────────────────────

  const createProject = useCallback((name: string, description: string): Project => {
    const project: Project = {
      id: generateId(),
      name,
      description,
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
      ownerId: self.id,
      memberIds: [self.id],
      collectionIds: [],
    }
    const next = [...projects, project]
    persistProjects(next)
    broadcast('project_updated', next)
    setActiveProjectId(project.id)
    return project
  }, [projects, self.id, persistProjects, broadcast])

  const joinProject = useCallback((code: string): Project | null => {
    const project = projects.find((p) => p.inviteCode === code.toUpperCase().trim())
    if (!project) return null
    if (project.memberIds.includes(self.id)) {
      setActiveProjectId(project.id)
      return project
    }
    const updated = { ...project, memberIds: [...project.memberIds, self.id] }
    const next = projects.map((p) => p.id === project.id ? updated : p)
    persistProjects(next)
    broadcast('project_updated', next)
    setActiveProjectId(project.id)
    return updated
  }, [projects, self.id, persistProjects, broadcast])

  // ── Flow actions ───────────────────────────────────────────────────────────

  const updateFlow = useCallback((flow: Flow) => {
    const next = flows.map((f) => f.id === flow.id ? flow : f)
    persistFlows(next)
    broadcast('flow_updated', next)
  }, [flows, persistFlows, broadcast])

  const createFlow = useCallback((name: string, projectId?: string): Flow => {
    const flow: Flow = {
      id: generateId(),
      name,
      projectId,
      nodes: [
        { id: generateId(), type: 'start', label: 'Start', x: 60, y: 160, status: 'idle' },
        { id: generateId(), type: 'end', label: 'End', x: 300, y: 160, status: 'idle' },
      ],
      edges: [],
    }
    const next = [...flows, flow]
    persistFlows(next)
    broadcast('flow_updated', next)
    return flow
  }, [flows, persistFlows, broadcast])

  return {
    self,
    members,
    projects,
    activeProjectId,
    setActiveProjectId,
    flows,
    specs,
    createProject,
    joinProject,
    updateFlow,
    createFlow,
    persistFlows,
    persistSpecs,
    broadcast,
  }
}
