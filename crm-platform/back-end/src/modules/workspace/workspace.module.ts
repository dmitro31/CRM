import { Module } from '@nestjs/common'

import { MailModule } from 'modules/mail/mail.module'

import { WorkspaceController } from './workspace.controller'
import { WorkspaceService } from './workspace.service'
import { WorkspaceAccessService } from './workspace-access.service'
import { InvitationController } from 'modules/invitation/invitation.controller'
import { InvitationService } from 'modules/invitation/invitation.service'
import { RoleController } from 'modules/role/role.controller'
import { RoleService } from 'modules/role/role.service'

@Module({
  imports: [MailModule],
  controllers: [
    WorkspaceController,
    InvitationController,
    RoleController,
  ],
  providers: [
    WorkspaceService,
    WorkspaceAccessService,
    InvitationService,
    RoleService,
  ],
  exports: [WorkspaceAccessService],
})
export class WorkspaceModule {}