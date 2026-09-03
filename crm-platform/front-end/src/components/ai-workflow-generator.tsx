'use client'

import { useState } from 'react'
import { AxiosError } from 'axios'

import * as aiApi from '@/lib/ai-api'
import type { CrmModule } from '@/types/metadata'
import type { WorkflowDraft } from '@/types/workflow'

interface AiWorkflowGeneratorProps {
  workspaceId: string
  modules: CrmModule[]
  onGenerated: (draft: WorkflowDraft) => void
}

export function AiWorkflowGenerator({
  workspaceId,
  modules,
  onGenerated,
}: AiWorkflowGeneratorProps) {
  const [moduleId, setModuleId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!moduleId) {
      setError('Оберіть модуль')
      return
    }

    setError(null)
    setIsGenerating(true)
    try {
      const draft = await aiApi.generateWorkflow(workspaceId, moduleId, prompt)
      onGenerated(draft)
      setPrompt('')
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setError(message ?? 'Не вдалося згенерувати автоматизацію')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mb-6 rounded-lg border bg-purple-50 p-4">
      <h3 className="mb-2 font-medium">✨ Згенерувати через AI</h3>

      <div className="mb-2">
        <select
          value={moduleId}
          onChange={e => setModuleId(e.target.value)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="">Оберіть модуль</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Наприклад: коли статус стає Завершено, надішли сповіщення"
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
    </div>
  )
}