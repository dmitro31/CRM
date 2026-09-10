'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import * as taskApi from '@/lib/task-api'
import { useWorkspace } from '@/providers/workspace-provider'
import type { Task, TaskStatus } from '@/types/task'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'Заплановано' },
  { status: 'IN_PROGRESS', label: 'В роботі' },
  { status: 'DONE', label: 'Завершено' },
]

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksContent />
    </ProtectedRoute>
  )
}

function TasksContent() {
  const { id: workspaceId } = useParams<{ id: string }>()
  const { currentWorkspace } = useWorkspace()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: () => taskApi.getTasks(workspaceId),
  })

  const members = currentWorkspace?.members ?? []

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] })
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDueDate('')
    setAssigneeId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!title.trim()) {
      setServerError('Введіть назву задачі')
      return
    }

    setIsSubmitting(true)
    try {
      await taskApi.createTask(workspaceId, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      })
      resetForm()
      setShowForm(false)
      invalidate()
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setServerError(message ?? 'Не вдалося створити задачу')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await taskApi.updateTask(taskId, { status })
    invalidate()
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Видалити цю задачу?')) return
    await taskApi.deleteTask(taskId)
    invalidate()
  }

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status)

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Задачі</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + Нова задача
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={e => void handleSubmit(e)}
          className="mb-6 space-y-3 rounded-lg border bg-white p-4"
        >
          <input
            placeholder="Назва задачі"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            placeholder="Опис (необов'язково)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded border px-3 py-2"
          />
          <div className="flex gap-3">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="rounded border px-3 py-2"
            />
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="flex-1 rounded border px-3 py-2"
            >
              <option value="">Без виконавця</option>
              {members.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.user.firstName} {member.user.lastName}
                </option>
              ))}
            </select>
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Створення...' : 'Створити'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-gray-500">Завантаження...</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map(column => (
          <div key={column.status} className="rounded-lg bg-gray-50 p-3">
            <h2 className="mb-3 text-sm font-medium text-gray-600">
              {column.label} ({tasksByStatus(column.status).length})
            </h2>

            <div className="space-y-2">
              {tasksByStatus(column.status).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={status => void handleStatusChange(task.id, status)}
                  onDelete={() => void handleDelete(task.id)}
                />
              ))}

              {tasksByStatus(column.status).length === 0 && (
                <p className="text-xs text-gray-400">Немає задач</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task
  onStatusChange: (status: TaskStatus) => void
  onDelete: () => void
}) {
  return (
    <div className="rounded border bg-white p-3">
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{task.title}</p>
        <button
          onClick={onDelete}
          className="shrink-0 text-xs text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="mb-2 text-xs text-gray-500">{task.description}</p>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
        {task.dueDate && (
          <span>до {new Date(task.dueDate).toLocaleDateString('uk-UA')}</span>
        )}
        {task.assignee && (
          <span>
            👤 {task.assignee.firstName} {task.assignee.lastName}
          </span>
        )}
      </div>

      <select
        value={task.status}
        onChange={e => onStatusChange(e.target.value as TaskStatus)}
        className="w-full rounded border px-2 py-1 text-xs"
      >
        <option value="TODO">Заплановано</option>
        <option value="IN_PROGRESS">В роботі</option>
        <option value="DONE">Завершено</option>
      </select>
    </div>
  )
}