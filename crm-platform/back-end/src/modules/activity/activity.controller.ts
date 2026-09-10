import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from 'common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

import { ActivityService } from './activity.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('records/:recordId/activity')
  findForRecord(
    @Param('recordId') recordId: string,
    @CurrentUser() user: User,
  ) {
    return this.activityService.findForRecord(recordId, user.id);
  }

  @Get('workspaces/:workspaceId/activity')
  findForWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Query() query: Record<string, string>,
  ) {
    return this.activityService.findForWorkspace(workspaceId, user.id, query);
  }
}