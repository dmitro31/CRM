'use client'

import { useState } from 'react'

import type { CrmModule, Field } from '@/types/metadata'
import type {
  WorkflowDraft,
  TriggerEvent,
  ConditionOperator,
  ActionType,
} from '@/types/workflow'

interface WorkflowBuilderProps {
  modules: CrmModule[]
  draft: WorkflowDraft
  onChange: (draft: WorkflowDraft) => void
}

const EVENT_LABELS: Record<TriggerEvent, string> = {
  RECORD_CREATED: 'Запис створено',
  RECORD_UPDATED: 'Запис оновлено',
  FIELD_CHANGED: 'Поле змінилось',
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'дорівнює',
  not_equals: 'не дорівнює',
  gt: 'більше ніж',
  lt: 'менше ніж',
}

const ACTION_LABELS: Record<ActionType, string> = {
  SEND_NOTIFICATION: 'Надіслати сповіщення',
  SEND_EMAIL: 'Надіслати email',
  UPDATE_RECORD: 'Оновити запис',
}

export function WorkflowBuilder({ modules, draft, onChange }: WorkflowBuilderProps) {
  const [selectedModuleId, setSelectedModuleId] = useState('')

  const selectedModule = modules.find(m => m.id === selectedModuleId)
  const availableFields: Field[] = selectedModule?.fields ?? []

  const update = (patch: Partial<WorkflowDraft>) => {
    onChange({ ...draft, ...patch })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Назва автоматизації</label>
        <input
          value={draft.name}
          onChange={e => update({ name: e.target.value })}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-medium">Коли...</h3>

        <div className="mb-3">
          <label className="mb-1 block text-sm text-gray-600">
            Модуль (для вибору полів нижче)
          </label>
          <select
            value={selectedModuleId}
            onChange={e => setSelectedModuleId(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Оберіть модуль</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <select
            value={draft.trigger.event}
            onChange={e =>
              update({
                trigger: {
                  event: e.target.value as TriggerEvent,
                  fieldKey: undefined,
                },
              })
            }
            className="w-full rounded border px-3 py-2"
          >
            {(Object.keys(EVENT_LABELS) as TriggerEvent[]).map(event => (
              <option key={event} value={event}>
                {EVENT_LABELS[event]}
              </option>
            ))}
          </select>
        </div>

        {draft.trigger.event === 'FIELD_CHANGED' && (
          <select
            value={draft.trigger.fieldKey ?? ''}
            onChange={e =>
              update({
                trigger: { ...draft.trigger, fieldKey: e.target.value },
              })
            }
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Оберіть поле</option>
            {availableFields.map(f => (
              <option key={f.key} value={f.key}>
                {f.name} ({f.key})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Якщо (необов&apos;язково)</h3>
          <button
            type="button"
            onClick={() =>
              update({
                conditions: [
                  ...draft.conditions,
                  { fieldKey: '', operator: 'equals', value: '' },
                ],
              })
            }
            className="text-sm text-blue-600 hover:underline"
          >
            + Умова
          </button>
        </div>

        {draft.conditions.map((condition, index) => (
          <div key={index} className="mb-2 flex gap-2">
            <select
              value={condition.fieldKey}
              onChange={e => {
                const next = [...draft.conditions]
                next[index] = { ...condition, fieldKey: e.target.value }
                update({ conditions: next })
              }}
              className="flex-1 rounded border px-2 py-1.5 text-sm"
            >
              <option value="">Поле</option>
              {availableFields.map(f => (
                <option key={f.key} value={f.key}>
                  {f.name}
                </option>
              ))}
            </select>

            <select
              value={condition.operator}
              onChange={e => {
                const next = [...draft.conditions]
                next[index] = {
                  ...condition,
                  operator: e.target.value as ConditionOperator,
                }
                update({ conditions: next })
              }}
              className="rounded border px-2 py-1.5 text-sm"
            >
              {(Object.keys(OPERATOR_LABELS) as ConditionOperator[]).map(op => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </select>

            <input
              value={condition.value}
              onChange={e => {
                const next = [...draft.conditions]
                next[index] = { ...condition, value: e.target.value }
                update({ conditions: next })
              }}
              placeholder="Значення"
              className="flex-1 rounded border px-2 py-1.5 text-sm"
            />

            <button
              type="button"
              onClick={() =>
                update({
                  conditions: draft.conditions.filter((_, i) => i !== index),
                })
              }
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}

        {draft.conditions.length === 0 && (
          <p className="text-sm text-gray-400">Без умов — спрацює завжди</p>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Тоді</h3>
          <button
            type="button"
            onClick={() =>
              update({
                actions: [...draft.actions, { type: 'SEND_NOTIFICATION' }],
              })
            }
            className="text-sm text-blue-600 hover:underline"
          >
            + Дія
          </button>
        </div>

        {draft.actions.map((action, index) => (
          <div key={index} className="mb-3 rounded border p-3">
            <div className="mb-2 flex items-center justify-between">
              <select
                value={action.type}
                onChange={e => {
                  const next = [...draft.actions]
                  next[index] = { type: e.target.value as ActionType }
                  update({ actions: next })
                }}
                className="rounded border px-2 py-1.5 text-sm"
              >
                {(Object.keys(ACTION_LABELS) as ActionType[]).map(type => (
                  <option key={type} value={type}>
                    {ACTION_LABELS[type]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() =>
                  update({ actions: draft.actions.filter((_, i) => i !== index) })
                }
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>

            {action.type === 'SEND_NOTIFICATION' && (
              <div className="space-y-2">
                <input
                  value={action.title ?? ''}
                  onChange={e => {
                    const next = [...draft.actions]
                    next[index] = { ...action, title: e.target.value }
                    update({ actions: next })
                  }}
                  placeholder="Заголовок"
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
                <textarea
                  value={action.message ?? ''}
                  onChange={e => {
                    const next = [...draft.actions]
                    next[index] = { ...action, message: e.target.value }
                    update({ actions: next })
                  }}
                  placeholder="Текст повідомлення"
                  rows={2}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </div>
            )}

            {action.type === 'SEND_EMAIL' && (
              <div className="space-y-2">
                <input
                  value={action.subject ?? ''}
                  onChange={e => {
                    const next = [...draft.actions]
                    next[index] = { ...action, subject: e.target.value }
                    update({ actions: next })
                  }}
                  placeholder="Тема листа"
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
                <textarea
                  value={action.body ?? ''}
                  onChange={e => {
                    const next = [...draft.actions]
                    next[index] = { ...action, body: e.target.value }
                    update({ actions: next })
                  }}
                  placeholder="Текст листа"
                  rows={2}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </div>
            )}

            {action.type === 'UPDATE_RECORD' && (
              <UpdateRecordFields
                fields={availableFields}
                data={(action.data as Record<string, string>) ?? {}}
                onChange={data => {
                  const next = [...draft.actions]
                  next[index] = { ...action, data }
                  update({ actions: next })
                }}
              />
            )}
          </div>
        ))}

        {draft.actions.length === 0 && (
          <p className="text-sm text-gray-400">Додай хоча б одну дію</p>
        )}
      </div>
    </div>
  )
}

function UpdateRecordFields({
  fields,
  data,
  onChange,
}: {
  fields: Field[]
  data: Record<string, string>
  onChange: (data: Record<string, string>) => void
}) {
  return (
    <div className="space-y-2">
      {fields.map(field => (
        <div key={field.key} className="flex items-center gap-2">
          <span className="w-32 shrink-0 text-sm text-gray-600">{field.name}</span>
          {field.type === 'SELECT' ? (
            <select
              value={data[field.key] ?? ''}
              onChange={e => onChange({ ...data, [field.key]: e.target.value })}
              className="flex-1 rounded border px-2 py-1.5 text-sm"
            >
              <option value="">— не змінювати —</option>
              {field.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={data[field.key] ?? ''}
              onChange={e => onChange({ ...data, [field.key]: e.target.value })}
              placeholder="Нове значення"
              className="flex-1 rounded border px-2 py-1.5 text-sm"
            />
          )}
        </div>
      ))}
    </div>
  )
}