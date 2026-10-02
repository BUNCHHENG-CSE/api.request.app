'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  changePasswordAction, createCollectionAction, createEnvironmentAction, createFlowAction, createStoredRequestAction,
  createWorkspaceAction, getSessionAction, healthCheckAction, listWorkspacesAction, loadWorkspaceAction, loginAction,
  logoutAction, registerAction, runFlowAction, updateEnvironmentAction, updateFlowAction, updateProfileAction, listHistoryAction,
  updateStoredRequestAction, searchAction, updateWorkspaceAction, deleteWorkspaceAction, deleteCollectionAction,
  deleteEnvironmentAction, deleteStoredRequestAction, duplicateStoredRequestAction, clearHistoryAction,
  exportLocalCollectionAction, importLocalCollectionAction, updateCollectionAction, deleteFlowAction,
  bulkDeleteStoredRequestsAction, getHistoryAction, deleteLocalCollectionAction, refreshTokenAction,
} from '@/app/actions/flow-api'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { Collection, CollectionRequest, Environment, Flow, HttpMethod, KeyValueRow, Project, ProjectMember, RequestTab, Spec } from '@/types/api.types'
import type { BackendCollection, BackendEnvironment, BackendFlow, BackendHistory, BackendRequest, BackendSearchResult, BackendUser, BackendWorkspace } from '@/types/backend.types'
import { normalizeHttpUrl } from '@/lib/http-url'

type Credentials = { email: string; password: string }
type Registration = Credentials & { username: string }
interface SyncContextValue {
  user: BackendUser | null; authLoading: boolean; loading: boolean; error: string | null; apiStatus: 'checking' | 'online' | 'offline'
  self: ProjectMember; members: ProjectMember[]; projects: Project[]; activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void; flows: Flow[]; specs: Spec[]
  login: (input: Credentials) => Promise<string | null>; register: (input: Registration) => Promise<string | null>; logout: () => Promise<void>
  createProject: (name: string, description: string) => Promise<Project | null>; joinProject: () => null
  renameProject: (id: string, name: string) => Promise<string | null>; deleteProject: (id: string) => Promise<string | null>
  updateFlow: (flow: Flow) => void; createFlow: (name: string, projectId?: string) => Promise<Flow | null>
  createCollection: (name: string, description?: string) => Promise<string | null>
  renameCollection: (id: string, name: string) => Promise<string | null>
  deleteCollection: (id: string) => Promise<string | null>
  createEnvironment: (name: string) => Promise<string | null>
  updateEnvironment: (environment: Environment) => Promise<string | null>
  deleteEnvironment: (id: string) => Promise<string | null>
  updateProfile: (username: string) => Promise<string | null>
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<string | null>
  runFlow: (id: string) => Promise<string | null>
  deleteFlow: (id: string) => Promise<string | null>
  search: (query: string) => Promise<BackendSearchResult[]>
  deleteRequest: (id: string) => Promise<string | null>; duplicateRequest: (id: string) => Promise<string | null>
  bulkDeleteRequests: (ids: string[]) => Promise<string | null>
  clearHistory: () => Promise<string | null>
  getHistory: (id: string) => Promise<BackendHistory | null>
  exportLocal: (workspaceId: string) => Promise<string>; importLocal: (workspaceId: string) => Promise<string>; deleteLocal: (workspaceId: string) => Promise<string>
  saveRequest: (tab: RequestTab, flowId?: string) => Promise<string | null>; refresh: () => Promise<void>
}
const SyncContext = createContext<SyncContextValue | null>(null)
const EMPTY_SPECS: Spec[] = []
const emptySelf: ProjectMember = { id: 'guest', name: 'Guest', avatar: '', color: '#3b82f6', online: true, lastSeen: '', projectId: '' }

