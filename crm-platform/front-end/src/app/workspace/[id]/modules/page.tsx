'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import * as metadataApi from '@/lib/metadata-api'
import { AiFormGenerator } from '@/components/ai-form-generator'
import { createModuleSchema, type CreateModuleFormData } from '@/lib/validation/metadata-schemas'

export default function ModulesPage() {
  return (
    <ProtectedRoute>
      <ModulesContent />
    </ProtectedRoute>
  )
}

function ModulesContent() {
  const { id: workspaceId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['modules', workspaceId],
    queryFn: () => metadataApi.getModules(workspaceId),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateModuleFormData>({
    resolver: zodResolver(createModuleSchema),
  })

  const onSubmit = async (data: CreateModuleFormData) => {
    setServerError(null)
    try {
      await metadataApi.createModule(workspaceId, data)
      reset()
      setShowForm(false)
      void queryClient.invalidateQueries({ queryKey: ['modules', workspaceId] })
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setServerError(message ?? 'Не вдалося створити модуль')
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6">
        <AiFormGenerator
          workspaceId={workspaceId}
          onCreated={() => void queryClient.invalidateQueries({ queryKey: ['modules', workspaceId] })}
        />
      </div>
      <div className="mb-6 flex items-center justify-between">

        <h1 className="text-2xl font-semibold">Модулі</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + Створити модуль
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 space-y-3 rounded-lg border bg-white p-4"
        >
          <div>
            <input
              placeholder="Назва модуля (наприклад Клієнти)"
              {...register('name')}
              className="w-full rounded border px-3 py-2"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              placeholder="Опис (необов'язково)"
              {...register('description')}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Створення...' : 'Створити'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-gray-500">Завантаження...</p>}

      <div className="space-y-2">
        {modules.map(module => (
          <Link
            key={module.id}
            href={`/workspace/${workspaceId}/modules/${module.id}`}
            className="block rounded-lg border bg-white p-4 transition hover:border-gray-300"
          >
            <div className="font-medium">{module.name}</div>
            {module.description && (
              <div className="text-sm text-gray-500">{module.description}</div>
            )}
          </Link>
        ))}

        {!isLoading && modules.length === 0 && (
          <p className="text-gray-500">Ще немає жодного модуля.</p>
        )}
      </div>
    </div>
  )
}