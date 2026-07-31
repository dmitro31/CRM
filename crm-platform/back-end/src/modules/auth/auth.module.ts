import { Module } from '@nestjs/common'
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'src/core/database/prisma.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PasswordService } from './services/password.service'
import { TokenService } from './services/token.service'

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: (config.get<string | number>('jwt.accessExpiresIn') ?? '1h') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService],
  exports: [AuthService],
})
export class AuthModule {}