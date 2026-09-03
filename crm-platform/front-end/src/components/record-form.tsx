'use client'

import { useState } from 'react'
import { AxiosError } from 'axios'

import type { Field } from '@/types/metadata'
import { DynamicFieldInput } from './dynamic-field-input'

interface RecordFormProps {
  fields: Field[]
  initialData?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

export function RecordForm({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel,
}: RecordFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    for (const field of fields) {
      const value = formData[field.key]
      const isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)

      if (field.required && isEmpty) {
        nextErrors[field.key] = "Обов'язкове поле"
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setServerError(message ?? 'Не вдалося зберегти запис')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-4">
      {fields
        .filter(f => f.isActive)
        .map(field => (
          <DynamicFieldInput
            key={field.id}
            field={field}
            value={formData[field.key]}
            onChange={value => handleChange(field.key, value)}
            error={errors[field.key]}
          />
        ))}

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Збереження...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border px-4 py-2 hover:bg-gray-50"
        >
          Скасувати
        </button>
      </div>
    </form>
  )
}