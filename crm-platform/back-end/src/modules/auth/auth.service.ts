import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { User } from '@prisma/client'

import { PrismaService } from 'src/core/database/prisma.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { PasswordService } from './services/password.service'
import { TokenService } from './services/token.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
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

    const tokens = await this.tokenService.generateTokens(
      this.createTokenPayload(user),
    )

    return this.buildAuthResponse(user, tokens)
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

    const tokens = await this.tokenService.generateTokens(
      this.createTokenPayload(user),
    )

    return this.buildAuthResponse(user, tokens)
  }

  private createTokenPayload(user: User) {
    return {
      sub: user.id,
      email: user.email,
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
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  }
}