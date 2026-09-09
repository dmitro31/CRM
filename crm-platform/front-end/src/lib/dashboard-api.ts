import * as metadataApi from './metadata-api'
import * as recordApi from './record-api'
import * as workflowApi from './workflow-api'
import type { CrmModule } from '@/types/metadata'
import type { CrmRecord } from '@/types/record'

export interface RecentRecord {
  record: CrmRecord
  moduleName: string
  moduleId: string
}

export async function getWorkspaceOverview(workspaceId: string) {
  const modules = await metadataApi.getModules(workspaceId)

  const recordCounts = await Promise.all(
    modules.map(async module_ => {
      const result = await recordApi.getRecords(module_.id, { limit: '1' })
      return result.total
    }),
  )

  const totalRecords = recordCounts.reduce((sum, count) => sum + count, 0)

  const recentPerModule = await Promise.all(
    modules.map(async module_ => {
      const result = await recordApi.getRecords(module_.id, {
        limit: '5',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      return result.items.map(record => ({
        record,
        moduleName: module_.name,
        moduleId: module_.id,
      }))
    }),
  )

  const recentRecords: RecentRecord[] = recentPerModule
    .flat()
    .sort(
      (a, b) =>
        new Date(b.record.createdAt).getTime() -
        new Date(a.record.createdAt).getTime(),
    )
    .slice(0, 8)

  const workflows = await workflowApi.getWorkflows(workspaceId)
  const activeWorkflows = workflows.filter(w => w.enabled).length

  return {
    modules,
    moduleCount: modules.length,
    totalRecords,
    recentRecords,
    workflowCount: workflows.length,
    activeWorkflows,
  }
}

function firstDisplayValue(record: CrmRecord, module_: CrmModule): string {
  const firstField = module_.fields?.find(f => f.isActive)
  if (!firstField) return record.id.slice(0, 8)
  const value = record.data[firstField.key]
  return value ? String(value) : record.id.slice(0, 8)
}

export { firstDisplayValue }

export interface TimelinePoint {
  date: string
  count: number
}

export async function getRecordsTimeline(
  workspaceId: string,
  modules: CrmModule[],
  days = 14,
): Promise<TimelinePoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const allTimestamps = (
    await Promise.all(
      modules.map(async module_ => {
        const result = await recordApi.getRecords(module_.id, {
          limit: '100',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        return result.items.map(r => r.createdAt)
      }),
    )
  ).flat()

  const buckets = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    buckets.set(d.toISOString().slice(0, 10), 0)
  }

  for (const ts of allTimestamps) {
    const day = ts.slice(0, 10)
    if (buckets.has(day)) {
      buckets.set(day, (buckets.get(day) ?? 0) + 1)
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }))
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