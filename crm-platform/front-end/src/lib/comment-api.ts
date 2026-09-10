import { apiClient } from './api-client'
import type { Comment } from '@/types/comment'

export async function getComments(recordId: string) {
  const { data } = await apiClient.get<Comment[]>(`/records/${recordId}/comments`)
  return data
}

export async function createComment(recordId: string, content: string) {
  const { data } = await apiClient.post<Comment>(`/records/${recordId}/comments`, { content })
  return data
}

export async function updateComment(commentId: string, content: string) {
  const { data } = await apiClient.patch<Comment>(`/comments/${commentId}`, { content })
  return data
}

export async function deleteComment(commentId: string) {
  await apiClient.delete(`/comments/${commentId}`)
}