'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

import * as authApi from '@/lib/auth-api'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-lg font-bold text-white">
              C
            </div>

            <span className="font-bold text-gray-950">
              CRM Platform
            </span>
          </Link>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-gray-200/40 sm:p-10">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                Підтверджуємо email
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Зачекайте кілька секунд. Ми перевіряємо ваше посилання.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <svg
                  className="h-8 w-8 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                Email підтверджено
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Ваш акаунт успішно підтверджено. Тепер можна увійти та
                почати працювати.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Перейти до входу
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <svg
                  className="h-8 w-8 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.3 3.5 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                Не вдалося підтвердити email
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Посилання недійсне або протерміноване. Спробуйте отримати
                новий лист підтвердження.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Повернутися до входу
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}