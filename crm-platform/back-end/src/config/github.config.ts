import { registerAs } from '@nestjs/config';

const backendUrl = "'https://crm-gr3n.onrender.com'"

export const githubConfig = registerAs('github', () => ({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackUrl: `${backendUrl}/api/auth/github/callback`,
}));
