import { z } from 'zod'

export const createModuleSchema = z.object({
  name: z.string().min(2, 'Мінімум 2 символи').max(100),
  description: z.string().max(500).optional(),
})

export type CreateModuleFormData = z.infer<typeof createModuleSchema>

const FIELD_TYPES = [
  'TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN',
  'DATE', 'DATETIME', 'EMAIL', 'PHONE', 'URL',
  'SELECT', 'MULTI_SELECT', 'FILE', 'IMAGE', 'RELATION',
] as const

export const createFieldSchema = z.object({
  name: z.string().min(1, "Введіть назву поля").max(100),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  optionsRaw: z.string().optional(),
})

export type CreateFieldFormData = z.infer<typeof createFieldSchema>

export const FIELD_TYPE_LABELS: Record<(typeof FIELD_TYPES)[number], string> = {
  TEXT: 'Текст',
  TEXTAREA: 'Довгий текст',
  NUMBER: 'Число',
  BOOLEAN: 'Так/Ні',
  DATE: 'Дата',
  DATETIME: 'Дата і час',
  EMAIL: 'Email',
  PHONE: 'Телефон',
  URL: 'Посилання',
  SELECT: 'Вибір (один)',
  MULTI_SELECT: 'Вибір (декілька)',
  FILE: 'Файл',
  IMAGE: 'Зображення',
  RELATION: "Зв'язок",
}