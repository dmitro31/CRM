import { Module } from '@nestjs/common'

import { QueueModule } from 'core/queue/queue.module'
import { MailModule } from 'modules/mail/mail.module'
import { WorkspaceModule } from 'modules/workspace/workspace.module'

import { WorkflowController } from './workflow.controller'
import { WorkflowService } from './workflow.service'
import { WorkflowEventsService } from './workflow-events.service'
import { WorkflowProcessor } from './workflow.processor'

@Module({
  imports: [QueueModule, MailModule, WorkspaceModule],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    WorkflowEventsService,
    WorkflowProcessor,
  ],
  exports: [WorkflowEventsService],
})
export class WorkflowModule {}