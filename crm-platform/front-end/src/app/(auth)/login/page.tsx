'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import { useAuth } from '@/providers/auth-provider'
import {
  loginSchema,
  type LoginFormData,
} from '@/lib/validation/auth-schemas'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)

    try {
      await login(data.email, data.password)
      router.push('/dashboard')
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined

      setServerError(message ?? 'Не вдалося увійти. Спробуйте ще раз.')
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="relative hidden overflow-hidden bg-gray-950 lg:flex lg:flex-col lg:justify-between p-12 xl:p-16">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">
                C
              </div>

              <span className="text-lg font-bold tracking-tight">
                CRM Platform
              </span>
            </Link>
          </div>

          <div className="relative max-w-xl">
          

            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Ваш бізнес.
              <br />
              В одному місці.
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-400">
              Увійдіть до CRM та продовжуйте працювати з клієнтами,
              командами, модулями та автоматизаціями.
            </p>
          </div>

          <p className="relative text-xs text-gray-600">
            © 2026 CRM Platform
          </p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-lg font-bold text-white">
                  C
                </div>

                <span className="font-bold text-gray-950">
                  CRM Platform
                </span>
              </Link>
            </div>

            <div className="mb-8">

              <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                Увійдіть в акаунт
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Введіть свої дані, щоб продовжити роботу.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Email
                </label>

                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  }`}
                />

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-800">
                    Пароль
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Забули пароль?
                  </Link>
                </div>

                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                    errors.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                />

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Вхід...' : 'Увійти'}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">або</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Немає акаунту?{' '}
              <Link
                href="/register"
                className="font-semibold text-gray-950 transition hover:text-blue-600"
              >
                Зареєструватись
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}