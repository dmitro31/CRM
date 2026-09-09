'use client'

import { Plus, X } from 'lucide-react'

import { Select } from '@/shared/UI/Select'
import type { Field } from '@/types/metadata'

export interface FilterRule {
  fieldKey: string
  operator: string
  value: string
}

interface FilterBuilderProps {
  fields: Field[]
  rules: FilterRule[]
  matchMode: 'all' | 'any'
  onChange: (rules: FilterRule[]) => void
  onMatchModeChange: (mode: 'all' | 'any') => void
}

const OPERATORS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  TEXT: [
    { value: 'equals', label: 'дорівнює' },
    { value: 'contains', label: 'містить' },
    { value: 'startsWith', label: 'починається з' },
    { value: 'ne', label: 'не дорівнює' },
    { value: 'isEmpty', label: 'порожнє' },
  ],
  NUMBER: [
    { value: 'equals', label: 'дорівнює' },
    { value: 'gt', label: 'більше' },
    { value: 'gte', label: 'більше або дорівнює' },
    { value: 'lt', label: 'менше' },
    { value: 'lte', label: 'менше або дорівнює' },
    { value: 'ne', label: 'не дорівнює' },
  ],
  SELECT: [
    { value: 'equals', label: 'дорівнює' },
    { value: 'ne', label: 'не дорівнює' },
  ],
  DEFAULT: [
    { value: 'equals', label: 'дорівнює' },
    { value: 'ne', label: 'не дорівнює' },
  ],
}

function getOperators(type: string) {
  return OPERATORS_BY_TYPE[type] ?? OPERATORS_BY_TYPE.DEFAULT
}

export function FilterBuilder({
  fields,
  rules,
  matchMode,
  onChange,
  onMatchModeChange,
}: FilterBuilderProps) {
  const filterableFields = fields.filter(f =>
    ['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PHONE', 'URL', 'SELECT'].includes(f.type),
  )

  const addRule = () => {
    const firstField = filterableFields[0]
    if (!firstField) return
    onChange([...rules, { fieldKey: firstField.key, operator: 'equals', value: '' }])
  }

  const updateRule = (index: number, patch: Partial<FilterRule>) => {
    const next = [...rules]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index))
  }

  if (filterableFields.length === 0) return null

  return (
    <div className="mb-4 rounded-md border border-[#DFE3DC] bg-white p-3">
      {rules.length > 1 && (
        <div className="mb-2 flex items-center gap-2 text-[12px] text-[#6C716A]">
          <span>Збіг:</span>
          <button
            onClick={() => onMatchModeChange('all')}
            className={`rounded-full px-2.5 py-0.5 ${
              matchMode === 'all' ? 'bg-[#E7EEE9] text-[#24493B]' : 'hover:bg-[#F6F7F4]'
            }`}
          >
            Усі умови (AND)
          </button>
          <button
            onClick={() => onMatchModeChange('any')}
            className={`rounded-full px-2.5 py-0.5 ${
              matchMode === 'any' ? 'bg-[#E7EEE9] text-[#24493B]' : 'hover:bg-[#F6F7F4]'
            }`}
          >
            Будь-яка умова (OR)
          </button>
        </div>
      )}

      <div className="space-y-2">
        {rules.map((rule, index) => {
          const field = fields.find(f => f.key === rule.fieldKey)
          const operators = getOperators(field?.type ?? 'DEFAULT')
          const needsValue = rule.operator !== 'isEmpty' && rule.operator !== 'isNotEmpty'

          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-36">
                <Select
                  value={rule.fieldKey}
                  onChange={e => updateRule(index, { fieldKey: e.target.value, operator: 'equals' })}
                >
                  {filterableFields.map(f => (
                    <option key={f.key} value={f.key}>{f.name}</option>
                  ))}
                </Select>
              </div>

              <div className="w-40">
                <Select value={rule.operator} onChange={e => updateRule(index, { operator: e.target.value })}>
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </Select>
              </div>

              {needsValue && (
                field?.type === 'SELECT' ? (
                  <div className="flex-1">
                    <Select value={rule.value} onChange={e => updateRule(index, { value: e.target.value })}>
                      <option value="">— значення —</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  <input
                    value={rule.value}
                    onChange={e => updateRule(index, { value: e.target.value })}
                    placeholder="Значення"
                    className="flex-1 rounded-md border border-[#DFE3DC] px-2.5 py-1.5 text-[13px] focus:border-[#24493B]/40 focus:outline-none"
                  />
                )
              )}

              <button onClick={() => removeRule(index)} className="text-[#8B9088] hover:text-[#B3261E]">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={addRule}
        className="mt-2 flex items-center gap-1 text-[12.5px] text-[#24493B] hover:underline"
      >
        <Plus size={13} /> Додати умову
      </button>
    </div>
  )
}