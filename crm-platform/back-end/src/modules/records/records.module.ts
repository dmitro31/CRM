import { Module } from "@nestjs/common";

import { WorkspaceModule } from 'modules/workspace/workspace.module'
import { RecordController } from "./record.controller";
import { RecordService } from "./record.service";

@Module({
    imports: [WorkspaceModule],
    controllers: [RecordController],
    providers: [RecordService]
})
export class RecordModule {}