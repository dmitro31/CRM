import { Module } from '@nestjs/common'

import { AiModule as CoreAiModule } from 'core/ai/ai.module'
import { WorkspaceModule } from 'modules/workspace/workspace.module'
import { MetadataModule } from 'modules/metadata/metadata.module'
import { RecordModule } from 'modules/records/records.module'

import { AiController } from './ai.controller'
import { AiFormService } from './ai-form.service'
import { AiWorkflowService } from './ai-workflow.service'
import { AiAssistantService } from './ai-assistant.service'

@Module({
  imports: [CoreAiModule, WorkspaceModule, MetadataModule, RecordModule],
  controllers: [AiController],
  providers: [AiFormService, AiWorkflowService, AiAssistantService],
})
export class AiModule {}