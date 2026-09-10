import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'modules/workspace/workspace.module';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [WorkspaceModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}