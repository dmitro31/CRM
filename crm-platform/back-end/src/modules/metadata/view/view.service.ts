import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'core/database/prisma.service'
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service'

import { CreateViewDto } from './dto/create-view.dto'
import { UpdateViewDto } from './dto/update-view.dto'

@Injectable()
export class ViewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async create(
    moduleId: string,
    userId: string,
    dto: CreateViewDto,
  ) {
    const module = await this.workspaceAccess.ensureModuleAccess(
      moduleId,
      userId,
    )

    const isFirstView = (await this.prisma.view.count({
      where: { moduleId: module.id },
    })) === 0

    const isDefault = dto.isDefault ?? isFirstView

    return this.prisma.$transaction(async tx => {
      if (isDefault) {
        await tx.view.updateMany({
          where: { moduleId: module.id, isDefault: true },
          data: { isDefault: false },
        })
      }

      return tx.view.create({
        data: {
          moduleId: module.id,
          name: dto.name,
          type: dto.type,
          filters: dto.filters as any,
          sorting: dto.sorting as any,
          columns: dto.columns as any,
          icon: dto.icon,
          color: dto.color,
          isDefault,
        },
      })
    })
  }

  async findAll(
    moduleId: string,
    userId: string,
  ) {
    await this.workspaceAccess.ensureModuleAccess(moduleId, userId)

    return this.prisma.view.findMany({
      where: { moduleId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findOne(
    viewId: string,
    userId: string,
  ) {
    const view = await this.findViewOrThrow(viewId)

    await this.workspaceAccess.ensureModuleAccess(
      view.moduleId,
      userId,
    )

    return view
  }

  async update(
    viewId: string,
    userId: string,
    dto: UpdateViewDto,
  ) {
    const view = await this.findViewOrThrow(viewId)

    await this.workspaceAccess.ensureModuleAccess(
      view.moduleId,
      userId,
    )

    return this.prisma.$transaction(async tx => {
      if (dto.isDefault === true) {
        await tx.view.updateMany({
          where: {
            moduleId: view.moduleId,
            isDefault: true,
            id: { not: viewId },
          },
          data: { isDefault: false },
        })
      }

      return tx.view.update({
        where: { id: viewId },
        data: {
          name: dto.name,
          filters: dto.filters as any,
          sorting: dto.sorting as any,
          columns: dto.columns as any,
          icon: dto.icon,
          color: dto.color,
          isDefault: dto.isDefault,
        },
      })
    })
  }

  async remove(
    viewId: string,
    userId: string,
  ) {
    const view = await this.findViewOrThrow(viewId)

    await this.workspaceAccess.ensureModuleAccess(
      view.moduleId,
      userId,
    )

    await this.prisma.view.delete({
      where: { id: viewId },
    })

    if (view.isDefault) {
      const fallback = await this.prisma.view.findFirst({
        where: { moduleId: view.moduleId },
        orderBy: { createdAt: 'asc' },
      })

      if (fallback) {
        await this.prisma.view.update({
          where: { id: fallback.id },
          data: { isDefault: true },
        })
      }
    }

    return { message: 'View deleted successfully' }
  }

  private async findViewOrThrow(viewId: string) {
    const view = await this.prisma.view.findUnique({
      where: { id: viewId },
    })

    if (!view) {
      throw new NotFoundException('View not found')
    }

    return view
  }
}