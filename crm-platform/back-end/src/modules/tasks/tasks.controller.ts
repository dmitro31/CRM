import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from 'common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('workspaces/:workspaceId/tasks')
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(workspaceId, user.id, dto);
  }

  @Get('workspaces/:workspaceId/tasks')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Query() query: Record<string, string>,
  ) {
    return this.tasksService.findAll(workspaceId, user.id, query);
  }

  @Patch('tasks/:id')
  update(
    @Param('id') taskId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, user.id, dto);
  }

  @Delete('tasks/:id')
  remove(@Param('id') taskId: string, @CurrentUser() user: User) {
    return this.tasksService.remove(taskId, user.id);
  }
}