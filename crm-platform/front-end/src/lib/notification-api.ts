import { apiClient } from './api-client'
import type { AppNotification } from '@/types/notification'

export async function getNotifications() {
  const { data } = await apiClient.get<AppNotification[]>('/notifications')
  return data
}

export async function getUnreadCount() {
  const { data } = await apiClient.get<{ count: number }>(
    '/notifications/unread-count',
  )
  return data.count
}

export async function markAsRead(id: string) {
  await apiClient.patch(`/notifications/${id}/read`)
}

export async function markAllAsRead() {
  await apiClient.patch('/notifications/read-all')
}