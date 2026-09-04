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