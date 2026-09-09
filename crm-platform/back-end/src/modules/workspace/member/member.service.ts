import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'core/database/prisma.service'
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service'

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async updateRole(
    workspaceId: string,
    memberId: string,
    userId: string,
    roleId: string,
  ) {
    const workspace = await this.workspaceAccess.ensureOwner(workspaceId, userId)

    const member = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    })

    if (!member) {
      throw new NotFoundException('Member not found')
    }

    const targetWorkspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { ownerId: true },
    })

    if (member.userId === targetWorkspace.ownerId) {
      throw new BadRequestException(
        'Cannot change the role of the workspace owner, transfer ownership first',
      )
    }

    const role = await this.prisma.role.findFirst({
      where: { id: roleId, workspaceId },
    })

    if (!role) {
      throw new NotFoundException('Role not found in this workspace')
    }

    return this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { roleId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
        role: true,
      },
    })
  }

  async remove(workspaceId: string, memberId: string, userId: string) {
    const workspace = await this.workspaceAccess.ensureOwner(workspaceId, userId)

    const member = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    })

    if (!member) {
      throw new NotFoundException('Member not found')
    }

    const targetWorkspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { ownerId: true },
    })

    if (member.userId === targetWorkspace.ownerId) {
      throw new BadRequestException(
        'Cannot remove the workspace owner, transfer ownership first',
      )
    }

    if (member.userId === userId) {
      throw new BadRequestException('You cannot remove yourself')
    }

    await this.prisma.workspaceMember.delete({ where: { id: memberId } })

    return { message: 'Member removed successfully' }
  }

  async transferOwnership(
    workspaceId: string,
    userId: string,
    newOwnerUserId: string,
  ) {
    await this.workspaceAccess.ensureOwner(workspaceId, userId)

    const newOwnerMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: newOwnerUserId,
        },
      },
    })

    if (!newOwnerMember) {
      throw new BadRequestException(
        'The new owner must already be a member of this workspace',
      )
    }

    const ownerRole = await this.prisma.role.findFirst({
      where: { workspaceId, name: 'Owner' },
    })

    if (!ownerRole) {
      throw new BadRequestException('Owner role not found for this workspace')
    }

    return this.prisma.$transaction(async tx => {
      await tx.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: newOwnerUserId },
      })

      await tx.workspaceMember.update({
        where: { id: newOwnerMember.id },
        data: { roleId: ownerRole.id },
      })

      return tx.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        include: {
          owner: {
            select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
          },
        },
      })
    })
  }
}