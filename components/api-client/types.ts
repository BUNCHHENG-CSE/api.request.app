// ─── HTTP ─────────────────────────────────────────────────────────────────────
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

// ─── Shared row model ─────────────────────────────────────────────────────────
export interface KeyValueRow {
  id: string
  key: string
  value: string
  enabled: boolean
  description?: string
}

/** @deprecated use KeyValueRow */
export type Header = KeyValueRow
/** @deprecated use KeyValueRow */
export type QueryParam = KeyValueRow

// ─── Environment ──────────────────────────────────────────────────────────────
export interface EnvironmentVariable {
  id: string
  key: string
  value: string
  enabled: boolean
  secret?: boolean
}

export interface Environment {
  id: string
  name: string
  variables: EnvironmentVariable[]
  color: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth2'

export interface Auth {
  type: AuthType
  token?: string
  username?: string
  password?: string
  apiKey?: string
  apiKeyIn?: 'header' | 'query'
  apiKeyName?: string
}

// ─── Body ─────────────────────────────────────────────────────────────────────
export type BodyType =
  | 'none'
  | 'json'
  | 'form-data'
  | 'x-www-form-urlencoded'
  | 'raw'
  | 'binary'
  | 'graphql'
  | 'text'
  | 'xml'

export interface FormDataRow extends KeyValueRow {
  type: 'text' | 'file'
  fileName?: string
}

// ─── Scripts ──────────────────────────────────────────────────────────────────
export interface Scripts {
  preRequest: string
  postResponse: string
}

// ─── Request settings ─────────────────────────────────────────────────────────
export interface RequestSettings {
  httpVersion: 'auto' | '1.0' | '1.1' | '2'
  sslVerification: boolean
  followRedirects: boolean
  followOriginalMethod: boolean
  followAuthHeader: boolean
  removeRefererOnRedirect: boolean
  strictHttpParser: boolean
  encodeUrlAutomatically: boolean
  disableCookieJar: boolean
  useServerCipherSuite: boolean
  maxRedirects: number
  disabledTlsProtocols: string
  cipherSuiteSelection: string
}

export const DEFAULT_REQUEST_SETTINGS: RequestSettings = {
  httpVersion: 'auto',
  sslVerification: false,
  followRedirects: true,
  followOriginalMethod: false,
  followAuthHeader: false,
  removeRefererOnRedirect: false,
  strictHttpParser: false,
  encodeUrlAutomatically: true,
  disableCookieJar: false,
  useServerCipherSuite: false,
  maxRedirects: 10,
  disabledTlsProtocols: '',
  cipherSuiteSelection: '',
}

// ─── RequestTab ───────────────────────────────────────────────────────────────
export interface RequestTab {
  id: string
  name: string
  method: HttpMethod
  url: string
  headers: KeyValueRow[]
  params: KeyValueRow[]
  body: string
  bodyType: BodyType
  formDataRows?: FormDataRow[]
  formEncodedRows?: KeyValueRow[]
  graphqlQuery?: string
  graphqlVariables?: string
  auth: Auth
  scripts: Scripts
  settings: RequestSettings
  activeTab: 'params' | 'headers' | 'auth' | 'body' | 'scripts' | 'settings'
}

// ─── ApiResponse ──────────────────────────────────────────────────────────────
export interface ApiResponse {
  status: number
  statusText: string
  time: number
  size: string
  headers: Record<string, string>
  body: string
}

// ─── Collection ───────────────────────────────────────────────────────────────
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
  headers?: KeyValueRow[]
  description?: string
}

// ─── History ──────────────────────────────────────────────────────────────────
export interface HistoryEntry {
  id: string
  method: HttpMethod
  url: string
  status: number
  time: number
  timestamp: Date
}

// ─── Projects ─────────────────────────────────────────────────────────────────
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
  avatar: string
  color: string
  online: boolean
  lastSeen: string
  projectId: string
}

// ─── Flows ────────────────────────────────────────────────────────────────────
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

// ─── Specs ────────────────────────────────────────────────────────────────────
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

// ─── Sync ─────────────────────────────────────────────────────────────────────
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

// ─── User profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string
  email: string
  color: string
  avatarInitials: string
  theme: 'dark' | 'light' | 'system'
}
