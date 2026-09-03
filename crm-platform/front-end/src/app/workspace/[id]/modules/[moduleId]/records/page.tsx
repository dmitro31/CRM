'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { ProtectedRoute } from '@/components/protected-route'
import { RecordForm } from '@/components/record-form'
import * as metadataApi from '@/lib/metadata-api'
import * as recordApi from '@/lib/record-api'
import type { CrmRecord } from '@/types/record'

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <RecordsContent />
    </ProtectedRoute>
  )
}

function RecordsContent() {
  const { moduleId } = useParams<{ id: string; moduleId: string }>()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [filterField, setFilterField] = useState('')
  const [filterValue, setFilterValue] = useState('')
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

  const selectFields = fields.filter(f => f.type === 'SELECT')

  const query: Record<string, string> = { page: String(page), limit: '20' }
  if (filterField && filterValue) {
    query[filterField] = filterValue
  }

  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['records', moduleId, query],
    queryFn: () => recordApi.getRecords(moduleId, query),
  })

  const displayFields = fields.filter(f => f.isActive).slice(0, 4)

  const invalidateRecords = () => {
    void queryClient.invalidateQueries({ queryKey: ['records', moduleId] })
  }

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
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{module_?.name}</h1>
        <button
          onClick={() => setShowCreateForm(v => !v)}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + Новий запис
        </button>
      </div>

      {selectFields.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <select
            value={filterField}
            onChange={e => {
              setFilterField(e.target.value)
              setFilterValue('')
              setPage(1)
            }}
            className="rounded border px-3 py-1.5 text-sm"
          >
            <option value="">Без фільтра</option>
            {selectFields.map(f => (
              <option key={f.key} value={f.key}>
                {f.name}
              </option>
            ))}
          </select>

          {filterField && (
            <select
              value={filterValue}
              onChange={e => {
                setFilterValue(e.target.value)
                setPage(1)
              }}
              className="rounded border px-3 py-1.5 text-sm"
            >
              <option value="">Усі значення</option>
              {selectFields
                .find(f => f.key === filterField)
                ?.options?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          )}
        </div>
      )}

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

      {isLoading && <p className="text-gray-500">Завантаження...</p>}

      {recordsData && recordsData.items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                {displayFields.map(field => (
                  <th key={field.id} className="px-4 py-2 text-left font-medium">
                    {field.name}
                  </th>
                ))}
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {recordsData.items.map(record => (
                <tr key={record.id} className="border-b last:border-0">
                  {displayFields.map(field => (
                    <td key={field.id} className="px-4 py-2">
                      {formatValue(record.data[field.key])}
                    </td>
                  ))}
                  <td className="space-x-2 px-4 py-2 text-right">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="text-blue-600 hover:underline"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => void handleDelete(record.id)}
                      className="text-red-600 hover:underline"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {recordsData && recordsData.items.length === 0 && (
        <p className="text-gray-500">Записів ще немає.</p>
      )}

      {recordsData && totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            ← Назад
          </button>
          <span className="text-sm text-gray-500">
            {page} з {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Далі →
          </button>
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