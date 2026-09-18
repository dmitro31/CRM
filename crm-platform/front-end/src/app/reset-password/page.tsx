'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from '@/lib/auth-api'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!token) {
      setStatus('error')
      setErrorMessage('Токен відновлення відсутній.')
      return
    }

    if (password !== confirmPassword) {
      setStatus('error')
      setErrorMessage('Паролі не збігаються.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      await resetPassword(token, password)
      setStatus('success')
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } catch (err: unknown) {
      setStatus('error')
      if (err && typeof err === 'object' && 'response' in err) {
        const responseErr = err as { response?: { data?: { message?: string } } }
        setErrorMessage(responseErr.response?.data?.message || 'Не вдалося змінити пароль.')
      } else {
        setErrorMessage('Не вдалося змінити пароль.')
      }
    }
  }

  if (!token) {
    return (
      <div className="auth-card">
        <h1>Помилка доступу</h1>
        <p className="description">Недійсний або відсутній токен для скидання пароля.</p>
        <Link href="/forgot-password">Запитати нове посилання</Link>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <h1>Встановлення нового пароля</h1>

      {status === 'success' ? (
        <div className="success-block">
          <p>Пароль успішно змінено! Перенаправлення на сторінку входу...</p>
          <Link href="/login">Перейти до входу</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {status === 'error' && <div className="error-banner">{errorMessage}</div>}

          <div className="field">
            <label htmlFor="password">Новий пароль</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Підтвердження пароля</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Збереження...' : 'Зберегти новий пароль'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={<div>Завантаження...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}