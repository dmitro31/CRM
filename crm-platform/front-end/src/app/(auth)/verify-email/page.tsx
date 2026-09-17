'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AxiosError } from 'axios'

import * as authApi from '@/lib/auth-api'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Токен відсутній у посиланні')
        return
      }

      try {
        await authApi.verifyEmail(token)
        setStatus('success')
        setMessage('Email успішно підтверджено!')
        setTimeout(() => router.push('/'), 2000)
      } catch (err) {
        let errorMessage = 'Не вдалося підтвердити email'

        if (err instanceof AxiosError) {
          errorMessage =
            (err.response?.data as { message?: string })?.message ||
            `Статус: ${err.response?.status} — можливо посилання прострочене`
        }

        setStatus('error')
        setMessage(errorMessage)
      }
    }

    void verify()
  }, [searchParams, router])

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setMessage('Введіть свій email')
      return
    }

    setIsResending(true)
    setMessage('')

    try {
      await authApi.resendVerifyEmail(email)
      setStatus('resend')
      setMessage('Новий верифікаційний лист надіслано на ваш email')
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setMessage(errorMessage ?? 'Не вдалося надіслати лист')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8">
        {status === 'loading' && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold">Підтвердження email...</p>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-green-600">✓ {message}</p>
            <p className="text-sm text-gray-500">Перенаправляю на головну...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600">✗ Помилка</p>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium text-gray-700">Надіслати новий верифікаційний лист:</p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded border px-3 py-2 text-sm"
              />
              <button
                onClick={() => void handleResendEmail()}
                disabled={isResending}
                className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isResending ? 'Надсилання...' : 'Надіслати лист'}
              </button>
            </div>

            <div className="space-y-2 border-t pt-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                На сторінку входу
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Повторно реєструватись
              </button>
            </div>
          </div>
        )}

        {status === 'resend' && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold text-green-600">✓ Лист надіслано</p>
            <p className="text-sm text-gray-600">{message}</p>
            <p className="text-xs text-gray-500">Перевір папку "Спам", якщо листа немає</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              На сторінку входу
            </button>
          </div>
        )}
      </div>
    </div>
  )
}