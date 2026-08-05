import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import {
  appConfig,
  databaseConfig,
  envValidationSchema,
  googleConfig,
  jwtConfig,
  mailConfig
} from './config'

import { PrismaModule } from './core/database/prisma.module'
import { AuthModule } from './modules/auth/auth.module'

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
        googleConfig,
        mailConfig
      ],
      validationSchema: envValidationSchema,
    }),

    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}