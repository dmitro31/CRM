'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { AiWorkflowGenerator } from '@/components/ai-workflow-generator'

import { ProtectedRoute } from '@/components/protected-route'
import { WorkflowBuilder } from '@/components/workflow-builder'
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
                modulesRaw.map(async m => ({
                    ...m,
                    fields: await metadataApi.getFields(m.id),
                })),
            )
            return results
        },
        enabled: modulesRaw.length > 0,
    })

    const invalidate = () => {
        void queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] })
    }

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
        <div className="mx-auto max-w-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Автоматизація</h1>
                <button
                    onClick={() => {
                        setDraft(EMPTY_DRAFT)
                        setShowBuilder(v => !v)
                    }}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                    + Нова автоматизація
                </button>
            </div>

            <AiWorkflowGenerator
                workspaceId={workspaceId}
                modules={modulesWithFields}
                onGenerated={setDraft}
            />

            {showBuilder && (
                <div className="mb-6 rounded-lg border bg-white p-4">
                    <WorkflowBuilder
                        modules={modulesWithFields}
                        draft={draft}
                        onChange={setDraft}
                    />

                    {serverError && (
                        <p className="mt-3 text-sm text-red-600">{serverError}</p>
                    )}

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => void handleSave()}
                            disabled={isSaving}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Збереження...' : 'Зберегти'}
                        </button>
                        <button
                            onClick={() => setShowBuilder(false)}
                            className="rounded border px-4 py-2 hover:bg-gray-50"
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            )}

            {isLoading && <p className="text-gray-500">Завантаження...</p>}

            <div className="space-y-2">
                {workflows.map(workflow => (
                    <div
                        key={workflow.id}
                        className="flex items-center justify-between rounded border bg-white p-4"
                    >
                        <div>
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm text-gray-500">
                                {workflow.trigger.event} • {workflow.actions.length} дій
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-sm">
                                <input
                                    type="checkbox"
                                    checked={workflow.enabled}
                                    onChange={e => void handleToggle(workflow.id, e.target.checked)}
                                />
                                Активна
                            </label>
                            <button
                                onClick={() => void handleDelete(workflow.id)}
                                className="text-sm text-red-600 hover:underline"
                            >
                                Видалити
                            </button>
                        </div>
                    </div>
                ))}

                {!isLoading && workflows.length === 0 && (
                    <p className="text-gray-500">Ще немає жодної автоматизації.</p>
                )}
            </div>
        </div>
    )
}