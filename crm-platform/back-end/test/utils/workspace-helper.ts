import type { INestApplication } from '@nestjs/common'
import request from 'supertest'

export async function createWorkspaceWithModule(
  app: INestApplication,
  accessToken: string,
  fields: {
    name: string
    type: string
    required?: boolean
    options?: string[]
  }[],
) {
  const workspaceResponse = await request(app.getHttpServer())
    .post('/workspaces')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: `Workspace-${Date.now()}` })
    .expect(201)

  const moduleResponse = await request(app.getHttpServer())
    .post(`/workspaces/${workspaceResponse.body.id}/modules`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: `Модуль-${Date.now()}` })
    .expect(201)

  const createdFields: unknown[] = []

  for (const field of fields) {
    const fieldResponse = await request(app.getHttpServer())
      .post(`/modules/${moduleResponse.body.id}/fields`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(field)
      .expect(201)

    createdFields.push(fieldResponse.body)
  }

  return {
    workspaceId: workspaceResponse.body.id,
    moduleId: moduleResponse.body.id,
    fields: createdFields,
  }
}