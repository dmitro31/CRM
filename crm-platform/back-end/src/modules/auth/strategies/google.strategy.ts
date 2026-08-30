import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('google.clientId'),
      clientSecret: config.getOrThrow<string>('google.clientSecret'),
      callbackURL: config.getOrThrow<string>('google.callbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, displayName, emails, photos, name } = profile;

    done(null, {
      googleId: id,
      email: emails?.[0]?.value,
      avatar: photos?.[0]?.value,
      firstName: name?.givenName ?? displayName.split(' ')[0],
      lastName: name?.familyName ?? displayName.split(' ').slice(1).join(' '),
    });
  }
}
