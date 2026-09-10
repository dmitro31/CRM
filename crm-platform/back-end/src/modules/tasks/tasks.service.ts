import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, TaskStatus } from '@prisma/client';
import { PrismaService } from 'core/database/prisma.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';
import { ActivityService } from 'modules/activity/activity.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly activity: ActivityService,
  ) {}

  async create(workspaceId: string, userId: string, dto: CreateTaskDto) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    if (dto.assigneeId) {
      await this.workspaceAccess.ensureMembership(workspaceId, dto.assigneeId);
    }

    const task = await this.prisma.task.create({
      data: {
        workspaceId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
        recordId: dto.recordId,
        createdById: userId,
      },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    await this.activity.log({
      type: ActivityType.TASK_CREATED,
      workspaceId,
      userId,
      recordId: dto.recordId,
      data: { taskId: task.id, title: task.title },
    });

    return task;
  }

  async findAll(
    workspaceId: string,
    userId: string,
    query: { status?: string; assigneeId?: string; recordId?: string },
  ) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    return this.prisma.task.findMany({
      where: {
        workspaceId,
        status: query.status ? (query.status as TaskStatus) : undefined,
        assigneeId: query.assigneeId,
        recordId: query.recordId,
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.findTaskOrThrow(taskId);

    await this.workspaceAccess.ensureMembership(task.workspaceId, userId);

    if (dto.assigneeId) {
      await this.workspaceAccess.ensureMembership(
        task.workspaceId,
        dto.assigneeId,
      );
    }

    const wasCompleted = task.status === TaskStatus.DONE;

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
      },
    });

    const justCompleted = !wasCompleted && updated.status === TaskStatus.DONE;

    await this.activity.log({
      type: justCompleted ? ActivityType.TASK_COMPLETED : ActivityType.TASK_UPDATED,
      workspaceId: task.workspaceId,
      userId,
      recordId: task.recordId ?? undefined,
      data: { taskId: task.id, title: updated.title },
    });

    return updated;
  }

  async remove(taskId: string, userId: string) {
    const task = await this.findTaskOrThrow(taskId);

    await this.workspaceAccess.ensureMembership(task.workspaceId, userId);

    await this.prisma.task.delete({ where: { id: taskId } });

    await this.activity.log({
      type: ActivityType.TASK_DELETED,
      workspaceId: task.workspaceId,
      userId,
      recordId: task.recordId ?? undefined,
      data: { taskId: task.id, title: task.title },
    });

    return { message: 'Task deleted successfully' };
  }

  private async findTaskOrThrow(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}