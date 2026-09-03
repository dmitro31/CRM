'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import * as workspaceApi from '@/lib/workspace-api'
import {
  inviteMemberSchema,
  type InviteMemberFormData,
  createRoleSchema,
  type CreateRoleFormData,
} from '@/lib/validation/workspace-schemas'

export default function MembersPage() {
  return (
    <ProtectedRoute>
      <MembersContent />
    </ProtectedRoute>
  )
}

function MembersContent() {
  const { id: workspaceId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [showRoleForm, setShowRoleForm] = useState(false)

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceApi.getWorkspace(workspaceId),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['roles', workspaceId],
    queryFn: () => workspaceApi.getRoles(workspaceId),
  })

  const inviteForm = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
  })

  const roleForm = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
  })

  const onInviteSubmit = async (data: InviteMemberFormData) => {
    setInviteError(null)
    setInviteSuccess(null)
    try {
      await workspaceApi.inviteMember(workspaceId, data)
      setInviteSuccess(`Запрошення надіслано на ${data.email}`)
      inviteForm.reset()
      void queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setInviteError(message ?? 'Не вдалося надіслати запрошення')
    }
  }

  const onRoleSubmit = async (data: CreateRoleFormData) => {
    setRoleError(null)
    try {
      await workspaceApi.createRole(workspaceId, data)
      roleForm.reset()
      setShowRoleForm(false)
      void queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] })
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setRoleError(message ?? 'Не вдалося створити роль')
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">
        Учасники — {workspace?.name}
      </h1>

      <div className="mb-8 space-y-2">
        {workspace?.members?.map(member => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded border bg-white p-3"
          >
            <div>
              <div className="font-medium">
                {member.user.firstName} {member.user.lastName}
              </div>
              <div className="text-sm text-gray-500">{member.user.email}</div>
            </div>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs">
              {member.role.name}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Ролі</h2>
          <button
            onClick={() => setShowRoleForm(v => !v)}
            className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900"
          >
            + Нова роль
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {roles.map(role => (
            <span
              key={role.id}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {role.name}
            </span>
          ))}
        </div>

        {showRoleForm && (
          <form
            onSubmit={roleForm.handleSubmit(onRoleSubmit)}
            className="space-y-3 rounded-lg border bg-white p-4"
          >
            <div>
              <input
                placeholder="Назва ролі (наприклад Manager)"
                {...roleForm.register('name')}
                className="w-full rounded border px-3 py-2"
              />
              {roleForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {roleForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <input
                placeholder="Опис (необов'язково)"
                {...roleForm.register('description')}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            {roleError && <p className="text-sm text-red-600">{roleError}</p>}

            <button
              type="submit"
              disabled={roleForm.formState.isSubmitting}
              className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-50"
            >
              {roleForm.formState.isSubmitting ? 'Створення...' : 'Створити роль'}
            </button>
          </form>
        )}
      </div>

      <h2 className="mb-3 text-lg font-medium">Запросити учасника</h2>
      <form
        onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
        className="space-y-3 rounded-lg border bg-white p-4"
      >
        <div>
          <input
            type="email"
            placeholder="Email"
            {...inviteForm.register('email')}
            className="w-full rounded border px-3 py-2"
          />
          {inviteForm.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {inviteForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <select
            {...inviteForm.register('roleId')}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Оберіть роль</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {inviteForm.formState.errors.roleId && (
            <p className="mt-1 text-sm text-red-600">
              {inviteForm.formState.errors.roleId.message}
            </p>
          )}
        </div>

        {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
        {inviteSuccess && (
          <p className="text-sm text-green-600">{inviteSuccess}</p>
        )}

        <button
          type="submit"
          disabled={inviteForm.formState.isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {inviteForm.formState.isSubmitting ? 'Надсилання...' : 'Запросити'}
        </button>
      </form>
    </div>
  )
}