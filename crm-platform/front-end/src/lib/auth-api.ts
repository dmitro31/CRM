import { apiClient, setAccessToken } from './api-client'
import type { LoginResponse, RefreshResponse, User } from '@/types/auth'

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  })
  setAccessToken(data.accessToken)
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
  const { data } = await apiClient.get<{ message: string }>(
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
  const { data } = await apiClient.post<RefreshResponse>('/auth/refresh')
  setAccessToken(data.accessToken)
  return data
}

export async function fetchMe() {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}

export async function logout() {
  await apiClient.post('/auth/logout')
  setAccessToken(null)
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