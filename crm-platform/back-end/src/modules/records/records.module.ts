import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'modules/workspace/workspace.module';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { WorkflowModule } from 'modules/workflow/workflow.module';
import { ActivityModule } from 'modules/activity/activity.module';

@Module({
  imports: [WorkspaceModule, WorkflowModule , ActivityModule],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
