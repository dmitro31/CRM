'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import * as workspaceApi from '@/lib/workspace-api'
import type { Workspace } from '@/types/workspace'
import { useAuth } from './auth-provider'

interface WorkspaceContextValue {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  setCurrentWorkspaceId: (id: string) => void
  isLoading: boolean
  refetchWorkspaces: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

const STORAGE_KEY = 'currentWorkspaceId'

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null)

  const { data: workspaces = [], isLoading, refetch } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getWorkspaces,
    enabled: !!user,
  })

  useEffect(() => {
    if (workspaces.length === 0) return

    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    const validStored = stored && workspaces.some(w => w.id === stored)

    if (validStored) {
      setCurrentWorkspaceIdState(stored)
    } else {
      setCurrentWorkspaceIdState(workspaces[0].id)
    }
  }, [workspaces])

  const setCurrentWorkspaceId = (id: string) => {
    setCurrentWorkspaceIdState(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id)
    }
  }

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) ?? null

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspaceId,
        isLoading,
        refetchWorkspaces: () => void refetch(),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}