'use client'

import { useState, useCallback } from 'react'
// unused Header and QueryParam are referenced only within tab data shapes — no direct import needed
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'
import { UrlBar } from './UrlBar'
import { RequestPanel } from './RequestPanel'
import { ResponsePanel } from './ResponsePanel'
import { ConsolePanel } from './ConsolePanel'
import { FlowsPanel } from './FlowsPanel'
import { SpecsPanel } from './SpecsPanel'
import { ProjectModal } from './ProjectModal'
import { EnvironmentEditor } from './EnvironmentEditor'
import { useSync } from './hooks/useSync'
import { cn } from '@/lib/utils'
import type {
  Collection,
  HistoryEntry,
  HttpMethod,
  RequestTab,
  ApiResponse,
  SidebarSection,
  Environment,
  EnvironmentVariable,
} from './types'

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL_TABS: RequestTab[] = [
  {
    id: 'tab-1',
    name: 'Register User',
    method: 'POST',
    url: 'localhost:8080/register',
    headers: [
      { id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true },
      { id: generateId(), key: 'Accept',        value: 'application/json', enabled: true },
    ],
    params: [],
    body: JSON.stringify({ id: 1, username: 'arzur', password: 'a@123' }, null, 2),
    bodyType: 'json',
    activeTab: 'body',
  },
  {
    id: 'tab-2',
    name: 'Get Users',
    method: 'GET',
    url: 'localhost:8080/users',
    headers: [{ id: generateId(), key: 'Authorization', value: 'Bearer {{token}}', enabled: true }],
    params: [
      { id: generateId(), key: 'page',  value: '1',  enabled: true },
      { id: generateId(), key: 'limit', value: '10', enabled: true },
    ],
    body: '',
    bodyType: 'none',
    activeTab: 'params',
  },
]

const INITIAL_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-1',
    name: 'Development',
    color: 'oklch(0.65_0.17_145)',
    variables: [
      { id: generateId(), key: 'BASE_URL', value: 'localhost:8080', enabled: true },
      { id: generateId(), key: 'API_KEY', value: 'dev-key-123', enabled: true },
    ],
  },
  {
    id: 'env-2',
    name: 'Staging',
    color: 'oklch(0.72_0.16_65)',
    variables: [
      { id: generateId(), key: 'BASE_URL', value: 'api-staging.example.com', enabled: true },
      { id: generateId(), key: 'API_KEY', value: 'staging-key-456', enabled: true },
    ],
  },
  {
    id: 'env-3',
    name: 'Production',
    color: 'oklch(0.65_0.22_25)',
    variables: [
      { id: generateId(), key: 'BASE_URL', value: 'api.example.com', enabled: true },
      { id: generateId(), key: 'API_KEY', value: '', enabled: true },
    ],
  },
]

const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Auth API',
    expanded: true,
    requests: [
      { id: 'req-1', name: 'Register User',  method: 'POST',   url: 'localhost:8080/register' },
      { id: 'req-2', name: 'Login',          method: 'POST',   url: 'localhost:8080/login'    },
      { id: 'req-3', name: 'Refresh Token',  method: 'PUT',    url: 'localhost:8080/refresh'  },
      { id: 'req-4', name: 'Logout',         method: 'DELETE', url: 'localhost:8080/logout'   },
    ],
  },
  {
    id: 'col-2',
    name: 'Users API',
    expanded: false,
    requests: [
      { id: 'req-5', name: 'Get All Users',   method: 'GET',   url: 'localhost:8080/users'       },
      { id: 'req-6', name: 'Get User by ID',  method: 'GET',   url: 'localhost:8080/users/:id'   },
      { id: 'req-7', name: 'Update User',     method: 'PATCH', url: 'localhost:8080/users/:id'   },
    ],
  },
  {
    id: 'col-3',
    name: 'Products API',
    expanded: false,
    requests: [
      { id: 'req-8', name: 'List Products',   method: 'GET',  url: 'localhost:8080/products' },
      { id: 'req-9', name: 'Create Product',  method: 'POST', url: 'localhost:8080/products' },
    ],
  },
]

