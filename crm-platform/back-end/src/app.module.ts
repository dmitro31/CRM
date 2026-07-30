import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import {
  appConfig,
  databaseConfig,
  envValidationSchema,
  jwtConfig,
} from './config'

import { PrismaModule } from './core/database/prisma.module'

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
      ],

      validationSchema: envValidationSchema,
    }),

    PrismaModule,
  ],
})
export class AppModule {}