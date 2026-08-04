import { Module } from '@nestjs/common'
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'src/core/database/prisma.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PasswordService } from './services/password.service'
import { TokenService } from './services/token.service'
import { MailModule } from '../mail/mail.module'
import { VerificationTokenService } from './services/verification-token.service'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RefreshTokenService } from './services/refresh-token.service'

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    MailModule,
    PassportModule.register({
    defaultStrategy: 'jwt',
    }),
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
  providers: [AuthService, PasswordService, TokenService , VerificationTokenService , JwtStrategy, RefreshTokenService],
  exports: [AuthService],
})
export class AuthModule {}