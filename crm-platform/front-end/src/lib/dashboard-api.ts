import { apiClient } from './api-client'
import * as recordApi from './record-api'
import type { CrmModule } from '@/types/metadata'
import type { CrmRecord } from '@/types/record'

export interface RecentRecord {
  record: CrmRecord
  moduleName: string
  moduleId: string
}

export interface TimelinePoint {
  date: string
  count: number
}

export interface DashboardData {
  modules: (CrmModule & { fields: any[] })[]
  moduleCount: number
  totalRecords: number
  recentRecords: RecentRecord[]
  workflowCount: number
  activeWorkflows: number
  timeline: TimelinePoint[]
}

export async function getDashboardData(workspaceId: string): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>(`/dashboard/${workspaceId}`)
  return data
}

export function firstDisplayValue(record: CrmRecord, module_: CrmModule): string {
  const firstField = module_.fields?.find(f => f.isActive)
  if (!firstField) return record.id.slice(0, 8)
  const value = record.data[firstField.key]
  return value ? String(value) : record.id.slice(0, 8)
}

export interface PipelineStage {
  label: string
  count: number
}

export async function getPipelineBreakdown(
  moduleId: string,
  fieldKey: string,
  options: string[],
): Promise<PipelineStage[]> {
  const results = await Promise.all(
    options.map(async option => {
      const result = await recordApi.getRecords(moduleId, {
        [fieldKey]: option,
        limit: '1',
      })
      return { label: option, count: result.total }
    }),
  )
  return results
}