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

import { CreateWorkspaceDto } from './dto/create-workspace.dto'
import { UpdateWorkspaceDto } from './dto/update-workspace'
import { WorkspaceService } from './workspace.service'

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(
      user.id,
      dto,
    )
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
  ) {
    return this.workspaceService.findAll(
      user.id,
    )
  }

  @Get(':id')
  findOne(
    @Param('id') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.workspaceService.findOne(
      workspaceId,
      user.id,
    )
  }

  @Patch(':id')
  update(
    @Param('id') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(
      workspaceId,
      user.id,
      dto,
    )
  }

  @Delete(':id')
  remove(
    @Param('id') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.workspaceService.remove(
      workspaceId,
      user.id,
    )
  }
}