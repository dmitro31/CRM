import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import * as bcrypt from 'bcrypt'

import { PrismaService } from 'core/database/prisma.service'
import { TokenPayload } from 'interfaces/token-payload.interface'

import { TokenService } from './token.service'

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
  ) {}

  private getRefreshExpiresAt(): Date {
    const expires = this.config.getOrThrow<string>(
      'jwt.refreshExpiresIn',
    )

    const match = expires.match(/^(\d+)([smhd])$/)

    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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

  async createSession(
    userId: string,
    email: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const sessionId = randomUUID()

    const payload: TokenPayload = {
      sub: userId,
      email,
      tid: sessionId,
    }

    const refreshToken =
      await this.tokenService.generateRefreshToken(
        payload,
      )

    const tokenHash = await bcrypt.hash(
      refreshToken,
      10,
    )

    await this.prisma.refreshToken.create({
      data: {
        id: sessionId,
        tokenId: sessionId,
        userId,
        tokenHash,
        expiresAt: this.getRefreshExpiresAt(),
        userAgent,
        ipAddress,
      },
    })

    return refreshToken
  }

  async validate(
    refreshToken: string,
  ): Promise<TokenPayload> {
    const payload =
      await this.tokenService.verifyRefreshToken(
        refreshToken,
      )

    if (!payload.tid) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      )
    }

    const session =
      await this.prisma.refreshToken.findUnique({
        where: {
          id: payload.tid,
        },
      })

    if (!session) {
      throw new UnauthorizedException(
        'Session not found',
      )
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({
        where: {
          id: session.id,
        },
      })

      throw new UnauthorizedException(
        'Refresh token expired',
      )
    }

    const matches = await bcrypt.compare(
      refreshToken,
      session.tokenHash,
    )

    if (!matches) {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: session.userId,
        },
      })

      throw new UnauthorizedException(
        'Refresh token reuse detected'
      )
    }

    await this.prisma.refreshToken.update({
      where: {
        id: session.id,
      },
      data: {
        lastUsedAt: new Date(),
      },
    })

    return payload
  }

  async rotate(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const payload =
      await this.validate(refreshToken)

    await this.prisma.refreshToken.delete({
      where: {
        id: payload.tid,
      },
    })

    return this.createSession(
      payload.sub,
      payload.email,
      userAgent,
      ipAddress,
    )
  }

  async revokeSession(
    sessionId: string,
  ) {
    return this.prisma.refreshToken.delete({
      where: {
        id: sessionId,
      },
    })
  }

  async revokeAllSessions(
    userId: string,
  ) {
    return this.prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    })
  }

  async getSessions(
    userId: string,
  ) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        lastUsedAt: true,
        userAgent: true,
        ipAddress: true,
      },
    })
  }

  async cleanupExpired() {
    return this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  }
}