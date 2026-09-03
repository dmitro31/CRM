export interface User {
  id: string
  email: string
  firstName: string
  lastName: string | null
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