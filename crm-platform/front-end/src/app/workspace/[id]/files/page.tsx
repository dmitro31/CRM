'use client'

import { useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import { FileIcon } from '@/components/file-icon'
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
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Файли</h1>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={e => void handleFileSelect(e)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploadProgress !== null}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploadProgress !== null
              ? `Завантаження ${uploadProgress}%`
              : '+ Завантажити файл'}
          </button>
        </div>
      </div>

      {uploadError && (
        <p className="mb-4 text-sm text-red-600">{uploadError}</p>
      )}

      {isLoading && <p className="text-gray-500">Завантаження...</p>}

      <div className="space-y-2">
        {files.map(file => (
          <div
            key={file.id}
            className="flex items-center justify-between rounded border bg-white p-3"
          >
            <div className="flex items-center gap-3">
              <FileIcon mimeType={file.mimeType} />
              <div>
                <div className="font-medium">{file.originalName}</div>
                <div className="text-sm text-gray-500">
                  {formatFileSize(file.size)} •{' '}
                  {new Date(file.createdAt).toLocaleDateString('uk-UA')}
                </div>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => void handleDownload(file.id)}
                disabled={downloadingId === file.id}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                {downloadingId === file.id ? 'Відкриття...' : 'Завантажити'}
              </button>
              <button
                onClick={() => void handleDelete(file.id)}
                className="text-red-600 hover:underline"
              >
                Видалити
              </button>
            </div>
          </div>
        ))}

        {!isLoading && files.length === 0 && (
          <p className="text-gray-500">Ще немає жодного файлу.</p>
        )}
      </div>
    </div>
  )
}