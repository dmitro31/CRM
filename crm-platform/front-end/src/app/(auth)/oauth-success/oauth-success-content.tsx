'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import { useAuth } from '@/providers/auth-provider'

export function OAuthSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loginWithToken } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const finishLogin = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setError('Токен авторизації відсутній')
        setTimeout(() => router.replace('/login'), 1500)
        return
      }

      try {
        await loginWithToken(token)
        router.replace('/dashboard')
      } catch {
        setError('Не вдалося завершити авторизацію')
        setTimeout(() => router.replace('/login'), 1500)
      }
    }

    void finishLogin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <p className="text-sm text-gray-500">Завершуємо авторизацію...</p>
          </>
        )}
      </div>
    </div>
  )
}