import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

function getCsrfTokenFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined

  const match = document.cookie.match(/csrfToken=([^;]+)/)
  return match?.[1]
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
    const csrfToken = getCsrfTokenFromCookie()
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }

  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const csrfToken = getCsrfTokenFromCookie()

  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
    },
  )

  const newToken = response.data.accessToken as string
  setAccessToken(newToken)
  return newToken
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isRefreshUrl = originalRequest.url?.includes('/auth/refresh')
    const status = error.response?.status

    if (isRefreshUrl && (status === 401 || status === 403)) {
      setAccessToken(null)
      refreshPromise = null
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (status === 401 && !originalRequest._retry && !isRefreshUrl) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }

        const newToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        setAccessToken(null)
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)