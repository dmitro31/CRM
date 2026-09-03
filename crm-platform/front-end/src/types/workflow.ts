export type TriggerEvent = 'RECORD_CREATED' | 'RECORD_UPDATED' | 'FIELD_CHANGED'
export type ConditionOperator = 'equals' | 'not_equals' | 'gt' | 'lt'
export type ActionType = 'SEND_NOTIFICATION' | 'SEND_EMAIL' | 'UPDATE_RECORD'

export interface WorkflowTrigger {
  event: TriggerEvent
  fieldKey?: string
}

export interface WorkflowCondition {
  fieldKey: string
  operator: ConditionOperator
  value: string
}

export interface WorkflowUpdateEntry {
  fieldKey: string
  value: string
}

export interface WorkflowAction {
  type: ActionType
  title?: string
  message?: string
  subject?: string
  body?: string
  data?: Record<string, unknown>
}

export interface Workflow {
  id: string
  name: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  enabled: boolean
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface WorkflowDraft {
  name: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  enabled?: boolean
}