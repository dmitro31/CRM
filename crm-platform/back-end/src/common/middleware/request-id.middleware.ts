import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      (req.headers['x-request-id'] as string) ?? randomUUID()

    req.headers['x-request-id'] = requestId
    res.setHeader('x-request-id', requestId)

    next()
  }
}