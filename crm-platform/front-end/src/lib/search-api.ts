import * as metadataApi from './metadata-api'
import * as recordApi from './record-api'

export interface SearchResult {
  type: 'module' | 'record'
  id: string
  title: string
  subtitle: string
  href: string
}

export async function globalSearch(
  workspaceId: string,
  query: string,
): Promise<SearchResult[]> {
  if (query.trim().length < 2) return []

  const modules = await metadataApi.getModules(workspaceId)

  const matchingModules = modules.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  )

  const moduleResults: SearchResult[] = matchingModules.map(m => ({
    type: 'module',
    id: m.id,
    title: m.name,
    subtitle: 'Модуль',
    href: `/workspace/${workspaceId}/modules/${m.id}`,
  }))

  const recordResultsPerModule = await Promise.all(
    modules.slice(0, 6).map(async module_ => {
      const fields = await metadataApi.getFields(module_.id)
      const textFields = fields.filter(f =>
        ['TEXT', 'TEXTAREA', 'EMAIL', 'PHONE'].includes(f.type),
      )

      if (textFields.length === 0) return []

      const results = await Promise.all(
        textFields.slice(0, 2).map(field =>
          recordApi
            .getRecords(module_.id, { [`${field.key}_contains`]: query, limit: '5' })
            .catch(() => ({ items: [], total: 0, page: 1, limit: 5 })),
        ),
      )

      const seen = new Set<string>()
      const items = results
        .flatMap(r => r.items)
        .filter(record => {
          if (seen.has(record.id)) return false
          seen.add(record.id)
          return true
        })

      return items.map(record => {
        const firstField = textFields[0]
        const label = String(record.data[firstField.key] ?? record.id.slice(0, 8))

        return {
          type: 'record' as const,
          id: record.id,
          title: label,
          subtitle: module_.name,
          href: `/workspace/${workspaceId}/modules/${module_.id}/records`,
        }
      })
    }),
  )

  return [...moduleResults, ...recordResultsPerModule.flat()].slice(0, 12)
}