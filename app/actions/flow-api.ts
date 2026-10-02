'use server'

import { cookies } from 'next/headers'
import type {
  ActionResult, BackendCollection, BackendEnvironment, BackendExecutionResult, BackendFlow, BackendFlowRun,
  BackendHistory, BackendHistoryPage, BackendImportResult, BackendLocalCollection, BackendRequest,
  BackendSearchResult, BackendUser, BackendWorkspace, WorkspaceData,
} from '@/types/backend.types'
import type { ApiResponse, HttpMethod } from '@/types/api.types'
import { normalizeHttpUrl } from '@/lib/http-url'

const API_URL = (process.env.FLOW_API_URL ?? process.env.NEXT_PUBLIC_FLOW_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '')
const API_ORIGIN = new URL(API_URL).origin
const TOKEN_COOKIE = 'flowapi_token'
const USER_COOKIE = 'flowapi_user'
const COOKIE_OPTIONS = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 86_400, path: '/' }

interface ApiEnvelope<T> { success?: boolean; message?: string; data?: T; error?: string }

async function apiFetch<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  if (authenticated) {
    const token = (await cookies()).get(TOKEN_COOKIE)?.value
    if (!token) throw new Error('Please sign in to continue.')
    headers.set('Authorization', `Bearer ${token}`)
  }
  let response: Response
  try { response = await fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' }) }
  catch { throw new Error(`Cannot reach FlowAPI at ${API_URL}. Make sure the backend is running.`) }
  const payload = await response.json().catch(() => ({})) as ApiEnvelope<T>
  if (!response.ok || payload.success === false) throw new Error(payload.error || payload.message || `FlowAPI returned ${response.status}.`)
  if (payload.data === undefined) throw new Error('FlowAPI returned no data.')
  return payload.data
}

function failure(error: unknown): ActionResult<never> { return { ok: false, error: error instanceof Error ? error.message : 'Unexpected error.' } }
async function action<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try { return { ok: true, data: await work() } } catch (error) { return failure(error) }
}
function query(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== '') params.set(key, String(value))
  return params.size ? `?${params}` : ''
}
async function clearSession() { const jar = await cookies(); jar.delete(TOKEN_COOKIE); jar.delete(USER_COOKIE) }

export async function healthCheckAction(): Promise<ActionResult<{ status: string }>> {
  return action(async () => {
    const response = await fetch(`${API_ORIGIN}/health`, { cache: 'no-store', signal: AbortSignal.timeout(5_000) })
    const data = await response.json().catch(() => ({})) as { status?: string; error?: string }
    if (!response.ok) throw new Error(data.error || `Health check returned ${response.status}.`)
    return { status: data.status ?? 'ok' }
  })
}

// Ad-hoc tabs do not have a stored-request ID yet. Keep this bounded proxy for
// scratch requests; saved requests use the backend executor below.
export async function executeRequestAction(input: { method: HttpMethod; url: string; headers: Record<string, string>; body?: string }): Promise<ActionResult<ApiResponse>> {
  return action(async () => {
    const startedAt = Date.now()
    const url = new URL(normalizeHttpUrl(input.url))
    const response = await fetch(url, { method: input.method, headers: input.headers, body: ['GET', 'HEAD'].includes(input.method) ? undefined : input.body, redirect: 'follow', cache: 'no-store', signal: AbortSignal.timeout(30_000) })
    const bytes = new Uint8Array(await response.arrayBuffer())
    const max = 2 * 1024 * 1024
    const body = new TextDecoder().decode(bytes.slice(0, max)) + (bytes.length > max ? '\n\n[Response truncated at 2 MB]' : '')
    return { status: response.status, statusText: response.statusText, time: Date.now() - startedAt, size: bytes.length >= 1024 ? `${(bytes.length / 1024).toFixed(1)}KB` : `${bytes.length}B`, headers: Object.fromEntries(response.headers), body }
  })
}

