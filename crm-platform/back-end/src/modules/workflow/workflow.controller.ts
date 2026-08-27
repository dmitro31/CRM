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

import { CreateWorkflowDto } from './dto/create-workflow.dto'
import { UpdateWorkflowDto } from './dto/update-workflow.dto'
import { WorkflowService } from './workflow.service'

@UseGuards(JwtAuthGuard)
@Controller()
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
  ) {}

  @Post('workspaces/:workspaceId/workflows')
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowService.create(workspaceId, user.id, dto)
  }

  @Get('workspaces/:workspaceId/workflows')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowService.findAll(workspaceId, user.id)
  }

  @Patch('workflows/:id')
  update(
    @Param('id') workflowId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowService.update(workflowId, user.id, dto)
  }

  @Delete('workflows/:id')
  remove(
    @Param('id') workflowId: string,
    @CurrentUser() user: User,
  ) {
    return this.workflowService.remove(workflowId, user.id)
  }
}