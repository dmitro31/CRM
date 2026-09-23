import { apiClient, setAccessToken } from './api-client'
import type { LoginResponse, RefreshResponse, User, VerifyEmailResponse } from '@/types/auth'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://crm-gr3n.onrender.com').replace(/\/$/, '')

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<LoginResponse & { refreshToken?: string }>('/auth/login', {
    email,
    password,
  })
  setAccessToken(data.accessToken)
  if (data.refreshToken && typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', data.refreshToken)
  }
  return data
}

export async function register(payload: {
  email: string
  password: string
  firstName: string
  lastName: string
}) {
  const { data } = await apiClient.post<{ message: string }>(
    '/auth/register',
    payload,
  )
  return data
}

export async function verifyEmail(token: string) {
  const { data } = await apiClient.get<VerifyEmailResponse>(
    '/auth/verify-email',
    { params: { token } },
  )
  return data
}

export async function resendVerification(email: string) {
  const { data } = await apiClient.post<{ message: string }>(
    '/auth/resend-verification',
    { email },
  )
  return data
}

export async function refresh() {
  const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
  const { data } = await apiClient.post<RefreshResponse & { refreshToken?: string }>('/auth/refresh', {
    refreshToken: storedRefreshToken,
  })
  setAccessToken(data.accessToken)
  if (data.refreshToken && typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', data.refreshToken)
  }
  return data
}

export async function fetchMe() {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}

export async function logout() {
  try {
    const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
    await apiClient.post('/auth/logout', { refreshToken: storedRefreshToken })
  } catch {
  } finally {
    setAccessToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken')
    }
  }
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post<{ message: string }>(
    '/auth/forgot-password',
    { email },
  )
  return data
}

export async function resetPassword(token: string, password: string) {
  const { data } = await apiClient.post<{ message: string }>(
    '/auth/reset-password',
    { token, password },
  )
  return data
}

export async function updateProfile(payload: {
  firstName?: string
  lastName?: string
  phone?: string
}) {
  const { data } = await apiClient.patch<User>('/auth/me', payload)
  return data
}

export function redirectToGoogleAuth() {
  window.location.href = `${API_URL}/auth/google`
}

export function redirectToGithubAuth() {
  window.location.href = `${API_URL}/auth/github`
}