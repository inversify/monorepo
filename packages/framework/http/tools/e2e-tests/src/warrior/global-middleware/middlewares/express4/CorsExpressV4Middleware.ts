import { HttpStatusCode } from '@inversifyjs/http-core';
import { ExpressMiddleware } from '@inversifyjs/http-express-v4';
import { NextFunction, Request, Response } from 'express4';
import { injectable } from 'inversify';

@injectable()
export class CorsExpressV4Middleware implements ExpressMiddleware {
  public async execute(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    response.setHeader('access-control-allow-origin', '*');
    response.setHeader(
      'access-control-allow-methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    response.setHeader(
      'access-control-allow-headers',
      'Content-Type, Authorization',
    );

    if (request.method === 'OPTIONS') {
      response.status(HttpStatusCode.NO_CONTENT).send();
    } else {
      next();
    }
  }
}
