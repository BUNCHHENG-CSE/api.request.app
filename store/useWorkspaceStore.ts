import { create } from 'zustand'
import {
    INITIAL_COLLECTIONS,
    INITIAL_ENVIRONMENTS,
    generateId,
} from '@/constants/mock-data'
import type {
    RequestTab,
    Collection,
    HistoryEntry,
    ApiResponse,
    SidebarSection,
    Environment,
} from '@/types/api.types'
import { DEFAULT_REQUEST_SETTINGS } from '@/types/api.types'

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
    collections: INITIAL_COLLECTIONS,
    history: [],
    responses: {},
    loadingTabs: new Set(),
    logs: [],
    consoleMinimized: true,
    sidebarSection: 'collections',
    environment: 'Development',
    environments: INITIAL_ENVIRONMENTS,
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

        set((s) => ({ loadingTabs: new Set(s.loadingTabs).add(state.activeTabId) }))
        const startTime = Date.now()
        get().addLog('info', `→ ${activeTab.method} ${activeTab.url}`)

        try {
            await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 400))

            const response: ApiResponse = {
                status: 200,
                statusText: 'OK',
                time: Date.now() - startTime,
                size: '1.2KB',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ message: 'Success' }, null, 2),
            }

            set((prev) => ({
                responses: { ...prev.responses, [state.activeTabId]: response },
                history: [{
                    id: generateId(), method: activeTab.method, url: activeTab.url,
                    status: response.status, time: response.time, timestamp: new Date(),
                }, ...prev.history.slice(0, 49)]
            }))
            get().addLog('log', `← ${response.status} ${response.statusText} (${response.time}ms)`)
        } catch (error) {
            get().addLog('error', `Request failed: ${error}`)
        } finally {
            set((s) => {
                const n = new Set(s.loadingTabs)
                n.delete(state.activeTabId)
                return { loadingTabs: n }
            })
        }
    }
}))