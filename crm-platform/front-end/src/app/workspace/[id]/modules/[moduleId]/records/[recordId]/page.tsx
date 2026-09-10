'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import { ProtectedRoute } from '@/components/protected-route'
import { RecordTimeline } from '@/components/record-timeline'
import { RecordComments } from '@/components/record-comments'
import * as metadataApi from '@/lib/metadata-api'
import * as recordApi from '@/lib/record-api'

type Tab = 'timeline' | 'comments'

export default function RecordDetailPage() {
  return (
    <ProtectedRoute>
      <RecordDetailContent />
    </ProtectedRoute>
  )
}

function RecordDetailContent() {
  const { id: workspaceId, moduleId, recordId } = useParams<{
    id: string
    moduleId: string
    recordId: string
  }>()

  const [tab, setTab] = useState<Tab>('timeline')

  const { data: module_ } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => metadataApi.getModule(moduleId),
  })

  const { data: fields = [] } = useQuery({
    queryKey: ['fields', moduleId],
    queryFn: () => metadataApi.getFields(moduleId),
  })

  const { data: record, isLoading } = useQuery({
    queryKey: ['record', recordId],
    queryFn: () => recordApi.getRecord(recordId),
  })

  const displayFields = fields.filter(f => f.isActive)

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link
        href={`/workspace/${workspaceId}/modules/${moduleId}/records`}
        className="mb-4 inline-block text-sm text-blue-600 hover:underline"
      >
        ← Назад до записів
      </Link>

      <h1 className="mb-1 text-2xl font-semibold">{module_?.name}</h1>
      <p className="mb-6 text-sm text-gray-400">Запис #{recordId.slice(0, 8)}</p>

      {isLoading && <p className="text-gray-500">Завантаження...</p>}

      {record && (
        <div className="mb-6 rounded-lg border bg-white p-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            {displayFields.map(field => (
              <div key={field.id}>
                <dt className="text-xs text-gray-400">{field.name}</dt>
                <dd className="text-sm">
                  {formatFieldValue(record.data[field.key])}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mb-4 flex gap-1 border-b">
        <button
          onClick={() => setTab('timeline')}
          className={`px-4 py-2 text-sm font-medium ${
            tab === 'timeline'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`px-4 py-2 text-sm font-medium ${
            tab === 'comments'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Коментарі
        </button>
      </div>

      {tab === 'timeline' && <RecordTimeline recordId={recordId} />}
      {tab === 'comments' && <RecordComments recordId={recordId} />}
    </div>
  )
}

function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Так' : 'Ні'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}