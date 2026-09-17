'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { setAccessToken } from '@/lib/api-client'

export default function OAuthSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setAccessToken(token)
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [searchParams, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-500">Авторизація...</p>
    </div>
  )
}