import { create } from 'zustand'
import { generateId } from '@/constants/mock-data'
import type {
    RequestTab,
    Collection,
    HistoryEntry,
    ApiResponse,
    SidebarSection,
    Environment,
} from '@/types/api.types'
import { DEFAULT_REQUEST_SETTINGS } from '@/types/api.types'
import { executeRequestAction, executeStoredRequestAction, updateStoredRequestAction } from '@/app/actions/flow-api'
import { isLoopbackHttpUrl, normalizeHttpUrl } from '@/lib/http-url'

export interface LogEntry {
    id: string
    level: 'log' | 'error' | 'warn' | 'info'
    message: string
    timestamp: Date
    details?: string
}

interface WorkspaceState {
    tabs: RequestTab[]
    activeTabId: string
    collections: Collection[]
    history: HistoryEntry[]
    responses: Record<string, ApiResponse | null>
    loadingTabs: Set<string>
    logs: LogEntry[]
    consoleMinimized: boolean
    sidebarSection: SidebarSection
    environment: string
    environments: Environment[]
    editingEnvironment: Environment | null
    projectModalOpen: boolean
    profileSettingsOpen: boolean

    // Actions
    setActiveTabId: (id: string) => void
    setSidebarSection: (section: SidebarSection) => void
    setConsoleMinimized: (minimized: boolean) => void
    setEnvironment: (env: string) => void
    setEditingEnvironment: (env: Environment | null) => void
    setProjectModalOpen: (open: boolean) => void
    setProfileSettingsOpen: (open: boolean) => void
    updateActiveTab: (updates: Partial<RequestTab>) => void
    addLog: (level: LogEntry['level'], message: string, details?: string) => void
    handleNewTab: () => void
    handleCloseTab: (id: string) => void
    handleSelectRequest: (collectionId: string, requestId: string) => void
    handleSend: () => Promise<void>
}

