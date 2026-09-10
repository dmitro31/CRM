export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  dueDate: string | null
  workspaceId: string
  recordId: string | null
  assigneeId: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  assignee?: { id: string; firstName: string; lastName: string | null; avatar: string | null } | null
  createdBy?: { id: string; firstName: string; lastName: string | null }
}