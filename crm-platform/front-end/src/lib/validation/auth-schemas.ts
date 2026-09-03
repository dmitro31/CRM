import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Невалідна email адреса'),
  password: z.string().min(1, 'Введіть пароль'),
})

export const registerSchema = z.object({
  email: z.string().email('Невалідна email адреса'),
  password: z.string().min(8, 'Пароль має містити щонайменше 8 символів'),
  firstName: z.string().min(1, "Введіть ім'я"),
  lastName: z.string().min(1, 'Введіть прізвище'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>