import {
  Controller,
  Get,
  Interceptor,
  Next,
  UseInterceptor,
} from '@inversifyjs/http-core';
import { NextFunction, Request, Response } from 'express4';

export class Express4NextInterceptor implements Interceptor<Request, Response> {
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
export class NextExpress4Controller {
  @UseInterceptor(Express4NextInterceptor)
  @Get()
  public getNext(@Next() next: NextFunction): void {
    next();
  }
}
// End-example
