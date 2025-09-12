import {
  HttpStatusCode,
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { Context, HonoRequest } from 'hono';

export class WarriorRouteHonoInterceptor
  implements Interceptor<HonoRequest, Context>
{
  public async intercept(
    _request: HonoRequest,
    context: Context,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    context.header('x-warrior-route', 'true');

    await next();

    context.status(HttpStatusCode.ACCEPTED);
  }
}
