export type ActivityType =
  | 'RECORD_CREATED' | 'RECORD_UPDATED' | 'RECORD_ARCHIVED'
  | 'COMMENT_ADDED' | 'COMMENT_UPDATED' | 'COMMENT_DELETED'
  | 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED'

export interface ActivityEvent {
  id: string
  type: ActivityType
  recordId: string | null
  workspaceId: string
  data: Record<string, unknown> | null
  createdAt: string
  user: { id: string; firstName: string; lastName: string | null; avatar: string | null }
}