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

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('workspaces/:workspaceId/roles')
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateRoleDto,
  ) {
    return this.roleService.create(workspaceId, user.id, dto);
  }

  @Get('workspaces/:workspaceId/roles')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.roleService.findAll(workspaceId, user.id);
  }

  @Get('roles/:id')
  findOne(@Param('id') roleId: string, @CurrentUser() user: User) {
    return this.roleService.findOne(roleId, user.id);
  }

  @Patch('roles/:id')
  update(
    @Param('id') roleId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.update(roleId, user.id, dto);
  }

  @Delete('roles/:id')
  remove(@Param('id') roleId: string, @CurrentUser() user: User) {
    return this.roleService.remove(roleId, user.id);
  }
}
