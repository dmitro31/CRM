import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<
  HTMLSelectElement,
  SelectProps
>(({ className = '', ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full rounded-md border border-[#DFE3DC] bg-white px-3 py-2 text-[13px] text-[#171A18] focus:border-[#24493B]/40 focus:outline-none ${className}`}
    {...props}
  />
))
Select.displayName = 'Select'