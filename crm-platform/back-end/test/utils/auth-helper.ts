import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { PrismaService } from '../../src/core/database/prisma.service'

interface TestUserCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
}

export async function registerAndLogin(
  app: INestApplication,
  prisma: PrismaService,
  overrides: Partial<TestUserCredentials> = {},
) {
  const credentials: TestUserCredentials = {
    email: overrides.email ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: overrides.password ?? 'SecurePass123!',
    firstName: overrides.firstName ?? 'Тест',
    lastName: overrides.lastName ?? 'Юзер',
  }

  await request(app.getHttpServer())
    .post('/auth/register')
    .send(credentials)
    .expect(201)

  const verificationToken = await prisma.verificationToken.findFirstOrThrow({
    where: { user: { email: credentials.email } },
  })

  await request(app.getHttpServer())
    .get(`/auth/verify-email?token=${verificationToken.token}`)
    .expect(200)

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: credentials.email, password: credentials.password })
    .expect(201)

  return {
    user: loginResponse.body.user as { id: string; email: string },
    accessToken: loginResponse.body.accessToken as string,
  }
}