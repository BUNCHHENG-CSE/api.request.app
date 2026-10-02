export interface BackendUser { id: string; username: string; email: string; created_at: string; updated_at: string }
export interface BackendWorkspace { id: string; name: string; owner_id: string; created_at: string; updated_at: string }
export interface BackendFlow { id: string; workspace_id: string; name: string; description: string; nodes: string; edges: string; created_at: string; updated_at: string }
export interface BackendRequest {
  id: string; flow_id: string; collection_id?: string | null; name: string; position: number; method: string; url: string
  headers: string; query_params: string; body: string; body_type: string; auth: string; scripts: string; settings: string
  created_at: string; updated_at: string
}
export interface BackendEnvironment { id: string; workspace_id: string; name: string; variables: string; created_at: string; updated_at: string }
export interface BackendCollection { id: string; workspace_id: string; name: string; description: string; created_at: string; updated_at: string }
export interface BackendExecutionResult { history_id: string; status: number; statusText: string; time: number; size: string; headers: Record<string, string>; body: string; truncated: boolean }
export interface BackendFlowRunItem { request_id: string; result?: BackendExecutionResult; error?: string }
export interface BackendFlowRun { flow_id: string; results: BackendFlowRunItem[] }
export interface BackendHistory {
  id: string; user_id: string; workspace_id: string; request_id: string; method: string; url: string; status: number
  time: number; size_bytes: number; response_headers: string; response_body: string; error?: string; created_at: string
}
export interface BackendHistoryPage { items: BackendHistory[]; total: number; page: number; limit: number }
export interface BackendSearchResult { type: string; id: string; workspace_id: string; name: string; method?: string; url?: string }
export interface BackendLocalCollection { workspace_id: string; name: string; path: string; updated_at: string }
export interface BackendImportResult { flows: number; requests: number; environments: number; collections: number }
export type ActionResult<T = undefined> = { ok: true; data: T; message?: string } | { ok: false; error: string }
export interface WorkspaceData {
  workspace: BackendWorkspace
  flows: Array<BackendFlow & { requests: BackendRequest[] }>
  environments: BackendEnvironment[]
  collections: BackendCollection[]
  history: BackendHistoryPage
}
