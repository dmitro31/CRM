import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common'
import type { User } from '@prisma/client'

import { CurrentUser } from 'common/decorators/current-user.decorator'
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard'

import { MemberService } from './member.service'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
import { TransferOwnershipDto } from './dto/transfer-ownership.dto'

@UseGuards(JwtAuthGuard)
@Controller()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Patch('workspaces/:workspaceId/members/:memberId')
  updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.memberService.updateRole(workspaceId, memberId, user.id, dto.roleId)
  }

  @Delete('workspaces/:workspaceId/members/:memberId')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.memberService.remove(workspaceId, memberId, user.id)
  }

  @Post('workspaces/:workspaceId/transfer-ownership')
  transferOwnership(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.memberService.transferOwnership(workspaceId, user.id, dto.newOwnerUserId)
  }
}