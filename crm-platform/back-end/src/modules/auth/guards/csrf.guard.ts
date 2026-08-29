import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import type { Request } from 'express'

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    const cookieToken = request.cookies?.csrfToken
    const headerToken = request.headers['x-csrf-token']

    if (
      !cookieToken ||
      !headerToken ||
      cookieToken !== headerToken
    ) {
      throw new ForbiddenException('Invalid CSRF token')
    }

    return true
  }
}