import {
  Controller,
  Get,
  Interceptor,
  Next,
  UseInterceptor,
} from '@inversifyjs/http-core';
import { type NextFunction, Request, Response } from 'express';

export class ExpressNextInterceptor implements Interceptor<Request, Response> {
  public async intercept(
    _request: Request,
    response: Response,
    next: () => Promise<unknown>,
  ): Promise<void> {
    response.setHeader('next-was-called', 'true');
    await next();
    response.send('ok');
  }
}

// Begin-example
@Controller('/next')
@UseInterceptor(ExpressNextInterceptor)
export class NextExpressController {
  @Get()
  public getNext(@Next() next: NextFunction): void {
    next();
  }
}
// End-example
