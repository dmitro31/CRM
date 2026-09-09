'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import { WorkflowBuilder } from '@/components/workflow-builder'
import { AiWorkflowGenerator } from '@/components/ai-workflow-generator'
import { Button } from '@/shared/UI/Button'
import { Card } from '@/shared/UI/Card'
import { PageHeader } from '@/shared/UI/PageHeader'
import { EmptyState } from '@/shared/UI/EmptyState'
import * as workflowApi from '@/lib/workflow-api'
import * as metadataApi from '@/lib/metadata-api'
import type { WorkflowDraft } from '@/types/workflow'

const EMPTY_DRAFT: WorkflowDraft = {
  name: '',
  trigger: { event: 'RECORD_CREATED' },
  conditions: [],
  actions: [],
}

export default function WorkflowsPage() {
  return (
    <ProtectedRoute>
      <WorkflowsContent />
    </ProtectedRoute>
  )
}

function WorkflowsContent() {
  const { id: workspaceId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const [showBuilder, setShowBuilder] = useState(false)
  const [draft, setDraft] = useState<WorkflowDraft>(EMPTY_DRAFT)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows', workspaceId],
    queryFn: () => workflowApi.getWorkflows(workspaceId),
  })

  const { data: modulesRaw = [] } = useQuery({
    queryKey: ['modules', workspaceId],
    queryFn: () => metadataApi.getModules(workspaceId),
  })

  const { data: modulesWithFields = [] } = useQuery({
    queryKey: ['modules-with-fields', workspaceId, modulesRaw.map(m => m.id)],
    queryFn: async () => {
      const results = await Promise.all(
        modulesRaw.map(async m => ({ ...m, fields: await metadataApi.getFields(m.id) })),
      )
      return results
    },
    enabled: modulesRaw.length > 0,
  })

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] })

  const handleSave = async () => {
    setServerError(null)

    if (!draft.name.trim()) {
      setServerError('Введіть назву')
      return
    }
    if (draft.actions.length === 0) {
      setServerError('Додайте хоча б одну дію')
      return
    }

    setIsSaving(true)
    try {
      await workflowApi.createWorkflow(workspaceId, draft)
      setDraft(EMPTY_DRAFT)
      setShowBuilder(false)
      invalidate()
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setServerError(message ?? 'Не вдалося зберегти автоматизацію')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (workflowId: string, enabled: boolean) => {
    await workflowApi.updateWorkflow(workflowId, { enabled })
    invalidate()
  }

  const handleDelete = async (workflowId: string) => {
    if (!confirm('Видалити цю автоматизацію?')) return
    await workflowApi.deleteWorkflow(workflowId)
    invalidate()
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <PageHeader
        title="Автоматизація"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setDraft(EMPTY_DRAFT)
              setShowBuilder(v => !v)
            }}
          >
            + Нова автоматизація
          </Button>
        }
      />

      {showBuilder && (
        <Card className="mb-6">
          <AiWorkflowGenerator
            workspaceId={workspaceId}
            modules={modulesWithFields}
            onGenerated={setDraft}
          />

          <WorkflowBuilder modules={modulesWithFields} draft={draft} onChange={setDraft} />

          {serverError && <p className="mt-3 text-[12px] text-[#B3261E]">{serverError}</p>}

          <div className="mt-4 flex gap-2">
            <Button onClick={() => void handleSave()} disabled={isSaving} size="sm">
              {isSaving ? 'Збереження...' : 'Зберегти'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowBuilder(false)}>
              Скасувати
            </Button>
          </div>
        </Card>
      )}

      {isLoading && <p className="text-[13px] text-[#6C716A]">Завантаження...</p>}

      <div className="space-y-2">
        {workflows.map(workflow => (
          <Card key={workflow.id} className="flex items-center justify-between">
            <div>
              <div className="text-[13.5px] font-medium text-[#171A18]">{workflow.name}</div>
              <div className="text-[12px] text-[#6C716A]">
                {workflow.trigger.event} • {workflow.actions.length} дій
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[12.5px] text-[#3D423B]">
                <input
                  type="checkbox"
                  checked={workflow.enabled}
                  onChange={e => void handleToggle(workflow.id, e.target.checked)}
                />
                Активна
              </label>
              <button
                onClick={() => void handleDelete(workflow.id)}
                className="text-[12.5px] text-[#B3261E] hover:underline"
              >
                Видалити
              </button>
            </div>
          </Card>
        ))}

        {!isLoading && workflows.length === 0 && <EmptyState title="Ще немає жодної автоматизації." />}
      </div>
    </div>
  )
}