import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    const hasError = !!error
    const message = typeof error === 'string' ? error : undefined

    return (
      <div>
        <input
          ref={ref}
          className={`h-11 w-full rounded-md border bg-white px-3.5 text-[13.5px] text-[#171A18] placeholder:text-[#8B9088] transition-colors focus:outline-none ${
            hasError
              ? 'border-[#B3261E]'
              : 'border-[#DFE3DC] focus:border-[#24493B]/50 focus:ring-2 focus:ring-[#24493B]/10'
          } ${className}`}
          {...props}
        />
        {message && <p className="mt-1.5 text-[12px] text-[#B3261E]">{message}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'