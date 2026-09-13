import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'modules/workspace/workspace.module';
import { ActivityModule } from 'modules/activity/activity.module';
import { NotificationModule } from 'modules/notifications/notification.module';

import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [WorkspaceModule, ActivityModule, NotificationModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}