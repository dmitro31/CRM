import type { ActivityEvent, ActivityType } from '@/types/activity'

const LABELS: Record<ActivityType, string> = {
  RECORD_CREATED: 'створив(ла) запис',
  RECORD_UPDATED: 'оновив(ла) запис',
  RECORD_ARCHIVED: 'архівував(ла) запис',
  COMMENT_ADDED: 'залишив(ла) коментар',
  COMMENT_UPDATED: 'відредагував(ла) коментар',
  COMMENT_DELETED: 'видалив(ла) коментар',
  TASK_CREATED: 'створив(ла) задачу',
  TASK_UPDATED: 'оновив(ла) задачу',
  TASK_COMPLETED: 'завершив(ла) задачу',
  TASK_DELETED: 'видалив(ла) задачу',
}

const ICONS: Record<ActivityType, string> = {
  RECORD_CREATED: '✨',
  RECORD_UPDATED: '✏️',
  RECORD_ARCHIVED: '📦',
  COMMENT_ADDED: '💬',
  COMMENT_UPDATED: '💬',
  COMMENT_DELETED: '🗑️',
  TASK_CREATED: '✅',
  TASK_UPDATED: '✅',
  TASK_COMPLETED: '🎉',
  TASK_DELETED: '🗑️',
}

export function formatActivityLabel(event: ActivityEvent): string {
  return LABELS[event.type] ?? event.type
}

export function formatActivityIcon(event: ActivityEvent): string {
  return ICONS[event.type] ?? '•'
}

export function formatActivityUserName(event: ActivityEvent): string {
  const { firstName, lastName } = event.user
  return [firstName, lastName].filter(Boolean).join(' ')
}

export function formatActivityDetail(event: ActivityEvent): string | null {
  const title = event.data?.title
  return typeof title === 'string' ? `«${title}»` : null
}