export interface CrmRecord {
  id: string
  moduleId: string
  data: Record<string, unknown>
  createdById: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedRecords {
  items: CrmRecord[]
  total: number
  page: number
  limit: number
}
export interface RecordFileValue {
  fileId: string
  originalName: string
  mimeType: string
  size: number
}