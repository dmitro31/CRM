import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padded?: boolean
}

export function Card({
  hoverable,
  padded = true,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-md border border-[#DFE3DC] bg-white ${padded ? 'p-4' : ''} ${
        hoverable ? 'transition-colors hover:border-[#C7CDC2]' : ''
      } ${className}`}
      {...props}
    />
  )
}