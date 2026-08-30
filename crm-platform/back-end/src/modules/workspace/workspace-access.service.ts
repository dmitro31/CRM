import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'core/database/prisma.service';

@Injectable()
export class WorkspaceAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureMembership(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      select: {
        id: true,
        roleId: true,
      },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this workspace');
    }

    return member;
  }

  async ensureModuleAccess(moduleId: string, userId: string) {
    const module = await this.prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    await this.ensureMembership(module.workspaceId, userId);

    return module;
  }

  async ensureOwner(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
      select: { id: true },
    });

    if (!workspace) {
      throw new ForbiddenException(
        'Only workspace owner can perform this action',
      );
    }

    return workspace;
  }
}
