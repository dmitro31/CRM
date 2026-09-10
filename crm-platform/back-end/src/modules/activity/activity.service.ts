import { Injectable } from '@nestjs/common';
import { ActivityType, Prisma } from '@prisma/client';
import { PrismaService } from 'core/database/prisma.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async log(params: {
    type: ActivityType;
    workspaceId: string;
    userId: string;
    recordId?: string;
    data?: Record<string, unknown>;
  }) {
    return this.prisma.activityEvent.create({
      data: {
        type: params.type,
        workspaceId: params.workspaceId,
        userId: params.userId,
        recordId: params.recordId,
        data: params.data as Prisma.InputJsonValue,
      },
    });
  }

  async findForRecord(recordId: string, userId: string) {
    const record = await this.prisma.record.findUnique({
      where: { id: recordId },
      select: { moduleId: true },
    });

    if (!record) {
      return [];
    }

    await this.workspaceAccess.ensureModuleAccess(record.moduleId, userId);

    return this.prisma.activityEvent.findMany({
      where: { recordId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async findForWorkspace(
    workspaceId: string,
    userId: string,
    query: { page?: string; limit?: string },
  ) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 30, 100);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.activityEvent.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      this.prisma.activityEvent.count({ where: { workspaceId } }),
    ]);

    return { items, total, page, limit };
  }
}