import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Req,
  Res,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { randomUUID } from 'crypto'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from 'common/decorators/current-user.decorator'
import type { User } from '@prisma/client'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import { AuthGuard } from '@nestjs/passport'
import { Throttle } from '@nestjs/throttler'
import { CsrfGuard } from './guards/csrf.guard'

const REFRESH_COOKIE_NAME = 'refreshToken'
const CSRF_COOKIE_NAME = 'csrfToken'
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  private setAuthCookies(
    res: Response,
    refreshToken: string,
  ) {
    const csrfToken = randomUUID()
    const isProduction = process.env.NODE_ENV === 'production'

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    })

    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    })
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME)
    res.clearCookie(CSRF_COOKIE_NAME)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto)

    this.setAuthCookies(res, result.refreshToken)

    return {
      user: result.user,
      accessToken: result.accessToken,
    }
  }

  @Post('resend-verification')
  resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email)
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      isActive: user.isActive,
    }
  }

  @UseGuards(CsrfGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

    if (!refreshToken) {
      this.clearAuthCookies(res)
      throw new ForbiddenException('No refresh token provided')
    }

    const result = await this.authService.refresh(refreshToken)

    this.setAuthCookies(res, result.refreshToken)

    return { accessToken: result.accessToken }
  }

  @UseGuards(CsrfGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

    if (refreshToken) {
      await this.authService.logout(refreshToken)
    }

    this.clearAuthCookies(res)

    return { message: 'Logged out successfully' }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.id)

    this.clearAuthCookies(res)

    return { message: 'Logged out from all devices' }
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email)
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.token,
      dto.password,
    )
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(req.user)

    this.setAuthCookies(res, result.refreshToken)

    return {
      user: result.user,
      accessToken: result.accessToken,
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  github() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.githubLogin(req.user)

    this.setAuthCookies(res, result.refreshToken)

    return {
      user: result.user,
      accessToken: result.accessToken,
    }
  }
}