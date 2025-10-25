import {
  Controller,
  Get,
  Interceptor,
  InterceptorTransformObject,
  Next,
  UseInterceptor,
} from '@inversifyjs/http-core';
import { type Context, type HonoRequest, type Next as HonoNext } from 'hono';

export class HonoNextInterceptor implements Interceptor<HonoRequest, Context> {
  public async intercept(
    _request: HonoRequest,
    context: Context,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    context.header('next-was-called', 'true');
    const transform: InterceptorTransformObject = await next();

    transform.push(() => context.body('ok'));
  }
}

// Begin-example
@Controller('/next')
export class NextHonoController {
  @UseInterceptor(HonoNextInterceptor)
  @Get()
  public async getNext(@Next() next: HonoNext): Promise<void> {
    await next();
  }
}
// End-example
