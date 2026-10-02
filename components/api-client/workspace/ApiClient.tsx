'use client'

import {TopNav} from '@/components/api-client/layout/TopNav'
import {Sidebar} from '@/components/api-client/layout/Sidebar'
import {TabBar} from '@/components/api-client/layout/TabBar'
import {UrlBar} from '@/components/api-client/request/UrlBar'
import {RequestPanel} from '@/components/api-client/request/RequestPanel'
import {ResponsePanel} from '@/components/api-client/response/ResponsePanel'
import {ConsolePanel} from '@/components/api-client/response/ConsolePanel'
import {FlowsPanel} from '@/components/api-client/workspace/FlowsPanel'
import {SpecsPanel} from '@/components/api-client/request/SpecsPanel'
import {ProjectModal} from '@/components/api-client/workspace/ProjectModal'
import {EnvironmentEditor} from '@/components/api-client/workspace/EnvironmentEditor'
import {ProfileSettings} from '@/components/api-client/workspace/ProfileSettings'
import {useWorkspaceStore} from '@/store/useWorkspaceStore'
import {cn} from '@/lib/utils'
import {SyncProvider, useSync} from '@/hooks/useSync'
import {AuthScreen} from '@/components/api-client/auth/AuthScreen'
import {Loader2} from 'lucide-react'

export function ApiClient() {
    return <SyncProvider><ApiClientContent/></SyncProvider>
}

function ApiClientContent() {
    const sync = useSync()
    // We only need the sidebarSection to determine the layout structure
    const sidebarSection = useWorkspaceStore((state) => state.sidebarSection)
    const isFullscreenView = sidebarSection === 'flows' || sidebarSection === 'specs'

    if (sync.authLoading) return <div className="grid h-screen place-items-center bg-background"><Loader2 className="size-6 animate-spin text-primary"/></div>
    if (!sync.user) return <AuthScreen/>

    return (
        <div
            className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
            <TopNav/>

            <div className="flex flex-1 overflow-hidden">
                <div
                    className={cn('shrink-0 border-r border-border overflow-hidden flex flex-col transition-all', isFullscreenView ? 'w-14' : 'w-72')}>
                    <Sidebar/>
                </div>

                {isFullscreenView ? (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {sidebarSection === 'flows' && <FlowsPanel/>}
                        {sidebarSection === 'specs' && <SpecsPanel/>}
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <TabBar/>
                        <UrlBar/>

                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            {/* Request area */}
                            <div className="shrink-0 border-b border-border" style={{height: '42%', minHeight: 170}}>
                                <RequestPanel/>
                            </div>

                            {/* Response area */}
                            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                                <ResponsePanel/>
                            </div>
                        </div>

                        <ConsolePanel/>
                    </div>
                )}
            </div>

            {/* Modals and Overlays */}
            <ProjectModal/>
            <EnvironmentEditor/>
            <ProfileSettings/>
        </div>
    )
}
