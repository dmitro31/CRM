import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Мінімум 2 символи').max(100),
  description: z.string().max(500).optional(),
})

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>

export const inviteMemberSchema = z.object({
  email: z.string().email('Невалідна email адреса'),
  roleId: z.string().min(1, 'Оберіть роль'),
})

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Мінімум 2 символи').max(50),
  description: z.string().max(300).optional(),
})

export type CreateRoleFormData = z.infer<typeof createRoleSchema>