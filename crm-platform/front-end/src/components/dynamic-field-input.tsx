'use client'

import type { Field } from '@/types/metadata'
import { useState } from 'react'
import { Upload, X, ExternalLink, FileIcon as FileIconLucide } from 'lucide-react'
import * as fileApi from '@/lib/file-api'
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, IMAGE_TYPES } from '@/lib/file-constants'
import type { RecordFileValue } from '@/types/record'


interface DynamicFieldInputProps {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
  workspaceId: string
  error?: string
}

export function DynamicFieldInput({
  field,
  value,
  onChange,
  workspaceId,
  error,
}: DynamicFieldInputProps) {
  const label = (
    <label className="mb-1 block text-[13px] font-medium text-[#171A18]">
      {field.name}
      {field.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  )

  const errorText = error && (
    <p className="mt-1 text-[12px] text-[#B3261E]">{error}</p>
  )

  switch (field.type) {
    case 'TEXTAREA':
      return (
        <div>
          {label}
          <textarea
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
            rows={3}
          />
          {errorText}
        </div>
      )

    case 'NUMBER':
      return (
        <div>
          {label}
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={e =>
              onChange(e.target.value === '' ? undefined : Number(e.target.value))
            }
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
          />
          {errorText}
        </div>
      )

    case 'BOOLEAN':
      return (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={(value as boolean) ?? false}
              onChange={e => onChange(e.target.checked)}
            />
            {field.name}
          </label>
          {errorText}
        </div>
      )

    case 'DATE':
      return (
        <div>
          {label}
          <input
            type="date"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
          />
          {errorText}
        </div>
      )

    case 'DATETIME':
      return (
        <div>
          {label}
          <input
            type="datetime-local"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
          />
          {errorText}
        </div>
      )

    case 'EMAIL':
      return (
        <div>
          {label}
          <input
            type="email"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
          />
          {errorText}
        </div>
      )

    case 'PHONE':
      return (
        <div>
          {label}
          <input
            type="tel"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
          />
          {errorText}
        </div>
      )

    case 'URL':
      return (
        <div>
          {label}
          <input
            type="url"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
          />
          {errorText}
        </div>
      )

    case 'SELECT':
      return (
        <div>
          {label}
          <select
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value || undefined)}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
          >
            <option value="">— Оберіть —</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errorText}
        </div>
      )

    case 'MULTI_SELECT': {
      const selected = (value as string[]) ?? []
      return (
        <div>
          {label}
          <div className="flex flex-wrap gap-2">
            {field.options?.map(option => {
              const isChecked = selected.includes(option)
              return (
                <label
                  key={option}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${isChecked
                      ? 'border-[#24493B]/40 bg-[#E7EEE9] text-[#24493B]'
                      : 'border-[#DFE3DC] text-[#3D423B]'
                    }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isChecked}
                    onChange={() => {
                      const next = isChecked
                        ? selected.filter(v => v !== option)
                        : [...selected, option]
                      onChange(next)
                    }}
                  />
                  {option}
                </label>
              )
            })}
          </div>
          {errorText}
        </div>
      )
    }

   case 'FILE':
case 'IMAGE':
  return (
    <FileFieldInput
      field={field}
      value={value as RecordFileValue | undefined}
      onChange={onChange}
      workspaceId={workspaceId}
      error={error}
    />
  )

case 'RELATION':
  return (
    <div>
      {label}
      <p className="text-[12.5px] text-[#8B9088]">
        Тип поля &quot;RELATION&quot; ще не підтримується у формі
      </p>
    </div>
  )

    default:
      return (
        <div>
          {label}
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none"
          />
          {errorText}
        </div>
      )
  }
}
function FileFieldInput({
  field,
  value,
  onChange,
  workspaceId,
  error,
}: {
  field: Field
  value: RecordFileValue | undefined
  onChange: (value: RecordFileValue | undefined) => void
  workspaceId: string
  error?: string
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const isImage = value ? IMAGE_TYPES.includes(value.mimeType) : field.type === 'IMAGE'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Файл завеликий (максимум 10MB)')
      e.target.value = ''
      return
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('Цей тип файлу не підтримується')
      e.target.value = ''
      return
    }

    setIsUploading(true)
    try {
      const uploaded = await fileApi.uploadFile(workspaceId, file)
      onChange({
        fileId: uploaded.id,
        originalName: uploaded.originalName,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
      })
    } catch {
      setUploadError('Не вдалося завантажити файл')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handlePreview = async () => {
    if (!value) return
    const { url } = await fileApi.getDownloadUrl(value.fileId)
    setPreviewUrl(url)
    window.open(url, '_blank')
  }

  return (
    <div>
      <label className="mb-1 block text-[13px] font-medium text-[#171A18]">
        {field.name}
        {field.required && <span className="ml-1 text-[#B3261E]">*</span>}
      </label>

      {!value ? (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#DFE3DC] px-3 py-2.5 text-[13px] text-[#6C716A] hover:border-[#C7CDC2]">
          <Upload size={14} />
          {isUploading ? 'Завантаження...' : isImage ? 'Завантажити фото' : 'Завантажити файл'}
          <input
            type="file"
            className="hidden"
            disabled={isUploading}
            onChange={e => void handleFileSelect(e)}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-[#DFE3DC] bg-white px-3 py-2">
          <button
            type="button"
            onClick={() => void handlePreview()}
            className="flex min-w-0 items-center gap-2 text-left"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E7EEE9] text-[#24493B]">
              <FileIconLucide size={13} />
            </span>
            <span className="truncate text-[12.5px] text-[#171A18]">{value.originalName}</span>
            <ExternalLink size={12} className="shrink-0 text-[#8B9088]" />
          </button>

          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="shrink-0 text-[#8B9088] hover:text-[#B3261E]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {uploadError && <p className="mt-1 text-[12px] text-[#B3261E]">{uploadError}</p>}
      {error && <p className="mt-1 text-[12px] text-[#B3261E]">{error}</p>}
    </div>
  )
}