export async function getSessionAction(): Promise<ActionResult<{ user: BackendUser | null }>> {
  const raw = (await cookies()).get(USER_COOKIE)?.value
  if (!raw) return { ok: true, data: { user: null } }
  return action(async () => {
    const cached = JSON.parse(raw) as BackendUser
    const user = await apiFetch<BackendUser>(`/users/${cached.id}`)
    ;(await cookies()).set(USER_COOKIE, JSON.stringify(user), COOKIE_OPTIONS)
    return { user }
  })
}
export async function loginAction(input: { email: string; password: string }): Promise<ActionResult<BackendUser>> {
  return action(async () => {
    const data = await apiFetch<{ token: string; user: BackendUser }>('/users/login', { method: 'POST', body: JSON.stringify(input) }, false)
    const jar = await cookies(); jar.set(TOKEN_COOKIE, data.token, COOKIE_OPTIONS); jar.set(USER_COOKIE, JSON.stringify(data.user), COOKIE_OPTIONS)
    return data.user
  })
}
export async function registerAction(input: { username: string; email: string; password: string }): Promise<ActionResult<BackendUser>> {
  const result = await action(() => apiFetch<BackendUser>('/users/register', { method: 'POST', body: JSON.stringify(input) }, false))
  return result.ok ? loginAction({ email: input.email, password: input.password }) : result
}
export async function refreshTokenAction(): Promise<ActionResult<undefined>> {
  return action(async () => {
    const data = await apiFetch<{ token: string }>('/users/refresh', { method: 'POST' })
    const jar = await cookies()
    jar.set(TOKEN_COOKIE, data.token, COOKIE_OPTIONS)
    const user = jar.get(USER_COOKIE)?.value
    if (user) jar.set(USER_COOKIE, user, COOKIE_OPTIONS)
    return undefined
  })
}
export async function logoutAction(): Promise<ActionResult<undefined>> {
  try { await apiFetch<Record<string, never>>('/users/logout', { method: 'POST' }) } catch { /* local logout still succeeds */ }
  await clearSession(); return { ok: true, data: undefined }
}
export async function updateProfileAction(userId: string, username: string): Promise<ActionResult<BackendUser>> {
  return action(async () => { const user = await apiFetch<BackendUser>(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ username }) }); (await cookies()).set(USER_COOKIE, JSON.stringify(user), COOKIE_OPTIONS); return user })
}
export async function changePasswordAction(input: { current_password: string; new_password: string; confirm_password: string }): Promise<ActionResult<undefined>> {
  return action(async () => { await apiFetch<Record<string, never>>('/users/change-password', { method: 'POST', body: JSON.stringify(input) }); await clearSession(); return undefined })
}

