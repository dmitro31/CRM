import { apiClient } from './api-client'
import type { CrmModule, Field, FieldType } from '@/types/metadata'

export async function getModules(workspaceId: string) {
  const { data } = await apiClient.get<CrmModule[]>(`/workspaces/${workspaceId}/modules`)
  return data
}

export async function getModule(moduleId: string) {
  const { data } = await apiClient.get<CrmModule>(`/modules/${moduleId}`)
  return data
}

export async function createModule(workspaceId: string, payload: { name: string; description?: string }) {
  const { data } = await apiClient.post<CrmModule>(`/workspaces/${workspaceId}/modules`, payload)
  return data
}

export async function updateModule(moduleId: string, payload: { name?: string; description?: string; isActive?: boolean }) {
  const { data } = await apiClient.patch<CrmModule>(`/modules/${moduleId}`, payload)
  return data
}

export async function deleteModule(moduleId: string) {
  await apiClient.delete(`/modules/${moduleId}`)
}

export async function getFields(moduleId: string) {
  const { data } = await apiClient.get<Field[]>(`/modules/${moduleId}/fields`)
  return data
}

export interface CreateFieldPayload {
  name: string
  type: FieldType
  description?: string
  required?: boolean
  unique?: boolean
  options?: string[]
  placeholder?: string
}

export async function createField(moduleId: string, payload: CreateFieldPayload) {
  const { data } = await apiClient.post<Field>(`/modules/${moduleId}/fields`, payload)
  return data
}

export async function updateField(fieldId: string, payload: Partial<CreateFieldPayload> & { isActive?: boolean }) {
  const { data } = await apiClient.patch<Field>(`/fields/${fieldId}`, payload)
  return data
}

export async function deleteField(fieldId: string) {
  await apiClient.delete(`/fields/${fieldId}`)
}