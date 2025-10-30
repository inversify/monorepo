import {
  HttpStatusCode,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { ExpressInterceptor } from '@inversifyjs/http-express-v4';
import express4 from 'express4';

export class WarriorRouteExpressV4Interceptor implements ExpressInterceptor {
  public async intercept(
    _request: express4.Request,
    response: express4.Response,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    response.setHeader('x-warrior-route', 'true');
    await next();
    response.status(HttpStatusCode.ACCEPTED);
  }
}
