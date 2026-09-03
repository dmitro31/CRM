import { apiClient } from './api-client'
import type { FormDraft, AskResponse } from '@/types/ai'
import type { WorkflowDraft } from '@/types/workflow'
import type { CrmModule } from '@/types/metadata'

export async function generateForm(workspaceId: string, prompt: string) {
  const { data } = await apiClient.post<FormDraft>(
    `/workspaces/${workspaceId}/ai/generate-form`,
    { prompt },
  )
  return data
}

export async function createFormFromDraft(workspaceId: string, draft: FormDraft) {
  const { data } = await apiClient.post<{ module: CrmModule }>(
    `/workspaces/${workspaceId}/ai/generate-form/create`,
    draft,
  )
  return data
}

export async function generateWorkflow(
  workspaceId: string,
  moduleId: string,
  prompt: string,
) {
  const { data } = await apiClient.post<WorkflowDraft>(
    `/workspaces/${workspaceId}/ai/modules/${moduleId}/generate-workflow`,
    { prompt },
  )
  return data
}

export async function askAssistant(workspaceId: string, question: string) {
  const { data } = await apiClient.post<AskResponse>(
    `/workspaces/${workspaceId}/ai/ask`,
    { question },
  )
  return data
}