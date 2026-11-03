import {
  HttpStatusCode,
  type InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { type HonoInterceptor } from '@inversifyjs/http-hono';
import { type Context, type HonoRequest } from 'hono';

export class WarriorRouteHonoInterceptor implements HonoInterceptor {
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
