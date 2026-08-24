import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'

import { TokenPayload } from 'interfaces/token-payload.interface'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getOptions(
    secretKey: string,
    expiresKey: string,
  ): JwtSignOptions {
    return {
      secret: this.config.getOrThrow<string>(secretKey),
      expiresIn: this.config.getOrThrow<string | number>(
        expiresKey,
      ) as JwtSignOptions['expiresIn'],
    }
  }

  async generateAccessToken(
    payload: TokenPayload,
  ): Promise<string> {
    return this.jwt.signAsync(
      payload,
      this.getOptions(
        'jwt.accessSecret',
        'jwt.accessExpiresIn',
      ),
    )
  }

  async generateRefreshToken(
    payload: TokenPayload,
  ): Promise<string> {
    return this.jwt.signAsync(
      payload,
      this.getOptions(
        'jwt.refreshSecret',
        'jwt.refreshExpiresIn',
      ),
    )
  }

  async generateTokens(
    payload: TokenPayload,
  ) {
    const accessToken =
      await this.generateAccessToken(payload)

    const refreshToken =
      await this.generateRefreshToken(payload)

    return {
      accessToken,
      refreshToken,
    }
  }

  async verifyAccessToken(
    token: string,
  ): Promise<TokenPayload> {
    return this.jwt.verifyAsync(
      token,
      {
        secret: this.config.getOrThrow<string>(
          'jwt.accessSecret',
        ),
      },
    )
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<TokenPayload> {
    return this.jwt.verifyAsync(
      token,
      {
        secret: this.config.getOrThrow<string>(
          'jwt.refreshSecret',
        ),
      },
    )
  }

  decode(
    token: string,
  ): TokenPayload | null {
    return this.jwt.decode(
      token,
    ) as TokenPayload | null
  }
}