import { HttpStatusCode } from '@inversifyjs/http-core';
import { type ExpressMiddleware } from '@inversifyjs/http-express';
import { type NextFunction, type Request, type Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export class CorsExpressMiddleware implements ExpressMiddleware {
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