export async function listWorkspacesAction() { return action(async () => (await apiFetch<BackendWorkspace[] | null>('/workspaces')) ?? []) }
export async function createWorkspaceAction(name: string) { return action(() => apiFetch<BackendWorkspace>('/workspaces', { method: 'POST', body: JSON.stringify({ name }) })) }
export async function getWorkspaceAction(id: string) { return action(() => apiFetch<BackendWorkspace>(`/workspaces/${id}`)) }
export async function updateWorkspaceAction(id: string, name: string) { return action(() => apiFetch<BackendWorkspace>(`/workspaces/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) })) }
export async function deleteWorkspaceAction(id: string) { return action(async () => { await apiFetch<Record<string, never>>(`/workspaces/${id}`, { method: 'DELETE' }); return undefined }) }
export async function listWorkspaceFlowsAction(id: string) { return action(async () => (await apiFetch<BackendFlow[] | null>(`/workspaces/${id}/flows`)) ?? []) }
export async function listWorkspaceEnvironmentsAction(id: string) { return action(async () => (await apiFetch<BackendEnvironment[] | null>(`/workspaces/${id}/environments`)) ?? []) }
export async function listWorkspaceCollectionsAction(id: string) { return action(async () => (await apiFetch<BackendCollection[] | null>(`/workspaces/${id}/collections`)) ?? []) }

export type FlowInput = { workspace_id: string; name: string; description?: string; nodes?: string; edges?: string }
export type FlowPatch = Partial<Pick<FlowInput, 'name' | 'description' | 'nodes' | 'edges'>>
export async function createFlowAction(input: FlowInput) { return action(() => apiFetch<BackendFlow>('/flows', { method: 'POST', body: JSON.stringify(input) })) }
export async function getFlowAction(id: string) { return action(() => apiFetch<BackendFlow>(`/flows/${id}`)) }
export async function updateFlowAction(id: string, input: FlowPatch) { return action(() => apiFetch<BackendFlow>(`/flows/${id}`, { method: 'PATCH', body: JSON.stringify(input) })) }
export async function deleteFlowAction(id: string) { return action(async () => { await apiFetch<Record<string, never>>(`/flows/${id}`, { method: 'DELETE' }); return undefined }) }
export async function runFlowAction(id: string, input: { environment_id?: string; stop_on_error?: boolean } = {}) { return action(() => apiFetch<BackendFlowRun>(`/flows/${id}/run`, { method: 'POST', body: JSON.stringify(input) })) }
export async function listFlowRequestsAction(id: string) { return action(async () => (await apiFetch<BackendRequest[] | null>(`/flows/${id}/requests`)) ?? []) }

export type StoredRequestInput = {
  flow_id: string; collection_id?: string | null; name?: string; position?: number; method: string; url: string
  headers?: string; query_params?: string; body?: string; body_type?: string; auth?: string; scripts?: string; settings?: string
}
export type StoredRequestPatch = Partial<StoredRequestInput>
export async function createStoredRequestAction(input: StoredRequestInput) { return action(() => apiFetch<BackendRequest>('/requests', { method: 'POST', body: JSON.stringify(input) })) }
export async function getStoredRequestAction(id: string) { return action(() => apiFetch<BackendRequest>(`/requests/${id}`)) }
export async function updateStoredRequestAction(id: string, input: StoredRequestPatch) { return action(() => apiFetch<BackendRequest>(`/requests/${id}`, { method: 'PATCH', body: JSON.stringify(input) })) }
export async function deleteStoredRequestAction(id: string) { return action(async () => { await apiFetch<Record<string, never>>(`/requests/${id}`, { method: 'DELETE' }); return undefined }) }
export async function executeStoredRequestAction(id: string, environmentId?: string) { return action(() => apiFetch<BackendExecutionResult>(`/requests/${id}/execute`, { method: 'POST', body: environmentId ? JSON.stringify({ environment_id: environmentId }) : undefined })) }
export async function duplicateStoredRequestAction(id: string) { return action(() => apiFetch<BackendRequest>(`/requests/${id}/duplicate`, { method: 'POST' })) }
export async function bulkDeleteStoredRequestsAction(ids: string[]) { return action(() => apiFetch<{ deleted: number }>('/requests/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) })) }

export async function createEnvironmentAction(input: { workspace_id: string; name: string; variables: string }) { return action(() => apiFetch<BackendEnvironment>('/environments', { method: 'POST', body: JSON.stringify(input) })) }
export async function getEnvironmentAction(id: string) { return action(() => apiFetch<BackendEnvironment>(`/environments/${id}`)) }
export async function updateEnvironmentAction(id: string, input: { name?: string; variables?: string }) { return action(() => apiFetch<BackendEnvironment>(`/environments/${id}`, { method: 'PATCH', body: JSON.stringify(input) })) }
export async function deleteEnvironmentAction(id: string) { return action(async () => { await apiFetch<Record<string, never>>(`/environments/${id}`, { method: 'DELETE' }); return undefined }) }

export async function createCollectionAction(input: { workspace_id: string; name: string; description?: string }) { return action(() => apiFetch<BackendCollection>('/collections', { method: 'POST', body: JSON.stringify(input) })) }
export async function getCollectionAction(id: string) { return action(() => apiFetch<BackendCollection>(`/collections/${id}`)) }
export async function updateCollectionAction(id: string, input: { name?: string; description?: string }) { return action(() => apiFetch<BackendCollection>(`/collections/${id}`, { method: 'PATCH', body: JSON.stringify(input) })) }
export async function deleteCollectionAction(id: string) { return action(async () => { await apiFetch<Record<string, never>>(`/collections/${id}`, { method: 'DELETE' }); return undefined }) }
export async function addRequestToCollectionAction(collectionId: string, requestId: string) { return action(() => apiFetch<BackendRequest>(`/collections/${collectionId}/requests/${requestId}`, { method: 'POST' })) }
export async function removeRequestFromCollectionAction(collectionId: string, requestId: string) { return action(() => apiFetch<BackendRequest>(`/collections/${collectionId}/requests/${requestId}`, { method: 'DELETE' })) }

export async function listHistoryAction(input: { page?: number; limit?: number; workspace_id?: string } = {}) { return action(() => apiFetch<BackendHistoryPage>(`/history${query(input)}`)) }
export async function getHistoryAction(id: string) { return action(() => apiFetch<BackendHistory>(`/history/${id}`)) }
export async function clearHistoryAction() { return action(async () => { await apiFetch<Record<string, never>>('/history', { method: 'DELETE' }); return undefined }) }
export async function searchAction(input: { q: string; workspace_id?: string; limit?: number }) { return action(async () => (await apiFetch<BackendSearchResult[] | null>(`/search${query(input)}`)) ?? []) }

export async function exportLocalCollectionAction(workspaceId: string) { return action(() => apiFetch<BackendLocalCollection>(`/workspaces/${workspaceId}/local/export`, { method: 'POST' })) }
export async function listLocalCollectionsAction() { return action(async () => (await apiFetch<BackendLocalCollection[] | null>('/local-collections')) ?? []) }
export async function getLocalCollectionAction(workspaceId: string) { return action(() => apiFetch<BackendLocalCollection>(`/local-collections/${workspaceId}`)) }
export async function importLocalCollectionAction(workspaceId: string) { return action(() => apiFetch<BackendImportResult>(`/local-collections/${workspaceId}/import`, { method: 'POST' })) }
export async function deleteLocalCollectionAction(workspaceId: string) { return action(async () => { await apiFetch<Record<string, never>>(`/local-collections/${workspaceId}`, { method: 'DELETE' }); return undefined }) }

export async function loadWorkspaceAction(workspaceId: string): Promise<ActionResult<WorkspaceData>> {
  return action(async () => {
    const [workspace, flowsResult, environmentsResult, collectionsResult, history] = await Promise.all([
      apiFetch<BackendWorkspace>(`/workspaces/${workspaceId}`), apiFetch<BackendFlow[] | null>(`/workspaces/${workspaceId}/flows`),
      apiFetch<BackendEnvironment[] | null>(`/workspaces/${workspaceId}/environments`), apiFetch<BackendCollection[] | null>(`/workspaces/${workspaceId}/collections`),
      apiFetch<BackendHistoryPage>(`/history${query({ page: 1, limit: 50, workspace_id: workspaceId })}`),
    ])
    const flows = flowsResult ?? []
    const withRequests = await Promise.all(flows.map(async flow => ({ ...flow, requests: (await apiFetch<BackendRequest[] | null>(`/flows/${flow.id}/requests`)) ?? [] })))
    return { workspace, flows: withRequests, environments: environmentsResult ?? [], collections: collectionsResult ?? [], history }
  })
}
