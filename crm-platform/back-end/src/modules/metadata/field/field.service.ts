import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'core/database/prisma.service'
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service'

import { CreateFieldDto } from './dto/create-field.dto'
import { UpdateFieldDto } from './dto/update-field.dto'

@Injectable()
export class FieldService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService
  ) {}

  async create(
    moduleId: string,
    userId: string,
    dto: CreateFieldDto,
  ) {
    const module = await this.workspaceAccess.ensureModuleAccess(
      moduleId,
      userId,
    )

    const key = await this.generateUniqueKey(
      moduleId,
      dto.name,
    )

    const order =
      dto.order ??
      (await this.prisma.field.count({
        where: { moduleId },
      }))

    return this.prisma.field.create({
      data: {
        moduleId: module.id,
        name: dto.name,
        key,
        type: dto.type,
        description: dto.description,
        required: dto.required ?? false,
        unique: dto.unique ?? false,
        defaultValue: dto.defaultValue as any,
        options: dto.options as any,
        placeholder: dto.placeholder,
        order,
      },
    })
  }

  async findAll(
    moduleId: string,
    userId: string,
  ) {
    await this.workspaceAccess.ensureModuleAccess(moduleId, userId)

    return this.prisma.field.findMany({
      where: {
        moduleId,
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    })
  }

  async update(
    fieldId: string,
    userId: string,
    dto: UpdateFieldDto,
  ) {
    const field = await this.findFieldOrThrow(fieldId)

    await this.workspaceAccess.ensureModuleAccess(field.moduleId, userId)

    return this.prisma.field.update({
      where: {
        id: fieldId,
      },
      data: {
        name: dto.name,
        description: dto.description,
        required: dto.required,
        unique: dto.unique,
        defaultValue: dto.defaultValue as any,
        options: dto.options as any,
        placeholder: dto.placeholder,
        order: dto.order,
        isActive: dto.isActive,
      },
    })
  }

  async remove(
    fieldId: string,
    userId: string,
  ) {
    const field = await this.findFieldOrThrow(fieldId)

    await this.workspaceAccess.ensureModuleAccess(field.moduleId, userId)

    await this.prisma.field.delete({
      where: {
        id: fieldId,
      },
    })

    return {
      message: 'Field deleted successfully',
    }
  }

  private async findFieldOrThrow(fieldId: string) {
    const field = await this.prisma.field.findUnique({
      where: {
        id: fieldId,
      },
      select: {
        id: true,
        moduleId: true,
      },
    })

    if (!field) {
      throw new NotFoundException('Field not found')
    }

    return field
  }

  private async generateUniqueKey(
    moduleId: string,
    name: string,
  ): Promise<string> {
    const baseKey = this.slugify(name)

    let key = baseKey
    let counter = 1

    while (true) {
      const existing = await this.prisma.field.findUnique({
        where: {
          moduleId_key: {
            moduleId,
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

    return normalized || 'field'
  }
}