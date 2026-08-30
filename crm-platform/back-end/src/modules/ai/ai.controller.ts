import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from 'common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

import { GenerateFormDto } from './dto/generate-form.dto';
import { CreateFormFromDraftDto } from './dto/create-form-from-draft.dto';
import { GenerateWorkflowDto } from './dto/generate-workflow.dto';
import { AiWorkflowService } from './ai-workflow.service';
import { AskAssistantDto } from './dto/ask-assistant.dto';
import { AiAssistantService } from './ai-assistant.service';
import { AiFormService } from './ai-form.service';

@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/ai')
export class AiController {
  constructor(
    private readonly aiFormService: AiFormService,
    private readonly aiWorkflowService: AiWorkflowService,
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  @Post('generate-form')
  generateForm(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: GenerateFormDto,
  ): Promise<unknown> {
    return this.aiFormService.generateDraft(workspaceId, user.id, dto);
  }

  @Post('generate-form/create')
  createForm(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateFormFromDraftDto,
  ) {
    return this.aiFormService.createFromDraft(workspaceId, user.id, dto);
  }

  @Post('modules/:moduleId/generate-workflow')
  generateWorkflow(
    @Param('workspaceId') workspaceId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: User,
    @Body() dto: GenerateWorkflowDto,
  ) {
    return this.aiWorkflowService.generateDraft(
      workspaceId,
      moduleId,
      user.id,
      dto,
    );
  }

  @Post('ask')
  ask(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: AskAssistantDto,
  ) {
    return this.aiAssistantService.ask(workspaceId, user.id, dto);
  }
}
