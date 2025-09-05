import { Middleware } from '@inversifyjs/http-core';
import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export class NextExpressMiddleware
  implements Middleware<Request, Response, NextFunction>
{
  public async execute(_request: Request, response: Response): Promise<void> {
    response.send();
  }
}
