import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { UnauthorizedException } from "@nestjs/common";

import { PrismaService } from "core/database/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>("jwt.accessSecret")
        })
    }

    async validate(payload: {
        sub: string,
        email: string
    }) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            }
        })

        if (!user) {
            throw new UnauthorizedException()
        }

        return user
    }


}