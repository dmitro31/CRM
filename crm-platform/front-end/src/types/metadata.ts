export type FieldType =
  | 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'BOOLEAN'
  | 'DATE' | 'DATETIME' | 'EMAIL' | 'PHONE' | 'URL'
  | 'SELECT' | 'MULTI_SELECT' | 'FILE' | 'IMAGE' | 'RELATION'

export interface Field {
  id: string
  name: string
  key: string
  type: FieldType
  description: string | null
  required: boolean
  unique: boolean
  defaultValue: unknown
  options: string[] | null
  placeholder: string | null
  order: number
  isActive: boolean
  moduleId: string
}

export interface CrmModule {
  id: string
  name: string
  key: string
  description: string | null
  icon: string | null
  color: string | null
  order: number
  isActive: boolean
  workspaceId: string
  fields?: Field[]
}