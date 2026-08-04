import { registerAs } from '@nestjs/config'

export const mailConfig = registerAs('mail', () => ({
  resendApiKey: process.env.RESEND_API_KEY!,
  appUrl: process.env.APP_URL!,
}))