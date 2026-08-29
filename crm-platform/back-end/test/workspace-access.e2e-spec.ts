import { INestApplication } from '@nestjs/common'
import request from 'supertest'

import { createTestApp } from './utils/create-test-app'
import { cleanDatabase } from './utils/clean-database'
import { registerAndLogin } from './utils/auth-helper'
import { PrismaService } from '../src/core/database/prisma.service'
import { describe, beforeAll, beforeEach, afterAll, it, expect } from "@jest/globals"

describe('Workspace access (e2e)', () => {
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

    it('allows the owner to create and read their own workspace', async () => {
        const owner = await registerAndLogin(app, prisma)

        const createResponse = await request(app.getHttpServer())
            .post('/workspaces')
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .send({ name: 'Тестовий Workspace' })
            .expect(201)

        expect(createResponse.body.ownerId).toBe(owner.user.id)
        expect(createResponse.body.members).toHaveLength(1)
        expect(createResponse.body.roles[0].name).toBe('Owner')

        const getResponse = await request(app.getHttpServer())
            .get(`/workspaces/${createResponse.body.id}`)
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .expect(200)

        expect(getResponse.body.id).toBe(createResponse.body.id)
    })

    it('hides the workspace from a user who is not a member', async () => {
        const owner = await registerAndLogin(app, prisma)
        const stranger = await registerAndLogin(app, prisma)

        const workspace = await request(app.getHttpServer())
            .post('/workspaces')
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .send({ name: 'Приватний Workspace' })
            .expect(201)

        await request(app.getHttpServer())
            .get(`/workspaces/${workspace.body.id}`)
            .set('Authorization', `Bearer ${stranger.accessToken}`)
            .expect(404)
    })

    it('rejects workspace update from a non-owner member', async () => {
        const owner = await registerAndLogin(app, prisma)
        const member = await registerAndLogin(app, prisma)

        const workspace = await request(app.getHttpServer())
            .post('/workspaces')
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .send({ name: 'Спільний Workspace' })
            .expect(201)

        const employeeRole = await prisma.role.create({
            data: {
                workspaceId: workspace.body.id,
                name: 'Employee',
                permissions: [],
            },
        })

        await prisma.workspaceMember.create({
            data: {
                workspaceId: workspace.body.id,
                userId: member.user.id,
                roleId: employeeRole.id,
            },
        })

        const readResponse = await request(app.getHttpServer())
            .get(`/workspaces/${workspace.body.id}`)
            .set('Authorization', `Bearer ${member.accessToken}`)
            .expect(200)

        expect(readResponse.body.id).toBe(workspace.body.id)

        await request(app.getHttpServer())
            .patch(`/workspaces/${workspace.body.id}`)
            .set('Authorization', `Bearer ${member.accessToken}`)
            .send({ name: 'Спроба перейменувати' })
            .expect(403)

        await request(app.getHttpServer())
            .delete(`/workspaces/${workspace.body.id}`)
            .set('Authorization', `Bearer ${member.accessToken}`)
            .expect(403)
    })

    it('allows the owner to update and delete the workspace', async () => {
        const owner = await registerAndLogin(app, prisma)

        const workspace = await request(app.getHttpServer())
            .post('/workspaces')
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .send({ name: 'Мій Workspace' })
            .expect(201)

        await request(app.getHttpServer())
            .patch(`/workspaces/${workspace.body.id}`)
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .send({ name: 'Оновлена назва' })
            .expect(200)

        await request(app.getHttpServer())
            .delete(`/workspaces/${workspace.body.id}`)
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .expect(200)

        await request(app.getHttpServer())
            .get(`/workspaces/${workspace.body.id}`)
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .expect(404)
    })

    it('blocks module access for non-members and allows it for members', async () => {
        const owner = await registerAndLogin(app, prisma)
        const stranger = await registerAndLogin(app, prisma)

        const workspace = await request(app.getHttpServer())
            .post('/workspaces')
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .send({ name: 'Workspace з модулями' })
            .expect(201)

        await request(app.getHttpServer())
            .post(`/workspaces/${workspace.body.id}/modules`)
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .send({ name: 'Клієнти' })
            .expect(201)

        await request(app.getHttpServer())
            .get(`/workspaces/${workspace.body.id}/modules`)
            .set('Authorization', `Bearer ${stranger.accessToken}`)
            .expect(404)

        const ownerModulesResponse = await request(app.getHttpServer())
            .get(`/workspaces/${workspace.body.id}/modules`)
            .set('Authorization', `Bearer ${owner.accessToken}`)
            .expect(200)

        expect(ownerModulesResponse.body).toHaveLength(1)
    })

    it('rejects any request without a valid access token', async () => {
        await request(app.getHttpServer())
            .get('/workspaces')
            .expect(401)

        await request(app.getHttpServer())
            .post('/workspaces')
            .send({ name: 'Без токена' })
            .expect(401)
    })
})