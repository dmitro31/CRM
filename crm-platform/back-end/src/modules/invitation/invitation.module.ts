import { Module } from '@nestjs/common'

import { MailModule } from 'modules/mail/mail.module'
import { WorkspaceModule } from 'modules/workspace/workspace.module'

import { InvitationController } from './invitation.controller'
import { InvitationService } from './invitation.service'

@Module({
  imports: [MailModule, WorkspaceModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}