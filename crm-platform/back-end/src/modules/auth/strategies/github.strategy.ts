import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import type { VerifyCallback } from 'passport-oauth2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow('github.clientId'),
      clientSecret: config.getOrThrow('github.clientSecret'),
      callbackURL: config.getOrThrow('github.callbackUrl'),
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    done(null, {
      githubId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      avatar: profile.photos?.[0]?.value ?? null,
      firstName: profile.displayName ?? profile.username,
      lastName: '',
    });
  }
}
