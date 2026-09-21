import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;

    // 1. Ігноруємо безпечні HTTP методи
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // 2. Ігноруємо ендпоінти авторизації
    const publicPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/csrf'];
    if (publicPaths.some((path) => url.includes(path))) {
      return true;
    }

    const cookies = request.cookies as Record<string, string> | undefined;
    const cookieToken = cookies?.csrfToken;
    const headerToken = request.headers['x-csrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      this.logger.warn(`CSRF Blocked: ${method} ${url} | Cookie: ${cookieToken} | Header: ${headerToken}`);
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}