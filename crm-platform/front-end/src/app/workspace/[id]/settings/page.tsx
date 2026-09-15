'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/providers/auth-provider'
import { useWorkspace } from '@/providers/workspace-provider'
import { Button } from '@/shared/UI/Button'
import { Input } from '@/shared/UI/Input'
import { Select } from '@/shared/UI/Select'
import { Card } from '@/shared/UI/Card'
import { PageHeader } from '@/shared/UI/PageHeader'
import * as workspaceApi from '@/lib/workspace-api'
import {
    createWorkspaceSchema,
    type CreateWorkspaceFormData,
} from '@/lib/validation/workspace-schemas'

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    )
}

function SettingsContent() {
    const { id: workspaceId } = useParams<{ id: string }>()
    const { user } = useAuth()
    const { refetchWorkspaces } = useWorkspace()
    const router = useRouter()
    const queryClient = useQueryClient()

    const [renameError, setRenameError] = useState<string | null>(null)
    const [transferError, setTransferError] = useState<string | null>(null)
    const [selectedNewOwner, setSelectedNewOwner] = useState('')

    const { data: workspace } = useQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: () => workspaceApi.getWorkspace(workspaceId),
    })

    const isOwner = workspace?.ownerId === user?.id

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateWorkspaceFormData>({
        resolver: zodResolver(createWorkspaceSchema),
        values: workspace ? { name: workspace.name, description: workspace.description ?? undefined } : undefined,
    })

    const onRename = async (data: CreateWorkspaceFormData) => {
        setRenameError(null)
        try {
            await workspaceApi.updateWorkspace(workspaceId, data)
            void queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
            refetchWorkspaces()
        } catch {
            setRenameError('Не вдалося оновити workspace')
        }
    }

    const handleTransfer = async () => {
        if (!selectedNewOwner) return
        setTransferError(null)
        try {
            await workspaceApi.transferOwnership(workspaceId, selectedNewOwner)
            void queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
            setSelectedNewOwner('')
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? (err.response?.data as { message?: string })?.message
                    : undefined
            setTransferError(message ?? 'Не вдалося передати власність')
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Видалити workspace "${workspace?.name}"? Цю дію не можна скасувати.`)) return
        await workspaceApi.deleteWorkspace(workspaceId)
        refetchWorkspaces()
        router.push('/dashboard')
    }

    const otherMembers = workspace?.members?.filter(m => m.userId !== workspace.ownerId) ?? []

    return (
        <div className="mx-auto max-w-2xl px-8 py-10">
            <PageHeader title="Налаштування workspace" subtitle={workspace?.name} />

            <div className="mb-6">
                <h2 className="mb-3 text-[15px] font-medium text-[#171A18]">Загальні</h2>
                <form onSubmit={handleSubmit(onRename)}>
                    <Card className="space-y-3">
                        <Input placeholder="Назва" {...register('name')} error={errors.name?.message} disabled={!isOwner} />
                        <Input placeholder="Опис" {...register('description')} disabled={!isOwner} />

                        {renameError && <p className="text-[12px] text-[#B3261E]">{renameError}</p>}

                        {isOwner && (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Збереження...' : 'Зберегти'}
                            </Button>
                        )}
                    </Card>
                </form>
            </div>

            {isOwner && otherMembers.length > 0 && (
                <div className="mb-6">
                    <h2 className="mb-3 text-[15px] font-medium text-[#171A18]">Передати власність</h2>
                    <Card className="space-y-3">
                        <p className="text-[12.5px] text-[#6C716A]">
                            Новий власник отримає повний контроль над workspace, а ти станеш
                            звичайним учасником.
                        </p>
                        <Select value={selectedNewOwner} onChange={e => setSelectedNewOwner(e.target.value)}>
                            <option value="">Оберіть учасника</option>
                            {otherMembers.map(m => (
                                <option key={m.userId} value={m.userId}>
                                    {m.user.firstName} {m.user.lastName} ({m.user.email})
                                </option>
                            ))}
                        </Select>

                        {transferError && <p className="text-[12px] text-[#B3261E]">{transferError}</p>}

                        <Button
                            disabled={!selectedNewOwner}
                            onClick={() => void handleTransfer()}
                        >
                            Передати власність
                        </Button>
                    </Card>
                </div>
            )}

            {isOwner && (
                <div>
                    <h2 className="mb-3 text-[15px] font-medium text-[#B3261E]">Небезпечна зона</h2>
                    <Card className="border-[#F3C6C1]">
                        <p className="mb-3 text-[12.5px] text-[#6C716A]">
                            Видалення workspace незворотне. Всі модулі, записи, файли й автоматизація
                            будуть втрачені назавжди.
                        </p>
                        <Button  onClick={() => void handleDelete()}>
                            Видалити workspace
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    )
}