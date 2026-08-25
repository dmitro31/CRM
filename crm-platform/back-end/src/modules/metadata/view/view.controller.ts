import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import type { User } from '@prisma/client'

import { CurrentUser } from 'common/decorators/current-user.decorator'
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard'

import { CreateViewDto } from './dto/create-view.dto'
import { UpdateViewDto } from './dto/update-view.dto'
import { ViewService } from './view.service'

@UseGuards(JwtAuthGuard)
@Controller()
export class ViewController {
  constructor(
    private readonly viewService: ViewService,
  ) {}

  @Post('modules/:moduleId/views')
  create(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateViewDto,
  ) {
    return this.viewService.create(moduleId, user.id, dto)
  }

  @Get('modules/:moduleId/views')
  findAll(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: User,
  ) {
    return this.viewService.findAll(moduleId, user.id)
  }

  @Get('views/:id')
  findOne(
    @Param('id') viewId: string,
    @CurrentUser() user: User,
  ) {
    return this.viewService.findOne(viewId, user.id)
  }

  @Patch('views/:id')
  update(
    @Param('id') viewId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateViewDto,
  ) {
    return this.viewService.update(viewId, user.id, dto)
  }

  @Delete('views/:id')
  remove(
    @Param('id') viewId: string,
    @CurrentUser() user: User,
  ) {
    return this.viewService.remove(viewId, user.id)
  }
}