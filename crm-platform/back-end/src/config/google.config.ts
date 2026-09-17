import { registerAs } from '@nestjs/config';

const backendUrl = 'https://www.crm-platform.site'
export const googleConfig = registerAs('google', () => ({

  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackUrl: `${backendUrl}/api/auth/google/callback`,
}));