function mapWorkspace(w: BackendWorkspace): Project {
  return { id: w.id, name: w.name, description: '', inviteCode: '', createdAt: w.created_at, ownerId: w.owner_id, memberIds: [w.owner_id], collectionIds: [] }
}
function mapFlow(flow: BackendFlow & { requests?: BackendRequest[] }): Flow {
  return { id: flow.id, name: flow.name, projectId: flow.workspace_id, edges: [], nodes: (flow.requests ?? []).map((r, i) => ({
    id: r.id, type: 'request', label: r.name || `${r.method} request`, method: r.method as HttpMethod, url: r.url, body: r.body,
    x: 80 + (i % 5) * 210, y: 80 + Math.floor(i / 5) * 120, status: 'idle',
  })) }
}
function mapEnvironment(env: BackendEnvironment, index: number): Environment {
  let parsed: Record<string, unknown> = {}
  try { parsed = JSON.parse(env.variables || '{}') as Record<string, unknown> } catch { /* invalid backend value */ }
  const colors = ['#3b82f6', '#f59e0b', '#ef4444']
  return { id: env.id, name: env.name, color: colors[index % colors.length], variables: Object.entries(parsed).map(([key, value], i) => ({ id: `${env.id}-${i}`, key, value: String(value), enabled: true })) }
}
function parseRequestHeaders(value: string): KeyValueRow[] {
  try {
    return Object.entries(JSON.parse(value || '{}') as Record<string, unknown>).map(([key, headerValue], index) => ({ id: `header-${index}`, key, value: String(headerValue), enabled: true }))
  } catch { return [] }
}
function requestName(request: Pick<BackendRequest, 'url' | 'method'>) {
  try { return new URL(/^https?:\/\//i.test(request.url) ? request.url : `http://${request.url}`).pathname.split('/').filter(Boolean).at(-1) || request.url }
  catch { return request.url || `${request.method} request` }
}
function mapStoredRequest(request: BackendRequest, name?: string): CollectionRequest {
  return { id: request.id, name: name || request.name || requestName(request), method: request.method as HttpMethod, url: request.url, body: request.body, headers: parseRequestHeaders(request.headers) }
}
function mapCollection(c: BackendCollection): Collection { return { id: c.id, name: c.name, requests: [], expanded: false, projectId: c.workspace_id } }
function mapHistory(entry: BackendHistory) {
  return { id: entry.id, method: entry.method as HttpMethod, url: entry.url, status: entry.status, time: entry.time, timestamp: new Date(entry.created_at) }
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null)
  const [flows, setFlows] = useState<Flow[]>([])
  const specs = EMPTY_SPECS

  useEffect(() => {
    let active = true
    const check = async () => {
      const result = await healthCheckAction()
      if (active) setApiStatus(result.ok ? 'online' : 'offline')
    }
    void check()
    const timer = window.setInterval(check, 30_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  const setWorkspaceData = useCallback((workspaceFlows: Array<BackendFlow & { requests: BackendRequest[] }>, environments: BackendEnvironment[], collections: BackendCollection[], history: BackendHistory[] = []) => {
    setFlows(workspaceFlows.map(mapFlow))
    const mappedCollections = collections.map(mapCollection)
    const requests = workspaceFlows.flatMap((flow) => flow.requests)
    for (const collection of mappedCollections) collection.requests = requests.filter((request) => request.collection_id === collection.id).map((request) => mapStoredRequest(request))
    const uncollected = requests.filter((request) => !request.collection_id).map((request) => mapStoredRequest(request))
    if (uncollected.length) {
      mappedCollections.unshift({ id: `uncollected-${workspaceFlows[0]?.workspace_id ?? 'local'}`, name: 'Uncollected Requests', requests: uncollected, expanded: true, projectId: workspaceFlows[0]?.workspace_id })
    }
    useWorkspaceStore.setState({ environments: environments.map(mapEnvironment), environment: environments[0]?.name ?? 'No Environment', collections: mappedCollections, history: history.map(mapHistory) })
  }, [])
  const loadWorkspace = useCallback(async (workspaceId: string) => {
    setLoading(true)
    const result = await loadWorkspaceAction(workspaceId)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setProjects((current) => current.map((project) => project.id === result.data.workspace.id ? mapWorkspace(result.data.workspace) : project))
    setError(null); setWorkspaceData(result.data.flows, result.data.environments, result.data.collections, result.data.history.items)
  }, [setWorkspaceData])
  const loadWorkspaces = useCallback(async () => {
    const result = await listWorkspacesAction()
    if (!result.ok) { setError(result.error); return }
    const mapped = result.data.map(mapWorkspace)
    setProjects(mapped)
    const firstId = mapped[0]?.id ?? null
    setActiveProjectIdState(firstId)
    if (firstId) await loadWorkspace(firstId); else setWorkspaceData([], [], [])
  }, [loadWorkspace, setWorkspaceData])
  const refresh = useCallback(async () => {
    if (activeProjectId) await loadWorkspace(activeProjectId); else await loadWorkspaces()
  }, [activeProjectId, loadWorkspace, loadWorkspaces])

  useEffect(() => { void (async () => {
    const session = await getSessionAction()
    if (session.ok && session.data.user) { setUser(session.data.user); await loadWorkspaces() }
    setAuthLoading(false)
  })() }, [loadWorkspaces])

  useEffect(() => {
    if (!user) return
    let active = true
    const refreshSession = async () => {
      const result = await refreshTokenAction()
      if (active && !result.ok) setError(result.error)
    }
    void refreshSession()
    const timer = window.setInterval(refreshSession, 12 * 60 * 60 * 1000)
    return () => { active = false; window.clearInterval(timer) }
  }, [user])

  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id)
    if (id) void loadWorkspace(id); else setWorkspaceData([], [], [])
  }, [loadWorkspace, setWorkspaceData])
  const login = useCallback(async (input: Credentials) => {
    const result = await loginAction(input); if (!result.ok) return result.error
    setUser(result.data); await loadWorkspaces(); return null
  }, [loadWorkspaces])
  const register = useCallback(async (input: Registration) => {
    const result = await registerAction(input); if (!result.ok) return result.error
    setUser(result.data); setProjects([]); setActiveProjectIdState(null); setWorkspaceData([], [], []); return null
  }, [setWorkspaceData])
  const logout = useCallback(async () => { await logoutAction(); setUser(null); setProjects([]); setActiveProjectIdState(null); setWorkspaceData([], [], []) }, [setWorkspaceData])
  const createProject = useCallback(async (name: string, description: string) => {
    void description
    const result = await createWorkspaceAction(name); if (!result.ok) { setError(result.error); return null }
    const project = mapWorkspace(result.data); setProjects((current) => [...current, project]); setActiveProjectIdState(project.id); setWorkspaceData([], [], []); return project
  }, [setWorkspaceData])
  const renameProject = useCallback(async (id: string, name: string) => {
    const result = await updateWorkspaceAction(id, name)
    if (!result.ok) return result.error
    setProjects((current) => current.map((project) => project.id === id ? mapWorkspace(result.data) : project)); return null
  }, [])
  const deleteProject = useCallback(async (id: string) => {
    const result = await deleteWorkspaceAction(id)
    if (!result.ok) return result.error
    const remaining = projects.filter((project) => project.id !== id)
    setProjects(remaining)
    const nextId = remaining[0]?.id ?? null
    setActiveProjectIdState(nextId)
    if (nextId) await loadWorkspace(nextId); else setWorkspaceData([], [], [])
    return null
  }, [projects, loadWorkspace, setWorkspaceData])
  const createFlow = useCallback(async (name: string, projectId?: string) => {
    const workspaceId = projectId ?? activeProjectId; if (!workspaceId) { setError('Create or select a workspace first.'); return null }
    const result = await createFlowAction({ workspace_id: workspaceId, name, description: '' }); if (!result.ok) { setError(result.error); return null }
    const flow = mapFlow(result.data); setFlows((current) => [...current, flow]); return flow
  }, [activeProjectId])
  const createCollection = useCallback(async (name: string, description = '') => {
    if (!activeProjectId) return 'Create or select a workspace first.'
    const result = await createCollectionAction({ workspace_id: activeProjectId, name, description }); if (!result.ok) return result.error
    useWorkspaceStore.setState((state) => ({ collections: [...state.collections, mapCollection(result.data)] })); return null
  }, [activeProjectId])
  const renameCollection = useCallback(async (id: string, name: string) => {
    const result = await updateCollectionAction(id, { name }); if (!result.ok) return result.error
    useWorkspaceStore.setState((state) => ({ collections: state.collections.map((item) => item.id === id ? { ...item, name: result.data.name } : item) })); return null
  }, [])
  const deleteCollection = useCallback(async (id: string) => {
    const result = await deleteCollectionAction(id); if (!result.ok) return result.error
    await refresh(); return null
  }, [refresh])
  const createEnvironment = useCallback(async (name: string) => {
    if (!activeProjectId) return 'Create or select a workspace first.'
    const result = await createEnvironmentAction({ workspace_id: activeProjectId, name, variables: '{}' }); if (!result.ok) return result.error
    const environment = mapEnvironment(result.data, useWorkspaceStore.getState().environments.length)
    useWorkspaceStore.setState((state) => ({ environments: [...state.environments, environment], environment: environment.name })); return null
  }, [activeProjectId])
  const updateEnvironment = useCallback(async (environment: Environment) => {
    const variables = Object.fromEntries(environment.variables.filter((item) => item.enabled && item.key).map((item) => [item.key, item.value]))
    const result = await updateEnvironmentAction(environment.id, { name: environment.name, variables: JSON.stringify(variables) })
    if (!result.ok) return result.error
    const mapped = mapEnvironment(result.data, useWorkspaceStore.getState().environments.findIndex((item) => item.id === environment.id))
    useWorkspaceStore.setState((state) => ({ environments: state.environments.map((item) => item.id === mapped.id ? { ...mapped, color: environment.color } : item), environment: mapped.name, editingEnvironment: null }))
    return null
  }, [])
  const deleteEnvironment = useCallback(async (id: string) => {
    const result = await deleteEnvironmentAction(id); if (!result.ok) return result.error
    useWorkspaceStore.setState((state) => {
      const environments = state.environments.filter((item) => item.id !== id)
      return { environments, environment: state.editingEnvironment?.id === id ? 'No Environment' : state.environment, editingEnvironment: null }
    }); return null
  }, [])
  const updateProfile = useCallback(async (username: string) => {
    if (!user) return 'Please sign in to continue.'
    const result = await updateProfileAction(user.id, username)
    if (!result.ok) return result.error
    setUser(result.data); return null
  }, [user])
  const changePassword = useCallback(async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const result = await changePasswordAction({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword })
    if (!result.ok) return result.error
    setUser(null); setProjects([]); setActiveProjectIdState(null); setWorkspaceData([], [], []); return null
  }, [setWorkspaceData])
  const saveRequest = useCallback(async (tab: RequestTab, selectedFlowId?: string) => {
    let normalizedUrl: string
    try { normalizedUrl = normalizeHttpUrl(tab.url) } catch (error) { return error instanceof Error ? error.message : 'Invalid endpoint URL.' }
    let workspaceId = activeProjectId
    if (!workspaceId) {
      const workspaceResult = await createWorkspaceAction('My Workspace')
      if (!workspaceResult.ok) return workspaceResult.error
      const project = mapWorkspace(workspaceResult.data)
      workspaceId = project.id
      setProjects((current) => [...current, project])
      setActiveProjectIdState(project.id)
    }
    let flowId = selectedFlowId ?? flows[0]?.id
    let createdFlow: Flow | null = null
    if (!flowId) {
      const flowResult = await createFlowAction({ workspace_id: workspaceId, name: 'Saved Requests', description: 'Requests saved from the API client' })
      if (!flowResult.ok) return flowResult.error
      createdFlow = mapFlow(flowResult.data)
      flowId = createdFlow.id
    }
    let savedCollection = useWorkspaceStore.getState().collections.find((collection) => collection.name.toLowerCase() === 'saved requests')
    if (!savedCollection) {
      const collectionResult = await createCollectionAction({ workspace_id: workspaceId, name: 'Saved Requests', description: 'Requests saved from the API client' })
      if (!collectionResult.ok) return collectionResult.error
      savedCollection = { ...mapCollection(collectionResult.data), expanded: true }
      const collection = savedCollection
      useWorkspaceStore.setState((state) => ({ collections: [collection, ...state.collections] }))
    }
    const headers = Object.fromEntries(tab.headers.filter((h) => h.enabled && h.key).map((h) => [h.key, h.value]))
    const queryParams = Object.fromEntries(tab.params.filter((item) => item.enabled && item.key).map((item) => [item.key, item.value]))
    const payload = { flow_id: flowId, collection_id: savedCollection.id, name: tab.name === 'New Request' ? requestName({ ...tab, url: normalizedUrl }) : tab.name, method: tab.method, url: normalizedUrl, headers: JSON.stringify(headers), query_params: JSON.stringify(queryParams), body: tab.body, body_type: tab.bodyType, auth: JSON.stringify(tab.auth), scripts: JSON.stringify(tab.scripts), settings: JSON.stringify(tab.settings) }
    const exists = flows.some((flow) => flow.nodes.some((node) => node.id === tab.id))
    const result = exists ? await updateStoredRequestAction(tab.id, payload) : await createStoredRequestAction(payload)
    if (!result.ok) return result.error
    const requestNode = { id: result.data.id, type: 'request' as const, label: tab.name || `${tab.method} request`, method: tab.method, url: normalizedUrl, body: tab.body, x: 80, y: 80, status: 'idle' as const }
    setFlows((current) => createdFlow
      ? [...current, { ...createdFlow, nodes: [requestNode] }]
      : current.map((flow) => flow.id === flowId ? { ...flow, nodes: [...flow.nodes, { ...requestNode, x: 80 + (flow.nodes.length % 5) * 210, y: 80 + Math.floor(flow.nodes.length / 5) * 120 }] } : flow))
    const collectionId = savedCollection.id
    const collectionRequest = mapStoredRequest(result.data, tab.name === 'New Request' ? undefined : tab.name)
    useWorkspaceStore.setState((state) => ({ collections: state.collections.map((collection) => collection.id === collectionId ? { ...collection, expanded: true, requests: [...collection.requests, collectionRequest] } : collection) }))
    return null
  }, [activeProjectId, flows])
  const updateFlow = useCallback((flow: Flow) => {
    setFlows((current) => current.map((item) => item.id === flow.id ? flow : item))
    void updateFlowAction(flow.id, { name: flow.name, nodes: JSON.stringify(flow.nodes), edges: JSON.stringify(flow.edges) }).then((result) => { if (!result.ok) setError(result.error) })
  }, [])
  const runFlow = useCallback(async (id: string) => {
    const selected = useWorkspaceStore.getState().environments.find((item) => item.name === useWorkspaceStore.getState().environment)
    const result = await runFlowAction(id, { environment_id: selected?.id, stop_on_error: true })
    if (!result.ok) return result.error
    setFlows((current) => current.map((flow) => flow.id !== id ? flow : { ...flow, nodes: flow.nodes.map((node) => {
      const run = result.data.results.find((item) => item.request_id === node.id)
      if (!run) return node
      return { ...node, status: run.error ? 'error' as const : 'success' as const, response: run.result ? { status: run.result.status, time: run.result.time, body: run.result.body } : { status: 0, time: 0, body: run.error ?? 'Execution failed' } }
    }) }))
    const history = await listHistoryAction({ page: 1, limit: 50, workspace_id: activeProjectId ?? undefined })
    if (history.ok) useWorkspaceStore.setState({ history: history.data.items.map(mapHistory) })
    return null
  }, [activeProjectId])
  const deleteFlow = useCallback(async (id: string) => {
    const result = await deleteFlowAction(id); if (!result.ok) return result.error
    setFlows((current) => current.filter((flow) => flow.id !== id)); return null
  }, [])
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return []
    const result = await searchAction({ q: searchQuery.trim(), workspace_id: activeProjectId ?? undefined, limit: 20 })
    if (!result.ok) { setError(result.error); return [] }
    return result.data
  }, [activeProjectId])
  const deleteRequest = useCallback(async (id: string) => {
    const result = await deleteStoredRequestAction(id); if (!result.ok) return result.error
    await refresh(); return null
  }, [refresh])
  const duplicateRequest = useCallback(async (id: string) => {
    const result = await duplicateStoredRequestAction(id); if (!result.ok) return result.error
    await refresh(); return null
  }, [refresh])
  const bulkDeleteRequests = useCallback(async (ids: string[]) => {
    for (let index = 0; index < ids.length; index += 100) {
      const result = await bulkDeleteStoredRequestsAction(ids.slice(index, index + 100))
      if (!result.ok) return result.error
    }
    for (const id of ids) useWorkspaceStore.getState().handleCloseTab(id)
    await refresh(); return null
  }, [refresh])
  const clearHistory = useCallback(async () => {
    const result = await clearHistoryAction(); if (!result.ok) return result.error
    useWorkspaceStore.setState({ history: [] }); return null
  }, [])
  const getHistory = useCallback(async (id: string) => {
    const result = await getHistoryAction(id); if (!result.ok) { setError(result.error); return null }
    return result.data
  }, [])
  const exportLocal = useCallback(async (workspaceId: string) => {
    const result = await exportLocalCollectionAction(workspaceId)
    return result.ok ? `Exported to ${result.data.path}` : result.error
  }, [])
  const importLocal = useCallback(async (workspaceId: string) => {
    const result = await importLocalCollectionAction(workspaceId)
    if (!result.ok) return result.error
    await loadWorkspace(workspaceId)
    const data = result.data
    return `Imported ${data.requests} requests, ${data.flows} flows, ${data.environments} environments, and ${data.collections} collections.`
  }, [loadWorkspace])
  const deleteLocal = useCallback(async (workspaceId: string) => {
    const result = await deleteLocalCollectionAction(workspaceId)
    return result.ok ? 'Local Bruno copy deleted. Database resources were not changed.' : result.error
  }, [])
  const self = useMemo<ProjectMember>(() => user ? { id: user.id, name: user.username, avatar: '', color: '#3b82f6', online: true, lastSeen: '', projectId: activeProjectId ?? '' } : emptySelf, [user, activeProjectId])
  const value = useMemo<SyncContextValue>(() => ({ user, authLoading, loading, error, apiStatus, self, members: [], projects, activeProjectId, setActiveProjectId, flows, specs, login, register, logout, createProject, renameProject, deleteProject, joinProject: () => null, updateFlow, createFlow, deleteFlow, createCollection, renameCollection, deleteCollection, createEnvironment, updateEnvironment, deleteEnvironment, updateProfile, changePassword, runFlow, search, deleteRequest, duplicateRequest, bulkDeleteRequests, clearHistory, getHistory, exportLocal, importLocal, deleteLocal, saveRequest, refresh }), [user, authLoading, loading, error, apiStatus, self, projects, activeProjectId, setActiveProjectId, flows, specs, login, register, logout, createProject, renameProject, deleteProject, updateFlow, createFlow, deleteFlow, createCollection, renameCollection, deleteCollection, createEnvironment, updateEnvironment, deleteEnvironment, updateProfile, changePassword, runFlow, search, deleteRequest, duplicateRequest, bulkDeleteRequests, clearHistory, getHistory, exportLocal, importLocal, deleteLocal, saveRequest, refresh])
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

export function useSync() { const context = useContext(SyncContext); if (!context) throw new Error('useSync must be used within SyncProvider.'); return context }
