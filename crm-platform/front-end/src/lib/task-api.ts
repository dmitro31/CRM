import { apiClient } from './api-client'
import type { Task } from '@/types/task'

export interface CreateTaskPayload {
  title: string
  description?: string
  dueDate?: string
  assigneeId?: string
  recordId?: string
}

export async function getTasks(workspaceId: string, query: Record<string, string> = {}) {
  const { data } = await apiClient.get<Task[]>(`/workspaces/${workspaceId}/tasks`, { params: query })
  return data
}

export async function createTask(workspaceId: string, payload: CreateTaskPayload) {
  const { data } = await apiClient.post<Task>(`/workspaces/${workspaceId}/tasks`, payload)
  return data
}

export async function updateTask(taskId: string, payload: Partial<CreateTaskPayload> & { status?: Task['status'] }) {
  const { data } = await apiClient.patch<Task>(`/tasks/${taskId}`, payload)
  return data
}

export async function deleteTask(taskId: string) {
  await apiClient.delete(`/tasks/${taskId}`)
}