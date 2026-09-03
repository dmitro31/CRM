'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { User } from '@/types/auth'
import * as authApi from '@/lib/auth-api'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refetchUser = async () => {
    try {
      const currentUser = await authApi.fetchMe()
      setUser(currentUser)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        await authApi.refresh()
        const currentUser = await authApi.fetchMe()
        if (!cancelled) setUser(currentUser)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    setUser(result.user)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}