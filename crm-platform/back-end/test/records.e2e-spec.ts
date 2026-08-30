import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './utils/create-test-app';
import { cleanDatabase } from './utils/clean-database';
import { registerAndLogin } from './utils/auth-helper';
import { createWorkspaceWithModule } from './utils/workspace-helper';
import { PrismaService } from '../src/core/database/prisma.service';
import {
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  it,
  expect,
} from '@jest/globals';

describe('Records (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  async function setupClientsModule(accessToken: string) {
    const { moduleId, fields } = await createWorkspaceWithModule(
      app,
      accessToken,
      [
        { name: 'Імʼя', type: 'TEXT', required: true },
        { name: 'Вік', type: 'NUMBER' },
        {
          name: 'Статус',
          type: 'SELECT',
          options: ['Новий', 'В роботі', 'Завершено'],
          required: true,
        },
      ],
    );

    const fieldKeys = fields as Array<{ key: string }>;
    const keys = {
      imya: fieldKeys[0].key,
      vik: fieldKeys[1].key,
      status: fieldKeys[2].key,
    };

    return { moduleId, keys };
  }

  it('rejects a record missing a required field', async () => {
    const user = await registerAndLogin(app, prisma);
    const { moduleId } = await setupClientsModule(user.accessToken);

    await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { status: 'Новий' } })
      .expect(400);
  });

  it('rejects a record with a value of the wrong type', async () => {
    const user = await registerAndLogin(app, prisma);
    const { moduleId, keys } = await setupClientsModule(user.accessToken);

    await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({
        data: {
          [keys.imya]: 'Дмитро',
          [keys.status]: 'Новий',
          vik: 'не число',
        },
      })
      .expect(400);
  });

  it('rejects a SELECT value outside of defined options', async () => {
    const user = await registerAndLogin(app, prisma);
    const { moduleId, keys } = await setupClientsModule(user.accessToken);

    await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Дмитро', [keys.status]: 'Невідомий' } })
      .expect(400);
  });

  it('lists records with pagination', async () => {
    const user = await registerAndLogin(app, prisma);
    const { moduleId, keys } = await setupClientsModule(user.accessToken);

    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post(`/modules/${moduleId}/records`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ data: { [keys.imya]: `Клієнт ${i}`, [keys.status]: 'Новий' } })
        .expect(201);
    }

    const response = await request(app.getHttpServer())
      .get(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(response.body.total).toBe(3);
    expect(response.body.items).toHaveLength(3);
  });

  it('filters records by a select field value', async () => {
    const user = await registerAndLogin(app, prisma);
    const { moduleId, keys } = await setupClientsModule(user.accessToken);

    await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Клієнт А', [keys.status]: 'Новий' } })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Клієнт Б', [keys.status]: 'Завершено' } })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/modules/${moduleId}/records?status=Завершено`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.items[0].data.imya).toBe('Клієнт Б');
  });

  it('rejects a filter on an unknown field', async () => {
    const user = await registerAndLogin(app, prisma);
    const { moduleId } = await setupClientsModule(user.accessToken);

    await request(app.getHttpServer())
      .get(`/modules/${moduleId}/records?unknownField=test`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(400);
  });

  it('updates a record with a partial merge', async () => {
    const user = await registerAndLogin(app, prisma);
    const { moduleId, keys } = await setupClientsModule(user.accessToken);

    const created = await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Клієнт', [keys.status]: 'Новий' } })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/records/${created.body.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.status]: 'Завершено' } })
      .expect(200);

    expect(updated.body.data.status).toBe('Завершено');
    expect(updated.body.data.imya).toBe('Клієнт');
  });

  it('soft-deletes a record and excludes it from listing', async () => {
    const user = await registerAndLogin(app, prisma);
    const { moduleId, keys } = await setupClientsModule(user.accessToken);

    const created = await request(app.getHttpServer())
      .post(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ data: { [keys.imya]: 'Клієнт', [keys.status]: 'Новий' } })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/records/${created.body.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    const listResponse = await request(app.getHttpServer())
      .get(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(listResponse.body.total).toBe(0);

    const stillExists = await prisma.record.findUnique({
      where: { id: created.body.id },
    });

    expect(stillExists).not.toBeNull();
    expect(stillExists?.isArchived).toBe(true);
  });

  it('rejects record access for a non-member of the workspace', async () => {
    const owner = await registerAndLogin(app, prisma);
    const stranger = await registerAndLogin(app, prisma);
    const { moduleId } = await setupClientsModule(owner.accessToken);

    await request(app.getHttpServer())
      .get(`/modules/${moduleId}/records`)
      .set('Authorization', `Bearer ${stranger.accessToken}`)
      .expect(404);
  });
});
