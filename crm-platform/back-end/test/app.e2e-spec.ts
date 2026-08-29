import { INestApplication } from '@nestjs/common'
import { PrismaService } from '../src/core/database/prisma.service'
import request from 'supertest'

import { createTestApp } from './utils/create-test-app'
import { cleanDatabase } from './utils/clean-database'
import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals'

describe('Auth (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    app = await createTestApp()
    prisma = app.get(PrismaService)
  })

  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  afterAll(async () => {
    await app.close()
  })

  const testUser = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'Тест',
    lastName: 'Тестовий',
  }

  it('registers a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)

    expect(response.body.message).toContain('Verification email')

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    })

    expect(user).not.toBeNull()
    expect(user?.isVerified).toBe(false)
  })

  it('rejects registration with an already-used email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(400)
  })

  it('rejects login before email verification', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(401)
  })

  it('logs in after verification and returns access token + cookies', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)

    const verificationToken = await prisma.verificationToken.findFirstOrThrow({
      where: { user: { email: testUser.email } },
    })

    await request(app.getHttpServer())
      .get(`/auth/verify-email?token=${verificationToken.token}`)
      .expect(200)

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)

    expect(loginResponse.body.accessToken).toBeDefined()
    expect(loginResponse.body.user.email).toBe(testUser.email)
    expect(loginResponse.body.refreshToken).toBeUndefined()

    const cookies = loginResponse.headers['set-cookie'] as unknown as string[]
    expect(cookies).toBeDefined()
    expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true)
    expect(cookies.some((c: string) => c.startsWith('csrfToken='))).toBe(true)
  })

  it('returns current user via /me with a valid access token', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)

    const verificationToken = await prisma.verificationToken.findFirstOrThrow({
      where: { user: { email: testUser.email } },
    })

    await request(app.getHttpServer())
      .get(`/auth/verify-email?token=${verificationToken.token}`)
      .expect(200)

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200)

    expect(meResponse.body.email).toBe(testUser.email)
  })

  it('rejects /me without a token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401)
  })

  it('refreshes the access token using the refresh cookie and CSRF header', async () => {
    const agent = request.agent(app.getHttpServer())

    await agent.post('/auth/register').send(testUser).expect(201)

    const verificationToken = await prisma.verificationToken.findFirstOrThrow({
      where: { user: { email: testUser.email } },
    })

    await agent
      .get(`/auth/verify-email?token=${verificationToken.token}`)
      .expect(200)

    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)

    const cookies = loginResponse.headers['set-cookie'] as unknown as string[]
    const csrfCookie = cookies
      .find((c: string) => c.startsWith('csrfToken='))
    expect(csrfCookie).toBeDefined()

    const csrfToken = csrfCookie!.split(';')[0].split('=')[1]

    const refreshResponse = await agent
      .post('/auth/refresh')
      .set('X-CSRF-Token', csrfToken)
      .expect(201)

    expect(refreshResponse.body.accessToken).toBeDefined()
    expect(refreshResponse.body.accessToken).not.toBe(
      loginResponse.body.accessToken,
    )
  })

  it('rejects refresh without a CSRF header', async () => {
    const agent = request.agent(app.getHttpServer())

    await agent.post('/auth/register').send(testUser).expect(201)

    const verificationToken = await prisma.verificationToken.findFirstOrThrow({
      where: { user: { email: testUser.email } },
    })

    await agent
      .get(`/auth/verify-email?token=${verificationToken.token}`)
      .expect(200)

    await agent
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)

    await agent.post('/auth/refresh').expect(403)
  })
})