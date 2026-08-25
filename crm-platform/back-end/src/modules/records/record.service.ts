import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Field, FieldType } from '@prisma/client'
import { PrismaService } from 'core/database/prisma.service'
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service'

import { CreateRecordDto } from './dto/create-record.dto'
import { UpdateRecordDto } from './dto/update-record.dto'

@Injectable()
export class RecordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async create(
    moduleId: string,
    userId: string,
    dto: CreateRecordDto,
  ) {
    await this.workspaceAccess.ensureModuleAccess(moduleId, userId)

    const fields = await this.prisma.field.findMany({
      where: { moduleId, isActive: true },
    })

    await this.validateData(moduleId, fields, dto.data, {
      partial: false,
    })

    return this.prisma.record.create({
      data: {
        moduleId,
        data: dto.data as any,
        createdById: userId,
      },
    })
  }

  async findAll(
    moduleId: string,
    userId: string,
    page = 1,
    limit = 20,
  ) {
    await this.workspaceAccess.ensureModuleAccess(moduleId, userId)

    const [items, total] = await this.prisma.$transaction([
      this.prisma.record.findMany({
        where: {
          moduleId,
          isArchived: false,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.record.count({
        where: {
          moduleId,
          isArchived: false,
        },
      }),
    ])

    return {
      items,
      total,
      page,
      limit,
    }
  }

  async findOne(
    recordId: string,
    userId: string,
  ) {
    const record = await this.findRecordOrThrow(recordId)

    await this.workspaceAccess.ensureModuleAccess(
      record.moduleId,
      userId,
    )

    return record
  }

  async update(
    recordId: string,
    userId: string,
    dto: UpdateRecordDto,
  ) {
    const record = await this.findRecordOrThrow(recordId)

    await this.workspaceAccess.ensureModuleAccess(
      record.moduleId,
      userId,
    )

    if (!dto.data) {
      return record
    }

    const fields = await this.prisma.field.findMany({
      where: { moduleId: record.moduleId, isActive: true },
    })

    await this.validateData(
      record.moduleId,
      fields,
      dto.data,
      {
        partial: true,
        excludeRecordId: recordId,
      },
    )

    return this.prisma.record.update({
      where: { id: recordId },
      data: {
        data: {
          ...(record.data as object),
          ...dto.data,
        } as any,
      },
    })
  }

  async remove(
    recordId: string,
    userId: string,
  ) {
    const record = await this.findRecordOrThrow(recordId)

    await this.workspaceAccess.ensureModuleAccess(
      record.moduleId,
      userId,
    )

    await this.prisma.record.update({
      where: { id: recordId },
      data: { isArchived: true },
    })

    return {
      message: 'Record archived successfully',
    }
  }

  private async findRecordOrThrow(recordId: string) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
    })

    if (!record) {
      throw new NotFoundException('Record not found')
    }

    return record
  }

  private async validateData(
    moduleId: string,
    fields: Field[],
    data: Record<string, unknown>,
    options: {
      partial: boolean
      excludeRecordId?: string
    },
  ) {
    for (const field of fields) {
      const hasValue = Object.prototype.hasOwnProperty.call(
        data,
        field.key,
      )

      if (!hasValue) {
        if (!options.partial && field.required) {
          throw new BadRequestException(
            `Field "${field.name}" is required`,
          )
        }
        continue
      }

      const value = data[field.key]

      if (value === null || value === undefined) {
        if (field.required) {
          throw new BadRequestException(
            `Field "${field.name}" is required`,
          )
        }
        continue
      }

      this.validateFieldType(field, value)

      if (field.unique) {
        await this.ensureUnique(
          moduleId,
          field,
          value,
          options.excludeRecordId,
        )
      }
    }
  }

  private validateFieldType(field: Field, value: unknown) {
    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
      case FieldType.EMAIL:
      case FieldType.PHONE:
      case FieldType.URL:
        if (typeof value !== 'string') {
          throw new BadRequestException(
            `Field "${field.name}" must be a string`,
          )
        }
        break

      case FieldType.NUMBER:
        if (typeof value !== 'number') {
          throw new BadRequestException(
            `Field "${field.name}" must be a number`,
          )
        }
        break

      case FieldType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new BadRequestException(
            `Field "${field.name}" must be a boolean`,
          )
        }
        break

      case FieldType.DATE:
      case FieldType.DATETIME:
        if (
          typeof value !== 'string' ||
          Number.isNaN(Date.parse(value))
        ) {
          throw new BadRequestException(
            `Field "${field.name}" must be a valid date`,
          )
        }
        break

      case FieldType.SELECT: {
        const options = (field as any).options as
          | string[]
          | null
        if (
          typeof value !== 'string' ||
          (options && !options.includes(value))
        ) {
          throw new BadRequestException(
            `Field "${field.name}" has invalid option`,
          )
        }
        break
      }

      case FieldType.MULTI_SELECT: {
        const options = (field as any).options as
          | string[]
          | null
        if (!Array.isArray(value)) {
          throw new BadRequestException(
            `Field "${field.name}" must be an array`,
          )
        }
        if (
          options &&
          !value.every(item => options.includes(item))
        ) {
          throw new BadRequestException(
            `Field "${field.name}" has invalid option`,
          )
        }
        break
      }

      case FieldType.FILE:
      case FieldType.IMAGE:
      case FieldType.RELATION:
        break
    }
  }

  private async ensureUnique(
    moduleId: string,
    field: Field,
    value: unknown,
    excludeRecordId?: string,
  ) {
    const existing = await this.prisma.record.findFirst({
      where: {
        moduleId,
        isArchived: false,
        id: excludeRecordId
          ? { not: excludeRecordId }
          : undefined,
        data: {
          path: [field.key],
          equals: value as any,
        },
      },
      select: { id: true },
    })

    if (existing) {
      throw new BadRequestException(
        `Value for field "${field.name}" must be unique`,
      )
    }
  }
}