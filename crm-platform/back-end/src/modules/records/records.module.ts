import { Module } from "@nestjs/common";

import { WorkspaceModule } from 'modules/workspace/workspace.module'
import { RecordController } from "./record.controller";
import { RecordService } from "./record.service";
import { WorkflowModule } from "modules/workflow/workflow.module";

@Module({
  imports: [WorkspaceModule, WorkflowModule],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}