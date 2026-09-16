'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'

import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/providers/auth-provider'
import * as authApi from '@/lib/auth-api'
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '@/lib/validation/account-schemas'
import { FormField } from '@/shared/UI/FormField'
import { Input } from '@/shared/UI/Input'
import { Button } from '@/shared/UI/Button'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  )
}

const PROVIDER_LABELS: Record<string, string> = {
  LOCAL: 'Email/пароль',
  GOOGLE: 'Google',
  GITHUB: 'GitHub',
}

function AccountContent() {
  const { user, refetchUser } = useAuth()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UpdateProfileFormData) => {
    setServerError(null)
    setSuccessMessage(null)
    try {
      await authApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        phone: data.phone || undefined,
      })
      await refetchUser()
      setSuccessMessage('Профіль оновлено')
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message
          : undefined
      setServerError(message ?? 'Не вдалося оновити профіль')
    }
  }

  if (!user) return null

  const initials = `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Мій акаунт</h1>

      <div className="mb-6 flex items-center gap-4 rounded-lg border bg-white p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#24493B] text-lg font-semibold text-white">
          {initials || user.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="mt-1 text-xs text-gray-400">
            Вхід через: {PROVIDER_LABELS[user.provider] ?? user.provider}
            {!user.isVerified && ' · Email не підтверджено'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Ім'я" error={errors.firstName?.message}>
            <Input {...register('firstName')} error={!!errors.firstName} />
          </FormField>

          <FormField label="Прізвище" error={errors.lastName?.message}>
            <Input {...register('lastName')} error={!!errors.lastName} />
          </FormField>
        </div>

        <FormField label="Телефон" error={errors.phone?.message}>
          <Input {...register('phone')} placeholder="+380..." error={!!errors.phone} />
        </FormField>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">Email</label>
          <Input value={user.email} disabled className="opacity-60" />
          <p className="mt-1 text-xs text-gray-400">Email не можна змінити з цієї сторінки</p>
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <Button type="submit" loading={isSubmitting} loadingText="Збереження..." disabled={!isDirty}>
          Зберегти зміни
        </Button>
      </form>
    </div>
  )
}