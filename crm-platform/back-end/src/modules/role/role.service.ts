import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'core/database/prisma.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const PROTECTED_ROLE_NAME = 'Owner';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async create(workspaceId: string, userId: string, dto: CreateRoleDto) {
    await this.workspaceAccess.ensureOwner(workspaceId, userId);

    const existing = await this.prisma.role.findUnique({
      where: {
        workspaceId_name: {
          workspaceId,
          name: dto.name,
        },
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        `Role "${dto.name}" already exists in this workspace`,
      );
    }

    return this.prisma.role.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions ?? [],
      },
    });
  }

  async findAll(workspaceId: string, userId: string) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    return this.prisma.role.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(roleId: string, userId: string) {
    const role = await this.findRoleOrThrow(roleId);

    await this.workspaceAccess.ensureMembership(role.workspaceId, userId);

    return role;
  }

  async update(roleId: string, userId: string, dto: UpdateRoleDto) {
    const role = await this.findRoleOrThrow(roleId);

    await this.workspaceAccess.ensureOwner(role.workspaceId, userId);

    if (role.name === PROTECTED_ROLE_NAME) {
      throw new BadRequestException('Owner role cannot be modified');
    }

    if (dto.name) {
      const existing = await this.prisma.role.findUnique({
        where: {
          workspaceId_name: {
            workspaceId: role.workspaceId,
            name: dto.name,
          },
        },
        select: { id: true },
      });

      if (existing && existing.id !== roleId) {
        throw new BadRequestException(
          `Role "${dto.name}" already exists in this workspace`,
        );
      }
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
      },
    });
  }

  async remove(roleId: string, userId: string) {
    const role = await this.findRoleOrThrow(roleId);

    await this.workspaceAccess.ensureOwner(role.workspaceId, userId);

    if (role.name === PROTECTED_ROLE_NAME) {
      throw new BadRequestException('Owner role cannot be deleted');
    }

    const membersCount = await this.prisma.workspaceMember.count({
      where: { roleId },
    });

    if (membersCount > 0) {
      throw new BadRequestException(
        'Cannot delete a role that is assigned to members',
      );
    }

    await this.prisma.role.delete({
      where: { id: roleId },
    });

    return { message: 'Role deleted successfully' };
  }

  private async findRoleOrThrow(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }
}
