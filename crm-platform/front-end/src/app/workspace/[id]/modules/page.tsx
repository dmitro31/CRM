'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import { AiFormGenerator } from '@/components/ai-form-generator'
import { Button } from '@/shared/UI/Button'
import { Input } from '@/shared/UI/Input'
import { Card } from '@/shared/UI/Card'
import { PageHeader } from '@/shared/UI/PageHeader'
import { EmptyState } from '@/shared/UI/EmptyState'
import * as metadataApi from '@/lib/metadata-api'
import {
  createModuleSchema,
  type CreateModuleFormData,
} from '@/lib/validation/metadata-schemas'

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
      void queryClient.invalidateQueries({
        queryKey: ['modules', workspaceId],
      })
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined

      setServerError(message ?? 'Не вдалося створити модуль')
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-6">
        <AiFormGenerator
          workspaceId={workspaceId}
          onCreated={() =>
            void queryClient.invalidateQueries({
              queryKey: ['modules', workspaceId],
            })
          }
        />
      </div>

      <PageHeader
        title="Модулі"
        actions={
          <Button
            size="sm"
            onClick={() => setShowForm(v => !v)}
            className="whitespace-nowrap"
          >
            + Створити модуль
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
          <Card className="space-y-3">
            <Input
              placeholder="Назва модуля (наприклад Клієнти)"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              placeholder="Опис (необов'язково)"
              {...register('description')}
            />

            {serverError && (
              <p className="text-[12px] text-[#B3261E]">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Створення...' : 'Створити'}
            </Button>
          </Card>
        </form>
      )}

      {isLoading && (
        <p className="text-[13px] text-[#6C716A]">
          Завантаження...
        </p>
      )}

      <div className="space-y-2">
        {modules.map(module => (
          <Link
            key={module.id}
            href={`/workspace/${workspaceId}/modules/${module.id}`}
            className="block"
          >
            <Card hoverable>
              <div className="break-words text-[14px] font-medium text-[#171A18]">
                {module.name}
              </div>

              {module.description && (
                <div className="mt-0.5 break-words text-[12.5px] text-[#6C716A]">
                  {module.description}
                </div>
              )}
            </Card>
          </Link>
        ))}

        {!isLoading && modules.length === 0 && (
          <EmptyState title="Ще немає жодного модуля." />
        )}
      </div>
    </div>
  )
}