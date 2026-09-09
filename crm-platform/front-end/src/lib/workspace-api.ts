import { apiClient } from './api-client'
import type { Workspace, Role, WorkspaceMember } from '@/types/workspace'

export async function getWorkspaces() {
  const { data } = await apiClient.get<Workspace[]>('/workspaces')
  return data
}

export async function getWorkspace(id: string) {
  const { data } = await apiClient.get<Workspace>(`/workspaces/${id}`)
  return data
}

export async function createWorkspace(payload: { name: string; description?: string }) {
  const { data } = await apiClient.post<Workspace>('/workspaces', payload)
  return data
}

export async function updateWorkspace(id: string, payload: { name?: string; description?: string }) {
  const { data } = await apiClient.patch<Workspace>(`/workspaces/${id}`, payload)
  return data
}

export async function deleteWorkspace(id: string) {
  await apiClient.delete(`/workspaces/${id}`)
}

export async function getRoles(workspaceId: string) {
  const { data } = await apiClient.get<Role[]>(`/workspaces/${workspaceId}/roles`)
  return data
}

export async function createRole(workspaceId: string, payload: { name: string; description?: string; permissions?: string[] }) {
  const { data } = await apiClient.post<Role>(`/workspaces/${workspaceId}/roles`, payload)
  return data
}

export async function inviteMember(workspaceId: string, payload: { email: string; roleId: string }) {
  const { data } = await apiClient.post(`/workspaces/${workspaceId}/invitations`, payload)
  return data
}

export async function getInvitations(workspaceId: string) {
  const { data } = await apiClient.get(`/workspaces/${workspaceId}/invitations`)
  return data
}

export async function revokeInvitation(invitationId: string) {
  await apiClient.delete(`/invitations/${invitationId}`)

  
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  roleId: string,
) {
  const { data } = await apiClient.patch<WorkspaceMember>(
    `/workspaces/${workspaceId}/members/${memberId}`,
    { roleId },
  )
  return data
}

export async function removeMember(workspaceId: string, memberId: string) {
  await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`)
}

export async function transferOwnership(workspaceId: string, newOwnerUserId: string) {
  const { data } = await apiClient.post<Workspace>(
    `/workspaces/${workspaceId}/transfer-ownership`,
    { newOwnerUserId },
  )
  return data
}