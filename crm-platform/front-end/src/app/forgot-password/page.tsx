'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AxiosError } from 'axios'

import { forgotPassword } from '@/lib/auth-api'
import { Button } from '@/shared/UI/Button'
import { Input } from '@/shared/UI/Input'
import { FormField } from '@/shared/UI/FormField'
import Logo from '@/features/header/logo'

const forgotPasswordSchema = z.object({
  email: z.string().email('Введіть коректний email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null)
    try {
      await forgotPassword(data.email)
      setIsSent(true)
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setServerError(message ?? 'Не вдалося надіслати інструкції. Спробуйте ще раз.')
    }
  }

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
              Відновлення
              <br />
              доступу.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#B7BFB9]">
              Ми допоможемо вам швидко повернутися до роботи в CRM.
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
              Забули пароль?
            </h1>
            <p className="mt-1.5 text-[13.5px] text-[#6C716A]">
              Введіть ваш email, і ми надішлемо посилання для скидання пароля.
            </p>

            {isSent ? (
              <div className="mt-7 space-y-4">
                <div className="rounded-md border border-[#C1E1C1] bg-[#EAF5EA] px-3.5 py-3 text-[13.5px] text-[#1E4620]">
                  Інструкції для скидання пароля надіслано на вашу електронну пошту.
                </div>
                <Link
                  href="/login"
                  className="flex h-11 w-full items-center justify-center rounded-lg border border-[#DFE3DC] bg-white text-[13.5px] font-medium text-[#171A18] transition-colors hover:bg-[#F0F2ED]"
                >
                  Повернутися до входу
                </Link>
              </div>
            ) : (
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

                {serverError && (
                  <div className="rounded-md border border-[#F3C6C1] bg-[#FBEDEC] px-3.5 py-2.5 text-[13px] text-[#B3261E]">
                    {serverError}
                  </div>
                )}

                <Button type="submit" loading={isSubmitting} loadingText="Надсилання..." className="h-11 w-full">
                  Надіслати інструкції
                </Button>

                <div className="pt-2 text-center">
                  <Link href="/login" className="text-[13px] font-medium text-[#24493B] hover:underline">
                    Повернутися до входу
                  </Link>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}