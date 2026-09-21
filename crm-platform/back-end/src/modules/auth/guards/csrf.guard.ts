import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Пропускаємо GET, HEAD, OPTIONS
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(request.method)) {
      return true;
    }

    // 2. Пропускаємо auth-маршрути (refresh, login, register)
    const ignoredPaths = ['/auth/refresh', '/auth/login', '/auth/register'];
    if (ignoredPaths.some(path => request.url.includes(path))) {
      return true;
    }

    const cookies = request.cookies as Record<string, string> | undefined;
    const cookieToken = cookies?.csrfToken;
    const headerToken = request.headers['x-csrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}