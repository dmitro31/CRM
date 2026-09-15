'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, FileText } from 'lucide-react'

import { ProtectedRoute } from '@/components/protected-route'
import { RecordTimeline } from '@/components/record-timeline'
import { RecordComments } from '@/components/record-comments'
import { Breadcrumb } from '@/shared/UI/Breadcrumb'
import { Card } from '@/shared/UI/Card'
import * as metadataApi from '@/lib/metadata-api'
import * as recordApi from '@/lib/record-api'
import * as fileApi from '@/lib/file-api'
import { IMAGE_TYPES } from '@/lib/file-constants'
import type { RecordFileValue } from '@/types/record'

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
    <div className="mx-auto max-w-3xl px-8 py-10">
      <Breadcrumb
        items={[
          { label: 'Модулі', href: `/workspace/${workspaceId}/modules` },
          { label: module_?.name ?? '...', href: `/workspace/${workspaceId}/modules/${moduleId}/records` },
          { label: `Запис #${recordId.slice(0, 8)}` },
        ]}
      />

      <h1 className="text-[20px] font-medium text-[#171A18]">{module_?.name}</h1>
      <p className="mt-1 text-[13px] text-[#8B9088]">Запис #{recordId.slice(0, 8)}</p>

      {isLoading && <p className="mt-6 text-[13px] text-[#6C716A]">Завантаження...</p>}

      {record && (
        <Card className="my-6">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            {displayFields.map(field => (
              <div key={field.id}>
                <dt className="text-[11px] text-[#8B9088]">{field.name}</dt>
                <dd className="mt-0.5 text-[13px] text-[#171A18]">
                  {field.type === 'FILE' || field.type === 'IMAGE' ? (
                    <FieldFileValue value={record.data[field.key] as RecordFileValue | undefined} />
                  ) : (
                    formatFieldValue(record.data[field.key])
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      <div className="mb-4 flex gap-1 border-b border-[#DFE3DC]">
        <button
          onClick={() => setTab('timeline')}
          className={`px-4 py-2 text-[13px] font-medium ${
            tab === 'timeline'
              ? 'border-b-2 border-[#24493B] text-[#24493B]'
              : 'text-[#6C716A] hover:text-[#171A18]'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`px-4 py-2 text-[13px] font-medium ${
            tab === 'comments'
              ? 'border-b-2 border-[#24493B] text-[#24493B]'
              : 'text-[#6C716A] hover:text-[#171A18]'
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

function FieldFileValue({ value }: { value: RecordFileValue | undefined }) {
  if (!value) return <span className="text-[#8B9088]">—</span>

  const handleOpen = async () => {
    const { url } = await fileApi.getDownloadUrl(value.fileId)
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={() => void handleOpen()}
      className="flex items-center gap-1.5 text-[#24493B] hover:underline"
    >
      {IMAGE_TYPES.includes(value.mimeType) ? (
        <FileText size={13} />
      ) : (
        <FileText size={13} />
      )}
      {value.originalName}
      <ExternalLink size={11} />
    </button>
  )
}

function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Так' : 'Ні'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}