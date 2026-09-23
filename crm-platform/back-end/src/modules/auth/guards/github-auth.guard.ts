import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  constructor() {
    super({
      session: false,
    });
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const res = context.switchToHttp().getResponse();
      const frontendUrl = ('https://www.crm-platform.site').replace(/\/$/, '');
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
    return user;
  }
}