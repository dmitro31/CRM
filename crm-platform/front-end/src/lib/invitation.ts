import { apiClient } from './api-client'

export interface InvitationPreview {
  email: string
  workspaceName: string
  roleName: string
  invitedByEmail: string
}

export async function getInvitationPreview(token: string) {
  const { data } = await apiClient.get<InvitationPreview>(`/invitations/${token}/preview`)
  return data
}

export async function acceptInvitation(token: string) {
  const { data } = await apiClient.post<{ id: string; name: string }>('/invitations/accept', { token })
  return data
}