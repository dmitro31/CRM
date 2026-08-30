import { randomBytes } from 'crypto';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvitationStatus } from '@prisma/client';
import { PrismaService } from 'core/database/prisma.service';
import { MailService } from 'modules/mail/mail.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';

import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

const INVITATION_TTL_DAYS = 7;

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly mail: MailService,
  ) {}

  async create(workspaceId: string, userId: string, dto: CreateInvitationDto) {
    await this.workspaceAccess.ensureOwner(workspaceId, userId);

    const workspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { name: true },
    });

    const role = await this.prisma.role.findFirst({
      where: {
        id: dto.roleId,
        workspaceId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found in this workspace');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      const isMember = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: existingUser.id,
          },
        },
        select: { id: true },
      });

      if (isMember) {
        throw new BadRequestException(
          'User is already a member of this workspace',
        );
      }
    }

    const pending = await this.prisma.invitation.findFirst({
      where: {
        workspaceId,
        email: dto.email,
        status: InvitationStatus.PENDING,
      },
      select: { id: true },
    });

    if (pending) {
      throw new BadRequestException(
        'An invitation is already pending for this email',
      );
    }

    const token = randomBytes(32).toString('hex');

    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email,
        token,
        workspaceId,
        roleId: dto.roleId,
        invitedById: userId,
        expiresAt: new Date(
          Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    });

    await this.mail.sendInvitationEmail(
      dto.email,
      workspace.name,
      role.name,
      token,
    );

    return invitation;
  }

  async findAll(workspaceId: string, userId: string) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    return this.prisma.invitation.findMany({
      where: {
        workspaceId,
        status: InvitationStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true, workspaceId: true, status: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.workspaceAccess.ensureOwner(invitation.workspaceId, userId);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be revoked');
    }

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REVOKED },
    });

    return { message: 'Invitation revoked successfully' };
  }

  async preview(token: string) {
    const invitation = await this.findValidInvitationOrThrow(token);

    return {
      email: invitation.email,
      workspaceName: invitation.workspace.name,
      roleName: invitation.role.name,
      invitedByEmail: invitation.invitedBy.email,
    };
  }

  async accept(userId: string, dto: AcceptInvitationDto) {
    const invitation = await this.findValidInvitationOrThrow(dto.token);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { email: true },
    });

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException(
        'This invitation was sent to a different email',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId,
          roleId: invitation.roleId,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED },
      });

      return tx.workspace.findUniqueOrThrow({
        where: { id: invitation.workspaceId },
      });
    });
  }

  private async findValidInvitationOrThrow(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: { select: { name: true } },
        role: { select: { name: true } },
        invitedBy: { select: { email: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation is no longer valid');
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });

      throw new BadRequestException('This invitation has expired');
    }

    return invitation;
  }
}
