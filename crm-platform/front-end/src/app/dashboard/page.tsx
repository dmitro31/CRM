'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/providers/auth-provider'
import { useWorkspace } from '@/providers/workspace-provider'
import * as workspaceApi from '@/lib/workspace-api'
import { createWorkspaceSchema, type CreateWorkspaceFormData } from '@/lib/validation/workspace-schemas'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, logout } = useAuth()
  const { workspaces, currentWorkspace, setCurrentWorkspaceId, refetchWorkspaces } = useWorkspace()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
  })

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    const workspace = await workspaceApi.createWorkspace(data)
    refetchWorkspaces()
    setCurrentWorkspaceId(workspace.id)
    reset()
    setShowCreateForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Привіт, {user?.firstName}!</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={() => void logout()}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Вийти
          </button>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Мої Workspace</h2>
          <button
            onClick={() => setShowCreateForm(v => !v)}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            + Створити
          </button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-6 space-y-3 rounded-lg border bg-white p-4"
          >
            <div>
              <input
                placeholder="Назва workspace"
                {...register('name')}
                className="w-full rounded border px-3 py-2"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Створення...' : 'Створити workspace'}
            </button>
          </form>
        )}

        <div className="space-y-2">
          {workspaces.map(workspace => (
            <button
              key={workspace.id}
              onClick={() => setCurrentWorkspaceId(workspace.id)}
              className={`block w-full rounded-lg border p-4 text-left transition ${
                currentWorkspace?.id === workspace.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{workspace.name}</div>
              <div className="text-sm text-gray-500">/{workspace.slug}</div>
            </button>
          ))}

          {workspaces.length === 0 && (
            <p className="text-gray-500">У тебе ще немає жодного workspace.</p>
          )}
        </div>

        {currentWorkspace && (
          <div className="mt-8 rounded-lg border bg-white p-4">
            <h3 className="mb-2 font-medium">Активний workspace: {currentWorkspace.name}</h3>
            <a
              href={`/workspace/${currentWorkspace.id}`}
              className="text-blue-600 hover:underline"
            >
              Відкрити →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}