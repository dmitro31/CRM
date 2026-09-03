import { apiClient } from './api-client'
import type { Workflow, WorkflowDraft } from '@/types/workflow'

export async function getWorkflows(workspaceId: string) {
  const { data } = await apiClient.get<Workflow[]>(
    `/workspaces/${workspaceId}/workflows`,
  )
  return data
}

export async function createWorkflow(workspaceId: string, payload: WorkflowDraft) {
  const { data } = await apiClient.post<Workflow>(
    `/workspaces/${workspaceId}/workflows`,
    payload,
  )
  return data
}

export async function updateWorkflow(
  workflowId: string,
  payload: Partial<WorkflowDraft>,
) {
  const { data } = await apiClient.patch<Workflow>(
    `/workflows/${workflowId}`,
    payload,
  )
  return data
}

export async function deleteWorkflow(workflowId: string) {
  await apiClient.delete(`/workflows/${workflowId}`)
}