import { Injectable } from '@nestjs/common'
import { JwtService, type JwtSignOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getJwtOptions(secretKey: string, expiresInKey: string): JwtSignOptions {
    return {
      secret: this.config.getOrThrow<string>(secretKey),
      expiresIn: this.config.getOrThrow<string>(expiresInKey) as JwtSignOptions['expiresIn'],
    }
  }

  async generateAccessToken(userId: string): Promise<string> {
    return this.jwt.signAsync(
      {
        sub: userId,
      },
      this.getJwtOptions('jwt.accessSecret', 'jwt.accessExpiresIn'),
    )
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwt.signAsync(
      {
        sub: userId,
      },
      this.getJwtOptions('jwt.refreshSecret', 'jwt.refreshExpiresIn'),
    )
  }
}