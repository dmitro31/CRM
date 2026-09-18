'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/auth-api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      await forgotPassword(email)
      setStatus('success')
    } catch (err: unknown) {
      setStatus('error')
      if (err && typeof err === 'object' && 'response' in err) {
        const responseErr = err as { response?: { data?: { message?: string } } }
        setErrorMessage(responseErr.response?.data?.message || 'Виникла помилка при відправці.')
      } else {
        setErrorMessage('Виникла помилка при відправці.')
      }
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Відновлення пароля</h1>

        {status === 'success' ? (
          <div className="success-block">
            <p>Інструкції надіслано! Перевірте вашу поштову скриньку.</p>
            <Link href="/login">Повернутися до входу</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="description">
              Введіть ваш Email, і ми надішлемо вам посилання для створення нового пароля.
            </p>

            {status === 'error' && <div className="error-banner">{errorMessage}</div>}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Надсилання...' : 'Надіслати посилання'}
            </button>

            <div className="auth-footer">
              <Link href="/login">Згадали пароль? Увійти</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}