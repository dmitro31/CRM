import {
  Body,
  Controller,
  Get,
  Req,
  Post,
  Query, UseGuards
} from '@nestjs/common'
import type { Request } from 'express'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import type { User } from '@prisma/client'
import { RefreshDto } from './dto/refresh.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { GoogleAuthGuard } from './guards/google-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto)
  }

  @Post('login')
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto)
  }

  @Post('resend-verification')
  resendVerification(
    @Body('email') email: string,
  ) {
    return this.authService.resendVerificationEmail(email)
  }

  @Get('verify-email')
  verifyEmail(
    @Query('token') token: string,
  ) {
    return this.authService.verifyEmail(token)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(
    @CurrentUser() user: User,
  ) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      isActive: user.isActive,
    }
  }

  @Post('refresh')
  refresh(
    @Body() dto: RefreshDto,
  ) {
    return this.authService.refresh(dto.refreshToken)
  }

  @Post('logout')
logout(
  @Body() dto: RefreshDto,
) {
  return this.authService.logout(
    dto.refreshToken,
  )
}

@UseGuards(JwtAuthGuard)
@Post('logout-all')
logoutAll(
  @CurrentUser() user: User,
) {
  return this.authService.logoutAll(
    user.id,
  )
}

@Post('forgot-password')
forgotPassword(
  @Body() dto: ForgotPasswordDto,
) {
  return this.authService.forgotPassword(
    dto.email,
  )
}

@Post('reset-password')
resetPassword(
  @Body() dto: ResetPasswordDto,
) {
  return this.authService.resetPassword(
    dto.token,
    dto.password,
  )
}

@UseGuards(GoogleAuthGuard)
@Get('google')
googleLogin() {}

@UseGuards(GoogleAuthGuard)
@Get('google/callback')
googleCallback(
  @Req() req: Request,
) {
  return req.user
}
}
