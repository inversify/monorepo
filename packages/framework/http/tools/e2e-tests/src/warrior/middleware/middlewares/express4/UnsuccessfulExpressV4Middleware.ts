import { HttpStatusCode } from '@inversifyjs/http-core';
import { ExpressMiddleware } from '@inversifyjs/http-express-v4';
import { NextFunction, Request, Response } from 'express4';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulExpressV4Middleware implements ExpressMiddleware {
  public async execute(
    _request: Request,
    response: Response,
    _next: NextFunction,
  ): Promise<void> {
    response.status(HttpStatusCode.FORBIDDEN).send();
  }
}
