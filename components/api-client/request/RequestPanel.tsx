'use client'

import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { KeyValueTable } from '@/components/web/KeyValueTable'
import { AuthTab } from '@/components/api-client/request/tabs/auth-tab'
import { BodyTab } from '@/components/api-client/request/tabs/body-tab'

const PANEL_TABS = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'auth', label: 'Authorization' },
  { id: 'body', label: 'Body' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'settings', label: 'Settings' },
] as const

export function RequestPanel() {
  const tabs = useWorkspaceStore((state) => state.tabs)
  const activeTabId = useWorkspaceStore((state) => state.activeTabId)
  const updateActiveTab = useWorkspaceStore((state) => state.updateActiveTab)

  const request = tabs.find(t => t.id === activeTabId)
  if (!request) return null

  return (
      <div className="flex flex-col h-full bg-background min-h-0">
        <div className="flex items-center px-3 border-b border-border bg-card shrink-0 overflow-x-auto no-scrollbar">
          {PANEL_TABS.map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => updateActiveTab({ activeTab: tab.id })}
                  className={cn(
                      'relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap shrink-0',
                      request.activeTab === tab.id
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                  )}
              >
                {tab.label}
              </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {request.activeTab === 'params' && (
              <KeyValueTable
                  items={request.params}
                  onChange={(params) => updateActiveTab({ params })}
                  placeholderKey="Parameter"
              />
          )}
          {request.activeTab === 'headers' && (
              <KeyValueTable
                  items={request.headers}
                  onChange={(headers) => updateActiveTab({ headers })}
              />
          )}
          {request.activeTab === 'auth' && <AuthTab />}
          {request.activeTab === 'body' && <BodyTab />}
        </div>
      </div>
  )
}