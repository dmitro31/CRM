import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'

import { PrismaService } from 'core/database/prisma.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { PasswordService } from './services/password.service'
import { TokenService } from './services/token.service'
import { VerificationTokenService } from './services/verification-token.service'
import { MailService } from '../mail/mail.service'
import { RefreshTokenService } from './services/refresh-token.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly verificationTokenService: VerificationTokenService,
    private readonly mailService: MailService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    })

    if (existingUser) {
      throw new BadRequestException(
        'User with this email already exists',
      )
    }

    const hashedPassword = await this.passwordService.hash(
      dto.password,
    )

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    })

    const verificationToken =
      await this.verificationTokenService.createEmailVerificationToken(
        user.id,
      )

    await this.mailService.sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken,
    )

    return {
      message:
        'Verification email has been sent. Please check your inbox.',
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    })

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      )
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Invalid email or password',
      )
    }

    const isPasswordValid =
      await this.passwordService.compare(
        dto.password,
        user.password,
      )

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      )
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in.',
      )
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User account is inactive.',
      )
    }

    const refreshToken =
      await this.refreshTokenService.createSession(
        user.id,
        user.email,
      )

    const payload =
      this.tokenService.decode(refreshToken)

    if (!payload?.tid) {
      throw new UnauthorizedException(
        'Failed to create authentication session.',
      )
    }

    const accessToken =
      await this.tokenService.generateAccessToken({
        sub: user.id,
        email: user.email,
        tid: payload.tid,
      })

    return this.buildAuthResponse(user, {
      accessToken,
      refreshToken,
    })
  }

  async verifyEmail(token: string) {
    const verificationToken =
      await this.prisma.verificationToken.findUnique({
        where: {
          token,
        },
      })

    if (!verificationToken) {
      throw new BadRequestException(
        'Invalid verification token',
      )
    }

    if (verificationToken.type !== 'EMAIL_VERIFICATION') {
      throw new BadRequestException(
        'Invalid verification token',
      )
    }

    if (verificationToken.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      })

      throw new BadRequestException(
        'Verification token has expired',
      )
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          isVerified: true,
        },
      }),
      this.prisma.verificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      }),
    ])

    return {
      message: 'Email verified successfully.',
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new BadRequestException(
        'User not found',
      )
    }

    if (user.isVerified) {
      throw new BadRequestException(
        'Email is already verified',
      )
    }

    const verificationToken =
      await this.verificationTokenService.createEmailVerificationToken(
        user.id,
      )

    await this.mailService.sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken,
    )

    return {
      message:
        'Verification email has been sent.',
    }
  }

  private buildAuthResponse(
    user: User,
    tokens: {
      accessToken: string
      refreshToken: string
    },
  ) {
    return {
      user: this.toUserResponse(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  private toUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      provider: user.provider,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  }

  private getRefreshTokenExpiresAt(): Date {
    const expiresIn = this.config.getOrThrow<string>(
      'jwt.refreshExpiresIn',
    )

    const match = expiresIn.match(/^(\d+)([smhd])$/)

    if (!match) {
      return new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000,
      )
    }

    const value = Number(match[1])
    const unit = match[2]

    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }

    return new Date(
      Date.now() +
        value *
          multipliers[
            unit as keyof typeof multipliers
          ],
    )
  }

  async refresh(refreshToken: string) {
    const payload =
      await this.refreshTokenService.validate(
        refreshToken,
      )

    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      })

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      )
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User account is inactive.',
      )
    }

    const newRefreshToken =
      await this.refreshTokenService.rotate(
        refreshToken,
      )

    const newPayload =
      this.tokenService.decode(
        newRefreshToken,
      )

    if (!newPayload?.tid) {
      throw new UnauthorizedException(
        'Failed to rotate authentication session.',
      )
    }

    const accessToken =
      await this.tokenService.generateAccessToken({
        sub: user.id,
        email: user.email,
        tid: newPayload.tid,
      })

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  async logout(refreshToken: string) {
    const payload =
      await this.refreshTokenService.validate(
        refreshToken,
      )

    await this.refreshTokenService.revokeSession(
      payload.tid,
    )

    return {
      message: 'Logged out successfully',
    }
  }

  async logoutAll(userId: string) {
    await this.refreshTokenService.revokeAllSessions(
      userId,
    )

    return {
      message: 'Logged out from all devices',
    }
  }

  async forgotPassword(email: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      })

    if (!user) {
      return {
        message:
          'If this email exists, a reset link has been sent.',
      }
    }

    const token =
      await this.verificationTokenService.createPasswordResetToken(
        user.id,
      )

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      token,
    )

    return {
      message:
        'If this email exists, a reset link has been sent.',
    }
  }

  async resetPassword(
    token: string,
    password: string,
  ) {
    const verification =
      await this.prisma.verificationToken.findUnique({
        where: {
          token,
        },
      })

    if (
      !verification ||
      verification.type !== 'PASSWORD_RESET'
    ) {
      throw new BadRequestException(
        'Invalid token',
      )
    }

    if (verification.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({
        where: {
          id: verification.id,
        },
      })

      throw new BadRequestException(
        'Token expired',
      )
    }

    const hashed =
      await this.passwordService.hash(
        password,
      )

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: verification.userId,
        },
        data: {
          password: hashed,
        },
      }),
      this.prisma.verificationToken.delete({
        where: {
          id: verification.id,
        },
      }),
      this.prisma.refreshToken.deleteMany({
        where: {
          userId: verification.userId,
        },
      }),
    ])

    return {
      message:
        'Password has been reset successfully.',
    }
  }

  async googleLogin(profile: {
    googleId: string
    email: string
    firstName: string
    lastName: string
    avatar?: string
  }) {
    let user = await this.prisma.user.findUnique({
      where: {
        email: profile.email,
      },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar,
          provider: 'GOOGLE',
          isVerified: true,
          password: null,
          oauthAccounts: {
            create: {
              provider: 'GOOGLE',
              providerId: profile.googleId,
              email: profile.email,
            },
          },
        },
      })
    } else {
      const existingOAuthAccount =
        await this.prisma.oAuthAccount.findUnique({
          where: {
            provider_providerId: {
              provider: 'GOOGLE',
              providerId: profile.googleId,
            },
          },
        })

      if (!existingOAuthAccount) {
        await this.prisma.oAuthAccount.create({
          data: {
            provider: 'GOOGLE',
            providerId: profile.googleId,
            email: profile.email,
            userId: user.id,
          },
        })
      }

      if (
        user.provider === 'LOCAL' ||
        !user.avatar
      ) {
        user = await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            provider:
              user.provider === 'LOCAL'
                ? 'GOOGLE'
                : user.provider,
            avatar:
              user.avatar ?? profile.avatar,
          },
        })
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User account is inactive.',
      )
    }

    const refreshToken =
      await this.refreshTokenService.createSession(
        user.id,
        user.email,
      )

    const payload =
      this.tokenService.decode(refreshToken)

    if (!payload?.tid) {
      throw new UnauthorizedException(
        'Failed to create authentication session.',
      )
    }

    const accessToken =
      await this.tokenService.generateAccessToken({
        sub: user.id,
        email: user.email,
        tid: payload.tid,
      })

    return this.buildAuthResponse(user, {
      accessToken,
      refreshToken,
    })
  }

  async githubLogin(profile: {
    githubId: string
    email: string
    firstName: string
    lastName: string
    avatar?: string
  }) {
    let user = await this.prisma.user.findUnique({
      where: {
        email: profile.email,
      },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar,
          provider: 'GITHUB',
          isVerified: true,
          password: null,
          oauthAccounts: {
            create: {
              provider: 'GITHUB',
              providerId: profile.githubId,
              email: profile.email,
            },
          },
        },
      })
    } else {
      const existingOAuthAccount =
        await this.prisma.oAuthAccount.findUnique({
          where: {
            provider_providerId: {
              provider: 'GITHUB',
              providerId: profile.githubId,
            },
          },
        })

      if (!existingOAuthAccount) {
        await this.prisma.oAuthAccount.create({
          data: {
            provider: 'GITHUB',
            providerId: profile.githubId,
            email: profile.email,
            userId: user.id,
          },
        })
      }

      if (
        user.provider === 'LOCAL' ||
        !user.avatar
      ) {
        user = await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            provider:
              user.provider === 'LOCAL'
                ? 'GITHUB'
                : user.provider,
            avatar:
              user.avatar ?? profile.avatar,
          },
        })
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User account is inactive.',
      )
    }

    const refreshToken =
      await this.refreshTokenService.createSession(
        user.id,
        user.email,
      )

    const payload =
      this.tokenService.decode(refreshToken)

    if (!payload?.tid) {
      throw new UnauthorizedException(
        'Failed to create authentication session.',
      )
    }

    const accessToken =
      await this.tokenService.generateAccessToken({
        sub: user.id,
        email: user.email,
        tid: payload.tid,
      })

    return this.buildAuthResponse(user, {
      accessToken,
      refreshToken,
    })
  }
}