import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import type { User } from '@prisma/client'

import { CurrentUser } from 'common/decorators/current-user.decorator'
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard'

import { CreateInvitationDto } from './dto/create-invitation.dto'
import { AcceptInvitationDto } from './dto/accept-invitation.dto'
import { InvitationService } from './invitation.service'

@Controller()
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('workspaces/:workspaceId/invitations')
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationService.create(workspaceId, user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('workspaces/:workspaceId/invitations')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.findAll(workspaceId, user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('invitations/:id')
  revoke(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.revoke(invitationId, user.id)
  }

  @Get('invitations/:token/preview')
  preview(@Param('token') token: string) {
    return this.invitationService.preview(token)
  }

  @UseGuards(JwtAuthGuard)
  @Post('invitations/accept')
  accept(
    @CurrentUser() user: User,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.invitationService.accept(user.id, dto)
  }
}