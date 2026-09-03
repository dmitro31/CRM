import type { ReactNode } from 'react'

type FormFieldProps = {
  label: string
  error?: string
  children: ReactNode
}

export function FormField({
  label,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}