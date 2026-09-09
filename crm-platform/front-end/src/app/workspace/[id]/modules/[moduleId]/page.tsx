'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { ArrowRight } from 'lucide-react'

import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/shared/UI/Button'
import { Input } from '@/shared/UI/Input'
import { Select } from '@/shared/UI/Select'
import { Card } from '@/shared/UI/Card'
import { PageHeader } from '@/shared/UI/PageHeader'
import { EmptyState } from '@/shared/UI/EmptyState'
import * as metadataApi from '@/lib/metadata-api'
import {
    createFieldSchema,
    type CreateFieldFormData,
    FIELD_TYPE_LABELS,
} from '@/lib/validation/metadata-schemas'

export default function ModuleDetailPage() {
    return (
        <ProtectedRoute>
            <ModuleDetailContent />
        </ProtectedRoute>
    )
}

function ModuleDetailContent() {
    const { id: workspaceId, moduleId } = useParams<{ id: string; moduleId: string }>()
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null)

    const { data: module_ } = useQuery({
        queryKey: ['module', moduleId],
        queryFn: () => metadataApi.getModule(moduleId),
    })

    const { data: fields = [] } = useQuery({
        queryKey: ['fields', moduleId],
        queryFn: () => metadataApi.getFields(moduleId),
    })

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateFieldFormData>({
        resolver: zodResolver(createFieldSchema),
        defaultValues: { type: 'TEXT', required: false, unique: false },
    })

    const selectedType = watch('type')
    const needsOptions = selectedType === 'SELECT' || selectedType === 'MULTI_SELECT'

    const onSubmit = async (data: CreateFieldFormData) => {
        setServerError(null)
        try {
            const options = needsOptions
                ? (data.optionsRaw ?? '').split(',').map(s => s.trim()).filter(Boolean)
                : undefined

            await metadataApi.createField(moduleId, {
                name: data.name,
                type: data.type,
                required: data.required,
                unique: data.unique,
                options,
            })

            reset({ type: 'TEXT', required: false, unique: false })
            setShowForm(false)
            void queryClient.invalidateQueries({ queryKey: ['fields', moduleId] })
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? (err.response?.data as { message?: string })?.message
                    : undefined
            setServerError(message ?? 'Не вдалося створити поле')
        }
    }

    const handleDeleteField = async (fieldId: string) => {
        const comfirmed = window.confirm(
            'Видалити це поле? Дані цього поля в існуючих записах можуть залишитися в JSON записів.'
        )

        if (!comfirmed) return


        try {
            setDeletingFieldId(fieldId)
            setServerError(null)

            await metadataApi.deleteField(fieldId)

            await queryClient.invalidateQueries({
                queryKey: ['fields', moduleId],
            })
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? (err.response?.data as { message?: string })?.message
                    : undefined

            setServerError(message ?? 'Не вдалося видалити поле')
        } finally {
            setDeletingFieldId(null)
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-8 py-10">
            <Link
                href={`/workspace/${workspaceId}/modules/${moduleId}/records`}
                className="mb-6 inline-flex items-center gap-1 text-[13px] text-[#24493B] hover:underline"
            >
                Переглянути записи <ArrowRight size={13} />
            </Link>

            <h1 className="text-[20px] font-medium text-[#171A18]">{module_?.name}</h1>
            {module_?.description && (
                <p className="mt-1 text-[13px] text-[#6C716A]">{module_.description}</p>
            )}

            <PageHeader
                title=""
                actions={undefined}
            />
            <div className="mt-8 mb-4 flex items-center justify-between">
                <h2 className="text-[15px] font-medium text-[#171A18]">Поля</h2>
                <Button size="sm" onClick={() => setShowForm(v => !v)}>
                    + Додати поле
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
                    <Card className="space-y-3">
                        <Input placeholder="Назва поля" {...register('name')} error={errors.name?.message} />

                        <Select {...register('type')}>
                            {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </Select>

                        {needsOptions && (
                            <Input
                                placeholder="Варіанти через кому (наприклад: Новий, В роботі, Завершено)"
                                {...register('optionsRaw')}
                            />
                        )}

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-[13px] text-[#3D423B]">
                                <input type="checkbox" {...register('required')} />
                                Обов&apos;язкове
                            </label>
                            <label className="flex items-center gap-2 text-[13px] text-[#3D423B]">
                                <input type="checkbox" {...register('unique')} />
                                Унікальне
                            </label>
                        </div>

                        {serverError && <p className="text-[12px] text-[#B3261E]">{serverError}</p>}

                        <Button type="submit" disabled={isSubmitting} size="sm">
                            {isSubmitting ? 'Створення...' : 'Додати поле'}
                        </Button>
                    </Card>
                </form>
            )}

            <div className="space-y-2">
                {fields.map(field => (
                    <Card
                        key={field.id}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <div className="text-[13.5px] font-medium text-[#171A18]">
                                {field.name}

                                {field.required && (
                                    <span className="ml-1 text-[#B3261E]">*</span>
                                )}
                            </div>

                            <div className="mt-0.5 text-[12px] text-[#6C716A]">
                                {FIELD_TYPE_LABELS[field.type]}

                                {field.options &&
                                    ` — ${field.options.join(', ')}`}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <code className="font-mono text-[11px] text-[#8B9088]">
                                {field.key}
                            </code>

                            <button
                                type="button"
                                onClick={() => handleDeleteField(field.id)}
                                disabled={deletingFieldId === field.id}
                                className="rounded-md px-2 py-1 text-[12px] text-[#B3261E] transition hover:bg-red-50 disabled:opacity-50"
                            >
                                {deletingFieldId === field.id
                                    ? 'Видалення...'
                                    : 'Видалити'}
                            </button>
                        </div>
                    </Card>
                ))}

                {fields.length === 0 && <EmptyState title="Ще немає жодного поля." />}
            </div>
        </div>
    )
}