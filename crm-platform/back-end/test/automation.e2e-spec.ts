import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp } from './utils/create-test-app'
import { cleanDatabase } from './utils/clean-database'
import { registerAndLogin } from './utils/auth-helper'
import { createWorkspaceWithModule } from './utils/workspace-helper'
import { pollUntil } from './utils/poll'
import { PrismaService } from '../src/core/database/prisma.service'
import { describe, beforeAll, beforeEach, afterAll, it, expect } from "@jest/globals"

describe('Automation (e2e)', () => {
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

  async function setupModule(accessToken: string) {
    const { workspaceId, moduleId, fields } = await createWorkspaceWithModule(
      app,
      accessToken,
      [
        { name: 'Імʼя', type: 'TEXT', required: true },
        {
          name: 'Статус',
          type: 'SELECT',
          options: ['Новий', 'В роботі', 'Завершено'],
          required: true,
        },
      ],
    )

    const moduleFields = fields as Array<{ key: string }>

    return {
      workspaceId,
      moduleId,
      keys: {
        imya: moduleFields[0].key,
        status: moduleFields[1].key,
      },
    }
  }

  it('triggers SEND_NOTIFICATION when a watched field changes and the condition matches', async () => {
    const user = await registerAndLogin(app, prisma)
    const { workspaceId, moduleId, keys } = await setupModule(user.accessToken)

    await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/workflows`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({
        name: 'Сповіщення про завершення',
        trigger: { event: 'FIELD_CHANGED', fieldKey: keys.status },
        conditions: [
          { fieldKey: keys.status, operator: 'equals', value: 'Завершено' },
        ],
        actions: [
          {
            type: 'SEND_NOTIFICATION',
            title: 'Запис завершено',
            message: 'Статус змінено на Завершено',
          },
        ],
      })
      .expect(201)

    const record = await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Клієнт', [keys.status]: 'Новий' } })
      .expect(201)

    await request(app.getHttpServer())
      .patch(`/records/${record.body.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.status]: 'Завершено' } })
      .expect(200)

    const notification = await pollUntil(() =>
      prisma.notification.findFirst({
        where: { userId: user.user.id, title: 'Запис завершено' },
      }),
    )

    expect(notification.message).toBe('Статус змінено на Завершено')
  })

  it('does not trigger when the condition does not match', async () => {
    const user = await registerAndLogin(app, prisma)
    const { workspaceId, moduleId, keys } = await setupModule(user.accessToken)

    await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/workflows`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({
        name: 'Сповіщення про завершення',
        trigger: { event: 'FIELD_CHANGED', fieldKey: keys.status },
        conditions: [
          { fieldKey: keys.status, operator: 'equals', value: 'Завершено' },
        ],
        actions: [
          { type: 'SEND_NOTIFICATION', title: 'Не має спрацювати' },
        ],
      })
      .expect(201)

    const record = await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Клієнт', [keys.status]: 'Новий' } })
      .expect(201)

    await request(app.getHttpServer())
      .patch(`/records/${record.body.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.status]: 'В роботі' } })
      .expect(200)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const notification = await prisma.notification.findFirst({
      where: { userId: user.user.id, title: 'Не має спрацювати' },
    })

    expect(notification).toBeNull()
  })

  it('triggers UPDATE_RECORD action and modifies the record data', async () => {
    const user = await registerAndLogin(app, prisma)
    const { workspaceId, moduleId, keys } = await setupModule(user.accessToken)

    await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/workflows`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({
        name: 'Авто-завершення',
        trigger: { event: 'RECORD_CREATED' },
        actions: [
          {
            type: 'UPDATE_RECORD',
            data: { [keys.status]: 'В роботі' },
          },
        ],
      })
      .expect(201)

    const record = await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Клієнт', [keys.status]: 'Новий' } })
      .expect(201)

    const updatedRecord = await pollUntil(async () => {
      const current = await prisma.record.findUnique({
        where: { id: record.body.id },
      })

      const data = current?.data as Record<string, unknown>

      return data?.[keys.status] === 'В роботі' ? current : null
    })

    expect((updatedRecord.data as Record<string, unknown>)[keys.status]).toBe(
      'В роботі',
    )
  })

  it('does not execute a disabled workflow', async () => {
    const user = await registerAndLogin(app, prisma)
    const { workspaceId, moduleId, keys } = await setupModule(user.accessToken)

    await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/workflows`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({
        name: 'Вимкнений workflow',
        trigger: { event: 'RECORD_CREATED' },
        actions: [
          { type: 'SEND_NOTIFICATION', title: 'Не має прийти' },
        ],
        enabled: false,
      })
      .expect(201)

    await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Клієнт', [keys.status]: 'Новий' } })
      .expect(201)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const notification = await prisma.notification.findFirst({
      where: { userId: user.user.id, title: 'Не має прийти' },
    })

    expect(notification).toBeNull()
  })
})