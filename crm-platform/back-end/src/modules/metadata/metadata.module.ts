import { Module } from '@nestjs/common'

import { WorkspaceModule } from 'modules/workspace/workspace.module'

import { ModuleController } from './module/module.controller'
import { ModuleService } from './module/module.service'
import { FieldController } from './field/field.controller'
import { FieldService } from './field/field.service'
import { ViewController } from './view/view.controller'
import { ViewService } from './view/view.service'

@Module({
  imports: [WorkspaceModule],
  controllers: [ModuleController, FieldController, ViewController],
  providers: [ModuleService, FieldService, ViewService],
})
export class MetadataModule {}