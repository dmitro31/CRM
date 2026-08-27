import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import {
  appConfig,
  databaseConfig,
  envValidationSchema,
  githubConfig,
  googleConfig,
  jwtConfig,
  mailConfig,
} from './config'

import { PrismaModule } from './core/database/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { MetadataModule } from 'modules/metadata/metadata.module'
import { WorkspaceModule } from './modules/workspace/workspace.module'
import { RecordModule } from 'modules/records/records.module'
import { InvitationModule } from 'modules/invitation/invitation.module'
import { FilesModule } from 'modules/files/files.module'
import storageConfig from 'config/storage.config'
import redisConfig from 'config/redis.config'
import { WorkflowModule } from 'modules/workflow/workflow.module'
import aiConfig from 'config/ai.config'
import { AiModule } from 'modules/ai/ai.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        mailConfig,
        googleConfig,
        githubConfig,
        storageConfig,
        redisConfig,
        aiConfig
      ],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    MetadataModule,
    RecordModule,
    FilesModule,
    WorkflowModule,
    AiModule
  ],
})
export class AppModule {}