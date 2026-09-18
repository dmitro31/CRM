'use client'

import { useState, useEffect } from 'react'
import { useRouter , useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import { useAuth } from '@/providers/auth-provider'
import { loginSchema, type LoginFormData } from '@/lib/validation/auth-schemas'
import { Button } from '@/shared/UI/Button'
import { Input } from '@/shared/UI/Input'
import { FormField } from '@/shared/UI/FormField'
import Logo from '@/features/header/logo'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

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

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setServerError('Не вдалося увійти через провайдера. Спробуй ще раз або використай email.')
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-[#F6F7F4]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_480px]">
        <section className="relative hidden overflow-hidden bg-[#14201B] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#24493B]/40 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-[#C1611F]/10 blur-3xl" />

          <Link href="/" className="relative flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M3 15L8 9L12.5 13L19 5" stroke="#E7EEE9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="19" cy="5" r="2.2" fill="#E7EEE9" />
            </svg>
            <span className="text-[17px] font-medium text-white">BoostFlow</span>
          </Link>

          <div className="relative max-w-lg">
            <h2 className="text-[38px] font-medium leading-[1.15] tracking-tight text-white">
              Ваш бізнес.
              <br />
              В одному місці.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#B7BFB9]">
              Увійди в CRM і продовжуй роботу з клієнтами, командою, модулями
              й автоматизацією.
            </p>
          </div>

          <p className="relative text-[11px] text-[#6C716A]">© {new Date().getFullYear()} BoostFlow</p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <h1 className="text-[26px] font-medium tracking-tight text-[#171A18]">
              Увійти в акаунт
            </h1>
            <p className="mt-1.5 text-[13.5px] text-[#6C716A]">
              Введи свої дані, щоб продовжити роботу.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
              <FormField label="Email" error={errors.email?.message}>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={!!errors.email}
                />
              </FormField>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-[#171A18]">Пароль</label>
                  <Link href="/forgot-password" className="text-[12px] font-medium text-[#24493B] hover:underline">
                    Забули пароль?
                  </Link>
                </div>
                <Input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={errors.password?.message}
                />
              </div>

              {serverError && (
                <div className="rounded-md border border-[#F3C6C1] bg-[#FBEDEC] px-3.5 py-2.5 text-[13px] text-[#B3261E]">
                  {serverError}
                </div>
              )}

              <Button type="submit" loading={isSubmitting} loadingText="Вхід..." className="h-11 w-full">
                Увійти
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#DFE3DC]" />
              <span className="text-[11px] text-[#8B9088]">або</span>
              <div className="h-px flex-1 bg-[#DFE3DC]" />
            </div>

            <p className="text-center text-[13px] text-[#6C716A]">
              Немає акаунту?{' '}
              <Link href="/register" className="font-medium text-[#171A18] hover:text-[#24493B]">
                Зареєструватись
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}