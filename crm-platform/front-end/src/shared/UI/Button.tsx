import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  loadingText?: string
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[#24493B] text-white hover:bg-[#1B392E] disabled:opacity-50',
  secondary:
    'border border-[#DFE3DC] bg-white text-[#171A18] hover:border-[#C7CDC2] hover:bg-[#F6F7F4] disabled:opacity-50',
  ghost: 'text-[#3D423B] hover:bg-[#EEF0EB] disabled:opacity-50',
  danger: 'text-[#B3261E] hover:bg-[#FBEDEC] disabled:opacity-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[12.5px]',
  md: 'px-4 py-2.5 text-[13.5px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, loadingText, disabled, children, className = '', ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (loadingText ?? 'Завантаження...') : children}
    </button>
  ),
)
Button.displayName = 'Button'