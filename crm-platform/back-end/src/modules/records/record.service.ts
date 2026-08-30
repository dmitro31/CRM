import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Field, FieldType, Prisma } from '@prisma/client';
import { PrismaService } from 'core/database/prisma.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';
import { WorkflowEventsService } from 'modules/workflow/workflow-events.service';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly workflowEvents: WorkflowEventsService,
  ) {}

  async create(moduleId: string, userId: string, dto: CreateRecordDto) {
    await this.workspaceAccess.ensureModuleAccess(moduleId, userId);

    const fields = await this.prisma.field.findMany({
      where: { moduleId, isActive: true },
    });

    await this.validateData(moduleId, fields, dto.data, {
      partial: false,
    });

    const record = await this.prisma.record.create({
      data: {
        moduleId,
        data: dto.data as Prisma.InputJsonValue,
        createdById: userId,
      },
    });

    await this.workflowEvents.emit({
      workspaceId: (
        await this.prisma.module.findUniqueOrThrow({
          where: { id: moduleId },
          select: { workspaceId: true },
        })
      ).workspaceId,
      moduleId,
      recordId: record.id,
      event: 'RECORD_CREATED',
      previousData: null,
      currentData: record.data as Record<string, unknown>,
    });

    return record;
  }

  async findAll(
    moduleId: string,
    userId: string,
    query: Record<string, string>,
  ) {
    await this.workspaceAccess.ensureModuleAccess(moduleId, userId);

    const fields = await this.prisma.field.findMany({
      where: { moduleId, isActive: true },
    });

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const allowedSortFields = ['createdAt', 'updatedAt'];

    if (!allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(
        `Sorting by "${sortBy}" is not supported yet, use one of: ${allowedSortFields.join(', ')}`,
      );
    }

    const reservedKeys = ['page', 'limit', 'sortBy', 'sortOrder'];

    const filterEntries = Object.entries(query).filter(
      ([key]) => !reservedKeys.includes(key),
    );

    const conditions: Prisma.RecordWhereInput[] = filterEntries.map(
      ([key, rawValue]) => {
        const field = fields.find((f) => f.key === key);

        if (!field) {
          throw new BadRequestException(`Unknown filter field "${key}"`);
        }

        return {
          data: {
            path: [key],
            equals: this.castFilterValue(field, rawValue),
            not: undefined,
          },
        } as Prisma.RecordWhereInput;
      },
    );

    const where: Prisma.RecordWhereInput = {
      moduleId,
      isArchived: false,
      ...(conditions.length > 0 && { AND: conditions }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.record.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.record.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  private castFilterValue(field: Field, rawValue: string): unknown {
    switch (field.type) {
      case FieldType.NUMBER: {
        const value = Number(rawValue);
        if (Number.isNaN(value)) {
          throw new BadRequestException(
            `Filter value for "${field.name}" must be a number`,
          );
        }
        return value;
      }

      case FieldType.BOOLEAN: {
        if (rawValue === 'true') return true;
        if (rawValue === 'false') return false;
        throw new BadRequestException(
          `Filter value for "${field.name}" must be true or false`,
        );
      }

      default:
        return rawValue;
    }
  }

  async findOne(recordId: string, userId: string) {
    const record = await this.findRecordOrThrow(recordId);

    await this.workspaceAccess.ensureModuleAccess(record.moduleId, userId);

    return record;
  }

  async update(recordId: string, userId: string, dto: UpdateRecordDto) {
    const record = await this.findRecordOrThrow(recordId);

    await this.workspaceAccess.ensureModuleAccess(record.moduleId, userId);

    if (!dto.data) {
      return record;
    }

    const fields = await this.prisma.field.findMany({
      where: { moduleId: record.moduleId, isActive: true },
    });

    await this.validateData(record.moduleId, fields, dto.data, {
      partial: true,
      excludeRecordId: recordId,
    });

    const updated = await this.prisma.record.update({
      where: { id: recordId },
      data: {
        data: {
          ...(record.data as object),
          ...dto.data,
        } as Prisma.InputJsonValue,
      },
    });

    await this.workflowEvents.emit({
      workspaceId: (
        await this.prisma.module.findUniqueOrThrow({
          where: { id: record.moduleId },
          select: { workspaceId: true },
        })
      ).workspaceId,
      moduleId: record.moduleId,
      recordId: updated.id,
      event: 'RECORD_UPDATED',
      previousData: record.data as Record<string, unknown>,
      currentData: updated.data as Record<string, unknown>,
    });

    return updated;
  }

  async remove(recordId: string, userId: string) {
    const record = await this.findRecordOrThrow(recordId);

    await this.workspaceAccess.ensureModuleAccess(record.moduleId, userId);

    await this.prisma.record.update({
      where: { id: recordId },
      data: { isArchived: true },
    });

    return {
      message: 'Record archived successfully',
    };
  }

  private async findRecordOrThrow(recordId: string) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    return record;
  }

  private async validateData(
    moduleId: string,
    fields: Field[],
    data: Record<string, unknown>,
    options: {
      partial: boolean;
      excludeRecordId?: string;
    },
  ) {
    for (const field of fields) {
      const hasValue = Object.hasOwn(data, field.key);

      if (!hasValue) {
        if (!options.partial && field.required) {
          throw new BadRequestException(`Field "${field.name}" is required`);
        }
        continue;
      }

      const value = data[field.key];

      if (value === null || value === undefined) {
        if (field.required) {
          throw new BadRequestException(`Field "${field.name}" is required`);
        }
        continue;
      }

      this.validateFieldType(field, value);

      if (field.unique) {
        await this.ensureUnique(
          moduleId,
          field,
          value,
          options.excludeRecordId,
        );
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
          );
        }
        break;

      case FieldType.NUMBER:
        if (typeof value !== 'number') {
          throw new BadRequestException(
            `Field "${field.name}" must be a number`,
          );
        }
        break;

      case FieldType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new BadRequestException(
            `Field "${field.name}" must be a boolean`,
          );
        }
        break;

      case FieldType.DATE:
      case FieldType.DATETIME:
        if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
          throw new BadRequestException(
            `Field "${field.name}" must be a valid date`,
          );
        }
        break;

      case FieldType.SELECT: {
        const options = field.options as string[] | null;
        if (
          typeof value !== 'string' ||
          (options && !options.includes(value))
        ) {
          throw new BadRequestException(
            `Field "${field.name}" has invalid option`,
          );
        }
        break;
      }

      case FieldType.MULTI_SELECT: {
        const options = field.options as string[] | null;
        if (!Array.isArray(value)) {
          throw new BadRequestException(
            `Field "${field.name}" must be an array`,
          );
        }
        if (
          options &&
          !value.every((item) => options.includes(item as string))
        ) {
          throw new BadRequestException(
            `Field "${field.name}" has invalid option`,
          );
        }
        break;
      }

      case FieldType.FILE:
      case FieldType.IMAGE:
      case FieldType.RELATION:
        break;
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
        id: excludeRecordId ? { not: excludeRecordId } : undefined,
        data: {
          path: [field.key],
          equals: value as Prisma.InputJsonValue,
        },
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        `Value for field "${field.name}" must be unique`,
      );
    }
  }
}
