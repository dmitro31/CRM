import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'core/database/prisma.service'
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service'

import { CreateWorkflowDto } from './dto/create-workflow.dto'
import { UpdateWorkflowDto } from './dto/update-workflow.dto'

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    dto: CreateWorkflowDto,
  ) {
    await this.workspaceAccess.ensureOwner(workspaceId, userId)

    return this.prisma.workflow.create({
      data: {
        workspaceId,
        name: dto.name,
        trigger: dto.trigger as any,
        conditions: dto.conditions as any,
        actions: dto.actions as any,
        enabled: dto.enabled ?? true,
      },
    })
  }

  async findAll(
    workspaceId: string,
    userId: string,
  ) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId)

    return this.prisma.workflow.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(
    workflowId: string,
    userId: string,
    dto: UpdateWorkflowDto,
  ) {
    const workflow = await this.findWorkflowOrThrow(workflowId)

    await this.workspaceAccess.ensureOwner(
      workflow.workspaceId,
      userId,
    )

    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        name: dto.name,
        trigger: dto.trigger as any,
        conditions: dto.conditions as any,
        actions: dto.actions as any,
        enabled: dto.enabled,
      },
    })
  }

  async remove(
    workflowId: string,
    userId: string,
  ) {
    const workflow = await this.findWorkflowOrThrow(workflowId)

    await this.workspaceAccess.ensureOwner(
      workflow.workspaceId,
      userId,
    )

    await this.prisma.workflow.delete({
      where: { id: workflowId },
    })

    return { message: 'Workflow deleted successfully' }
  }

  private async findWorkflowOrThrow(workflowId: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow) {
      throw new NotFoundException('Workflow not found')
    }

    return workflow
  }
}