'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/shared/UI/button/button'
import { Input } from '@/shared/UI/Input'
import { Select } from '@/shared/UI/Select'
import { Card } from '@/shared/UI/Card'
import { PageHeader } from '@/shared/UI/PageHeader'
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

  const handleRoleChange = async (memberId: string, roleId: string) => {
    await workspaceApi.updateMemberRole(workspaceId, memberId, roleId)
    void queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Видалити цього учасника з workspace?')) return
    await workspaceApi.removeMember(workspaceId, memberId)
    void queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <PageHeader title="Учасники" subtitle={workspace?.name} />

      <div className="mb-8 space-y-2">
        {workspace?.members?.map(member => {
          const isOwnerRow = member.userId === workspace.ownerId
          return (
            <Card key={member.id} className="flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-medium text-[#171A18]">
                  {member.user.firstName} {member.user.lastName}
                </div>
                <div className="text-[12px] text-[#6C716A]">{member.user.email}</div>
              </div>

              <div className="flex items-center gap-2">
                {isOwnerRow ? (
                  <span className="rounded-full bg-[#E7EEE9] px-2.5 py-1 font-mono text-[11px] text-[#24493B]">
                    {member.role.name}
                  </span>
                ) : (
                  <select
                    value={member.roleId}
                    onChange={e => void handleRoleChange(member.id, e.target.value)}
                    className="rounded-md border border-[#DFE3DC] px-2 py-1 text-[11.5px]"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                )}

                {!isOwnerRow && (
                  <button
                    onClick={() => void handleRemoveMember(member.id)}
                    className="text-[11.5px] text-[#B3261E] hover:underline"
                  >
                    Видалити
                  </button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-[#171A18]">Ролі</h2>
          <Button onClick={() => setShowRoleForm(v => !v)}>
            + Нова роль
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {roles.map(role => (
            <span
              key={role.id}
              className="rounded-full border border-[#DFE3DC] bg-white px-3 py-1 text-[12px] text-[#3D423B]"
            >
              {role.name}
            </span>
          ))}
        </div>

        {showRoleForm && (
          <form onSubmit={roleForm.handleSubmit(onRoleSubmit)}>
            <Card className="space-y-3">
              <Input
                placeholder="Назва ролі (наприклад Manager)"
                {...roleForm.register('name')}
                error={roleForm.formState.errors.name?.message}
              />
              <Input placeholder="Опис (необов'язково)" {...roleForm.register('description')} />

              {roleError && <p className="text-[12px] text-[#B3261E]">{roleError}</p>}

              <Button type="submit" disabled={roleForm.formState.isSubmitting}>
                {roleForm.formState.isSubmitting ? 'Створення...' : 'Створити роль'}
              </Button>
            </Card>
          </form>
        )}
      </div>

      <h2 className="mb-3 text-[15px] font-medium text-[#171A18]">Запросити учасника</h2>
      <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)}>
        <Card className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            {...inviteForm.register('email')}
            error={inviteForm.formState.errors.email?.message}
          />

          <Select {...inviteForm.register('roleId')}>
            <option value="">Оберіть роль</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </Select>
          {inviteForm.formState.errors.roleId && (
            <p className="text-[12px] text-[#B3261E]">
              {inviteForm.formState.errors.roleId.message}
            </p>
          )}

          {inviteError && <p className="text-[12px] text-[#B3261E]">{inviteError}</p>}
          {inviteSuccess && <p className="text-[12px] text-[#24493B]">{inviteSuccess}</p>}

          <Button type="submit" disabled={inviteForm.formState.isSubmitting}>
            {inviteForm.formState.isSubmitting ? 'Надсилання...' : 'Запросити'}
          </Button>
        </Card>
      </form>
    </div>
  )
}