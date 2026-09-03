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
}