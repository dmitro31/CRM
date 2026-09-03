'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import Link from 'next/link'

import { ProtectedRoute } from '@/components/protected-route'
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
                ? (data.optionsRaw ?? '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
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

    return (
        <div className="mx-auto max-w-3xl p-8">
            <div>
                <Link
                    href={`/workspace/${workspaceId}/modules/${moduleId}/records`}
                    className="mb-6 inline-block text-blue-600 hover:underline"
                >
                    Переглянути записи →
                </Link>
            </div>
            <h1 className="mb-1 text-2xl font-semibold">{module_?.name}</h1>
            {module_?.description && (
                <p className="mb-6 text-gray-500">{module_.description}</p>
            )}

            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Поля</h2>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                    + Додати поле
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mb-6 space-y-3 rounded-lg border bg-white p-4"
                >
                    <div>
                        <input
                            placeholder="Назва поля"
                            {...register('name')}
                            className="w-full rounded border px-3 py-2"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <select {...register('type')} className="w-full rounded border px-3 py-2">
                            {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {needsOptions && (
                        <div>
                            <input
                                placeholder="Варіанти через кому (наприклад: Новий, В роботі, Завершено)"
                                {...register('optionsRaw')}
                                className="w-full rounded border px-3 py-2"
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" {...register('required')} />
                            Обов&apos;язкове
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" {...register('unique')} />
                            Унікальне
                        </label>
                    </div>

                    {serverError && <p className="text-sm text-red-600">{serverError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Створення...' : 'Додати поле'}
                    </button>
                </form>
            )}

            <div className="space-y-2">
                {fields.map(field => (
                    <div
                        key={field.id}
                        className="flex items-center justify-between rounded border bg-white p-3"
                    >
                        <div>
                            <div className="font-medium">
                                {field.name}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </div>
                            <div className="text-sm text-gray-500">
                                {FIELD_TYPE_LABELS[field.type]}
                                {field.options && ` — ${field.options.join(', ')}`}
                            </div>
                        </div>
                        <code className="text-xs text-gray-400">{field.key}</code>
                    </div>
                ))}

                {fields.length === 0 && (
                    <p className="text-gray-500">Ще немає жодного поля.</p>
                )}
            </div>
        </div>
    )
}