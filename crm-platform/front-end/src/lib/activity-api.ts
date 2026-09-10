import { apiClient } from './api-client'
import type { ActivityEvent } from '@/types/activity'

export async function getRecordActivity(recordId: string) {
  const { data } = await apiClient.get<ActivityEvent[]>(`/records/${recordId}/activity`)
  return data
}

export async function getWorkspaceActivity(workspaceId: string, query: Record<string, string> = {}) {
  const { data } = await apiClient.get<{ items: ActivityEvent[]; total: number; page: number; limit: number }>(
    `/workspaces/${workspaceId}/activity`,
    { params: query },
  )
  return data
}