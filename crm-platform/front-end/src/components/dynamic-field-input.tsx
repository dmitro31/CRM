'use client'

import type { Field } from '@/types/metadata'

interface DynamicFieldInputProps {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}

export function DynamicFieldInput({
  field,
  value,
  onChange,
  error,
}: DynamicFieldInputProps) {
  const label = (
    <label className="mb-1 block text-sm font-medium">
      {field.name}
      {field.required && <span className="ml-1 text-red-500">*</span>}
    </label>
  )

  const errorText = error && (
    <p className="mt-1 text-sm text-red-600">{error}</p>
  )

  switch (field.type) {
    case 'TEXTAREA':
      return (
        <div>
          {label}
          <textarea
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
          {errorText}
        </div>
      )

    case 'NUMBER':
      return (
        <div>
          {label}
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={e =>
              onChange(e.target.value === '' ? undefined : Number(e.target.value))
            }
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded border px-3 py-2"
          />
          {errorText}
        </div>
      )

    case 'BOOLEAN':
      return (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={(value as boolean) ?? false}
              onChange={e => onChange(e.target.checked)}
            />
            {field.name}
          </label>
          {errorText}
        </div>
      )

    case 'DATE':
      return (
        <div>
          {label}
          <input
            type="date"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          {errorText}
        </div>
      )

    case 'DATETIME':
      return (
        <div>
          {label}
          <input
            type="datetime-local"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          {errorText}
        </div>
      )

    case 'EMAIL':
      return (
        <div>
          {label}
          <input
            type="email"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded border px-3 py-2"
          />
          {errorText}
        </div>
      )

    case 'PHONE':
      return (
        <div>
          {label}
          <input
            type="tel"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded border px-3 py-2"
          />
          {errorText}
        </div>
      )

    case 'URL':
      return (
        <div>
          {label}
          <input
            type="url"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded border px-3 py-2"
          />
          {errorText}
        </div>
      )

    case 'SELECT':
      return (
        <div>
          {label}
          <select
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value || undefined)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">— Оберіть —</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errorText}
        </div>
      )

    case 'MULTI_SELECT': {
      const selected = (value as string[]) ?? []
      return (
        <div>
          {label}
          <div className="flex flex-wrap gap-2">
            {field.options?.map(option => {
              const isChecked = selected.includes(option)
              return (
                <label
                  key={option}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isChecked}
                    onChange={() => {
                      const next = isChecked
                        ? selected.filter(v => v !== option)
                        : [...selected, option]
                      onChange(next)
                    }}
                  />
                  {option}
                </label>
              )
            })}
          </div>
          {errorText}
        </div>
      )
    }

    case 'FILE':
    case 'IMAGE':
    case 'RELATION':
      return (
        <div>
          {label}
          <p className="text-sm text-gray-400">
            Тип поля &quot;{field.type}&quot; ще не підтримується у формі
          </p>
        </div>
      )

    default:
      return (
        <div>
          {label}
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="w-full rounded border px-3 py-2"
          />
          {errorText}
        </div>
      )
  }
}