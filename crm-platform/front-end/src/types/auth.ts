export interface User {
  id: string
  email: string
  firstName: string
  lastName: string | null
  phone: string | null
  avatar: string | null
  provider: 'LOCAL' | 'GOOGLE' | 'GITHUB'
  isVerified: boolean
  isActive: boolean
}

export interface LoginResponse {
  user: User
  accessToken: string
}

export interface RefreshResponse {
  accessToken: string
}