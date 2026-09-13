import type { FieldType } from './metadata'
import type { WorkflowDraft } from './workflow'

export interface FormDraftField {
  name: string
  type: FieldType
  required?: boolean
  options?: string[]
}

export interface FormDraft {
  name: string
  fields: FormDraftField[]
}

export interface AskResponse {
  answer: string
  conversationId: string
}

export interface AiConversation {
  id: string
  title: string
  workspaceId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type AiMessageRole = 'USER' | 'ASSISTANT'

export interface AiMessage {
  id: string
  conversationId: string
  role: AiMessageRole
  content: string
  createdAt: string
}