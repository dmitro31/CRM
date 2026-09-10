import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'modules/workspace/workspace.module';
import { ActivityModule } from 'modules/activity/activity.module';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [WorkspaceModule, ActivityModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}