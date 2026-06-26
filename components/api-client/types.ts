export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface Header {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface QueryParam {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface EnvironmentVariable {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface Environment {
  id: string
  name: string
  variables: EnvironmentVariable[]
  color: string
}

export interface RequestTab {
  id: string
  name: string
  method: HttpMethod
  url: string
  headers: Header[]
  params: QueryParam[]
  body: string
  bodyType: "none" | "json" | "form" | "form-data" | "x-www-form-urlencoded" | "raw" | "binary" | "text" | "xml";
  activeTab: 'params' | 'headers' | 'auth' | 'body' | 'scripts' | 'settings'
}

export interface ApiResponse {
  status: number
  statusText: string
  time: number
  size: string
  headers: Record<string, string>
  body: string
}

export interface Collection {
  id: string
  name: string
  requests: CollectionRequest[]
  expanded: boolean
  projectId?: string
}

export interface CollectionRequest {
  id: string
  name: string
  method: HttpMethod
  url: string
  body?: string
  headers?: Header[]
  description?: string
}

export interface HistoryEntry {
  id: string
  method: HttpMethod
  url: string
  status: number
  time: number
  timestamp: Date
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  description: string
  inviteCode: string
  createdAt: string
  ownerId: string
  memberIds: string[]
  collectionIds: string[]
}

export interface ProjectMember {
  id: string
  name: string
  avatar: string   // initials
  color: string    // accent hue
  online: boolean
  lastSeen: string
  projectId: string
}

// ─── Flows ───────────────────────────────────────────────────────────────────

export interface FlowNode {
  id: string
  type: 'request' | 'condition' | 'delay' | 'start' | 'end'
  label: string
  method?: HttpMethod
  url?: string
  body?: string
  x: number
  y: number
  status?: 'idle' | 'running' | 'success' | 'error'
  response?: Pick<ApiResponse, 'status' | 'time' | 'body'>
}

export interface FlowEdge {
  id: string
  from: string
  to: string
  label?: string
}

export interface Flow {
  id: string
  name: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  projectId?: string
}

// ─── Specs ───────────────────────────────────────────────────────────────────

export interface SpecParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'body'
  required: boolean
  type: string
  description?: string
  example?: string
}

export interface SpecResponse {
  status: number
  description: string
  example?: string
}

export interface SpecEndpoint {
  id: string
  method: HttpMethod
  path: string
  summary: string
  description?: string
  tag: string
  parameters: SpecParameter[]
  responses: SpecResponse[]
  deprecated?: boolean
}

export interface Spec {
  id: string
  name: string
  version: string
  baseUrl: string
  endpoints: SpecEndpoint[]
  projectId?: string
}

// ─── Sync ────────────────────────────────────────────────────────────────────

export type SyncEventType =
  | 'member_joined'
  | 'member_left'
  | 'member_heartbeat'
  | 'collection_updated'
  | 'project_updated'
  | 'flow_updated'
  | 'request_saved'

export interface SyncEvent {
  type: SyncEventType
  senderId: string
  payload: unknown
  timestamp: string
}

export type SidebarSection = 'collections' | 'environments' | 'history' | 'flows' | 'specs' | 'projects'

export interface Response {
  headers: string;
  body: string;
  status: number;
  time: number ;
  size: number ;
}