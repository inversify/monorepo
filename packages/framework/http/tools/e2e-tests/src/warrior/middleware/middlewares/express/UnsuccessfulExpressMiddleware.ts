import { HttpStatusCode } from '@inversifyjs/http-core';
import { ExpressMiddleware } from '@inversifyjs/http-express';
import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulExpressMiddleware implements ExpressMiddleware {
  public async execute(
    _request: Request,
    response: Response,
    _next: NextFunction,
  ): Promise<void> {
    response.status(HttpStatusCode.FORBIDDEN).send();
  }
}
