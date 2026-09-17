'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AxiosError } from 'axios'

import * as authApi from '@/lib/auth-api'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token')
      console.log('Token from URL:', token)
      setDebugInfo(`Token: ${token ? token.slice(0, 20) + '...' : 'відсутній'}`)

      if (!token) {
        setStatus('error')
        setMessage('Токен відсутній у посиланні')
        return
      }

      try {
        console.log('Sending verify request...')
        const result = await authApi.verifyEmail(token)
        console.log('Verify result:', result)
        
        setStatus('success')
        setMessage('Email успішно підтверджено!')
        setTimeout(() => router.push('/'), 2000)
      } catch (err) {
        console.error('Verify error:', err)
        
        let errorMessage = 'Не вдалося підтвердити email'
        
        if (err instanceof AxiosError) {
          console.log('Error response:', err.response?.status, err.response?.data)
          errorMessage =
            (err.response?.data as { message?: string })?.message ||
            `Статус: ${err.response?.status}`
        }

        setStatus('error')
        setMessage(errorMessage)
      }
    }

    void verify()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8 text-center">
        {status === 'loading' && (
          <>
            <p className="text-lg font-semibold">Підтвердження email...</p>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
            {debugInfo && (
              <p className="mt-4 rounded bg-gray-100 p-2 font-mono text-xs text-gray-600">
                {debugInfo}
              </p>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <p className="text-lg font-semibold text-green-600">✓ {message}</p>
            <p className="text-sm text-gray-500">Перенаправляю на головну сторінку...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-lg font-semibold text-red-600">✗ Помилка</p>
            <p className="text-sm text-gray-600">{message}</p>
            {debugInfo && (
              <div className="mt-4 rounded bg-gray-100 p-2">
                <p className="text-xs font-mono text-gray-700">{debugInfo}</p>
              </div>
            )}
            <div className="space-y-2 pt-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                На сторінку входу
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full rounded border px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Повторно реєструватись
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}