import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export function Input({
  error = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <input
      className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
        error ? 'border-red-400' : 'border-gray-200'
      } ${className}`}
      {...props}
    />
  )
}