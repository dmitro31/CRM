import { Module } from '@nestjs/common'

import { WorkspaceModule } from 'modules/workspace/workspace.module'

import { ModuleController } from './module/module.controller'
import { ModuleService } from './module/module.service'
import { FieldController } from './field/field.controller'
import { FieldService } from './field/field.service'

@Module({
  imports: [WorkspaceModule],
  controllers: [ModuleController, FieldController],
  providers: [ModuleService, FieldService],
})
export class MetadataModule {}