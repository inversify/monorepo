import { Middleware } from '@inversifyjs/http-core';
import { NextFunction, Request, Response } from 'express4';
import { injectable } from 'inversify';

@injectable()
export class NextExpress4Middleware
  implements Middleware<Request, Response, NextFunction>
{
  public async execute(_request: Request, response: Response): Promise<void> {
    response.send();
  }
}