const DEFAULT_TAB_ID = generateId()
const DEFAULT_TAB: RequestTab = {
    id: DEFAULT_TAB_ID,
    name: 'New Request',
    method: 'GET',
    url: '',
    headers: [],
    params: [],
    body: '',
    bodyType: 'none',
    auth: { type: 'none' },
    scripts: { preRequest: '', postResponse: '' },
    settings: DEFAULT_REQUEST_SETTINGS,
    activeTab: 'params',
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
    tabs: [DEFAULT_TAB],
    activeTabId: DEFAULT_TAB_ID,
    collections: [],
    history: [],
    responses: {},
    loadingTabs: new Set(),
    logs: [],
    consoleMinimized: true,
    sidebarSection: 'collections',
    environment: 'No Environment',
    environments: [],
    editingEnvironment: null,
    projectModalOpen: false,
    profileSettingsOpen: false,

    setActiveTabId: (id) => set({ activeTabId: id }),
    setSidebarSection: (section) => set({ sidebarSection: section }),
    setConsoleMinimized: (minimized) => set({ consoleMinimized: minimized }),
    setEnvironment: (env) => set({ environment: env }),
    setEditingEnvironment: (env) => set({ editingEnvironment: env }),
    setProjectModalOpen: (open) => set({ projectModalOpen: open }),
    setProfileSettingsOpen: (open) => set({ profileSettingsOpen: open }),

    updateActiveTab: (updates) => set((state) => ({
        tabs: state.tabs.map((t) => (t.id === state.activeTabId ? { ...t, ...updates } : t))
    })),

    addLog: (level, message, details) => set((state) => ({
        logs: [...state.logs, { id: generateId(), level, message, timestamp: new Date(), details }]
    })),

    handleNewTab: () => {
        const newTab = { ...DEFAULT_TAB, id: generateId() }
        set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id
        }))
    },

    handleCloseTab: (id) => set((state) => {
        if (state.tabs.length === 1) {
            const newBlankTab = { ...DEFAULT_TAB, id: generateId() }
            return { tabs: [newBlankTab], activeTabId: newBlankTab.id }
        }
        const idx = state.tabs.findIndex((t) => t.id === id)
        const newTabs = state.tabs.filter((t) => t.id !== id)
        const newActiveId = state.activeTabId === id ? newTabs[idx === 0 ? 0 : idx - 1].id : state.activeTabId
        return { tabs: newTabs, activeTabId: newActiveId }
    }),

    handleSelectRequest: (collectionId, requestId) => set((state) => {
        const existingTab = state.tabs.find((t) => t.id === requestId)
        if (existingTab) return { activeTabId: existingTab.id }

        const req = state.collections.find((c) => c.id === collectionId)?.requests.find((r) => r.id === requestId)
        if (!req) return state

        const newTab: RequestTab = {
            ...DEFAULT_TAB,
            id: requestId,
            name: req.name,
            method: req.method,
            url: req.url,
            headers: req.headers ?? [],
            body: req.body ?? '',
        }
        return { tabs: [...state.tabs, newTab], activeTabId: newTab.id }
    }),

    handleSend: async () => {
        const state = get()
        const activeTab = state.tabs.find(t => t.id === state.activeTabId)
        if (!activeTab?.url) return

        set((current) => ({ loadingTabs: new Set(current.loadingTabs).add(state.activeTabId) }))
        const startedAt = Date.now()
        get().addLog('info', `Sending ${activeTab.method} ${activeTab.url}`)
        try {
            const environment = state.environments.find((item) => item.name === state.environment)
            const variables = Object.fromEntries((environment?.variables ?? []).filter((item) => item.enabled).map((item) => [item.key, item.value]))
            const interpolate = (value: string) => value.replace(/\{\{\s*([^}]+?)\s*}}/g, (match, key: string) => variables[key] ?? match)
            const url = new URL(normalizeHttpUrl(interpolate(activeTab.url)))
            activeTab.params.filter((param) => param.enabled && param.key).forEach((param) => url.searchParams.set(interpolate(param.key), interpolate(param.value)))
            const headers = Object.fromEntries(activeTab.headers.filter((header) => header.enabled && header.key).map((header) => [interpolate(header.key), interpolate(header.value)]))
            if (activeTab.auth.type === 'bearer' && activeTab.auth.token) headers.Authorization = `Bearer ${interpolate(activeTab.auth.token)}`
            if (activeTab.auth.type === 'basic') headers.Authorization = `Basic ${btoa(`${activeTab.auth.username ?? ''}:${activeTab.auth.password ?? ''}`)}`
            if (activeTab.auth.type === 'api-key' && activeTab.auth.apiKeyName && activeTab.auth.apiKey) {
                if (activeTab.auth.apiKeyIn === 'query') url.searchParams.set(activeTab.auth.apiKeyName, interpolate(activeTab.auth.apiKey))
                else headers[activeTab.auth.apiKeyName] = interpolate(activeTab.auth.apiKey)
            }
            const isStored = state.collections.some((collection) => collection.requests.some((request) => request.id === activeTab.id))
            const selectedEnvironment = state.environments.find((item) => item.name === state.environment)
            let result
            if (isStored) {
                const patch = await updateStoredRequestAction(activeTab.id, {
                    method: activeTab.method, url: normalizeHttpUrl(activeTab.url), headers: JSON.stringify(Object.fromEntries(activeTab.headers.filter((item) => item.enabled && item.key).map((item) => [item.key, item.value]))),
                    query_params: JSON.stringify(Object.fromEntries(activeTab.params.filter((item) => item.enabled && item.key).map((item) => [item.key, item.value]))),
                    body: activeTab.body, body_type: activeTab.bodyType, auth: JSON.stringify(activeTab.auth), scripts: JSON.stringify(activeTab.scripts), settings: JSON.stringify(activeTab.settings), name: activeTab.name,
                })
                if (!patch.ok) throw new Error(patch.error)
                result = isLoopbackHttpUrl(url.toString())
                    ? await executeRequestAction({ method: activeTab.method, url: url.toString(), headers, body: interpolate(activeTab.body) })
                    : await executeStoredRequestAction(activeTab.id, selectedEnvironment?.id)
            } else {
                result = await executeRequestAction({ method: activeTab.method, url: url.toString(), headers, body: interpolate(activeTab.body) })
            }
            if (!result.ok) throw new Error(result.error)
            const response = result.data
            const historyId = 'history_id' in response && typeof response.history_id === 'string' ? response.history_id : generateId()
            set((previous) => ({
                responses: { ...previous.responses, [state.activeTabId]: response },
                history: [{ id: historyId, method: activeTab.method, url: url.toString(), status: response.status, time: response.time, timestamp: new Date() }, ...previous.history.slice(0, 49)],
            }))
            get().addLog(response.status >= 400 ? 'error' : 'log', `${response.status} ${response.statusText} (${response.time}ms)`)
        } catch (error) {
            let message = error instanceof Error ? error.message : String(error)
            if (message.includes('target resolves only to blocked private or local addresses')) {
                message = 'Local/private endpoints are blocked by the FlowAPI backend. Set ALLOW_PRIVATE_REQUESTS=true in the backend .env for local development, then restart it.'
            }
            get().addLog('error', `Request failed after ${Date.now() - startedAt}ms`, message)
        } finally {
            set((current) => {
                const loadingTabs = new Set(current.loadingTabs)
                loadingTabs.delete(state.activeTabId)
                return { loadingTabs }
            })
        }
    }
}))
