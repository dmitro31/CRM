import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from 'common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleService } from './module.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post('workspaces/:workspaceId/modules')
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateModuleDto,
  ) {
    return this.moduleService.create(workspaceId, user.id, dto);
  }

  @Get('workspaces/:workspaceId/modules')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.moduleService.findAll(workspaceId, user.id);
  }

  @Get('modules/:id')
  findOne(@Param('id') moduleId: string, @CurrentUser() user: User) {
    return this.moduleService.findOne(moduleId, user.id);
  }

  @Patch('modules/:id')
  update(
    @Param('id') moduleId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.moduleService.update(moduleId, user.id, dto);
  }

  @Delete('modules/:id')
  remove(@Param('id') moduleId: string, @CurrentUser() user: User) {
    return this.moduleService.remove(moduleId, user.id);
  }
}
