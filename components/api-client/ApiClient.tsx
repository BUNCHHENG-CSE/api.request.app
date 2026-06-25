'use client'

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
import { useWorkspace } from './hooks/useWorkspace'
import { cn } from '@/lib/utils'

export function ApiClient() {
  const workspace = useWorkspace()
  const sync = useSync()

  const activeProject = sync.projects.find((p) => p.id === sync.activeProjectId) ?? null
  const isFullscreenView = workspace.sidebarSection === 'flows' || workspace.sidebarSection === 'specs'

  return (
      <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
        <TopNav
            environment={workspace.environment}
            onEnvironmentChange={workspace.setEnvironment}
            self={sync.self}
            members={sync.members}
            activeProject={activeProject}
            onOpenProjects={() => workspace.setProjectModalOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className={cn('flex-shrink-0 border-r border-border overflow-hidden flex flex-col transition-all', isFullscreenView ? 'w-14' : 'w-72')}>
            <Sidebar
                collections={workspace.collections}
                history={workspace.history}
                onSelectRequest={workspace.handleSelectRequest}
                onNewRequest={workspace.handleNewTab}
                onToggleCollection={workspace.handleToggleCollection}
                activeSection={workspace.sidebarSection}
                onSectionChange={workspace.setSidebarSection}
                onOpenProjects={() => workspace.setProjectModalOpen(true)}
                activeProjectName={activeProject?.name}
                onEditEnvironment={(envName) => {
                  const env = workspace.environments.find((e) => e.name === envName)
                  if (env) workspace.setEditingEnvironment(env)
                }}
            />
          </div>

          {isFullscreenView ? (
              <div className="flex-1 overflow-hidden flex flex-col">
                {workspace.sidebarSection === 'flows' && (
                    <FlowsPanel flows={sync.flows} onUpdateFlow={sync.updateFlow} onCreateFlow={(name) => sync.createFlow(name, sync.activeProjectId ?? undefined)} />
                )}
                {workspace.sidebarSection === 'specs' && <SpecsPanel specs={sync.specs} />}
              </div>
          ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                <TabBar
                    tabs={workspace.tabs}
                    activeTabId={workspace.activeTabId}
                    onTabSelect={workspace.setActiveTabId}
                    onTabClose={workspace.handleCloseTab}
                    onNewTab={workspace.handleNewTab}
                />

                {workspace.activeTab && (
                    <UrlBar
                        method={workspace.activeTab.method}
                        url={workspace.activeTab.url}
                        isLoading={workspace.loadingTabs.has(workspace.activeTabId)}
                        onMethodChange={(m) => workspace.updateActiveTab({ method: m })}
                        onUrlChange={(u) => workspace.updateActiveTab({ url: u })}
                        onSend={workspace.handleSend}
                        onSave={() => workspace.addLog('log', `Saved: ${workspace.activeTab.name || workspace.activeTab.url}`)}
                    />
                )}

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <div className="flex-shrink-0 border-b border-border" style={{ height: '42%', minHeight: 170 }}>
                    {workspace.activeTab && (
                        <RequestPanel
                            headers={workspace.activeTab.headers}
                            params={workspace.activeTab.params}
                            body={workspace.activeTab.body}
                            bodyType={workspace.activeTab.bodyType}
                            activeTab={workspace.activeTab.activeTab}
                            onTabChange={(tab) => workspace.updateActiveTab({ activeTab: tab })}
                            onHeadersChange={(headers) => workspace.updateActiveTab({ headers })}
                            onParamsChange={(params) => workspace.updateActiveTab({ params })}
                            onBodyChange={(body) => workspace.updateActiveTab({ body })}
                            onBodyTypeChange={(bodyType) => workspace.updateActiveTab({ bodyType })}
                        />
                    )}
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <ResponsePanel response={workspace.responses[workspace.activeTabId] ?? null} isLoading={workspace.loadingTabs.has(workspace.activeTabId)} />
                  </div>
                </div>

                <ConsolePanel
                    logs={workspace.logs}
                    onClear={() => workspace.setLogs([])}
                    isMinimized={workspace.consoleMinimized}
                    onToggleMinimize={() => workspace.setConsoleMinimized(!workspace.consoleMinimized)}
                />
              </div>
          )}
        </div>

        {workspace.projectModalOpen && (
            <ProjectModal
                projects={sync.projects} activeProjectId={sync.activeProjectId} self={sync.self}
                onCreateProject={sync.createProject} onJoinProject={sync.joinProject}
                onSelectProject={(id) => sync.setActiveProjectId(id)} onClose={() => workspace.setProjectModalOpen(false)}
            />
        )}

        {workspace.editingEnvironment && (
            <EnvironmentEditor
                environment={workspace.editingEnvironment}
                onEnvironmentChange={(updatedEnv) => {
                  workspace.setEnvironments(workspace.environments.map((e) => e.id === updatedEnv.id ? updatedEnv : e))
                  workspace.setEditingEnvironment(null)
                }}
                onClose={() => workspace.setEditingEnvironment(null)}
            />
        )}
      </div>
  )
}