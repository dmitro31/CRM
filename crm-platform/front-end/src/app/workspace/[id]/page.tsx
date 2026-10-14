'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Activity } from 'lucide-react'

export default function WorkspaceRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard`)
    }
  }, [id, router])

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7EEE9] text-[#24493B] shadow-sm">
          <Activity size={22} className="animate-pulse" />
          <div className="absolute -inset-1 rounded-xl border border-[#24493B]/20 animate-ping opacity-25" />
        </div>
        
        <div>
          <h2 className="text-[15px] font-medium text-[#171A18]">
            Підготовка workspace...
          </h2>
          <p className="mt-1 text-[12px] text-[#6C716A]">
            За мить ви будете перенаправлені на дашборд
          </p>
        </div>
      </div>
    </div>
  )
}