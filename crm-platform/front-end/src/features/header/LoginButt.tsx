import Link from 'next/link'
import { LogIn } from 'lucide-react'

export default function LoginButt() {
  return (
    <Link
      href="/login"
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#24493B] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1d3b30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24493B] focus-visible:ring-offset-2 active:bg-[#172e26]"
    >
      <LogIn size={15} />
      <span>Увійти</span>
    </Link>
  )
}