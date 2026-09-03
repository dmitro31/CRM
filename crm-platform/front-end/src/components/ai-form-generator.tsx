'use client'

import { useState } from 'react'
import { AxiosError } from 'axios'

import * as aiApi from '@/lib/ai-api'
import { FIELD_TYPE_LABELS } from '@/lib/validation/metadata-schemas'
import type { FormDraft } from '@/types/ai'

interface AiFormGeneratorProps {
  workspaceId: string
  onCreated: () => void
}

export function AiFormGenerator({ workspaceId, onCreated }: AiFormGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState<FormDraft | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setError(null)
    setDraft(null)
    setIsGenerating(true)
    try {
      const result = await aiApi.generateForm(workspaceId, prompt)
      setDraft(result)
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setError(message ?? 'Не вдалося згенерувати структуру')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConfirm = async () => {
    if (!draft) return
    setIsCreating(true)
    setError(null)
    try {
      await aiApi.createFormFromDraft(workspaceId, draft)
      setDraft(null)
      setPrompt('')
      onCreated()
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setError(message ?? 'Не вдалося створити модуль')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="rounded-lg border bg-purple-50 p-4">
      <h3 className="mb-2 font-medium">✨ Створити модуль через AI</h3>
      <p className="mb-3 text-sm text-gray-600">
        Опиши, що тобі треба — AI підбере поля й типи.
      </p>

      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Наприклад: облік автомобілів клієнтів автосервісу"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          onClick={() => void handleGenerate()}
          disabled={isGenerating || prompt.trim().length < 5}
          className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isGenerating ? 'Генерація...' : 'Згенерувати'}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {draft && (
        <div className="mt-4 rounded border bg-white p-4">
          <div className="mb-2">
            <label className="mb-1 block text-sm font-medium">Назва модуля</label>
            <input
              value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value })}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="mb-4 space-y-1">
            <p className="text-sm font-medium">Поля:</p>
            {draft.fields.map((field, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <input
                  value={field.name}
                  onChange={e => {
                    const next = [...draft.fields]
                    next[index] = { ...field, name: e.target.value }
                    setDraft({ ...draft, fields: next })
                  }}
                  className="flex-1 rounded border px-2 py-1"
                />
                <span className="w-32 text-gray-500">
                  {FIELD_TYPE_LABELS[field.type]}
                </span>
                {field.options && (
                  <span className="text-xs text-gray-400">
                    {field.options.join(', ')}
                  </span>
                )}
                <button
                  onClick={() =>
                    setDraft({
                      ...draft,
                      fields: draft.fields.filter((_, i) => i !== index),
                    })
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => void handleConfirm()}
              disabled={isCreating}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isCreating ? 'Створення...' : 'Створити модуль'}
            </button>
            <button
              onClick={() => setDraft(null)}
              className="rounded border px-4 py-2 hover:bg-gray-50"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  )
}