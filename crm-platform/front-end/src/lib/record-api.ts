import { apiClient } from './api-client'
import type { CrmRecord, PaginatedRecords } from '@/types/record'

export async function getRecords(
  moduleId: string,
  query: Record<string, string> = {},
) {
  const { data } = await apiClient.get<PaginatedRecords>(
    `/modules/${moduleId}/records`,
    { params: query },
  )
  return data
}

export async function getRecord(recordId: string) {
  const { data } = await apiClient.get<CrmRecord>(`/records/${recordId}`)
  return data
}

export async function createRecord(
  moduleId: string,
  data: Record<string, unknown>,
) {
  const { data: record } = await apiClient.post<CrmRecord>(
    `/modules/${moduleId}/records`,
    { data },
  )
  return record
}

export async function updateRecord(
  recordId: string,
  data: Record<string, unknown>,
) {
  const { data: record } = await apiClient.patch<CrmRecord>(
    `/records/${recordId}`,
    { data },
  )
  return record
}

export async function deleteRecord(recordId: string) {
  await apiClient.delete(`/records/${recordId}`)
}