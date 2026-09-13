'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import * as commentApi from '@/lib/comment-api'
import { useAuth } from '@/providers/auth-provider'
import { MentionTextarea } from '@/components/mention-textarea'
import { formatCommentContent } from '@/lib/format-mentions'

interface RecordCommentsProps {
  recordId: string
}

export function RecordComments({ recordId }: RecordCommentsProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', recordId],
    queryFn: () => commentApi.getComments(recordId),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['comments', recordId] })
    void queryClient.invalidateQueries({ queryKey: ['activity', recordId] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setError(null)
    setIsSubmitting(true)
    try {
      await commentApi.createComment(recordId, content.trim())
      setContent('')
      invalidate()
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setError(message ?? 'Не вдалося додати коментар')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (commentId: string, currentContent: string) => {
    setEditingId(commentId)
    setEditingContent(currentContent)
  }

  const handleUpdate = async (commentId: string) => {
    if (!editingContent.trim()) return
    try {
      await commentApi.updateComment(commentId, editingContent.trim())
      setEditingId(null)
      invalidate()
    } catch {
      setError('Не вдалося оновити коментар')
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Видалити цей коментар?')) return
    await commentApi.deleteComment(commentId)
    invalidate()
  }

  return (
    <div>
      <form onSubmit={e => void handleSubmit(e)} className="mb-6 space-y-2">
        <MentionTextarea
          value={content}
          onChange={setContent}
          placeholder="Написати коментар... (@ для згадки)"
          rows={3}
          className="w-full rounded-md border border-[#DFE3DC] px-3 py-2 text-[13px] focus:border-[#24493B]/40 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Надсилання...' : 'Додати коментар'}
        </button>
      </form>

      {isLoading && <p className="text-gray-500">Завантаження...</p>}

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="rounded border bg-white p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">
                {comment.author.firstName} {comment.author.lastName}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString('uk-UA')}
              </span>
            </div>

            {editingId === comment.id ? (
              <div className="space-y-2">
                <MentionTextarea
                  value={editingContent}
                  onChange={setEditingContent}
                  rows={2}
                  className="w-full rounded-md border border-[#DFE3DC] px-2 py-1.5 text-[13px] focus:border-[#24493B]/40 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleUpdate(comment.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Зберегти
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700">{comment.content}</p>
                {comment.authorId === user?.id && (
                  <div className="mt-2 flex gap-3 text-xs">
                    <button
                      onClick={() => startEdit(comment.id, comment.content)}
                      className="text-blue-600 hover:underline"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => void handleDelete(comment.id)}
                      className="text-red-600 hover:underline"
                    >
                      Видалити
                    </button>
                    <p className="text-[13px] text-[#3D423B]">{formatCommentContent(comment.content)}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {!isLoading && comments.length === 0 && (
          <p className="text-gray-500">Ще немає жодного коментаря.</p>
        )}
      </div>
    </div>
  )
}