import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-4 flex items-center gap-1.5 text-[13px]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link href={item.href} className="text-[#6C716A] hover:text-[#24493B]">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-[#171A18]' : 'text-[#6C716A]'}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight size={12} className="text-[#C7CDC2]" />}
          </span>
        )
      })}
    </nav>
  )
}