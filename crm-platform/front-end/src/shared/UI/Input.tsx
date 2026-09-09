import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => (
    <div>
      <input
        ref={ref}
        className={`w-full rounded-md border px-3 py-2 text-[13px] text-[#171A18] placeholder:text-[#8B9088] focus:outline-none ${
          error
            ? 'border-[#B3261E]'
            : 'border-[#DFE3DC] focus:border-[#24493B]/40'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[12px] text-[#B3261E]">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'