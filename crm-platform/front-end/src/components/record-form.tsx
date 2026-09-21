'use client'

import { useState, useEffect, useRef } from 'react'
import { AxiosError } from 'axios'

import type { Field } from '@/types/metadata'
import { DynamicFieldInput } from './dynamic-field-input'

interface RecordFormProps {
  fields: Field[]
  workspaceId: string
  initialData?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

export function RecordForm({
  fields,
  workspaceId,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel,
}: RecordFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

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
      if (isMounted.current) {
        setFormData(initialData)
      }
    } catch (err) {
      if (!isMounted.current) return

      let message: string | undefined

      if (err instanceof AxiosError) {
        const responseData = err.response?.data as { message?: string | string[] } | undefined
        if (Array.isArray(responseData?.message)) {
          message = responseData.message.join(', ')
        } else if (typeof responseData?.message === 'string') {
          message = responseData.message
        }
      }

      setServerError(message ?? 'Не вдалося зберегти запис')
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-[#DFE3DC] bg-white p-4">
      {fields
        .filter(f => f.isActive)
        .map(field => (
          <DynamicFieldInput
            key={field.id}
            field={field}
            workspaceId={workspaceId}
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
          className="rounded-md bg-[#24493B] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1B392E] disabled:opacity-50"
        >
          {isSubmitting ? 'Збереження...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-[#DFE3DC] px-4 py-2 text-[13px] transition-colors hover:bg-[#F6F7F4] disabled:opacity-50"
        >
          Скасувати
        </button>
      </div>
    </form>
  )
}