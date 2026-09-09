import { apiClient } from './api-client'
import type { CrmRecord, PaginatedRecords } from '@/types/record'
import type { FilterRule } from '@/components/filter-builder'

export async function getRecords(
  moduleId: string,
  query: Record<string, string> = {},
) {
  const { data } = await apiClient.get<PaginatedRecords>(
    `/modules/${moduleId}/records`,
    { params: query },
  )
  return data
}

export async function getRecord(recordId: string) {
  const { data } = await apiClient.get<CrmRecord>(`/records/${recordId}`)
  return data
}

export async function createRecord(
  moduleId: string,
  data: Record<string, unknown>,
) {
  const { data: record } = await apiClient.post<CrmRecord>(
    `/modules/${moduleId}/records`,
    { data },
  )
  return record
}

export async function updateRecord(
  recordId: string,
  data: Record<string, unknown>,
) {
  const { data: record } = await apiClient.patch<CrmRecord>(
    `/records/${recordId}`,
    { data },
  )
  return record
}

export async function deleteRecord(recordId: string) {
  await apiClient.delete(`/records/${recordId}`)
}

export function buildFilterQuery(
  rules: FilterRule[],
  matchMode: 'all' | 'any',
): Record<string, string> {
  const query: Record<string, string> = {}

  if (matchMode === 'any' && rules.length > 1) {
    query.match = 'any'
  }

  for (const rule of rules) {
    if (!rule.fieldKey) continue
    if (rule.operator !== 'isEmpty' && rule.operator !== 'isNotEmpty' && !rule.value) continue

    const key = rule.operator === 'equals' ? rule.fieldKey : `${rule.fieldKey}_${rule.operator}`
    query[key] = rule.operator === 'isEmpty' || rule.operator === 'isNotEmpty' ? 'true' : rule.value
  }

  return query
}