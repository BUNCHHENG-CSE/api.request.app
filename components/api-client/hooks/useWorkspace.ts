import { useState, useCallback } from 'react'
import { INITIAL_TABS, INITIAL_COLLECTIONS, INITIAL_ENVIRONMENTS, generateId } from '../mock-data'
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

    // 🚀 READY FOR REAL API 🚀
    const handleSend = async () => {
        if (!activeTab?.url) return

        setLoadingTabs((s) => new Set(s).add(activeTabId))
        const startTime = Date.now()
        addLog('info', `→ ${activeTab.method} ${activeTab.url}`)

        try {
            // 1. REPLACE THIS TIMEOUT WITH YOUR REAL FETCH CALL:
            // const res = await fetch(activeTab.url, { method: activeTab.method, body: activeTab.body })
            await new Promise((resolve) => setTimeout(resolve, 600))

            const response: ApiResponse = {
                status: 200,
                statusText: 'OK',
                time: Date.now() - startTime,
                size: '1.2KB',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ message: "Ready for real backend integration!" }, null, 2),
            }

            setResponses((prev) => ({ ...prev, [activeTabId]: response }))
            setHistory((prev) => [{ id: generateId(), method: activeTab.method, url: activeTab.url, status: response.status, time: response.time, timestamp: new Date() }, ...prev.slice(0, 49)])
            addLog('log', `← ${response.status} ${response.statusText}`)

        } catch (error) {
            addLog('error', `Request Failed: ${error}`)
        } finally {
            setLoadingTabs((s) => { const n = new Set(s); n.delete(activeTabId); return n })
        }
    }

    const handleNewTab = () => {
        const newTab: RequestTab = {
            id: generateId(), name: 'New Request', method: 'GET', url: '',
            headers: [], params: [], body: '', bodyType: 'none', activeTab: 'params',
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
        const req = collections.find((c) => c.id === collectionId)?.requests.find((r) => r.id === requestId)
        if (!req) return
        const newTab: RequestTab = { ...req, id: generateId(), headers: [], params: [], body: '', bodyType: 'none', activeTab: 'params' }
        setTabs((prev) => [...prev, newTab])
        setActiveTabId(newTab.id)
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