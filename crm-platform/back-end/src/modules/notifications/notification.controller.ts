import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import type { User } from '@prisma/client'

import { CurrentUser } from 'common/decorators/current-user.decorator'
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard'

import { NotificationService } from './notification.service'

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.notificationService.findAll(user.id)
  }

  @Get('unread-count')
  countUnread(@CurrentUser() user: User) {
    return this.notificationService.countUnread(user.id)
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationService.markAsRead(id, user.id)
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: User) {
    return this.notificationService.markAllAsRead(user.id)
  }
}