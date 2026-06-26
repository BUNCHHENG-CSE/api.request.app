import type {
  RequestTab,
  Environment,
  Collection,
  HttpMethod,
  ApiResponse,
} from './types'
import { DEFAULT_REQUEST_SETTINGS } from './types'

export function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

const DEFAULT_AUTH = { type: 'none' as const }
const DEFAULT_SCRIPTS = { preRequest: '', postResponse: '' }

export const INITIAL_TABS: RequestTab[] = [
  {
    id: 'tab-1',
    name: 'Register User',
    method: 'POST',
    url: 'localhost:8080/register',
    headers: [
      { id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true },
      { id: generateId(), key: 'Accept', value: 'application/json', enabled: true },
    ],
    params: [],
    body: JSON.stringify({ id: 1, username: 'arzur', password: 'a@123' }, null, 2),
    bodyType: 'json',
    auth: DEFAULT_AUTH,
    scripts: DEFAULT_SCRIPTS,
    settings: DEFAULT_REQUEST_SETTINGS,
    activeTab: 'body',
  },
  {
    id: 'tab-2',
    name: 'Get Users',
    method: 'GET',
    url: 'localhost:8080/users',
    headers: [
      { id: generateId(), key: 'Authorization', value: 'Bearer {{token}}', enabled: true },
    ],
    params: [
      { id: generateId(), key: 'page', value: '1', enabled: true },
      { id: generateId(), key: 'limit', value: '10', enabled: true },
    ],
    body: '',
    bodyType: 'none',
    auth: DEFAULT_AUTH,
    scripts: DEFAULT_SCRIPTS,
    settings: DEFAULT_REQUEST_SETTINGS,
    activeTab: 'params',
  },
]

export const INITIAL_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-1',
    name: 'Development',
    color: '#3b82f6',
    variables: [
      { id: generateId(), key: 'BASE_URL', value: 'localhost:8080', enabled: true },
      { id: generateId(), key: 'API_KEY', value: 'dev-key-123', enabled: true, secret: true },
      { id: generateId(), key: 'TOKEN', value: 'dev-token-abc', enabled: true, secret: true },
    ],
  },
  {
    id: 'env-2',
    name: 'Staging',
    color: '#f59e0b',
    variables: [
      { id: generateId(), key: 'BASE_URL', value: 'api-staging.example.com', enabled: true },
      { id: generateId(), key: 'API_KEY', value: 'stg-key-456', enabled: true, secret: true },
    ],
  },
  {
    id: 'env-3',
    name: 'Production',
    color: '#ef4444',
    variables: [
      { id: generateId(), key: 'BASE_URL', value: 'api.example.com', enabled: true },
    ],
  },
]

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Auth API',
    expanded: true,
    requests: [
      { id: 'req-1', name: 'Register User', method: 'POST', url: 'localhost:8080/register' },
      { id: 'req-2', name: 'Login', method: 'POST', url: 'localhost:8080/login' },
      { id: 'req-3', name: 'Refresh Token', method: 'POST', url: 'localhost:8080/auth/refresh' },
      { id: 'req-4', name: 'Logout', method: 'DELETE', url: 'localhost:8080/auth/logout' },
    ],
  },
  {
    id: 'col-2',
    name: 'Users',
    expanded: false,
    requests: [
      { id: 'req-5', name: 'Get Users', method: 'GET', url: 'localhost:8080/users' },
      { id: 'req-6', name: 'Get User by ID', method: 'GET', url: 'localhost:8080/users/:id' },
      { id: 'req-7', name: 'Update User', method: 'PUT', url: 'localhost:8080/users/:id' },
      { id: 'req-8', name: 'Delete User', method: 'DELETE', url: 'localhost:8080/users/:id' },
    ],
  },
  {
    id: 'col-3',
    name: 'Products',
    expanded: false,
    requests: [
      { id: 'req-9', name: 'List Products', method: 'GET', url: 'localhost:8080/products' },
      { id: 'req-10', name: 'Create Product', method: 'POST', url: 'localhost:8080/products' },
      { id: 'req-11', name: 'Update Product', method: 'PATCH', url: 'localhost:8080/products/:id' },
    ],
  },
]

export function buildFakeResponse(method: HttpMethod, url: string): ApiResponse {
  const isError = url.includes('error') || url.includes('404')
  const status = isError ? 404 : method === 'DELETE' ? 204 : method === 'POST' ? 201 : 200
  const time = Math.floor(Math.random() * 200) + 80

  const bodies: Record<string, string> = {
    POST: JSON.stringify({ success: true, id: generateId(), message: 'Resource created.' }, null, 2),
    GET: JSON.stringify({
      items: [
        { id: 1, name: 'Item 1', active: true },
        { id: 2, name: 'Item 2', active: false },
      ],
      total: 2,
      page: 1,
    }, null, 2),
    PUT: JSON.stringify({ success: true, message: 'Resource updated.' }, null, 2),
    PATCH: JSON.stringify({ success: true, message: 'Resource patched.' }, null, 2),
    DELETE: '',
  }

  const sizeBytes = bodies[method]?.length ?? 0
  const sizeStr = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)}KB` : `${sizeBytes}B`

  return {
    status,
    statusText: status === 200 ? 'OK' : status === 201 ? 'Created' : status === 204 ? 'No Content' : 'Not Found',
    time,
    size: sizeStr,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-request-id': generateId(),
      'cache-control': 'no-cache',
    },
    body: isError
      ? JSON.stringify({ error: 'Not Found', statusCode: 404, message: 'The requested resource does not exist.' }, null, 2)
      : (bodies[method] ?? '{}'),
  }
}
