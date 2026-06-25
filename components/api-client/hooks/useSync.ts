'use client'

import { useState, useCallback } from 'react'
import type { Project, ProjectMember, Flow, Spec } from '../types'

function generateId() { return Math.random().toString(36).slice(2, 11) }

function getOrCreateSelf(): ProjectMember {
  if (typeof window === 'undefined') return {
    avatar: "",
    projectId: "",
    id: 'ssr', name: 'Guest', color: 'var(--primary)', online: true, lastSeen: '' }
  const stored = sessionStorage.getItem('flowapi_self')
  if (stored) return JSON.parse(stored)

  const newSelf = { id: `u-${generateId()}`, name: 'Developer', color: 'var(--primary)', online: true, lastSeen: '' }
  sessionStorage.setItem('flowapi_self', JSON.stringify(newSelf))
  return <ProjectMember>newSelf
}

export function useSync() {
  const [self] = useState<ProjectMember>(() => getOrCreateSelf())
  const [projects, setProjects] = useState<Project[]>([])
  const [members] = useState<ProjectMember[]>([]) // Add members when backend is ready
  const [flows, setFlows] = useState<Flow[]>([])
  const [specs, setSpecs] = useState<Spec[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const createProject = useCallback((name: string, description: string): Project => {
    const project: Project = {
      id: generateId(), name, description, inviteCode: generateId(),
      createdAt: new Date().toISOString(), ownerId: self.id, memberIds: [self.id], collectionIds: [],
    }
    setProjects((p) => [...p, project])
    setActiveProjectId(project.id)
    return project
  }, [self.id])

  const joinProject = useCallback(() => null, [])
  const updateFlow = useCallback((flow: Flow) => setFlows((f) => f.map((x) => x.id === flow.id ? flow : x)), [])
  const createFlow = useCallback((name: string, projectId?: string) => {
    const flow: Flow = { id: generateId(), name, projectId, nodes: [], edges: [] }
    setFlows((f) => [...f, flow])
    return flow
  }, [])

  return { self, members, projects, activeProjectId, setActiveProjectId, flows, specs, createProject, joinProject, updateFlow, createFlow }
}