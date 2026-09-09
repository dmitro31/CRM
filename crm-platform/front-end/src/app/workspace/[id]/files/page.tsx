'use client'

import { useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import { FileIcon } from '@/components/file-icon'
import { Button } from '@/shared/UI/button/button'
import { Card } from '@/shared/UI/Card'
import { PageHeader } from '@/shared/UI/PageHeader'
import { EmptyState } from '@/shared/UI/EmptyState'
import { formatFileSize } from '@/lib/format-file-size'
import * as fileApi from '@/lib/file-api'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export default function FilesPage() {
  return (
    <ProtectedRoute>
      <FilesContent />
    </ProtectedRoute>
  )
}

function FilesContent() {
  const { id: workspaceId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files', workspaceId],
    queryFn: () => fileApi.getFiles(workspaceId),
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    if (file.size > MAX_SIZE) {
      setUploadError('Файл завеликий (максимум 10MB)')
      e.target.value = ''
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Цей тип файлу не підтримується')
      e.target.value = ''
      return
    }

    setUploadProgress(0)
    try {
      await fileApi.uploadFile(workspaceId, file, setUploadProgress)
      void queryClient.invalidateQueries({ queryKey: ['files', workspaceId] })
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setUploadError(message ?? 'Не вдалося завантажити файл')
    } finally {
      setUploadProgress(null)
      e.target.value = ''
    }
  }

  const handleDownload = async (fileId: string) => {
    setDownloadingId(fileId)
    try {
      const { url } = await fileApi.getDownloadUrl(fileId)
      window.open(url, '_blank')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Видалити цей файл?')) return
    await fileApi.deleteFile(fileId)
    void queryClient.invalidateQueries({ queryKey: ['files', workspaceId] })
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <PageHeader
        title="Файли"
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={e => void handleFileSelect(e)}
            />
            <Button disabled={uploadProgress !== null} onClick={() => inputRef.current?.click()}>
              {uploadProgress !== null ? `Завантаження ${uploadProgress}%` : '+ Завантажити файл'}
            </Button>
          </>
        }
      />

      {uploadError && <p className="mb-4 text-[12px] text-[#B3261E]">{uploadError}</p>}

      {isLoading && <p className="text-[13px] text-[#6C716A]">Завантаження...</p>}

      <div className="space-y-2">
        {files.map(file => (
          <Card key={file.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileIcon mimeType={file.mimeType} />
              <div>
                <div className="text-[13.5px] font-medium text-[#171A18]">{file.originalName}</div>
                <div className="text-[12px] text-[#6C716A]">
                  {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('uk-UA')}
                </div>
              </div>
            </div>
            <div className="flex gap-4 text-[12.5px]">
              <button
                onClick={() => void handleDownload(file.id)}
                disabled={downloadingId === file.id}
                className="text-[#24493B] hover:underline disabled:opacity-50"
              >
                {downloadingId === file.id ? 'Відкриття...' : 'Завантажити'}
              </button>
              <button onClick={() => void handleDelete(file.id)} className="text-[#B3261E] hover:underline">
                Видалити
              </button>
            </div>
          </Card>
        ))}

        {!isLoading && files.length === 0 && <EmptyState title="Ще немає жодного файлу." />}
      </div>
    </div>
  )
}