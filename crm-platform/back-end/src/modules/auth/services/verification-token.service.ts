import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";

import { PrismaService } from "core/database/prisma.service";

@Injectable()
export class VerificationTokenService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async createEmailVerificationToken(userId: string) {
        await this.prisma.verificationToken.deleteMany({
            where: {
                userId,
                type: 'EMAIL_VERIFICATION'
            }
        })

        const token = randomBytes(32).toString('hex')

        const expiresAt = new Date(
            Date.now() + 1000 * 60 * 60 * 24,
        )

        await this.prisma.verificationToken.create({
            data: {
                token,
                userId,
                type: "EMAIL_VERIFICATION",
                expiresAt
            }
        })

        return token
    }

    async createPasswordResetToken(
  userId: string,
) {
  await this.prisma.verificationToken.deleteMany({
    where: {
      userId,
      type: 'PASSWORD_RESET',
    },
  })

  const token = randomBytes(32).toString('hex')

  await this.prisma.verificationToken.create({
    data: {
      token,
      userId,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(
        Date.now() + 1000 * 60 * 30,
      ),
    },
  })

  return token
}
}