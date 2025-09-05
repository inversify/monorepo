import { HttpStatusCode, Middleware } from '@inversifyjs/http-core';
import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulExpressMiddleware
  implements Middleware<Request, Response, NextFunction, void>
{
  public async execute(
    _request: Request,
    response: Response,
    _next: NextFunction,
  ): Promise<void> {
    response.status(HttpStatusCode.FORBIDDEN).send();
  }
}
