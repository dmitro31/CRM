import { Injectable } from '@nestjs/common';
import { PrismaService } from 'core/database/prisma.service';
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspaceDashboard(workspaceId: string) {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [modules, workflows, recentRecords, totalRecords, timelineRecords] =
      await Promise.all([
        this.prisma.module.findMany({
          where: { workspaceId },
          include: {
            fields: {
              where: { isActive: true },
            },
          },
        }),
        this.prisma.workflow.findMany({
          where: { workspaceId },
          select: { enabled: true },
        }),
        this.prisma.record.findMany({
          where: { module: { workspaceId } },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: {
            module: {
              select: { id: true, name: true, fields: true },
            },
          },
        }),
        this.prisma.record.count({
          where: { module: { workspaceId } },
        }),
        this.prisma.record.findMany({
          where: {
            module: { workspaceId },
            createdAt: { gte: fourteenDaysAgo },
          },
          select: { createdAt: true },
        }),
      ]);

    const buckets = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      buckets.set(d.toISOString().slice(0, 10), 0);
    }

    for (const record of timelineRecords) {
      const day = record.createdAt.toISOString().slice(0, 10);
      if (buckets.has(day)) {
        buckets.set(day, (buckets.get(day) ?? 0) + 1);
      }
    }

    const timeline = Array.from(buckets.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    const formattedRecentRecords = recentRecords.map((r) => ({
      record: { id: r.id, createdAt: r.createdAt, data: r.data },
      moduleName: r.module.name,
      moduleId: r.module.id,
    }));

    return {
      modules,
      moduleCount: modules.length,
      totalRecords,
      recentRecords: formattedRecentRecords,
      workflowCount: workflows.length,
      activeWorkflows: workflows.filter((w) => w.enabled).length,
      timeline,
    };
  }
}