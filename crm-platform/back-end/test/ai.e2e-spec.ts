import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { FieldType } from '@prisma/client';

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
  jest,
} from '@jest/globals';

jest.setTimeout(30000);

describe('AI tools (e2e)', () => {
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

  describe('AI Form Generator', () => {
    it('generates a valid draft and creates a real module from it', async () => {
      const user = await registerAndLogin(app, prisma);

      const workspace = await request(app.getHttpServer())
        .post('/workspaces')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ name: 'AI Test Workspace' })
        .expect(201);

      const draftResponse = await request(app.getHttpServer())
        .post(`/workspaces/${workspace.body.id}/ai/generate-form`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          prompt:
            'Модуль для обліку книг: назва, автор, рік видання, статус (в наявності/видана)',
        })
        .expect(201);

      const draft = draftResponse.body;

      expect(typeof draft.name).toBe('string');
      expect(draft.name.length).toBeGreaterThan(0);
      expect(Array.isArray(draft.fields)).toBe(true);
      expect(draft.fields.length).toBeGreaterThan(0);

      const validTypes = Object.values(FieldType);

      for (const field of draft.fields) {
        expect(typeof field.name).toBe('string');
        expect(validTypes).toContain(field.type);
      }

      const createResponse = await request(app.getHttpServer())
        .post(`/workspaces/${workspace.body.id}/ai/generate-form/create`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(draft)
        .expect(201);

      expect(createResponse.body.module.workspaceId).toBe(workspace.body.id);
      expect(createResponse.body.fields.length).toBe(draft.fields.length);

      const modulesInDb = await prisma.module.findMany({
        where: { workspaceId: workspace.body.id },
      });

      expect(modulesInDb).toHaveLength(1);
    });

    it('rejects the generate-form endpoint for a non-member', async () => {
      const owner = await registerAndLogin(app, prisma);
      const stranger = await registerAndLogin(app, prisma);

      const workspace = await request(app.getHttpServer())
        .post('/workspaces')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ name: 'AI Private Workspace' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/workspaces/${workspace.body.id}/ai/generate-form`)
        .set('Authorization', `Bearer ${stranger.accessToken}`)
        .send({ prompt: 'Модуль для клієнтів' })
        .expect(404);
    });
  });

  describe('AI Workflow Generator', () => {
    it('generates a workflow draft grounded in real module fields', async () => {
      const user = await registerAndLogin(app, prisma);

      const { workspaceId, moduleId, fields } = await createWorkspaceWithModule(
        app,
        user.accessToken,
        [
          { name: 'Імʼя', type: 'TEXT', required: true },
          {
            name: 'Статус',
            type: 'SELECT',
            options: ['Новий', 'В роботі', 'Завершено'],
            required: true,
          },
        ],
      );

      const statusKey = (fields[1] as { key: string }).key;

      const draftResponse = await request(app.getHttpServer())
        .post(
          `/workspaces/${workspaceId}/ai/modules/${moduleId}/generate-workflow`,
        )
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          prompt: 'Коли статус стає Завершено, надішли сповіщення',
        })
        .expect(201);

      const draft = draftResponse.body;

      expect(typeof draft.name).toBe('string');
      expect(draft.trigger).toBeDefined();
      expect(Array.isArray(draft.actions)).toBe(true);
      expect(draft.actions.length).toBeGreaterThan(0);

      if (draft.trigger.event === 'FIELD_CHANGED') {
        expect(draft.trigger.fieldKey).toBe(statusKey);
      }

      for (const condition of draft.conditions ?? []) {
        expect(condition.fieldKey).toBe(statusKey);
      }

      const createResponse = await request(app.getHttpServer())
        .post(`/workspaces/${workspaceId}/workflows`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(draft)
        .expect(201);

      expect(createResponse.body.workspaceId).toBe(workspaceId);

      const workflowsInDb = await prisma.workflow.findMany({
        where: { workspaceId },
      });

      expect(workflowsInDb).toHaveLength(1);
    });

    it('rejects the generate-workflow endpoint for a non-member', async () => {
      const owner = await registerAndLogin(app, prisma);
      const stranger = await registerAndLogin(app, prisma);

      const { workspaceId, moduleId } = await createWorkspaceWithModule(
        app,
        owner.accessToken,
        [{ name: 'Поле', type: 'TEXT' }],
      );

      await request(app.getHttpServer())
        .post(
          `/workspaces/${workspaceId}/ai/modules/${moduleId}/generate-workflow`,
        )
        .set('Authorization', `Bearer ${stranger.accessToken}`)
        .send({ prompt: 'Опис автоматизації для тесту' })
        .expect(404);
    });
  });

  describe('AI Assistant', () => {
    it('answers with a grounded zero count when no records exist', async () => {
      const user = await registerAndLogin(app, prisma);

      const { workspaceId } = await createWorkspaceWithModule(
        app,
        user.accessToken,
        [
          {
            name: 'Статус',
            type: 'SELECT',
            options: ['Новий', 'Завершено'],
            required: true,
          },
        ],
      );

      const response = await request(app.getHttpServer())
        .post(`/workspaces/${workspaceId}/ai/ask`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ question: 'Скільки записів у статусі Завершено?' })
        .expect(201);

      expect(typeof response.body.answer).toBe('string');
      expect(response.body.answer.length).toBeGreaterThan(0);
      expect(response.body.answer).toMatch(/0/);
    });

    it('rejects the ask endpoint for a non-member', async () => {
      const owner = await registerAndLogin(app, prisma);
      const stranger = await registerAndLogin(app, prisma);

      const workspace = await request(app.getHttpServer())
        .post('/workspaces')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ name: 'AI Assistant Private' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/workspaces/${workspace.body.id}/ai/ask`)
        .set('Authorization', `Bearer ${stranger.accessToken}`)
        .send({ question: 'Щось' })
        .expect(404);
    });
  });
});
