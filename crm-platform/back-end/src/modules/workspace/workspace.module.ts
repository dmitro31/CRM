import { Module } from '@nestjs/common';

import { MailModule } from 'modules/mail/mail.module';

import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceAccessService } from './workspace-access.service';
import { InvitationController } from 'modules/invitation/invitation.controller';
import { InvitationService } from 'modules/invitation/invitation.service';
import { RoleController } from 'modules/role/role.controller';
import { RoleService } from 'modules/role/role.service';
import { MemberController } from './member/member.controller'
import { MemberService } from './member/member.service'

@Module({
  imports: [MailModule],
  controllers: [WorkspaceController, InvitationController, RoleController , MemberController],
  providers: [
    WorkspaceService,
    WorkspaceAccessService,
    InvitationService,
    RoleService,
    MemberService
  ],
  exports: [WorkspaceAccessService],
})
export class WorkspaceModule {}
