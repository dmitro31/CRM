import { apiClient } from './api-client'
import type { FormDraft, AskResponse, AiConversation, AiMessage } from '@/types/ai'
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

export async function askAssistant(
  workspaceId: string,
  question: string,
  conversationId?: string,
) {
  const { data } = await apiClient.post<AskResponse>(
    `/workspaces/${workspaceId}/ai/ask`,
    { question, conversationId },
  )
  return data
}

export async function getConversations(workspaceId: string) {
  const { data } = await apiClient.get<AiConversation[]>(
    `/workspaces/${workspaceId}/ai/conversations`,
  )
  return data
}

export async function getConversationMessages(
  workspaceId: string,
  conversationId: string,
) {
  const { data } = await apiClient.get<AiMessage[]>(
    `/workspaces/${workspaceId}/ai/conversations/${conversationId}/messages`,
  )
  return data
}

export async function deleteConversation(workspaceId: string, conversationId: string) {
  await apiClient.delete(
    `/workspaces/${workspaceId}/ai/conversations/${conversationId}`,
  )
}