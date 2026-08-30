import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FieldType } from '@prisma/client';

import { PrismaService } from 'core/database/prisma.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';
import { WorkflowEventsService } from 'modules/workflow/workflow-events.service';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

import { RecordService } from './record.service';

describe('RecordService', () => {
  let service: RecordService;
  let prisma: {
    field: { findMany: jest.Mock };
    record: { create: jest.Mock; findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      field: { findMany: jest.fn() },
      record: { create: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: WorkspaceAccessService,
          useValue: { ensureModuleAccess: jest.fn() },
        },
        {
          provide: WorkflowEventsService,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(RecordService);
  });

  it('rejects creation when a required field is missing', async () => {
    prisma.field.findMany.mockImplementation(() => [
      {
        key: 'name',
        name: 'Імʼя',
        type: FieldType.TEXT,
        required: true,
        unique: false,
      },
    ]);

    await expect(
      service.create('module-1', 'user-1', { data: {} }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a value of the wrong type', async () => {
    prisma.field.findMany.mockImplementation(() => [
      {
        key: 'age',
        name: 'Вік',
        type: FieldType.NUMBER,
        required: false,
        unique: false,
      },
    ]);

    await expect(
      service.create('module-1', 'user-1', { data: { age: 'not-a-number' } }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a SELECT value outside of options', async () => {
    prisma.field.findMany.mockImplementation(() => [
      {
        key: 'status',
        name: 'Статус',
        type: FieldType.SELECT,
        required: false,
        unique: false,
        options: ['Новий', 'Завершено'],
      },
    ]);

    await expect(
      service.create('module-1', 'user-1', { data: { status: 'Невідомо' } }),
    ).rejects.toThrow(BadRequestException);
  });

  it('accepts a valid record and creates it', async () => {
    prisma.field.findMany.mockImplementation(() => [
      {
        key: 'name',
        name: 'Імʼя',
        type: FieldType.TEXT,
        required: true,
        unique: false,
      },
    ]);
    prisma.record.create.mockResolvedValue({
      id: 'record-1',
      moduleId: 'module-1',
      data: { name: 'Дмитро' },
    } as never);

    const result = await service.create('module-1', 'user-1', {
      data: { name: 'Дмитро' },
    });

    expect(result.id).toBe('record-1');
    expect(prisma.record.create).toHaveBeenCalled();
  });
});
