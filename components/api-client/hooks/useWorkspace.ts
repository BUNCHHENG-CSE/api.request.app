import { useState, useCallback } from 'react'
import {
  INITIAL_TABS,
  INITIAL_COLLECTIONS,
  INITIAL_ENVIRONMENTS,
  generateId,
} from '../mock-data'
import type {
  RequestTab,
  Collection,
  HistoryEntry,
  ApiResponse,
  SidebarSection,
  Environment,
} from '../types'
import { DEFAULT_REQUEST_SETTINGS } from '../types'

type LogLevel = 'log' | 'error' | 'warn' | 'info'
export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  timestamp: Date
  details?: string
}

export function useWorkspace() {
  const [tabs, setTabs] = useState<RequestTab[]>(INITIAL_TABS)
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [responses, setResponses] = useState<Record<string, ApiResponse | null>>({})
  const [loadingTabs, setLoadingTabs] = useState<Set<string>>(new Set())
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [consoleMinimized, setConsoleMinimized] = useState(true)
  const [sidebarSection, setSidebarSection] = useState<SidebarSection>('collections')
  const [environment, setEnvironment] = useState('Development')
  const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVIRONMENTS)
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false)

  const activeTab = tabs.find((t) => t.id === activeTabId)!

  const updateActiveTab = useCallback(
    (updates: Partial<RequestTab>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      )
    },
    [activeTabId],
  )

  const addLog = useCallback(
    (level: LogLevel, message: string, details?: string) => {
      setLogs((prev) => [
        ...prev,
        { id: generateId(), level, message, timestamp: new Date(), details },
      ])
    },
    [],
  )

  /** Simulates an API request. Replace the timeout with a real fetch call. */
  const handleSend = useCallback(async () => {
    if (!activeTab?.url) return

    setLoadingTabs((s) => new Set(s).add(activeTabId))
    const startTime = Date.now()
    addLog('info', `→ ${activeTab.method} ${activeTab.url}`)

    try {
      // TODO: replace with real fetch:
      // const res = await fetch(activeTab.url, { method: activeTab.method, body: activeTab.body })
      await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 400))

      const response: ApiResponse = {
        status: 200,
        statusText: 'OK',
        time: Date.now() - startTime,
        size: '1.2KB',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-request-id': generateId(),
        },
        body: JSON.stringify(
          { message: 'Ready for real backend integration!', timestamp: new Date().toISOString() },
          null,
          2,
        ),
      }

      setResponses((prev) => ({ ...prev, [activeTabId]: response }))
      setHistory((prev) => [
        {
          id: generateId(),
          method: activeTab.method,
          url: activeTab.url,
          status: response.status,
          time: response.time,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ])
      addLog('log', `← ${response.status} ${response.statusText} (${response.time}ms)`)
    } catch (error) {
      addLog('error', `Request failed: ${error}`)
    } finally {
      setLoadingTabs((s) => {
        const n = new Set(s)
        n.delete(activeTabId)
        return n
      })
    }
  }, [activeTab, activeTabId, addLog])

  const handleNewTab = useCallback(() => {
    const newTab: RequestTab = {
      id: generateId(),
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
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [])

  const handleCloseTab = useCallback(
    (id: string) => {
      if (tabs.length === 1) return
      const idx = tabs.findIndex((t) => t.id === id)
      setTabs((prev) => prev.filter((t) => t.id !== id))
      if (activeTabId === id) {
        setActiveTabId(tabs[idx === 0 ? 1 : idx - 1].id)
      }
    },
    [tabs, activeTabId],
  )

  const handleSelectRequest = useCallback(
    (collectionId: string, requestId: string) => {
      const req = collections
        .find((c) => c.id === collectionId)
        ?.requests.find((r) => r.id === requestId)
      if (!req) return
      const newTab: RequestTab = {
        id: generateId(),
        name: req.name,
        method: req.method,
        url: req.url,
        headers: req.headers ?? [],
        params: [],
        body: req.body ?? '',
        bodyType: 'none',
        auth: { type: 'none' },
        scripts: { preRequest: '', postResponse: '' },
        settings: DEFAULT_REQUEST_SETTINGS,
        activeTab: 'params',
      }
      setTabs((prev) => [...prev, newTab])
      setActiveTabId(newTab.id)
    },
    [collections],
  )

  const handleToggleCollection = useCallback(
    (id: string) =>
      setCollections((p) =>
        p.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c)),
      ),
    [],
  )

  return {
    tabs,
    activeTabId,
    activeTab,
    collections,
    history,
    responses,
    loadingTabs,
    logs,
    consoleMinimized,
    sidebarSection,
    environment,
    environments,
    editingEnvironment,
    projectModalOpen,
    profileSettingsOpen,
    setTabs,
    setActiveTabId,
    setCollections,
    setConsoleMinimized,
    setSidebarSection,
    setEnvironment,
    setEnvironments,
    setEditingEnvironment,
    setProjectModalOpen,
    setProfileSettingsOpen,
    setLogs,
    updateActiveTab,
    addLog,
    handleSend,
    handleNewTab,
    handleCloseTab,
    handleSelectRequest,
    handleToggleCollection,
  }
}
