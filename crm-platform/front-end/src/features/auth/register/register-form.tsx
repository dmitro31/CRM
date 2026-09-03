'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import * as authApi from '@/lib/auth-api'
import {
  registerSchema,
  type RegisterFormData,
} from '@/lib/validation/auth-schemas'

import { Button } from '@/shared/UI/button'
import { FormField } from '@/shared/UI/form-field'
import { Input } from '@/shared/UI/Input'

export function RegisterForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)

    try {
      await authApi.register(data)
      setSubmitted(true)
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined

      setServerError(message ?? 'Не вдалося зареєструватись.')
    }
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-gray-200/40 sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <svg
              className="h-8 w-8 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16v16H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950">
            Перевір свою пошту
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Ми надіслали лист для підтвердження email. Перейди за
            посиланням у листі, щоб активувати свій акаунт.
          </p>

          <Link
            href="/login"
            className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Перейти до входу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-600">
          Почнемо
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Створіть акаунт
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Зареєструйтесь, щоб створити свій робочий простір.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Ім'я"
            error={errors.firstName?.message}
          >
            <Input
              {...register('firstName')}
              placeholder="Дмитро"
              autoComplete="given-name"
              error={!!errors.firstName}
            />
          </FormField>

          <FormField
            label="Прізвище"
            error={errors.lastName?.message}
          >
            <Input
              {...register('lastName')}
              placeholder="Абрам'як"
              autoComplete="family-name"
              error={!!errors.lastName}
            />
          </FormField>
        </div>

        <FormField
          label="Email"
          error={errors.email?.message}
        >
          <Input
            type="email"
            {...register('email')}
            placeholder="you@example.com"
            autoComplete="email"
            error={!!errors.email}
          />
        </FormField>

        <FormField
          label="Пароль"
          error={errors.password?.message}
        >
          <Input
            type="password"
            {...register('password')}
            placeholder="••••••••"
            autoComplete="new-password"
            error={!!errors.password}
          />
        </FormField>

        {serverError && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          loadingText="Створення акаунта..."
        >
          Створити акаунт
        </Button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />

        <span className="text-xs text-gray-400">
          або
        </span>

        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <p className="text-center text-sm text-gray-500">
        Вже маєте акаунт?{' '}
        <Link
          href="/login"
          className="font-semibold text-gray-950 transition hover:text-blue-600"
        >
          Увійти
        </Link>
      </p>

      <p className="mt-6 text-center text-xs leading-5 text-gray-400">
        Створюючи акаунт, ви погоджуєтесь з умовами використання
        платформи.
      </p>
    </div>
  )
}