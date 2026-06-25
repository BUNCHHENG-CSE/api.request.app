// components/api-client/mock-data.ts
import type { RequestTab, Environment, Collection, HttpMethod, ApiResponse } from './types'

export function generateId() {
    return Math.random().toString(36).slice(2, 11)
}

export const INITIAL_TABS: RequestTab[] = [
    {
        id: 'tab-1', name: 'Register User', method: 'POST', url: 'localhost:8080/register',
        headers: [
            { id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true },
            { id: generateId(), key: 'Accept', value: 'application/json', enabled: true },
        ],
        params: [],
        body: JSON.stringify({ id: 1, username: 'arzur', password: 'a@123' }, null, 2),
        bodyType: 'json', activeTab: 'body',
    },
    {
        id: 'tab-2', name: 'Get Users', method: 'GET', url: 'localhost:8080/users',
        headers: [{ id: generateId(), key: 'Authorization', value: 'Bearer {{token}}', enabled: true }],
        params: [
            { id: generateId(), key: 'page', value: '1', enabled: true },
            { id: generateId(), key: 'limit', value: '10', enabled: true },
        ],
        body: '', bodyType: 'none', activeTab: 'params',
    },
]

export const INITIAL_ENVIRONMENTS: Environment[] = [
    // Notice we switch to semantic variables or Tailwind classes instead of static OKLCH if possible.
    {
        id: 'env-1', name: 'Development', color: 'var(--chart-1)',
        variables: [
            { id: generateId(), key: 'BASE_URL', value: 'localhost:8080', enabled: true },
            { id: generateId(), key: 'API_KEY', value: 'dev-key-123', enabled: true },
        ],
    },
    {
        id: 'env-2', name: 'Staging', color: 'var(--chart-3)',
        variables: [
            { id: generateId(), key: 'BASE_URL', value: 'api-staging.example.com', enabled: true },
        ],
    },
    {
        id: 'env-3', name: 'Production', color: 'var(--chart-5)',
        variables: [
            { id: generateId(), key: 'BASE_URL', value: 'api.example.com', enabled: true },
        ],
    },
]

export const INITIAL_COLLECTIONS: Collection[] = [
    {
        id: 'col-1', name: 'Auth API', expanded: true,
        requests: [
            { id: 'req-1', name: 'Register User', method: 'POST', url: 'localhost:8080/register' },
            { id: 'req-2', name: 'Login', method: 'POST', url: 'localhost:8080/login' },
        ],
    },
    // ... (Keep the rest of your collections here)
]

export function buildFakeResponse(method: HttpMethod, url: string): ApiResponse {
    const isError = url.includes('error') || url.includes('404')
    const status = isError ? 404 : method === 'DELETE' ? 204 : method === 'POST' ? 201 : 200
    const time = Math.floor(Math.random() * 200) + 80

    const bodies: Record<string, string> = {
        POST: JSON.stringify({ success: true, message: 'Action successful' }, null, 2),
        GET: JSON.stringify({ items: [{ id: 1, name: 'Item 1' }] }, null, 2),
        DELETE: '',
    }

    return {
        status,
        statusText: status === 200 ? 'OK' : status === 201 ? 'Created' : 'Not Found',
        time,
        size: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}KB`,
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: isError ? JSON.stringify({ error: 'Not Found' }) : (bodies[method] ?? '{}'),
    }
}