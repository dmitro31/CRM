import { apiClient } from './api-client'
import type { View } from '@/types/metadata'
import type { FilterRule } from '@/components/filter-builder'

export async function getViews(moduleId: string) {
  const { data } = await apiClient.get<View[]>(`/modules/${moduleId}/views`)
  return data
}

export interface CreateViewPayload {
  name: string
  filters: { rules: FilterRule[]; matchMode: 'all' | 'any' }
  sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }
  columns: string[]
  isDefault?: boolean
}

export async function createView(moduleId: string, payload: CreateViewPayload) {
  const { data } = await apiClient.post<View>(`/modules/${moduleId}/views`, payload)
  return data
}

export async function updateView(viewId: string, payload: Partial<CreateViewPayload>) {
  const { data } = await apiClient.patch<View>(`/views/${viewId}`, payload)
  return data
}

export async function deleteView(viewId: string) {
  await apiClient.delete(`/views/${viewId}`)
}