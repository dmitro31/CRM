import { Module } from '@nestjs/common'

import { WorkspaceModule } from 'modules/workspace/workspace.module'

import { InvitationController } from './invitation.controller'
import { InvitationService } from './invitation.service'

@Module({
  imports: [WorkspaceModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}