import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'core/database/prisma.service'
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service'

import { CreateModuleDto } from './dto/create-module.dto'
import { UpdateModuleDto } from './dto/update-module.dto'

@Injectable()
export class ModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    dto: CreateModuleDto,
  ) {
      await this.workspaceAccess.ensureMembership(workspaceId, userId)

    const key = await this.generateUniqueKey(
      workspaceId,
      dto.name,
    )

    return this.prisma.module.create({
      data: {
        workspaceId,
        name: dto.name,
        key,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        order: dto.order ?? 0,
      },
    })
  }

  async findAll(
    workspaceId: string,
    userId: string,
  ) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId)

    return this.prisma.module.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    })
  }

  async findOne(
    moduleId: string,
    userId: string,
  ) {
    const module = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
        views: true,
      },
    })

    if (!module) {
      throw new NotFoundException('Module not found')
    }

    await this.workspaceAccess.ensureMembership(module.workspaceId, userId)

    return module
  }

  async update(
    moduleId: string,
    userId: string,
    dto: UpdateModuleDto,
  ) {
    const module = await this.findModuleOrThrow(moduleId)

    await this.workspaceAccess.ensureMembership(module.workspaceId, userId)

    return this.prisma.module.update({
      where: {
        id: moduleId,
      },
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        order: dto.order,
        isActive: dto.isActive,
      },
    })
  }

  async remove(
    moduleId: string,
    userId: string,
  ) {
    const module = await this.findModuleOrThrow(moduleId)

    await this.workspaceAccess.ensureMembership(module.workspaceId, userId)

    await this.prisma.module.delete({
      where: {
        id: moduleId,
      },
    })

    return {
      message: 'Module deleted successfully',
    }
  }

  private async findModuleOrThrow(moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    })

    if (!module) {
      throw new NotFoundException('Module not found')
    }

    return module
  }
  
  private async generateUniqueKey(
    workspaceId: string,
    name: string,
  ): Promise<string> {
    const baseKey = this.slugify(name)

    let key = baseKey
    let counter = 1

    while (true) {
      const existing = await this.prisma.module.findUnique({
        where: {
          workspaceId_key: {
            workspaceId,
            key,
          },
        },
        select: {
          id: true,
        },
      })

      if (!existing) {
        return key
      }

      counter += 1
      key = `${baseKey}-${counter}`
    }
  }

  private slugify(value: string): string {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')

    return normalized || 'module'
  }
}