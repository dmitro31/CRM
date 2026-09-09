'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Select } from '@/shared/UI/Select'
import { Card } from '@/shared/UI/Card'
import { EmptyState } from '@/shared/UI/EmptyState'
import * as dashboardApi from '@/lib/dashboard-api'
import type { CrmModule } from '@/types/metadata'

export function PipelineWidget({ modules }: { modules: CrmModule[] }) {
  const modulesWithSelect = modules.filter(m =>
    m.fields?.some(f => f.type === 'SELECT' && f.options && f.options.length > 0),
  )

  const [moduleId, setModuleId] = useState(modulesWithSelect[0]?.id ?? '')

  const selectedModule = modules.find(m => m.id === moduleId)
  const selectFields = selectedModule?.fields?.filter(
    f => f.type === 'SELECT' && f.options && f.options.length > 0,
  ) ?? []

  const [fieldKey, setFieldKey] = useState(selectFields[0]?.key ?? '')

  const activeField = selectFields.find(f => f.key === fieldKey) ?? selectFields[0]

  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['pipeline', moduleId, activeField?.key],
    queryFn: () =>
      dashboardApi.getPipelineBreakdown(moduleId, activeField!.key, activeField!.options!),
    enabled: !!moduleId && !!activeField,
  })

  const maxCount = Math.max(1, ...stages.map(s => s.count))

  if (modulesWithSelect.length === 0) {
    return (
      <EmptyState title="Додай поле типу «Вибір» до модуля, щоб побачити воронку тут." />
    )
  }

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-2">
        <Select
          className="w-auto"
          value={moduleId}
          onChange={e => {
            setModuleId(e.target.value)
            const fields = modules
              .find(m => m.id === e.target.value)
              ?.fields?.filter(f => f.type === 'SELECT' && f.options?.length)
            setFieldKey(fields?.[0]?.key ?? '')
          }}
        >
          {modulesWithSelect.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </Select>

        {selectFields.length > 1 && (
          <Select className="w-auto" value={fieldKey} onChange={e => setFieldKey(e.target.value)}>
            {selectFields.map(f => (
              <option key={f.key} value={f.key}>{f.name}</option>
            ))}
          </Select>
        )}
      </div>

      {isLoading ? (
        <p className="text-[13px] text-[#6C716A]">Завантаження...</p>
      ) : (
        <div className="space-y-3">
          {stages.map(stage => (
            <div key={stage.label}>
              <div className="mb-1 flex items-center justify-between text-[12.5px]">
                <span className="text-[#3D423B]">{stage.label}</span>
                <span className="font-mono text-[#8B9088]">{stage.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF0EB]">
                <div
                  className="h-full rounded-full bg-[#24493B] transition-all"
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}