import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import type { VerifyCallback } from 'passport-oauth2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('github.clientId'),
      clientSecret: config.getOrThrow<string>('github.clientSecret'),
      callbackURL: config.getOrThrow<string>('github.callbackUrl'),
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, displayName, username, emails, photos } = profile;

    const email = emails?.[0]?.value;

    if (!email) {
      return done(
        new UnauthorizedException('GitHub акаунт не надає доступ до email'),
        false,
      );
    }

    const fullName = displayName || username || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || username;
    const lastName = nameParts.slice(1).join(' ') || '';

    done(null, {
      githubId: id,
      email,
      avatar: photos?.[0]?.value ?? null,
      firstName,
      lastName,
    });
  }
}