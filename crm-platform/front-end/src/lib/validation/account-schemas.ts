import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'Мінімум 2 символи').max(50),
  lastName: z.string().max(50).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>