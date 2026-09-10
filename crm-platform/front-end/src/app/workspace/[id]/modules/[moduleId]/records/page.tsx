'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { ProtectedRoute } from '@/components/protected-route'
import { RecordForm } from '@/components/record-form'
import { Button } from '@/shared/UI/button/button'
import { Select } from '@/shared/UI/Select'
import { PageHeader } from '@/shared/UI/PageHeader'
import { EmptyState } from '@/shared/UI/EmptyState'
import * as metadataApi from '@/lib/metadata-api'
import * as recordApi from '@/lib/record-api'
import type { CrmRecord } from '@/types/record'
import { FilterBuilder, type FilterRule } from '@/components/filter-builder'
import { buildFilterQuery } from '@/lib/record-api'
import Link from 'next/link'

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <RecordsContent />
    </ProtectedRoute>
  )
}

function RecordsContent() {
  const { id: workspaceId, moduleId } = useParams<{ id: string; moduleId: string }>()
  const queryClient = useQueryClient()
  const [filterRules, setFilterRules] = useState<FilterRule[]>([])
  const [matchMode, setMatchMode] = useState<'all' | 'any'>('all')

  const [page, setPage] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<CrmRecord | null>(null)

  const { data: module_ } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => metadataApi.getModule(moduleId),
  })

  const { data: fields = [] } = useQuery({
    queryKey: ['fields', moduleId],
    queryFn: () => metadataApi.getFields(moduleId),
  })

  const query: Record<string, string> = {
    page: String(page),
    limit: '20',
    ...buildFilterQuery(filterRules, matchMode),
  }

  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['records', moduleId, query],
    queryFn: () => recordApi.getRecords(moduleId, query),
  })

  const displayFields = fields.filter(f => f.isActive).slice(0, 4)

  const invalidateRecords = () =>
    void queryClient.invalidateQueries({ queryKey: ['records', moduleId] })

  const handleCreate = async (data: Record<string, unknown>) => {
    await recordApi.createRecord(moduleId, data)
    setShowCreateForm(false)
    invalidateRecords()
  }

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingRecord) return
    await recordApi.updateRecord(editingRecord.id, data)
    setEditingRecord(null)
    invalidateRecords()
  }

  const handleDelete = async (recordId: string) => {
    if (!confirm('Видалити цей запис?')) return
    await recordApi.deleteRecord(recordId)
    invalidateRecords()
  }

  const totalPages = recordsData ? Math.ceil(recordsData.total / recordsData.limit) : 1

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <PageHeader
        title={module_?.name ?? ''}
        actions={
          <Button onClick={() => setShowCreateForm(v => !v)}>
            + Новий запис
          </Button>
        }
      />

      <FilterBuilder
        fields={fields}
        rules={filterRules}
        matchMode={matchMode}
        onChange={rules => { setFilterRules(rules); setPage(1) }}
        onMatchModeChange={mode => { setMatchMode(mode); setPage(1) }}
      />

      {showCreateForm && (
        <div className="mb-6">
          <RecordForm
            fields={fields}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            submitLabel="Створити"
          />
        </div>
      )}

      {editingRecord && (
        <div className="mb-6">
          <RecordForm
            fields={fields}
            initialData={editingRecord.data}
            onSubmit={handleUpdate}
            onCancel={() => setEditingRecord(null)}
            submitLabel="Зберегти"
          />
        </div>
      )}

      {isLoading && <p className="text-[13px] text-[#6C716A]">Завантаження...</p>}

      {recordsData && recordsData.items.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-[#DFE3DC] bg-white">
          <table className="w-full text-[13px]">
            <thead className="border-b border-[#DFE3DC] bg-[#F6F7F4]">
              <tr>
                {displayFields.map(field => (
                  <th key={field.id} className="px-4 py-2.5 text-left font-medium text-[#3D423B]">
                    {field.name}
                  </th>
                ))}
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {recordsData.items.map(record => (
                <tr key={record.id} className="border-b border-[#F1F2EF] last:border-0 hover:bg-[#F6F7F4]">
                  {displayFields.map(field => (
                    <td key={field.id} className="px-4 py-2.5 text-[#171A18]">
                      {formatValue(record.data[field.key])}
                    </td>
                  ))}
                  <td className="space-x-3 px-4 py-2.5 text-right">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="text-[12.5px] text-[#24493B] hover:underline"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => void handleDelete(record.id)}
                      className="text-[12.5px] text-[#B3261E] hover:underline"
                    >
                      Видалити
                    </button>
                  </td>
                  <td>
                    <Link
                      href={`/workspace/${workspaceId}/modules/${moduleId}/records/${record.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Деталі
                    </Link>
                  </td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>
      )}

      {recordsData && recordsData.items.length === 0 && (
        <EmptyState title="Записів ще немає." />
      )}

      {recordsData && totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            ← Назад
          </Button>
          <span className="text-[12.5px] text-[#6C716A]">{page} з {totalPages}</span>
          <Button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Далі →
          </Button>
        </div>
      )}
    </div>
  )
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'boolean') return value ? 'Так' : 'Ні'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}