function buildFakeResponse(method: HttpMethod, url: string): ApiResponse {
  const isError = url.includes('error') || url.includes('404')
  const status = isError ? 404 : method === 'DELETE' ? 204 : method === 'POST' ? 201 : 200
  const time = Math.floor(Math.random() * 200) + 80

  const bodies: Record<string, string> = {
    POST:    JSON.stringify({ success: true, id: Math.floor(Math.random() * 1000), message: 'User registered successfully', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFyenVyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' }, null, 2),
    GET:     JSON.stringify({ users: [{ id: 1, username: 'arzur', email: 'arzur@example.com', createdAt: '2025-01-15T10:30:00Z' }, { id: 2, username: 'john_doe', email: 'john@example.com', createdAt: '2025-01-20T14:22:00Z' }], total: 2, page: 1, limit: 10 }, null, 2),
    PUT:     JSON.stringify({ success: true, message: 'Token refreshed', accessToken: 'new_access_token_xyz', expiresIn: 3600 }, null, 2),
    PATCH:   JSON.stringify({ success: true, message: 'User updated', updatedFields: ['email', 'username'] }, null, 2),
    DELETE:  '',
    HEAD:    '',
    OPTIONS: '',
  }

  const errorBody = JSON.stringify({ error: 'Not Found', message: 'The requested resource could not be found', statusCode: 404 }, null, 2)

  return {
    status,
    statusText: status === 200 ? 'OK' : status === 201 ? 'Created' : status === 204 ? 'No Content' : 'Not Found',
    time,
    size: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}KB`,
    headers: {
      'content-type':              'application/json; charset=utf-8',
      'x-request-id':              Math.random().toString(36).slice(2),
      'x-response-time':           `${time}ms`,
      'cache-control':             'no-cache, no-store',
      'access-control-allow-origin': '*',
      server:                      'FlowAPI/1.0',
    },
    body: isError ? errorBody : (bodies[method] ?? '{}'),
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ApiClient() {
  // ── request state ──────────────────────────────────────────────────────────
  const [tabs, setTabs]               = useState<RequestTab[]>(INITIAL_TABS)
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS)
  const [history, setHistory]         = useState<HistoryEntry[]>([])
  const [responses, setResponses]     = useState<Record<string, ApiResponse | null>>({})
  const [loadingTabs, setLoadingTabs] = useState<Set<string>>(new Set())
  const [logs, setLogs]               = useState<{ id: string; level: 'log' | 'error' | 'warn' | 'info'; message: string; timestamp: Date; details?: string }[]>([])
  const [consoleMinimized, setConsoleMinimized] = useState(true)
  const [environment, setEnvironment] = useState('Development')
  const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVIRONMENTS)
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null)
  const [sidebarSection, setSidebarSection] = useState<SidebarSection>('collections')
  const [projectModalOpen, setProjectModalOpen] = useState(false)

  // ── sync (cross-tab + projects) ────────────────────────────────────────────
  const {
    self,
    members,
    projects,
    activeProjectId,
    setActiveProjectId,
    flows,
    specs,
    createProject,
    joinProject,
    updateFlow,
    createFlow,
  } = useSync()

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null
  const activeTab     = tabs.find((t) => t.id === activeTabId)!

  // ── tab helpers ────────────────────────────────────────────────────────────

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

    addLog(
      response.status < 400 ? 'log' : 'error',
      `← ${response.status} ${response.statusText}  ${response.time}ms  ${response.size}`,
      response.body
    )

    setHistory((prev) => [
      { id: generateId(), method: activeTab.method, url: activeTab.url, status: response.status, time: response.time, timestamp: new Date() },
      ...prev.slice(0, 49),
    ])
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
    const next = tabs[idx === 0 ? 1 : idx - 1]
    setTabs((prev) => prev.filter((t) => t.id !== id))
    if (activeTabId === id) setActiveTabId(next.id)
  }

  const handleToggleCollection = (id: string) => {
    setCollections((prev) => prev.map((c) => c.id === id ? { ...c, expanded: !c.expanded } : c))
  }

  const handleSelectRequest = (collectionId: string, requestId: string) => {
    const col = collections.find((c) => c.id === collectionId)
    const req = col?.requests.find((r) => r.id === requestId)
    if (!req) return
    
    // Check if a tab with the same method+url already exists
    const existingTab = tabs.find((t) => t.method === req.method && t.url === req.url)
    if (existingTab) {
      setActiveTabId(existingTab.id)
    } else {
      const newTab: RequestTab = {
        id: generateId(), name: req.name, method: req.method, url: req.url,
        headers: [{ id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true }],
        params: [], body: '', bodyType: req.method === 'GET' ? 'none' : 'json',
        activeTab: req.method === 'GET' ? 'params' : 'body',
      }
      setTabs((prev) => [...prev, newTab])
      setActiveTabId(newTab.id)
    }
    
    // switch back to main editor view when opening a request from sidebar
    if (sidebarSection === 'flows' || sidebarSection === 'specs') {
      setSidebarSection('collections')
    }
  }

  const handleSidebarSectionChange = (s: SidebarSection) => {
    setSidebarSection(s)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const isFullscreenView = sidebarSection === 'flows' || sidebarSection === 'specs'

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Top nav */}
      <TopNav
        environment={environment}
        onEnvironmentChange={setEnvironment}
        self={self}
        members={members}
        activeProject={activeProject}
        onOpenProjects={() => setProjectModalOpen(true)}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn('flex-shrink-0 border-r border-border overflow-hidden flex flex-col transition-all', isFullscreenView ? 'w-14' : 'w-72')}>
          <Sidebar
            collections={collections}
            history={history}
            onSelectRequest={handleSelectRequest}
            onNewRequest={handleNewTab}
            onToggleCollection={handleToggleCollection}
            activeSection={sidebarSection}
            onSectionChange={handleSidebarSectionChange}
            onOpenProjects={() => setProjectModalOpen(true)}
            activeProjectName={activeProject?.name}
            onEditEnvironment={(envName) => {
              const env = environments.find((e) => e.name === envName)
              if (env) setEditingEnvironment(env)
            }}
          />
        </div>

        {/* Main editor / fullscreen panels */}
        {isFullscreenView ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarSection === 'flows' && (
              <FlowsPanel
                flows={flows}
                onUpdateFlow={updateFlow}
                onCreateFlow={(name) => createFlow(name, activeProjectId ?? undefined)}
              />
            )}
            {sidebarSection === 'specs' && (
              <SpecsPanel specs={specs} />
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tab bar */}
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabSelect={setActiveTabId}
              onTabClose={handleCloseTab}
              onNewTab={handleNewTab}
            />

            {/* URL bar */}
            {activeTab && (
              <UrlBar
                method={activeTab.method}
                url={activeTab.url}
                isLoading={loadingTabs.has(activeTabId)}
                onMethodChange={(m) => updateActiveTab({ method: m })}
                onUrlChange={(u) => updateActiveTab({ url: u })}
                onSend={handleSend}
                onSave={() => addLog('log', `Saved: ${activeTab.name || activeTab.url}`)}
              />
            )}

            {/* Split view */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex-shrink-0 border-b border-border" style={{ height: '42%', minHeight: 170 }}>
                {activeTab && (
                  <RequestPanel
                    headers={activeTab.headers}
                    params={activeTab.params}
                    body={activeTab.body}
                    bodyType={activeTab.bodyType}
                    activeTab={activeTab.activeTab}
                    onTabChange={(tab) => updateActiveTab({ activeTab: tab })}
                    onHeadersChange={(headers) => updateActiveTab({ headers })}
                    onParamsChange={(params) => updateActiveTab({ params })}
                    onBodyChange={(body) => updateActiveTab({ body })}
                    onBodyTypeChange={(bodyType) => updateActiveTab({ bodyType })}
                  />
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <ResponsePanel
                  response={responses[activeTabId] ?? null}
                  isLoading={loadingTabs.has(activeTabId)}
                />
              </div>
            </div>

            {/* Console */}
            <ConsolePanel
              logs={logs}
              onClear={() => setLogs([])}
              isMinimized={consoleMinimized}
              onToggleMinimize={() => setConsoleMinimized(!consoleMinimized)}
            />
          </div>
        )}
      </div>

      {/* Project modal */}
      {projectModalOpen && (
        <ProjectModal
          projects={projects}
          activeProjectId={activeProjectId}
          self={self}
          onCreateProject={createProject}
          onJoinProject={joinProject}
          onSelectProject={(id) => setActiveProjectId(id)}
          onClose={() => setProjectModalOpen(false)}
        />
      )}

      {/* Environment editor modal */}
      {editingEnvironment && (
        <EnvironmentEditor
          environment={editingEnvironment}
          onEnvironmentChange={(updatedEnv) => {
            setEnvironments(environments.map((e) => e.id === updatedEnv.id ? updatedEnv : e))
            setEditingEnvironment(null)
          }}
          onClose={() => setEditingEnvironment(null)}
        />
      )}
    </div>
  )
}


