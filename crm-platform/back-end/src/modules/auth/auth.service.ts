import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/core/database/prisma.service'
import { PasswordService } from './services/password.service'
import { TokenService } from './services/token.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}
}