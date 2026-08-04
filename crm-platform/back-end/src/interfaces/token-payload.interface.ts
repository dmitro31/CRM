export interface TokenPayload {
  sub: string
  email: string
  tid: string

  iat?: number
  exp?: number
}