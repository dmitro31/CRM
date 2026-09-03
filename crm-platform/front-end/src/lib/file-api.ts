import { apiClient } from './api-client'
import type { CrmFile } from '@/types/file'

export async function getFiles(workspaceId: string) {
  const { data } = await apiClient.get<CrmFile[]>(
    `/workspaces/${workspaceId}/files`,
  )
  return data
}

export async function uploadFile(
  workspaceId: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post<CrmFile>(
    `/workspaces/${workspaceId}/files`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: event => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
    },
  )
  return data
}

export async function getDownloadUrl(fileId: string) {
  const { data } = await apiClient.get<{
    url: string
    originalName: string
    mimeType: string
  }>(`/files/${fileId}/download`)
  return data
}

export async function deleteFile(fileId: string) {
  await apiClient.delete(`/files/${fileId}`)
}