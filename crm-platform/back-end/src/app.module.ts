import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  appConfig,
  databaseConfig,
  envValidationSchema,
  githubConfig,
  googleConfig,
  jwtConfig,
  mailConfig,
} from './config';

import { PrismaModule } from './core/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MetadataModule } from 'modules/metadata/metadata.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { RecordModule } from 'modules/records/records.module';
import { FilesModule } from 'modules/files/files.module';
import storageConfig from 'config/storage.config';
import redisConfig from 'config/redis.config';
import { WorkflowModule } from 'modules/workflow/workflow.module';
import aiConfig from 'config/ai.config';
import { AiModule } from 'modules/ai/ai.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from 'modules/health/health.module';
import { LoggerModule } from 'nestjs-pino';
import { RequestIdMiddleware } from 'common/middleware/request-id.middleware';
import { AppThrottlerGuard } from 'common/guards/app-throttler.guard';
import type { IncomingMessage } from 'http';
import { NotificationModule } from 'modules/notifications/notification.module';

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
        aiConfig,
      ],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    NotificationModule,
    MetadataModule,
    RecordModule,
    FilesModule,
    WorkflowModule,
    AiModule,
    HealthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req: IncomingMessage) =>
          String(req.headers['x-request-id'] ?? ''),
        customProps: () => ({}),
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.refreshToken',
        ],
        serializers: {
          req: (req: IncomingMessage & { id?: string }) => ({
            method: req.method,
            url: req.url,
            id: req.id,
          }),
        },
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
