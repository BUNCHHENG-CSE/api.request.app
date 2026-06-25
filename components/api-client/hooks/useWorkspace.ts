// components/api-client/hooks/useWorkspace.ts
import { useState, useCallback } from 'react'
import { INITIAL_TABS, INITIAL_COLLECTIONS, INITIAL_ENVIRONMENTS, generateId, buildFakeResponse } from '../mock-data'
import type { RequestTab, Collection, HistoryEntry, ApiResponse, SidebarSection, Environment } from '../types'

export function useWorkspace() {
    const [tabs, setTabs] = useState<RequestTab[]>(INITIAL_TABS)
    const [activeTabId, setActiveTabId] = useState('tab-1')
    const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS)
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [responses, setResponses] = useState<Record<string, ApiResponse | null>>({})
    const [loadingTabs, setLoadingTabs] = useState<Set<string>>(new Set())
    const [logs, setLogs] = useState<{ id: string; level: 'log' | 'error' | 'warn' | 'info'; message: string; timestamp: Date; details?: string }[]>([])
    const [consoleMinimized, setConsoleMinimized] = useState(true)
    const [sidebarSection, setSidebarSection] = useState<SidebarSection>('collections')
    const [environment, setEnvironment] = useState('Development')
    const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVIRONMENTS)
    const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null)
    const [projectModalOpen, setProjectModalOpen] = useState(false)

    const activeTab = tabs.find((t) => t.id === activeTabId)!

    const updateActiveTab = useCallback((updates: Partial<RequestTab>) => {
        setTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, ...updates } : t))
    }, [activeTabId])

    const addLog = (level: 'log' | 'error' | 'warn' | 'info', message: string, details?: string) => {
        setLogs((prev) => [...prev, { id: generateId(), level, message, timestamp: new Date(), details }])
    }

    const handleSend = async () => {
        if (!activeTab?.url) return
        const url = activeTab.url.startsWith('http') ? activeTab.url : `https://${activeTab.url}`
        setLoadingTabs((s) => new Set(s).add(activeTabId))
        addLog('info', `→ ${activeTab.method} ${url}`)

        await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
        const response = buildFakeResponse(activeTab.method, url)

        setResponses((prev) => ({ ...prev, [activeTabId]: response }))
        setLoadingTabs((s) => { const n = new Set(s); n.delete(activeTabId); return n })
        addLog(response.status < 400 ? 'log' : 'error', `← ${response.status} ${response.statusText}  ${response.time}ms`, response.body)
        setHistory((prev) => [{ id: generateId(), method: activeTab.method, url: activeTab.url, status: response.status, time: response.time, timestamp: new Date() }, ...prev.slice(0, 49)])
    }

    const handleNewTab = () => {
        const newTab: RequestTab = {
            id: generateId(), name: '', method: 'GET', url: '',
            headers: [{ id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true }],
            params: [], body: '', bodyType: 'none', activeTab: 'params',
        }
        setTabs((prev) => [...prev, newTab])
        setActiveTabId(newTab.id)
    }

    const handleCloseTab = (id: string) => {
        if (tabs.length === 1) return
        const idx = tabs.findIndex((t) => t.id === id)
        setTabs((prev) => prev.filter((t) => t.id !== id))
        if (activeTabId === id) setActiveTabId(tabs[idx === 0 ? 1 : idx - 1].id)
    }

    const handleSelectRequest = (collectionId: string, requestId: string) => {
        const col = collections.find((c) => c.id === collectionId)
        const req = col?.requests.find((r) => r.id === requestId)
        if (!req) return

        const existingTab = tabs.find((t) => t.method === req.method && t.url === req.url)
        if (existingTab) {
            setActiveTabId(existingTab.id)
        } else {
            const newTab: RequestTab = { ...req, id: generateId(), headers: [], params: [], body: '', bodyType: 'none', activeTab: 'params' }
            setTabs((prev) => [...prev, newTab])
            setActiveTabId(newTab.id)
        }
        if (sidebarSection === 'flows' || sidebarSection === 'specs') setSidebarSection('collections')
    }

    return {
        tabs, activeTabId, activeTab, collections, history, responses, loadingTabs, logs,
        consoleMinimized, sidebarSection, environment, environments, editingEnvironment, projectModalOpen,
        setTabs, setActiveTabId, setCollections, setConsoleMinimized, setSidebarSection, setEnvironment,
        setEnvironments, setEditingEnvironment, setProjectModalOpen, setLogs,
        updateActiveTab, addLog, handleSend, handleNewTab, handleCloseTab, handleSelectRequest,
        handleToggleCollection: (id: string) => setCollections((p) => p.map((c) => c.id === id ? { ...c, expanded: !c.expanded } : c))
    }
}